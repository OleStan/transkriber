import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useGetTranscriptionQuery, useUpdateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import AudioPlayer from '../../player/AudioPlayer';
import useAdjustableTranscription from '../../../hooks/useAdjustableTranscription';
import TranscriptionSegmentsSkeleton from './TranscriptionSegmentsSkeleton';
import TranscriptionShowSkeleton from './TranscriptionShowSkeleton';
import useActionCable, { TranscriptionMessage } from '../../../hooks/useActionCable';
import AdjustSegmentSizeSlider from './AdjustSegmentSizeSlider';
import useAudioStore from '../../../stores/useAudioStore';
import TranscriptionEditor from './TranscriptionEditor';
import { Box, LinearProgress, Typography, Stack, Alert, Button, IconButton, CircularProgress, Snackbar, Menu, MenuItem, ListItemText, Chip } from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Cancel as CancelIcon,
  Error as ErrorIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

import { LoaderFunctionArgs } from 'react-router-dom';

// Type definitions for the transcription data
interface ITranscriptionSegment {
  timestamp: string;
  text: string;
  start: number;
  end: number;
}

interface TranscriptionDetails {
  id: string;
  status: string;
  audioFilename: string;
  audioTranscriptionPath: string;
  duration: number;
  progress?: number;
  error_message?: string;
  transcriptions: ITranscriptionSegment[] | string;
}

interface TranscriptionDetailsResponse {
  id: string;
  status: string;
  audioFilename: string;
  audioTranscriptionPath: string;
  duration: number;
  progress?: number;
  error_message?: string;
  transcriptions: ITranscriptionSegment[] | string;
}

interface LoaderData {
  id: string;
}

export function loader({
  params,
}: LoaderFunctionArgs) {
  return { id: params.id };
}



const EXPORT_FORMATS: { label: string; format: 'txt' | 'srt' | 'vtt' }[] = [
  { label: 'Plain text (.txt)', format: 'txt' },
  { label: 'Subtitles (.srt)', format: 'srt' },
  { label: 'Web captions (.vtt)', format: 'vtt' },
];

const TranscriptionShow = () => {
  const { id } = useLoaderData() as LoaderData;
  const { data: transcription, isLoading } = useGetTranscriptionQuery(Number(id)) as { data: TranscriptionDetailsResponse | undefined, isLoading: boolean };
  const [transcriptionState, setTranscriptionState] = useState({
    text: '',
    isCompleted: false,
    progress: 0,
    status: '',
    error: '',
    cancelled: false,
  });
  const [hoveredTimestamp, setHoveredTimestamp] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedSegments, setEditedSegments] = useState<ITranscriptionSegment[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Store hooks
  const setSeek = useAudioStore((state) => state.setSeek);

  // Edit mutation
  const [updateTranscription] = useUpdateTranscriptionMutation();
  
  // Use our enhanced ActionCable hook
  const { latestMessage, messages, cancelTranscription } = useActionCable('TranscriptionChannel', id);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel this transcription?')) {
      cancelTranscription();
    }
  }, [cancelTranscription]);

  // Edit mode handlers
  const handleEnterEdit = useCallback(() => {
    const segs = Array.isArray(transcription?.transcriptions)
      ? transcription.transcriptions
      : [];
    setEditedSegments(segs as ITranscriptionSegment[]);
    setIsEditing(true);
    setHasUnsavedChanges(false);
  }, [transcription]);

  const handleDiscardEdit = useCallback(() => {
    if (hasUnsavedChanges && !window.confirm('Discard unsaved changes?')) return;
    setIsEditing(false);
    setHasUnsavedChanges(false);
  }, [hasUnsavedChanges]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const transcriptionText = editedSegments.map(s => s.text).join(' ');
      const transcriptionJson = {
        segments: editedSegments.map(s => ({
          id: (s as any).id,
          text: s.text,
          start: s.start,
          end: s.end,
        })),
      };
      await updateTranscription({
        id: Number(id),
        transcription: transcriptionText,
        transcriptionJson,
      }).unwrap();
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch {
      // error handled server-side; UI will show existing error state
    } finally {
      setIsSaving(false);
    }
  }, [editedSegments, id, updateTranscription]);

  const handleSegmentsChange = useCallback((segments: ITranscriptionSegment[]) => {
    setEditedSegments(segments);
    setHasUnsavedChanges(true);
  }, []);

  // Unsaved changes guard on navigation/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Ctrl+Enter to save when editing
  useEffect(() => {
    if (!isEditing) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        handleSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, handleSave]);

  useEffect(() => {
    if (!latestMessage) return;

    setTranscriptionState((prevState) => ({
      text: latestMessage.transcription_json || prevState.text,
      isCompleted: latestMessage.status === 'completed' || latestMessage.status === 'failed' || prevState.isCompleted,
      progress: latestMessage.progress !== undefined ? latestMessage.progress : prevState.progress,
      status: latestMessage.status || prevState.status,
      error: latestMessage.error || prevState.error,
      cancelled: latestMessage.status === 'cancelled' || prevState.cancelled,
    }));
  }, [latestMessage]);

  // Determine what status text to display
  const getStatusText = useCallback(() => {
    switch (transcriptionState.status) {
      case 'uploading':
        return 'Uploading audio file...';
      case 'processing':
        return 'Processing audio...';
      case 'in_progress':
        return 'Preparing for transcription...';
      case 'transcribing':
        return 'Transcribing audio...';
      case 'post_processing':
        return 'Finalizing transcription...';
      case 'completed':
        return 'Transcription completed!';
      case 'failed':
        return 'Transcription failed';
      case 'cancelled':
        return 'Transcription cancelled';
      default:
        return 'Please wait while we process your transcription';
    }
  }, [transcriptionState.status]);

  const transcriptionSegments = useAdjustableTranscription(
    (transcription?.transcriptions || transcriptionState.text || []) as ITranscriptionSegment[]
  );
  
  // Copy functionality
  const transcriptWithTimestamps = useMemo(
    () =>
      transcriptionSegments
        ?.map(
          (t) =>
            `${t.timestampOfChunk} ${t.segments
              .map((s) => s.text)
              .join('')
              .trim()}`
        )
        .join('\n') ?? '',
    [transcriptionSegments]
  );
  
  const handleDownloadButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
  };

  const handleExport = (format: 'txt' | 'srt' | 'vtt') => {
    const link = document.createElement('a');
    link.href = `/ajax/transcriptions/${id}/export?format=${format}`;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleDownloadMenuClose();
  };

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(transcriptWithTimestamps);
      setCopied(true);
    } catch (err) {
      console.error('Copy failed', err);
    }
  }, [transcriptWithTimestamps]);
  
  const handleTimestampClick = useCallback((startTime: number) => {
    setSeek(startTime);
  }, [setSeek]);

  if (isLoading || !transcription) {
    return <TranscriptionShowSkeleton />;
  }

  // Determine if we should show the progress UI
  const showInProgress = (
    ['in_progress', 'pending', 'uploading', 'processing', 'transcribing', 'post_processing'].includes(
      transcriptionState.status || transcription.status
    ) &&
    !transcriptionState.isCompleted &&
    !transcription.transcriptions
  );

  return (
    <Box
      sx={{
        bgcolor: '#111b22',
        minHeight: '100vh',
        color: 'white',
        fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
      }}
    >
      {/* Main Content Container */}
      <Box sx={{ gap: 1, px: 6, flex: 1, justifyContent: 'center', py: 5, maxWidth: '100%' }}>
        {/* Left Column - Controls */}
        <Box sx={{ 
          width: '320px', 
          mr: 4, 
          display: 'inline-block', 
          verticalAlign: 'top',
          position: 'sticky',
          top: '20px',
          alignSelf: 'flex-start'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              px: 4, 
              pb: 3, 
              pt: 5,
              color: 'white',
              fontSize: '22px'
            }}
          >
            Transcription
          </Typography>
          
          {/* Chunk Duration Slider */}
          <Box sx={{ p: 4 }}>
            <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 'medium', mb: 3 }}>
              Chunk Duration
            </Typography>
            <Box sx={{ 
              '& .MuiSlider-root': {
                color: '#1993e5'
              },
              '& .MuiSvgIcon-root': {
                color: '#93b3c8'
              }
            }}>
              <AdjustSegmentSizeSlider />
            </Box>
          </Box>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', flex: 1, gap: 3, maxWidth: '480px', flexDirection: 'column', px: 4, py: 3 }}>
              {!isEditing ? (
                <Button
                  onClick={handleEnterEdit}
                  disabled={!Array.isArray(transcription?.transcriptions) || transcription.transcriptions.length === 0}
                  startIcon={<EditIcon />}
                  sx={{
                    minWidth: '84px',
                    height: '40px',
                    px: 4,
                    bgcolor: '#243947',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    borderRadius: '20px',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#2d4350'
                    },
                    '&:disabled': {
                      bgcolor: '#1a2832',
                      color: '#93b3c8'
                    }
                  }}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    startIcon={isSaving ? <CircularProgress size={16} sx={{ color: 'white' }} /> : undefined}
                    sx={{
                      minWidth: '84px',
                      height: '40px',
                      px: 4,
                      bgcolor: '#1993e5',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      borderRadius: '20px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#1478c7'
                      },
                      '&:disabled': {
                        bgcolor: '#1a2832',
                        color: '#93b3c8'
                      }
                    }}
                  >
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </Button>
                  <Button
                    onClick={handleDiscardEdit}
                    disabled={isSaving}
                    variant="text"
                    sx={{
                      minWidth: '84px',
                      height: '40px',
                      px: 4,
                      color: '#93b3c8',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      borderRadius: '20px',
                      textTransform: 'none',
                      '&:hover': {
                        bgcolor: '#1a2832',
                        color: 'white'
                      }
                    }}
                  >
                    Discard
                  </Button>
                </>
              )}
              <Button
                onClick={handleCopy}
                disabled={!transcriptWithTimestamps}
                sx={{
                  minWidth: '84px',
                  height: '40px',
                  px: 4,
                  bgcolor: '#243947',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '20px',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#2d4350'
                  },
                  '&:disabled': {
                    bgcolor: '#1a2832',
                    color: '#93b3c8'
                  }
                }}
              >
                Copy
              </Button>
              <Button
                onClick={handleDownloadButtonClick}
                sx={{
                  minWidth: '84px',
                  height: '40px',
                  px: 4,
                  bgcolor: '#1993e5',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '20px',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#1478c7'
                  }
                }}
              >
                Download
              </Button>
              <Menu
                anchorEl={downloadMenuAnchor}
                open={Boolean(downloadMenuAnchor)}
                onClose={handleDownloadMenuClose}
                PaperProps={{
                  sx: {
                    bgcolor: '#1f282e',
                    border: '1px solid #3d505c',
                    borderRadius: '8px',
                    color: 'white',
                  }
                }}
              >
                {EXPORT_FORMATS.map(({ label, format }) => (
                  <MenuItem
                    key={format}
                    onClick={() => handleExport(format)}
                    sx={{
                      fontSize: '14px',
                      color: '#9db1be',
                      '&:hover': {
                        bgcolor: '#2b3840',
                        color: 'white',
                      }
                    }}
                  >
                    <ListItemText primary={label} />
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>
          
          {/* Error States */}
          {transcriptionState.error && (
            <Box sx={{ px: 4, py: 2 }}>
              <Alert 
                severity="error"
                sx={{ 
                  bgcolor: '#2d1b1b',
                  color: '#ff6b6b',
                  '& .MuiAlert-icon': { color: '#ff6b6b' }
                }}
                action={
                  <Button 
                    size="small"
                    onClick={() => window.location.reload()}
                    sx={{ color: '#ff6b6b' }}
                  >
                    Retry
                  </Button>
                }
              >
                {transcriptionState.error}
              </Alert>
            </Box>
          )}
          
          {transcriptionState.cancelled && (
            <Box sx={{ px: 4, py: 2 }}>
              <Alert 
                severity="info"
                sx={{ 
                  bgcolor: '#1b2632',
                  color: '#93b3c8',
                  '& .MuiAlert-icon': { color: '#93b3c8' }
                }}
              >
                This transcription was cancelled. You can upload a new file to try again.
              </Alert>
            </Box>
          )}
        </Box>
        
        {/* Right Column - Main Content */}
        <Box sx={{ maxWidth: '960px', flex: 1, display: 'inline-block', verticalAlign: 'top' }}>
          {/* Audio Player Card */}
          <Box sx={{ px: 4, py: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, borderRadius: '12px', bgcolor: '#243947', px: 4, py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Box
                  sx={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '8px',
                    bgcolor: '#345165',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <PlayArrowIcon sx={{ color: 'white', fontSize: '24px' }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography 
                    sx={{ 
                      color: 'white', 
                      fontSize: '16px', 
                      fontWeight: 'bold',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {transcription.audioFilename}
                  </Typography>
                  <Typography 
                    sx={{ 
                      color: '#93b3c8', 
                      fontSize: '14px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Audio File
                  </Typography>
                </Box>
              </Box>
              
              {/* Audio Player */}
              <AudioPlayer src={transcription.audioTranscriptionPath} />
            </Box>
          </Box>
          
          {/* Transcription Title */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, px: 4, pb: 3, pt: 5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 'bold',
                color: 'white'
              }}
            >
              Transcription
            </Typography>
            {isEditing && (
              <Chip
                label="Editing"
                color="warning"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            )}
          </Box>
          
          {/* Progress State */}
          {showInProgress && !transcriptionState.cancelled && !transcriptionState.error ? (
            <Box sx={{ px: 4, py: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                  {getStatusText()}
                </Typography>
                <IconButton 
                  onClick={handleCancel}
                  title="Cancel transcription"
                  sx={{ color: '#93b3c8' }}
                >
                  <CancelIcon />
                </IconButton>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <LinearProgress 
                  variant="determinate"
                  value={transcriptionState.progress} 
                  sx={{ 
                    flex: 1,
                    height: 10, 
                    borderRadius: 5,
                    bgcolor: '#345165',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: transcriptionState.progress > 90 ? '#4caf50' : '#1993e5'
                    }
                  }} 
                />
                <Typography sx={{ color: 'white', fontSize: '14px' }}>
                  {transcriptionState.progress}%
                </Typography>
              </Box>
              
              <Alert 
                severity="info"
                sx={{ 
                  bgcolor: '#1b2632',
                  color: '#93b3c8',
                  '& .MuiAlert-icon': { color: '#1993e5' }
                }}
              >
                {transcriptionState.status === 'transcribing' && (
                  'Transcription is in progress. This may take a few minutes depending on the audio length.'
                )}
                {transcriptionState.status === 'uploading' && 'Uploading your audio file. Please wait...'}
                {transcriptionState.status === 'processing' && 'Processing your audio file to prepare it for transcription...'}
              </Alert>
              
              <TranscriptionSegmentsSkeleton />
            </Box>
          ) : (
            /* Transcription Segments — read-only or editor */
            !transcriptionState.cancelled && !transcriptionState.error && transcriptionSegments && transcriptionSegments.length > 0 && (
              isEditing ? (
                <TranscriptionEditor
                  segments={editedSegments}
                  onChange={handleSegmentsChange}
                />
              ) : (
                <Box>
                  {transcriptionSegments.map((segment) => (
                    <Box key={segment.id} sx={{ px: 4 }}>
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '0',
                          gap: 6,
                          py: 2,
                          '&:hover .timestamp': {
                            '& .play-icon': {
                              opacity: 1
                            }
                          }
                        }}
                        onMouseEnter={() => setHoveredTimestamp(String(segment.id))}
                        onMouseLeave={() => setHoveredTimestamp(null)}
                      >
                        <Box
                          className="timestamp"
                          sx={{
                            color: '#93b3c8',
                            fontSize: '14px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            minWidth: '80px'
                          }}
                          onClick={() => handleTimestampClick(segment.startOfChunk)}
                        >
                          <Typography sx={{ fontSize: '14px', color: '#93b3c8' }}>
                            {segment.timestampOfChunk}
                          </Typography>
                          <PlayArrowIcon
                            className="play-icon"
                            sx={{
                              fontSize: '16px',
                              color: '#93b3c8',
                              opacity: hoveredTimestamp === String(segment.id) ? 1 : 0,
                              transition: 'opacity 0.2s'
                            }}
                          />
                        </Box>
                        <Typography
                          sx={{
                            color: 'white',
                            fontSize: '14px',
                            textAlign: 'left',
                            flex: 1
                          }}
                        >
                          {segment.segments.map((s, index) => (
                            <span key={s.id || index}>{s.text}</span>
                          ))}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              )
            )
          )}
          
          {/* No segments message */}
          {!showInProgress && transcriptionSegments && transcriptionSegments.length === 0 && !transcriptionState.error && !transcriptionState.cancelled && (
            <Box sx={{ px: 4, py: 3 }}>
              <Typography sx={{ color: '#93b3c8' }}>No transcription segments available</Typography>
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Copy Success Snackbar */}
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setCopied(false)} 
          severity="success" 
          sx={{ 
            bgcolor: '#2d4a2d',
            color: '#4caf50' 
          }}
        >
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TranscriptionShow;

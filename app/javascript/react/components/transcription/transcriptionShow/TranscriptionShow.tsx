import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useLoaderData, useNavigate } from 'react-router-dom';
import { useGetTranscriptionQuery, useUpdateTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import AudioPlayer from '../../player/AudioPlayer';
import useAdjustableTranscription from '../../../hooks/useAdjustableTranscription';
import TranscriptionSegmentsSkeleton from './TranscriptionSegmentsSkeleton';
import TranscriptionShowSkeleton from './TranscriptionShowSkeleton';
import useActionCable, { TranscriptionMessage } from '../../../hooks/useActionCable';
import AdjustSegmentSizeSlider from './AdjustSegmentSizeSlider';
import useAudioStore from '../../../stores/useAudioStore';
import TranscriptionEditor from './TranscriptionEditor';
import TranscriptionSummary, { SummaryData } from './TranscriptionSummary';
import {
  Box, LinearProgress, Typography, Stack, Alert, Button, IconButton,
  CircularProgress, Snackbar, Menu, MenuItem, ListItemText,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Cancel as CancelIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  Edit as EditIcon,
  ChevronRight as ChevronRightIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { LoaderFunctionArgs } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import StatusBadge from '../../shared/StatusBadge';
import { DS } from '../../../theme';

interface ITranscriptionSegment {
  timestamp: string;
  text: string;
  start: number;
  end: number;
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
  summary?: SummaryData | null;
}

interface LoaderData {
  id: string;
}

export function loader({ params }: LoaderFunctionArgs) {
  return { id: params.id };
}

const EXPORT_FORMATS: { label: string; format: 'txt' | 'srt' | 'vtt' }[] = [
  { label: 'Plain text (.txt)', format: 'txt' },
  { label: 'Subtitles (.srt)', format: 'srt' },
  { label: 'Web captions (.vtt)', format: 'vtt' },
];

const ghostButtonSx = {
  border: `1px solid ${DS.outlineVariant}30`,
  color: DS.primary,
  borderRadius: '12px',
  px: 2,
  py: 0.75,
  fontSize: '13px',
  fontFamily: '"Inter", sans-serif',
  '&:hover': { bgcolor: DS.surface, borderColor: DS.outlineVariant },
  '&:disabled': { color: DS.outline, borderColor: `${DS.outlineVariant}20` },
};

const TranscriptionShow = () => {
  const { id } = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const [summaryPollingInterval, setSummaryPollingInterval] = useState(0);
  const { data: transcription, isLoading } = useGetTranscriptionQuery(Number(id), {
    pollingInterval: summaryPollingInterval,
  }) as { data: TranscriptionDetailsResponse | undefined; isLoading: boolean };

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

  const [isEditing, setIsEditing] = useState(false);
  const [editedSegments, setEditedSegments] = useState<ITranscriptionSegment[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [currentSummary, setCurrentSummary] = useState<SummaryData | null>(null);

  const { showNotification } = useNotification();
  const setSeek = useAudioStore((state) => state.setSeek);
  const [updateTranscription] = useUpdateTranscriptionMutation();
  const { latestMessage, cancelTranscription } = useActionCable('TranscriptionChannel', id);

  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel this transcription?')) {
      cancelTranscription();
    }
  }, [cancelTranscription]);

  const handleEnterEdit = useCallback(() => {
    const segs = Array.isArray(transcription?.transcriptions) ? transcription.transcriptions : [];
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
      const transcriptionText = editedSegments.map((s) => s.text).join(' ');
      const transcriptionJson = {
        segments: editedSegments.map((s) => ({
          id: (s as any).id,
          text: s.text,
          start: s.start,
          end: s.end,
          timestamp: s.timestamp,
        })),
      };
      await updateTranscription({ id: Number(id), transcription: transcriptionText, transcriptionJson }).unwrap();
      setIsEditing(false);
      setHasUnsavedChanges(false);
    } catch {
      showNotification('Failed to save changes. Please try again.', 'danger');
    } finally {
      setIsSaving(false);
    }
  }, [editedSegments, id, updateTranscription]);

  const handleSegmentsChange = useCallback((segments: ITranscriptionSegment[]) => {
    setEditedSegments(segments);
    setHasUnsavedChanges(true);
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (!isEditing) return;
    const handleKeyDown = (e: KeyboardEvent) => { if (e.ctrlKey && e.key === 'Enter') handleSave(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, handleSave]);

  useEffect(() => {
    if (!latestMessage) return;
    if (latestMessage.summary) {
      const s = latestMessage.summary as any;
      setCurrentSummary({
        overview: s.overview,
        keyPoints: s.key_points ?? s.keyPoints ?? [],
        actionItems: s.action_items ?? s.actionItems ?? [],
      });
      setSummaryPollingInterval(0);
    }
    if (latestMessage.summary_error) setSummaryPollingInterval(0);
    setTranscriptionState((prevState) => ({
      text: latestMessage.transcription_json || prevState.text,
      isCompleted: latestMessage.status === 'completed' || latestMessage.status === 'failed' || prevState.isCompleted,
      progress: latestMessage.progress !== undefined ? latestMessage.progress : prevState.progress,
      status: latestMessage.status || prevState.status,
      error: latestMessage.error || prevState.error,
      cancelled: latestMessage.status === 'cancelled' || prevState.cancelled,
    }));
  }, [latestMessage]);

  useEffect(() => {
    if (transcription?.summary) {
      setCurrentSummary(transcription.summary);
      setSummaryPollingInterval(0);
    }
  }, [transcription?.summary]);

  const getStatusText = useCallback(() => {
    switch (transcriptionState.status) {
      case 'uploading': return 'Uploading audio file...';
      case 'processing': return 'Processing audio...';
      case 'in_progress': return 'Preparing for transcription...';
      case 'transcribing': return 'Transcribing audio...';
      case 'post_processing': return 'Finalizing transcription...';
      case 'completed': return 'Transcription completed!';
      case 'failed': return 'Transcription failed';
      case 'cancelled': return 'Transcription cancelled';
      default: return 'Please wait while we process your transcription';
    }
  }, [transcriptionState.status]);

  const transcriptionSegments = useAdjustableTranscription(
    (transcription?.transcriptions || transcriptionState.text || []) as ITranscriptionSegment[]
  );

  const transcriptWithTimestamps = useMemo(
    () =>
      transcriptionSegments
        ?.map((t) => `${t.timestampOfChunk} ${t.segments.map((s) => s.text).join('').trim()}`)
        .join('\n') ?? '',
    [transcriptionSegments]
  );

  const handleDownloadButtonClick = (event: React.MouseEvent<HTMLElement>) => setDownloadMenuAnchor(event.currentTarget);
  const handleDownloadMenuClose = () => setDownloadMenuAnchor(null);

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
    } catch { /* ignore */ }
  }, [transcriptWithTimestamps]);

  const handleTimestampClick = useCallback((startTime: number) => setSeek(startTime), [setSeek]);

  if (isLoading || !transcription) return <TranscriptionShowSkeleton />;

  const showInProgress =
    ['in_progress', 'pending', 'uploading', 'processing', 'transcribing', 'post_processing'].includes(
      transcriptionState.status || transcription.status
    ) &&
    !transcriptionState.isCompleted &&
    !transcription.transcriptions;

  const displayStatus = transcriptionState.status || transcription.status;

  return (
    <Box sx={{ bgcolor: DS.bg, minHeight: '100vh', color: DS.onSurface, pt: '64px' }}>
      <Box sx={{ px: { xs: 2, sm: 4, md: 6 }, py: 4, maxWidth: '1200px', mx: 'auto' }}>
        {/* Breadcrumb */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <Typography
            onClick={() => navigate('/transcriptions')}
            sx={{
              color: DS.outline,
              fontSize: '12px',
              cursor: 'pointer',
              fontFamily: '"Inter", sans-serif',
              '&:hover': { color: DS.onSurface },
            }}
          >
            Library
          </Typography>
          <ChevronRightIcon sx={{ color: DS.outline, fontSize: '16px' }} />
          <Typography sx={{ color: DS.outline, fontSize: '12px', fontFamily: '"Inter", sans-serif' }}>
            {transcription.audioFilename || `Transcription #${id}`}
          </Typography>
        </Box>

        {/* Title row */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, gap: 2, flexWrap: 'wrap' }}>
          <Box>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: { xs: '1.5rem', md: '2rem' },
                color: DS.onSurface,
                letterSpacing: '-0.02em',
                lineHeight: 1.2,
                mb: 1,
              }}
            >
              {transcription.audioFilename || `Transcription #${id}`}
            </Typography>
            <StatusBadge status={displayStatus} />
          </Box>

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {!isEditing ? (
              <Button
                onClick={handleEnterEdit}
                disabled={!Array.isArray(transcription?.transcriptions) || transcription.transcriptions.length === 0}
                startIcon={<EditIcon sx={{ fontSize: '16px !important' }} />}
                variant="outlined"
                sx={ghostButtonSx}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  startIcon={isSaving ? <CircularProgress size={14} sx={{ color: DS.onPrimary }} /> : undefined}
                  sx={{
                    background: DS.primaryGradient,
                    color: DS.onPrimary,
                    borderRadius: '12px',
                    px: 2,
                    py: 0.75,
                    fontSize: '13px',
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 700,
                    '&:hover': { background: DS.primaryGradient, opacity: 0.9 },
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save changes'}
                </Button>
                <Button onClick={handleDiscardEdit} disabled={isSaving} variant="outlined" sx={ghostButtonSx}>
                  Discard
                </Button>
              </>
            )}

            <Button
              onClick={handleCopy}
              disabled={!transcriptWithTimestamps}
              startIcon={<ContentCopyIcon sx={{ fontSize: '16px !important' }} />}
              variant="outlined"
              sx={ghostButtonSx}
            >
              Copy
            </Button>

            <Button
              onClick={handleDownloadButtonClick}
              startIcon={<DownloadIcon sx={{ fontSize: '16px !important' }} />}
              variant="outlined"
              sx={ghostButtonSx}
            >
              Download
            </Button>

            <Button
              startIcon={<ShareIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                background: DS.primaryGradient,
                color: DS.onPrimary,
                borderRadius: '12px',
                px: 2,
                py: 0.75,
                fontSize: '13px',
                fontFamily: '"Inter", sans-serif',
                fontWeight: 700,
                '&:hover': { background: DS.primaryGradient, opacity: 0.9 },
              }}
            >
              Share
            </Button>

            <Menu
              anchorEl={downloadMenuAnchor}
              open={Boolean(downloadMenuAnchor)}
              onClose={handleDownloadMenuClose}
              PaperProps={{
                sx: {
                  bgcolor: DS.surfaceHigh,
                  border: `1px solid ${DS.outlineVariant}33`,
                  borderRadius: '12px',
                },
              }}
            >
              {EXPORT_FORMATS.map(({ label, format }) => (
                <MenuItem
                  key={format}
                  onClick={() => handleExport(format)}
                  sx={{
                    fontSize: '13px',
                    fontFamily: '"Inter", sans-serif',
                    color: DS.onSurfaceVariant,
                    '&:hover': { bgcolor: DS.surfaceBright, color: DS.onSurface },
                  }}
                >
                  <ListItemText primary={label} />
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Box>

        {/* Segment size controls */}
        <Box
          sx={{
            bgcolor: DS.surfaceLow,
            borderRadius: '12px',
            p: 2,
            mb: 3,
            border: `1px solid ${DS.outlineVariant}1a`,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography sx={{ color: DS.onSurfaceVariant, fontSize: '12px', fontFamily: '"Inter", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flexShrink: 0 }}>
            Chunk size
          </Typography>
          <Box sx={{ '& .MuiSlider-root': { color: DS.primary }, '& .MuiSvgIcon-root': { color: DS.outline }, minWidth: 160 }}>
            <AdjustSegmentSizeSlider />
          </Box>
        </Box>

        {/* Audio Player Card */}
        <Box
          sx={{
            bgcolor: DS.surfaceLow,
            borderRadius: '16px',
            border: `1px solid ${DS.outlineVariant}0d`,
            p: 3,
            mb: 3,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: DS.primaryGradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PlayArrowIcon sx={{ color: DS.onPrimary, fontSize: '24px' }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                sx={{
                  color: DS.onSurface,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '14px',
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {transcription.audioFilename}
              </Typography>
              <Typography sx={{ color: DS.outline, fontFamily: '"Inter", sans-serif', fontSize: '12px' }}>
                Audio File
              </Typography>
            </Box>
          </Box>
          <AudioPlayer src={transcription.audioTranscriptionPath} />
        </Box>

        {/* AI Summary */}
        {transcription?.status === 'completed' && (
          <TranscriptionSummary
            transcriptionId={Number(id)}
            summary={currentSummary}
            transcriptionText={
              typeof transcription?.transcriptions === 'string'
                ? transcription.transcriptions
                : Array.isArray(transcription?.transcriptions)
                ? transcription.transcriptions.map((s) => s.text).join(' ')
                : null
            }
            onGenerateStart={() => setSummaryPollingInterval(3000)}
          />
        )}

        {/* Transcription title */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, mt: 2 }}>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 700,
              fontSize: '1.125rem',
              color: DS.onSurface,
              letterSpacing: '-0.01em',
            }}
          >
            Transcript
          </Typography>
          {isEditing && (
            <Box
              sx={{
                px: 1.5,
                py: 0.25,
                borderRadius: '9999px',
                bgcolor: `${DS.tertiary}1a`,
                color: DS.tertiary,
                fontSize: '10px',
                fontWeight: 700,
                fontFamily: '"Inter", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Editing
            </Box>
          )}
        </Box>

        {/* Progress State */}
        {showInProgress && !transcriptionState.cancelled && !transcriptionState.error ? (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ color: DS.onSurface, fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '1rem' }}>
                {getStatusText()}
              </Typography>
              <IconButton onClick={handleCancel} title="Cancel transcription" sx={{ color: DS.outline, '&:hover': { color: DS.error } }}>
                <CancelIcon />
              </IconButton>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1, height: 6, borderRadius: '9999px', bgcolor: DS.surfaceHigh, overflow: 'hidden' }}>
                <Box
                  sx={{
                    height: '100%',
                    borderRadius: '9999px',
                    background: DS.primaryGradient,
                    width: `${transcriptionState.progress}%`,
                    transition: 'width 0.5s ease',
                  }}
                />
              </Box>
              <Typography sx={{ color: DS.onSurfaceVariant, fontFamily: 'monospace', fontSize: '13px', flexShrink: 0 }}>
                {transcriptionState.progress}%
              </Typography>
            </Box>
            <TranscriptionSegmentsSkeleton />
          </Box>
        ) : (
          !transcriptionState.cancelled && !transcriptionState.error && transcriptionSegments && transcriptionSegments.length > 0 && (
            isEditing ? (
              <TranscriptionEditor segments={editedSegments} onChange={handleSegmentsChange} />
            ) : (
              <Box>
                {transcriptionSegments.map((segment) => (
                  <Box
                    key={segment.id}
                    sx={{
                      display: 'flex',
                      gap: 3,
                      mb: 6,
                    }}
                    onMouseEnter={() => setHoveredTimestamp(String(segment.id))}
                    onMouseLeave={() => setHoveredTimestamp(null)}
                  >
                    <Box
                      sx={{
                        width: '96px',
                        flexShrink: 0,
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        color: hoveredTimestamp === String(segment.id) ? DS.primary : DS.outline,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 0.5,
                        pt: '4px',
                        transition: 'color 0.2s',
                      }}
                      onClick={() => handleTimestampClick(segment.startOfChunk)}
                    >
                      <PlayArrowIcon
                        sx={{
                          fontSize: '14px',
                          opacity: hoveredTimestamp === String(segment.id) ? 1 : 0,
                          transition: 'opacity 0.2s',
                          flexShrink: 0,
                          mt: '1px',
                        }}
                      />
                      {segment.timestampOfChunk}
                    </Box>
                    <Typography
                      sx={{
                        fontFamily: '"Newsreader", serif',
                        fontSize: '1.25rem',
                        lineHeight: 1.6,
                        color: DS.onSurface,
                        flex: 1,
                      }}
                    >
                      {segment.segments.map((s, index) => (
                        <span key={s.id || index}>{s.text}</span>
                      ))}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )
          )
        )}

        {/* No segments */}
        {!showInProgress && transcriptionSegments && transcriptionSegments.length === 0 && !transcriptionState.error && !transcriptionState.cancelled && (
          <Typography sx={{ color: DS.onSurfaceVariant, fontFamily: '"Newsreader", serif', fontSize: '1rem', fontStyle: 'italic' }}>
            No transcription segments available
          </Typography>
        )}

        {/* Error */}
        {transcriptionState.error && (
          <Alert
            severity="error"
            sx={{ bgcolor: `${DS.errorContainer}33`, color: DS.error, '& .MuiAlert-icon': { color: DS.error }, borderRadius: '12px', mt: 2 }}
            action={<Button size="small" onClick={() => window.location.reload()} sx={{ color: DS.error }}>Retry</Button>}
          >
            {transcriptionState.error}
          </Alert>
        )}

        {/* Cancelled */}
        {transcriptionState.cancelled && (
          <Alert
            severity="info"
            sx={{ bgcolor: `${DS.outlineVariant}1a`, color: DS.onSurfaceVariant, '& .MuiAlert-icon': { color: DS.outline }, borderRadius: '12px', mt: 2 }}
          >
            This transcription was cancelled. You can upload a new file to try again.
          </Alert>
        )}
      </Box>

      <Snackbar open={copied} autoHideDuration={2000} onClose={() => setCopied(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setCopied(false)} severity="success" sx={{ bgcolor: 'rgba(34, 197, 94, 0.1)', color: '#34d399' }}>
          Copied to clipboard!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TranscriptionShow;

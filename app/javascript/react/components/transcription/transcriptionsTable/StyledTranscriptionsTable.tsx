import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemText,
  Typography,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  AudioFile as AudioIcon,
  VideoFile as VideoIcon,
} from '@mui/icons-material';
import { useDeleteTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../shared/StatusBadge';
import { DS } from '../../../theme';

interface Transcription {
  id: number;
  audioFilename?: string | null;
  createdAtFormatted?: string;
  duration?: string | number;
  status: string;
}

interface StyledTranscriptionsTableProps {
  transcriptions: Transcription[];
}

const EXPORT_FORMATS: { label: string; format: 'txt' | 'srt' | 'vtt' }[] = [
  { label: 'Plain text (.txt)', format: 'txt' },
  { label: 'Subtitles (.srt)', format: 'srt' },
  { label: 'Web captions (.vtt)', format: 'vtt' },
];

const handleExport = (id: number, format: 'txt' | 'srt' | 'vtt') => {
  const link = document.createElement('a');
  link.href = `/ajax/transcriptions/${id}/export?format=${format}`;
  link.setAttribute('download', '');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const isVideoFile = (filename?: string | null): boolean => {
  if (!filename) return false;
  return /\.(mp4|mov|avi|mkv|webm|flv|wmv|m4v)$/i.test(filename);
};

const StyledTranscriptionsTable: React.FC<StyledTranscriptionsTableProps> = ({ transcriptions }) => {
  const [deleteTranscription, { isLoading: isDeleting }] = useDeleteTranscriptionMutation();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState<null | HTMLElement>(null);
  const [downloadMenuId, setDownloadMenuId] = useState<number | null>(null);

  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'string') return duration;
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleViewTranscription = (id: number) => navigate(`/transcriptions/${id}/`);

  const handleDownloadIconClick = (event: React.MouseEvent<HTMLElement>, id: number) => {
    setDownloadMenuAnchor(event.currentTarget);
    setDownloadMenuId(id);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
    setDownloadMenuId(null);
  };

  const handleDownloadFormatSelect = (format: 'txt' | 'srt' | 'vtt') => {
    if (downloadMenuId !== null) handleExport(downloadMenuId, format);
    handleDownloadMenuClose();
  };

  const handleDeleteTranscription = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transcription?')) return;
    try {
      const result = await deleteTranscription(id).unwrap();
      if (result) {
        showNotification('Transcription deleted successfully', 'success');
      } else {
        showNotification('Failed to delete transcription', 'danger');
      }
    } catch (error) {
      showNotification('An error occurred while deleting the transcription', 'danger');
    }
  };

  if (transcriptions.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          color: DS.onSurfaceVariant,
          bgcolor: DS.surfaceLow,
          borderRadius: '16px',
          border: `1px solid ${DS.outlineVariant}1a`,
          fontFamily: '"Newsreader", serif',
          fontSize: '1rem',
          fontStyle: 'italic',
        }}
      >
        No transcriptions found
      </Box>
    );
  }

  const actionIconSx = {
    color: DS.outline,
    p: 1,
    borderRadius: '8px',
    '&:hover': { color: DS.onSurface, bgcolor: DS.surfaceHighest },
  };

  return (
    <>
      <TableContainer
        component={Paper}
        sx={{
          bgcolor: DS.surfaceLow,
          borderRadius: '16px',
          overflow: 'hidden',
          border: `1px solid ${DS.outlineVariant}1a`,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: `${DS.surfaceHigh}80` }}>
              <TableCell sx={{ color: DS.outline, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: `1px solid ${DS.outlineVariant}1a`, py: 2, px: 3, fontFamily: '"Inter", sans-serif' }}>
                Name
              </TableCell>
              <TableCell sx={{ color: DS.outline, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: `1px solid ${DS.outlineVariant}1a`, py: 2, px: 2, fontFamily: '"Inter", sans-serif' }}>
                Duration
              </TableCell>
              <TableCell sx={{ color: DS.outline, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: `1px solid ${DS.outlineVariant}1a`, py: 2, px: 2, fontFamily: '"Inter", sans-serif' }}>
                Status
              </TableCell>
              <TableCell sx={{ color: DS.outline, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', borderBottom: `1px solid ${DS.outlineVariant}1a`, py: 2, px: 2, fontFamily: '"Inter", sans-serif' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transcriptions.map((transcription) => {
              const isVideo = isVideoFile(transcription.audioFilename);
              return (
                <TableRow
                  key={transcription.id}
                  className="group"
                  sx={{
                    borderBottom: `1px solid ${DS.outlineVariant}1a`,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: DS.surface },
                    '&:last-child td': { borderBottom: 'none' },
                  }}
                  onClick={() => handleViewTranscription(transcription.id)}
                >
                  {/* Type icon + Name */}
                  <TableCell sx={{ borderBottom: 'none', py: 2, px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '8px',
                          bgcolor: DS.surfaceHighest,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {isVideo ? (
                          <VideoIcon sx={{ color: DS.primary, fontSize: 20 }} />
                        ) : (
                          <AudioIcon sx={{ color: DS.primary, fontSize: 20 }} />
                        )}
                      </Box>
                      <Typography
                        sx={{
                          color: DS.onSurface,
                          fontFamily: '"Inter", sans-serif',
                          fontSize: '14px',
                          fontWeight: 500,
                        }}
                      >
                        {transcription.audioFilename || `Transcription ${transcription.id}`}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Duration */}
                  <TableCell sx={{ borderBottom: 'none', py: 2, px: 2 }}>
                    <Typography
                      sx={{
                        color: DS.onSurfaceVariant,
                        fontFamily: 'monospace',
                        fontSize: '13px',
                      }}
                    >
                      {transcription.duration ? formatDuration(transcription.duration) : '--:--:--'}
                    </Typography>
                  </TableCell>

                  {/* Status */}
                  <TableCell sx={{ borderBottom: 'none', py: 2, px: 2 }}>
                    <StatusBadge status={transcription.status} />
                  </TableCell>

                  {/* Actions */}
                  <TableCell
                    sx={{ borderBottom: 'none', py: 2, px: 2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        sx={actionIconSx}
                        onClick={(e) => { e.stopPropagation(); handleViewTranscription(transcription.id); }}
                        title="View transcription"
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={actionIconSx}
                        onClick={(e) => { e.stopPropagation(); handleDownloadIconClick(e, transcription.id); }}
                        title="Download transcription"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ ...actionIconSx, '&:hover': { color: DS.error, bgcolor: `${DS.errorContainer}33` } }}
                        onClick={(e) => { e.stopPropagation(); handleDeleteTranscription(transcription.id); }}
                        title="Delete transcription"
                        disabled={isDeleting}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

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
            onClick={() => handleDownloadFormatSelect(format)}
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
    </>
  );
};

export default StyledTranscriptionsTable;

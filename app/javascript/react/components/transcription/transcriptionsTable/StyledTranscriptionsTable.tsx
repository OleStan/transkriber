import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useDeleteTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useNotification } from '../../../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';

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

// Status color mapping from existing TranscriptionsTableBase
const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
  completed: 'success',
  in_progress: 'warning',
  pending: 'warning',
  uploading: 'default',
  transcribing: 'default',
  error: 'error',
  processing: 'warning',
  failed: 'error',
};

const StyledTranscriptionsTable: React.FC<StyledTranscriptionsTableProps> = ({ transcriptions }) => {
  const [deleteTranscription, { isLoading: isDeleting }] = useDeleteTranscriptionMutation();
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const formatDuration = (duration: string | number) => {
    if (typeof duration === 'string') {
      return duration; // Return as-is if already formatted
    }
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleViewTranscription = (id: number) => {
    navigate(`/transcriptions/${id}/`);
  };

  const handleDownloadTranscription = (id: number) => {
    // TODO: Implement download functionality
    console.log('Download transcription:', id);
    showNotification('Download functionality coming soon', 'warning');
  };

  const handleDeleteTranscription = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this transcription?')) {
      return;
    }

    try {
      const result = await deleteTranscription(id).unwrap();
      if (result) {
        showNotification('Transcription deleted successfully', 'success');
      } else {
        showNotification('Failed to delete transcription', 'danger');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showNotification('An error occurred while deleting the transcription', 'danger');
    }
  };

  if (transcriptions.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 8, 
          color: '#9db1be',
          bgcolor: '#141b1f',
          border: '1px solid #3d505c',
          borderRadius: '12px'
        }}
      >
        No transcriptions found
      </Box>
    );
  }

  return (
    <TableContainer 
      component={Paper}
      sx={{
        bgcolor: '#141b1f',
        border: '1px solid #3d505c',
        borderRadius: '12px',
        overflow: 'hidden'
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: '#1f282e' }}>
          <TableRow>
            <TableCell 
              sx={{ 
                color: 'white', 
                fontWeight: 'medium', 
                fontSize: '14px',
                borderBottom: 'none',
                py: 3,
                px: 4
              }}
            >
              Name
            </TableCell>
            <TableCell 
              sx={{ 
                color: 'white', 
                fontWeight: 'medium', 
                fontSize: '14px',
                borderBottom: 'none',
                py: 3,
                px: 4
              }}
            >
              Duration
            </TableCell>
            <TableCell 
              sx={{ 
                color: 'white', 
                fontWeight: 'medium', 
                fontSize: '14px',
                borderBottom: 'none',
                py: 3,
                px: 4
              }}
            >
              Status
            </TableCell>
            <TableCell 
              sx={{ 
                color: '#9db1be', 
                fontWeight: 'medium', 
                fontSize: '14px',
                borderBottom: 'none',
                py: 3,
                px: 4
              }}
            >
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transcriptions.map((transcription) => (
            <TableRow 
              key={transcription.id} 
              sx={{ 
                borderTop: '1px solid #3d505c',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.02)'
                }
              }}
            >
              <TableCell 
                sx={{ 
                  color: 'white', 
                  fontSize: '14px',
                  borderBottom: 'none',
                  py: 2,
                  px: 4,
                  height: '72px'
                }}
              >
                {transcription.audioFilename || `Transcription ${transcription.id}`}
              </TableCell>
              <TableCell 
                sx={{ 
                  color: '#9db1be', 
                  fontSize: '14px',
                  borderBottom: 'none',
                  py: 2,
                  px: 4
                }}
              >
                {transcription.duration ? formatDuration(transcription.duration) : '--:--:--'}
              </TableCell>
              <TableCell 
                sx={{ 
                  borderBottom: 'none',
                  py: 2,
                  px: 4
                }}
              >
                <Chip
                  label={transcription.status || 'Unknown'}
                  color={statusColors[transcription.status] || 'default'}
                  variant="filled"
                  sx={{
                    bgcolor: '#2b3840',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'medium',
                    borderRadius: '20px',
                    height: '32px',
                    minWidth: '84px'
                  }}
                />
              </TableCell>
              <TableCell 
                sx={{ 
                  color: '#9db1be', 
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderBottom: 'none',
                  py: 2,
                  px: 4
                }}
              >
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#9db1be', '&:hover': { color: 'white', bgcolor: '#2b3840' } }}
                    onClick={() => handleViewTranscription(transcription.id)}
                    title="View transcription"
                  >
                    <ViewIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#9db1be', '&:hover': { color: 'white', bgcolor: '#2b3840' } }}
                    onClick={() => handleDownloadTranscription(transcription.id)}
                    title="Download transcription"
                  >
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    sx={{ color: '#9db1be', '&:hover': { color: 'white', bgcolor: '#2b3840' } }}
                    onClick={() => handleDeleteTranscription(transcription.id)}
                    title="Delete transcription"
                    disabled={isDeleting}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StyledTranscriptionsTable;

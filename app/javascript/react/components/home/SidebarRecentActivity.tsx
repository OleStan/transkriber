import React from 'react';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Skeleton from '@mui/joy/Skeleton';
import Link from '@mui/joy/Link';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { Transcription } from '../../redux/resourcesApi/transcriptions/types';

const IN_PROGRESS_STATUSES = new Set([
  'in_progress',
  'transcribing',
  'uploading',
  'processing',
  'post_processing',
]);

function statusDotColor(status: string): string {
  if (status === 'completed') return 'var(--joy-palette-success-500, #1a7f4b)';
  if (status === 'failed') return 'var(--joy-palette-danger-500, #c41c1c)';
  if (status === 'cancelled') return 'var(--joy-palette-neutral-500, #636b74)';
  if (IN_PROGRESS_STATUSES.has(status)) return 'var(--joy-palette-warning-500, #9a5b13)';
  return 'var(--joy-palette-neutral-500, #636b74)';
}

function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    pending: 'Pending',
    in_progress: 'In progress',
    transcribing: 'Transcribing',
    uploading: 'Uploading',
    processing: 'Processing',
    post_processing: 'Post-processing',
  };
  return labels[status] ?? status;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen).trimEnd() + '…';
}

const pulseAnimation = {
  '@keyframes sidebarPulse': {
    '0%': { opacity: 1 },
    '50%': { opacity: 0.4 },
    '100%': { opacity: 1 },
  },
  animation: 'sidebarPulse 1.5s ease-in-out infinite',
};

interface ActivityItemProps {
  transcription: Transcription;
  onClick: () => void;
}

const ActivityItem: React.FC<ActivityItemProps> = ({ transcription, onClick }) => {
  const isInProgress = IN_PROGRESS_STATUSES.has(transcription.status);
  const dotColor = statusDotColor(transcription.status);
  const displayName = truncate(transcription.audioFilename || `Transcription #${transcription.id}`, 28);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.25,
        px: 1,
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'background 0.15s',
        '&:hover': {
          bgcolor: 'rgba(255, 255, 255, 0.05)',
        },
      }}
    >
      {/* Status dot */}
      <Box
        sx={{
          flexShrink: 0,
          width: 10,
          height: 10,
          borderRadius: '50%',
          bgcolor: dotColor,
          ...(isInProgress ? pulseAnimation : {}),
        }}
      />

      {/* Title and status */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          level="body-sm"
          sx={{
            color: 'white',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            lineHeight: 1.3,
          }}
        >
          {displayName}
        </Typography>
        <Typography
          level="body-xs"
          sx={{
            color: '#9db1be',
            lineHeight: 1.3,
            mt: 0.25,
          }}
        >
          {statusLabel(transcription.status)}
        </Typography>
      </Box>

      {/* Date */}
      <Typography
        level="body-xs"
        sx={{
          flexShrink: 0,
          color: '#6b7f8a',
          whiteSpace: 'nowrap',
        }}
      >
        {transcription.createdAtFormatted}
      </Typography>
    </Box>
  );
};

const SidebarRecentActivity: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetTranscriptionsQuery({ page: 1 });
  const recent = data?.transcriptions?.slice(0, 5) ?? [];

  return (
    <Box
      sx={{
        bgcolor: '#141b1f',
        border: '1px solid #3d505c',
        borderRadius: '12px',
        p: 2,
        minWidth: 220,
      }}
    >
      <Typography
        level="title-sm"
        sx={{
          mb: 1.5,
          color: 'white',
          fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
          fontWeight: 'bold',
        }}
      >
        Recent Activity
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[0, 1, 2].map((i) => (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Skeleton variant="circular" width={10} height={10} />
              <Box sx={{ flex: 1 }}>
                <Skeleton variant="text" level="body-sm" width="70%" />
                <Skeleton variant="text" level="body-xs" width="40%" />
              </Box>
            </Box>
          ))}
        </Box>
      ) : recent.length === 0 ? (
        <Typography level="body-sm" sx={{ color: '#9db1be' }}>
          No transcriptions yet. Upload your first file.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {recent.map((t) => (
            <ActivityItem
              key={t.id}
              transcription={t}
              onClick={() => navigate(`/transcriptions/${t.id}`)}
            />
          ))}
        </Box>
      )}

      <Box sx={{ mt: 2, pt: 1.5, borderTop: '1px solid #3d505c' }}>
        <Link
          component={RouterLink}
          to="/transcriptions"
          level="body-sm"
          sx={{
            color: '#1994e6',
            textDecoration: 'none',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View all →
        </Link>
      </Box>
    </Box>
  );
};

export default SidebarRecentActivity;

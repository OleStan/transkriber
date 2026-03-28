import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useGetUsageQuery } from '../../redux/resourcesApi/billing/billingSlice';
import { Transcription } from '../../redux/resourcesApi/transcriptions/types';
import { DS } from '../../theme';

const IN_PROGRESS_STATUSES = new Set([
  'in_progress',
  'transcribing',
  'uploading',
  'processing',
  'post_processing',
]);

function statusDotColor(status: string): string {
  if (status === 'completed') return '#22c55e';
  if (status === 'failed') return DS.error;
  if (IN_PROGRESS_STATUSES.has(status)) return DS.tertiary;
  return DS.outline;
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
  const isFailed = transcription.status === 'failed';
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
        bgcolor: isFailed ? 'rgba(147, 0, 10, 0.1)' : 'transparent',
        '&:hover': {
          bgcolor: isFailed ? 'rgba(147, 0, 10, 0.15)' : DS.surface,
        },
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: dotColor,
          ...(isInProgress ? pulseAnimation : {}),
        }}
      />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          sx={{
            color: DS.onSurface,
            fontFamily: '"Inter", sans-serif',
            fontSize: '13px',
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
          sx={{
            color: isFailed ? DS.error : DS.onSurfaceVariant,
            fontFamily: '"Inter", sans-serif',
            fontSize: '11px',
            lineHeight: 1.3,
            mt: 0.25,
          }}
        >
          {statusLabel(transcription.status)}
        </Typography>
      </Box>
      <Typography
        sx={{
          flexShrink: 0,
          color: DS.outline,
          fontFamily: '"Inter", sans-serif',
          fontSize: '11px',
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
  const { data: usage } = useGetUsageQuery();

  const minutesUsed = usage?.currentPeriod?.minutesUsed ?? 0;
  const minutesLimit = usage?.currentPeriod?.minutesLimit ?? 60;
  const unlimited = usage?.currentPeriod?.unlimited ?? false;
  const planName = usage?.plan?.name ?? 'Free';
  const usagePct = unlimited ? 0 : Math.min((minutesUsed / minutesLimit) * 100, 100);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 240 }}>
      {/* Recent Activity Card */}
      <Box
        sx={{
          bgcolor: DS.surfaceLow,
          borderRadius: '12px',
          p: 2,
          border: `1px solid ${DS.outlineVariant}1a`,
        }}
      >
        <Typography
          sx={{
            mb: 1.5,
            color: DS.onSurface,
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 700,
            fontSize: '14px',
          }}
        >
          Recent Activity
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[0, 1, 2].map((i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Skeleton variant="circular" width={8} height={8} sx={{ bgcolor: DS.surfaceHigh }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="70%" sx={{ bgcolor: DS.surfaceHigh }} />
                  <Skeleton variant="text" width="40%" sx={{ bgcolor: DS.surfaceHigh }} />
                </Box>
              </Box>
            ))}
          </Box>
        ) : recent.length === 0 ? (
          <Typography
            sx={{
              color: DS.onSurfaceVariant,
              fontFamily: '"Newsreader", serif',
              fontSize: '13px',
              fontStyle: 'italic',
            }}
          >
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

        <Box sx={{ mt: 2, pt: 1.5, borderTop: `1px solid ${DS.outlineVariant}30` }}>
          <Typography
            component={RouterLink}
            to="/transcriptions"
            sx={{
              color: DS.primary,
              textDecoration: 'none',
              fontFamily: '"Inter", sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              '&:hover': { opacity: 0.8 },
            }}
          >
            View all activity →
          </Typography>
        </Box>
      </Box>

      {/* Workspace Usage Card */}
      <Box
        sx={{
          bgcolor: DS.surfaceLow,
          borderRadius: '12px',
          p: 2,
          border: `1px solid ${DS.outlineVariant}1a`,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.5 }}>
          <Typography sx={{ color: DS.onSurface, fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '14px' }}>
            Workspace Usage
          </Typography>
          <Typography sx={{ color: DS.primary, fontFamily: '"Inter", sans-serif', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {planName}
          </Typography>
        </Box>
        <Typography sx={{ color: DS.onSurfaceVariant, fontFamily: '"Inter", sans-serif', fontSize: '11px', mb: 1.5 }}>
          {unlimited
            ? `${minutesUsed.toFixed(0)} min used (unlimited)`
            : `${minutesUsed.toFixed(0)} / ${minutesLimit} min used`}
        </Typography>

        {/* Progress bar */}
        <Box sx={{ bgcolor: DS.surfaceLowest, borderRadius: '9999px', height: 4, overflow: 'hidden', mb: 1.5 }}>
          <Box
            sx={{
              height: '100%',
              borderRadius: '9999px',
              background: DS.primaryGradient,
              width: `${usagePct}%`,
              transition: 'width 0.5s ease',
            }}
          />
        </Box>

        <Box
          component="button"
          onClick={() => navigate('/settings?section=billing')}
          sx={{
            width: '100%',
            py: 1,
            borderRadius: '8px',
            bgcolor: DS.secondaryContainer,
            color: DS.onSecondaryContainer,
            fontFamily: '"Inter", sans-serif',
            fontSize: '12px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
            '&:hover': { opacity: 0.85 },
          }}
        >
          {planName === 'Free' ? 'Upgrade Plan' : 'Manage Plan'}
        </Box>
      </Box>
    </Box>
  );
};

export default SidebarRecentActivity;

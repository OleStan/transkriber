import React from 'react';
import Box from '@mui/material/Box';
import { DS } from '../../theme';

interface StatusConfig {
  bg: string;
  color: string;
  dot: string;
  pulse?: boolean;
  label: string;
}

const STATUS_MAP: Record<string, StatusConfig> = {
  completed: {
    bg: 'rgba(16, 185, 129, 0.1)',
    color: '#34d399',
    dot: '#34d399',
    label: 'Completed',
  },
  in_progress: {
    bg: 'rgba(255, 184, 105, 0.1)',
    color: DS.tertiary,
    dot: DS.tertiary,
    pulse: true,
    label: 'In Progress',
  },
  transcribing: {
    bg: 'rgba(255, 184, 105, 0.1)',
    color: DS.tertiary,
    dot: DS.tertiary,
    pulse: true,
    label: 'Transcribing',
  },
  processing: {
    bg: 'rgba(255, 184, 105, 0.1)',
    color: DS.tertiary,
    dot: DS.tertiary,
    pulse: true,
    label: 'Processing',
  },
  uploading: {
    bg: 'rgba(255, 184, 105, 0.1)',
    color: DS.tertiary,
    dot: DS.tertiary,
    pulse: true,
    label: 'Uploading',
  },
  post_processing: {
    bg: 'rgba(255, 184, 105, 0.1)',
    color: DS.tertiary,
    dot: DS.tertiary,
    pulse: true,
    label: 'Post-processing',
  },
  failed: {
    bg: 'rgba(255, 180, 171, 0.1)',
    color: DS.error,
    dot: DS.error,
    label: 'Failed',
  },
  pending: {
    bg: 'rgba(149, 142, 160, 0.1)',
    color: DS.outline,
    dot: DS.outline,
    label: 'Pending',
  },
  cancelled: {
    bg: 'rgba(149, 142, 160, 0.1)',
    color: DS.outline,
    dot: DS.outline,
    label: 'Cancelled',
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  bg: 'rgba(149, 142, 160, 0.1)',
  color: DS.outline,
  dot: DS.outline,
  label: 'Unknown',
};

interface StatusBadgeProps {
  status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = STATUS_MAP[status] ?? DEFAULT_CONFIG;

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        px: 1.5,
        py: 0.5,
        borderRadius: '9999px',
        bgcolor: config.bg,
        fontSize: '10px',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: config.color,
        fontFamily: '"Inter", sans-serif',
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          bgcolor: config.dot,
          flexShrink: 0,
          ...(config.pulse && {
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.4 },
            },
          }),
        }}
      />
      {config.label}
    </Box>
  );
};

export default StatusBadge;

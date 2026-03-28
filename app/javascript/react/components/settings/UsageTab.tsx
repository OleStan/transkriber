import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { AudioFile, VideoFile, Schedule, WorkOutline } from '@mui/icons-material';
import { DS } from '../../theme';
import { useGetUsageQuery } from '../../redux/resourcesApi/billing/billingSlice';

const sectionCard = {
  bgcolor: DS.surfaceLow,
  borderRadius: '12px',
  p: 3,
  mb: 3,
};

const UsageTab: React.FC = () => {
  const { data: usage, isLoading } = useGetUsageQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} sx={{ color: DS.primary }} />
      </Box>
    );
  }

  if (!usage) return null;

  const { plan, currentPeriod, history } = usage;
  const maxHistory = Math.max(...history.map((h) => h.minutesUsed), 1);

  return (
    <Box>
      {/* Current period */}
      <Box sx={sectionCard}>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '14px', color: DS.onSurface, mb: 2 }}>
          This Month
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: DS.onSurfaceVariant }}>
            Transcription minutes
          </Typography>
          <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', fontWeight: 600, color: DS.onSurface }}>
            {currentPeriod.unlimited
              ? `${currentPeriod.minutesUsed.toFixed(1)} min (unlimited)`
              : `${currentPeriod.minutesUsed.toFixed(1)} / ${currentPeriod.minutesLimit} min`}
          </Typography>
        </Box>

        {!currentPeriod.unlimited && (
          <>
            <Box sx={{ height: 6, bgcolor: DS.surfaceHigh, borderRadius: '9999px', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${currentPeriod.percentageUsed}%`,
                  background: currentPeriod.percentageUsed >= 90
                    ? `linear-gradient(90deg, ${DS.tertiary}, ${DS.error})`
                    : DS.primaryGradient,
                  borderRadius: '9999px',
                  transition: 'width 0.3s ease',
                }}
              />
            </Box>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '11px', color: DS.outline, mt: 0.75 }}>
              {currentPeriod.percentageUsed}% used · resets on {new Date(currentPeriod.periodStart).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} (next month)
            </Typography>
          </>
        )}
      </Box>

      {/* Plan limits */}
      <Box sx={sectionCard}>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '14px', color: DS.onSurface, mb: 2 }}>
          Plan Limits · <span style={{ color: DS.primary }}>{plan.name}</span>
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {[
            { icon: Schedule, label: 'Minutes/month', value: plan.unlimitedMinutes ? 'Unlimited' : `${plan.transcriptionMinutesLimit} min` },
            { icon: WorkOutline, label: 'Max file size', value: `${plan.maxFileSizeMb} MB` },
            { icon: VideoFile, label: 'Video support', value: plan.videoAllowed ? 'Yes' : 'No' },
            { icon: AudioFile, label: 'Concurrent jobs', value: String(plan.maxConcurrentJobs) },
          ].map(({ icon: Icon, label, value }) => (
            <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: `${DS.primary}1a`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon sx={{ fontSize: 16, color: DS.primary }} />
              </Box>
              <Box>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '10px', color: DS.outline, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
                  {label}
                </Typography>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '13px', color: DS.onSurface, fontWeight: 600 }}>
                  {value}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Usage history */}
      <Box sx={sectionCard}>
        <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '14px', color: DS.onSurface, mb: 3 }}>
          Usage History
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 80 }}>
          {history.map((item) => {
            const heightPct = maxHistory > 0 ? (item.minutesUsed / maxHistory) * 100 : 0;
            return (
              <Box key={item.month} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '9px', color: DS.outline }}>
                  {item.minutesUsed > 0 ? item.minutesUsed.toFixed(0) : ''}
                </Typography>
                <Box sx={{ width: '100%', height: `${Math.max(heightPct, 4)}%`, minHeight: 3, background: heightPct > 0 ? DS.primaryGradient : DS.surfaceHigh, borderRadius: '4px 4px 0 0' }} />
                <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: '9px', color: DS.outline, whiteSpace: 'nowrap' }}>
                  {item.month.split(' ')[0]}
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default UsageTab;

import { useState, useEffect } from 'react';
import QuickAddFileOrUrl from './QuickAddFile/QuickAddFileOrUrl';
import SidebarRecentActivity from './SidebarRecentActivity';
import Box from '@mui/joy/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/joy/Stack';
import StyledTranscriptionsTable from '../transcription/transcriptionsTable/StyledTranscriptionsTable';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { Transcription } from '../../redux/resourcesApi/transcriptions/types';
import { CircularProgress } from '@mui/material';
import { cable } from '../../lib/cable';
import { DS } from '../../theme';

const Home = () => {
  const { data, error, isLoading } = useGetTranscriptionsQuery({ page: 1 });
  const transcriptions: Transcription[] = data?.transcriptions || [];
  const [updates, setUpdates] = useState<Record<number, { status: string }>>({});

  useEffect(() => {
    const activeTranscriptions = transcriptions.filter(
      ({ status }) => status !== 'completed' && status !== 'failed'
    );
    if (!activeTranscriptions.length) return;

    const subs = activeTranscriptions.map(({ id }) =>
      cable.subscriptions.create(
        { channel: 'TranscriptionChannel', room: id.toString() },
        {
          received(data: { status: string }) {
            setUpdates((prev) => ({ ...prev, [id]: data }));
          },
        }
      )
    );

    return () => subs.forEach((sub: any) => sub.unsubscribe());
  }, [transcriptions]);

  const displayTranscriptions = transcriptions.map((tr) => ({
    ...tr,
    status: updates[tr.id]?.status || tr.status,
  }));

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        bgcolor: DS.bg,
        pt: '64px',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <Stack spacing={4} sx={{ flexGrow: 1 }} direction={{ xs: 'column', md: 'row' }}>
          <Box sx={{ flex: 1 }}>
            {/* Hero Section */}
            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  fontFamily: '"Manrope", sans-serif',
                  fontSize: { xs: '2rem', md: '2.75rem' },
                  fontWeight: 800,
                  color: 'white',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  mb: 1,
                }}
              >
                The Digital Archivist
              </Typography>
              <Typography
                sx={{
                  fontFamily: '"Newsreader", serif',
                  fontSize: '1.25rem',
                  color: DS.onSurfaceVariant,
                  fontStyle: 'italic',
                  maxWidth: '480px',
                }}
              >
                Transform your recordings into editorial-grade transcripts.
              </Typography>
            </Box>

            <QuickAddFileOrUrl />

            {/* Feature Stat Cards */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3, mb: 4 }}>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: DS.surface,
                  borderRadius: '12px',
                  p: 3,
                  border: `1px solid ${DS.outlineVariant}1a`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: DS.primary,
                    mb: 0.5,
                  }}
                >
                  99.2%
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: DS.onSurface,
                    mb: 0.5,
                  }}
                >
                  Accuracy
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Newsreader", serif',
                    fontSize: '13px',
                    color: DS.onSurfaceVariant,
                    fontStyle: 'italic',
                  }}
                >
                  Powered by OpenAI Whisper for industry-leading precision.
                </Typography>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  bgcolor: DS.surfaceHigh,
                  borderRadius: '12px',
                  p: 3,
                  border: `1px solid ${DS.outlineVariant}1a`,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Manrope", sans-serif',
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: DS.tertiary,
                    mb: 0.5,
                  }}
                >
                  Real-time
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: DS.onSurface,
                    mb: 0.5,
                  }}
                >
                  Live Drafts
                </Typography>
                <Typography
                  sx={{
                    fontFamily: '"Newsreader", serif',
                    fontSize: '13px',
                    color: DS.onSurfaceVariant,
                    fontStyle: 'italic',
                  }}
                >
                  Watch your transcript appear word by word as it processes.
                </Typography>
              </Box>
            </Stack>

            <Box sx={{ mt: 2 }}>
              <Typography
                sx={{
                  mb: 2,
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 700,
                  fontSize: '1.125rem',
                  color: DS.onSurface,
                  letterSpacing: '-0.01em',
                }}
              >
                Recent Transcriptions
              </Typography>
              {isLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: 200,
                    bgcolor: DS.surfaceLow,
                    borderRadius: '12px',
                  }}
                >
                  <CircularProgress sx={{ color: DS.primary }} size={32} />
                </Box>
              ) : error ? (
                <Box
                  sx={{
                    p: 3,
                    bgcolor: `${DS.errorContainer}33`,
                    borderRadius: '12px',
                  }}
                >
                  <Typography sx={{ color: DS.error, fontFamily: '"Inter", sans-serif', fontSize: '14px' }}>
                    Error loading transcriptions
                  </Typography>
                </Box>
              ) : (
                <StyledTranscriptionsTable transcriptions={displayTranscriptions} />
              )}
            </Box>
          </Box>

          <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
            <SidebarRecentActivity />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;

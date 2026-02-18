import { useState, useEffect } from 'react';
import QuickAddFileOrUrl from './QuickAddFile/QuickAddFileOrUrl';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import StyledTranscriptionsTable from '../transcription/transcriptionsTable/StyledTranscriptionsTable';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { Transcription } from '../../redux/resourcesApi/transcriptions/types';
import { CircularProgress } from '@mui/material';
import { cable } from '../../lib/cable';

const Home = () => {
  // Fetch the first page of transcriptions for the home widget
  const { data, error, isLoading } = useGetTranscriptionsQuery({ page: 1 });
  const transcriptions: Transcription[] = data?.transcriptions || [];
  const [updates, setUpdates] = useState<Record<number, { status: string }>>({});

  // Subscribe to WebSocket updates for active transcriptions
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

  // Merge real-time updates with transcription data
  const displayTranscriptions = transcriptions.map((tr) => ({
    ...tr,
    status: updates[tr.id]?.status || tr.status,
  }));

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#111b22',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        <Stack spacing={4} sx={{ flexGrow: 1 }} direction={{ xs: 'column', md: 'row' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              level="h4" 
              sx={{ 
                mb: 3,
                color: 'white',
                fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
                fontWeight: 'bold'
              }}
            >
              Choose your transcription source:
            </Typography>
            <QuickAddFileOrUrl />
            <Box sx={{ mt: 5 }}>
              <Typography 
                level="h4" 
                sx={{ 
                  mb: 3,
                  color: 'white',
                  fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
                  fontWeight: 'bold'
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
                bgcolor: '#141b1f',
                border: '1px solid #3d505c',
                borderRadius: '12px'
              }}
            >
              <CircularProgress sx={{ color: '#1994e6' }} />
            </Box>
          ) : error ? (
            <Box 
              sx={{ 
                p: 3, 
                bgcolor: '#141b1f',
                border: '1px solid #3d505c',
                borderRadius: '12px',
                color: '#ff5252'
              }}
            >
              <Typography sx={{ color: '#ff5252' }}>
                Error loading transcriptions: {error instanceof Error ? error.message : 'Unknown error'}
              </Typography>
            </Box>
          ) : (
            <StyledTranscriptionsTable transcriptions={displayTranscriptions} />
          )}
            </Box>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default Home;

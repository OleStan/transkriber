import QuickAddFileOrUrl from './QuickAddFile/QuickAddFileOrUrl';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import RecentTranscriptionsTable from './RecentTranscriptionsTable';

const Home = () => {
  return (
    <Stack spacing={4} sx={{ flexGrow: 1 }} direction={{ xs: 'column', md: 'row' }}>
      <Box sx={{ flex: 1 }}>
        <Typography level="h4" sx={{ mb: 2 }}>
          Choose your transcription source:
        </Typography>
        <QuickAddFileOrUrl />
        <Box sx={{ mt: 4 }}>
          <RecentTranscriptionsTable />
        </Box>
      </Box>
    </Stack>
  );
};

export default Home;

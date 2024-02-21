import QuickAddFile from './QuickAddFile/QuickAddFile';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';

const Home = () => {
  return (
    <Stack spacing={16}>
      {
        // Card to add new transcription. User can click on it or drug on it file
        // Box with last transcriptions
      }
      <QuickAddFile />
      <Box>
        <Typography>*Table with last transcriptions*</Typography>
      </Box>
    </Stack>
  );
};

export default Home;

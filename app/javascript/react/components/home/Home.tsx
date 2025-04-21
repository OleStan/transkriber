import QuickAddFileOrUrl from './QuickAddFile/QuickAddFileOrUrl';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';

const Home = () => {
  return (
    <Stack spacing={4} sx={{ flexGrow: 1 }}>
      {/*<Grid container>*/}
      {/*  <Grid xs={6} md={6}>*/}
      {/*    <Typography variant={'outlined'}>Home</Typography>*/}
      {/*  </Grid>*/}
      {/*  <Grid xs={6} md={6}>*/}
      {/*  </Grid>*/}
      {/*</Grid>*/}
      <QuickAddFileOrUrl />

      <Box>
        <Typography>*Table with last transcriptions*</Typography>
      </Box>
    </Stack>
  );
};

export default Home;

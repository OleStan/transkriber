import React, {useEffect} from 'react';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
// import { ITranscriptionDetails } from '../../../redux/resourcesApi/transcriptions/types';
import { useSearchParams } from 'react-router-dom';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import useActionCable from '../../hooks/useActionCable';

// import TemplateOutlineRow from './transcriptionOutlineRow/TemplateOutlineRow';
import { Pagination } from '@mui/material';
import TranscriptionsTable from './transcriptionsTable/TranscriptionsTable';

const Transcriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  // const messages = useActionCable('TranscriptionChannel', 'Room1');

  const { data: transcriptions, error, isLoading } = useGetTranscriptionsQuery(currentPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    setSearchParams({ page: value.toString() }); // Update URL search params
  };

  useEffect(() => {
    if (isLoading) return;
  }, [transcriptions]);

  // Loading state
  if (isLoading) {
    return (
      <Stack alignItems='center' justifyContent='center' sx={{ height: '100vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Typography level='body-sm' sx={{ color: 'error.main' }}>
        Error occurred: {error instanceof Error ? error.message : 'Unknown error'}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography level='h4' component='h1' sx={{ mb: 2 }}>
      </Typography>
      {/*<Stack direction='column' spacing={2}>*/}
      {/*  {transcriptions?.transcriptions.map((transcription: ITranscriptionDetails) => (*/}
      {/*    <TemplateOutlineRow key={transcription.id} {...transcription} />*/}
      {/*  ))}*/}
      {/*</Stack>*/}
      <TranscriptionsTable transcriptions={transcriptions?.transcriptions} />
      {transcriptions?.totalPages > 1 && (
        <Stack direction='row' spacing={2} justifyContent='center' mt={2}>
          <Pagination
            count={transcriptions?.totalPages}
            page={currentPage}
            onChange={handlePageChange}
          />
        </Stack>
      )}
    </Stack>
  );
};

export default Transcriptions;

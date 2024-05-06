import React, { useEffect } from 'react';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useSearchParams } from 'react-router-dom';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import useActionCable from '../../hooks/useActionCable';
import { Pagination } from '@mui/material';
import TranscriptionsTable from './transcriptionsTable/TranscriptionsTable';
import QuickAddFile from '../home/QuickAddFile/QuickAddFile';

const Transcriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const {
    data: transcriptions,
    error,
    isLoading,
    refetch,
  } = useGetTranscriptionsQuery(currentPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    setSearchParams({ page: value.toString() }); // Update URL search params
  };

  // useEffect(() => {
  //   refetch();
  // }, []);

  useEffect(() => {
    if (isLoading) return;
  }, [transcriptions]);

  if (isLoading) {
    return (
      <Stack alignItems='center' justifyContent='center' sx={{ height: '100vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (error) {
    return (
      <Typography level='body-sm' sx={{ color: 'error.main' }}>
        Error occurred: {error instanceof Error ? error.message : 'Unknown error'}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      <Typography level='h4' component='h1' sx={{ mb: 2 }}>Transcriptions</Typography>

      {transcriptions?.transcriptions && transcriptions.transcriptions.length === 0 ? (
        <QuickAddFile />
      ) : (
        <>
          <TranscriptionsTable key={currentPage} transcriptions={transcriptions?.transcriptions} />
          {transcriptions?.totalPages > 1 && (
            <Stack direction='row' spacing={2} justifyContent='center' mt={2}>
              <Pagination
                count={transcriptions?.totalPages}
                page={currentPage}
                onChange={handlePageChange}
              />
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
};

export default Transcriptions;

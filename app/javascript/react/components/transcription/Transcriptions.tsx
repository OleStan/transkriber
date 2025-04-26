import React, { useEffect, useState } from 'react';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useSearchParams } from 'react-router-dom';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';
import { Pagination } from '@mui/material';
import TranscriptionsTable from './transcriptionsTable/TranscriptionsTable';
import QuickAddFileOrUrl from '../home/QuickAddFile/QuickAddFileOrUrl';
import { cable } from '../../lib/cable';

const Transcriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const { data: transcriptions, error, isLoading } = useGetTranscriptionsQuery(currentPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    setSearchParams({ page: value.toString() }); // Update URL search params
  };

  useEffect(() => {
    if (isLoading) return;
  }, [transcriptions]);

  const records = transcriptions?.transcriptions || [];
  const [updates, setUpdates] = useState<Record<number, { status: string }>>({});
  useEffect(() => {
    if (!records.length) return;
    const subs = records.map(({ id }) =>
      cable.subscriptions.create(
        { channel: 'TranscriptionChannel', room: id.toString() },
        {
          received(data: { status: string }) {
            setUpdates(prev => ({ ...prev, [id]: data }));
          },
        }
      )
    );
    return () => subs.forEach((sub: any) => sub.unsubscribe());
  }, [records]);
  const displayRecords = records.map(tr => ({ ...tr, status: updates[tr.id]?.status || tr.status }));

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
      <Typography level='h4' component='h1' sx={{ mb: 2 }}>
        Transcriptions
      </Typography>

      {transcriptions?.transcriptions && transcriptions.transcriptions.length === 0 ? (
        <QuickAddFileOrUrl />
      ) : (
        <>
          <TranscriptionsTable key={currentPage} transcriptions={displayRecords} />
          {transcriptions && transcriptions?.totalPages > 1 && (
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

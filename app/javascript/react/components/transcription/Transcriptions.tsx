import React from 'react';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useSearchParams } from 'react-router-dom';
import Typography from '@mui/joy/Typography';
import CircularProgress from '@mui/joy/CircularProgress';
import Stack from '@mui/joy/Stack';

import TemplateOutlineRow from './transcriptionOutlineRow/TemplateOutlineRow';

const Transcriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const { data: transcriptions, error, isLoading } = useGetTranscriptionsQuery(currentPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSearchParams({ page: newPage.toString() }); // Update URL search params
  };

  // Loading state
  if (isLoading) {
    return (
      <Stack alignItems="center" justifyContent="center" sx={{ height: '100vh' }}>
        <CircularProgress />
      </Stack>
    );
  }

  // Error state
  if (error) {
    return (
      <Typography level="body1" sx={{ color: 'error.main' }}>
        Error occurred: {error instanceof Error ? error.message : 'Unknown error'}
      </Typography>
    );
  }

  return (
    <div>
      <Typography level="h4" component="h1" sx={{ mb: 2 }}>
        Transcriptions
      </Typography>
      <Stack direction="column" spacing={2}>
        {transcriptions?.map((transcription) => (
          <TemplateOutlineRow
            key={transcription.id}
            {...transcription}
          />
        ))}
      </Stack>
      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <button onClick={() => handlePageChange(currentPage + 1)}>
          Next
        </button>
      </Stack>
    </div>
  );
};

export default Transcriptions;
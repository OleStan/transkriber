import React, { useState } from 'react';
import Typography from '@mui/joy/Typography';
import TranscriptionsTableBase from '../transcription/transcriptionsTable/TranscriptionsTableBase';
import { useGetTranscriptionsQuery, useDeleteTranscriptionMutation } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { Transcription } from '../../redux/resourcesApi/transcriptions/types';
import { useAppNavigate } from '../../helpers/navigationHelpers';
import { useNotification } from '../../contexts/NotificationContext';
import en from '../../locales/en';
import { locales } from '../../locales';
import Sheet from '@mui/joy/Sheet';
import CircularProgress from '@mui/joy/CircularProgress';

const RecentTranscriptionsTable = () => {
  // Always fetch the first page for the home widget
  const { data, error, isLoading, refetch } = useGetTranscriptionsQuery(1);
  const [deleteTranscription] = useDeleteTranscriptionMutation();
  const { goToTranscriptions } = useAppNavigate();
  const { showNotification } = useNotification();
  const transcriptions: Transcription[] = data?.transcriptions || [];
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleView = (id: number) => {
    goToTranscriptions(id);
  };

  const handleDelete = (id: number) => async () => {
    setDeletingId(id);
    try {
      await deleteTranscription(id).unwrap();
      showNotification('Transcription deleted successfully', 'success');
      refetch();
    } catch (e: any) {
      showNotification('Failed to delete transcription', 'danger');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Sheet variant="outlined" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 120 }}>
        <CircularProgress />
      </Sheet>
    );
  }

  if (error) {
    return (
      <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
        <Typography level="body-sm" color="danger">
          {en.home.recentTranscriptionsTable.general.error} {error instanceof Error ? error.message : ''}
        </Typography>
      </Sheet>
    );
  }

  return (
    <TranscriptionsTableBase
      transcriptions={transcriptions}
      locale={en.home.recentTranscriptionsTable}
      onView={handleView}
      onDelete={handleDelete}
      deletingId={deletingId}
      showActions={true}
    />
  );
};

export default RecentTranscriptionsTable;

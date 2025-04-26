import { useState, useEffect } from 'react';
import Typography from '@mui/joy/Typography';
import TranscriptionsTableBase from '../transcription/transcriptionsTable/TranscriptionsTableBase';
import { useGetTranscriptionsQuery, useDeleteTranscriptionMutation } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { Transcription } from '../../redux/resourcesApi/transcriptions/types';
import { useAppNavigate } from '../../helpers/navigationHelpers';
import { useNotification } from '../../contexts/NotificationContext';
import en from '../../locales/en';
import Sheet from '@mui/joy/Sheet';
import CircularProgress from '@mui/joy/CircularProgress';
import { cable } from '../../lib/cable';

const RecentTranscriptionsTable = () => {
  // Always fetch the first page for the home widget
  const { data, error, isLoading } = useGetTranscriptionsQuery(1);
  const [deleteTranscription] = useDeleteTranscriptionMutation();
  const { goToTranscriptions } = useAppNavigate();
  const { showNotification } = useNotification();
  const transcriptions: Transcription[] = data?.transcriptions || [];
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [updates, setUpdates] = useState<Record<number, { status: string }>>({});

  useEffect(() => {
    // subscribe only to non-final transcriptions
    const activeTranscriptions = transcriptions.filter(({ status }) => status !== 'completed' && status !== 'failed');
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

  const handleView = (id: number) => {
    goToTranscriptions(id);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteTranscription(id).unwrap();
      showNotification('Transcription deleted successfully', 'success');
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

  const displayTranscriptions = transcriptions.map((tr) => ({
    ...tr,
    status: updates[tr.id]?.status || tr.status,
  }));

  return (
    <TranscriptionsTableBase
      transcriptions={displayTranscriptions}
      locale={en.home.recentTranscriptionsTable}
      onView={handleView}
      onDelete={handleDelete}
      deletingId={deletingId}
      showActions={true}
    />
  );
};

export default RecentTranscriptionsTable;

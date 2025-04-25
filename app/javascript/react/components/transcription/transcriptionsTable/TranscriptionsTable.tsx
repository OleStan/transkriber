import React from 'react';
import TranscriptionsTableBase from './TranscriptionsTableBase';
import { ITranscription } from '../../../redux/resourcesApi/transcriptions/types';
import { useDeleteTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useNotification } from '../../../contexts/NotificationContext';
import en from "../../../locales/en";

interface TranscriptionsTableProps {
  transcriptions: ITranscription[] | undefined;
}

const TranscriptionsTable: React.FC<TranscriptionsTableProps> = ({ transcriptions }) => {
  const [deleteTranscription] = useDeleteTranscriptionMutation();
  const { showNotification } = useNotification();

  const handleDelete = (transcriptionId: number) => async () => {
    try {
      const result = await deleteTranscription(transcriptionId).unwrap();
      if (result && result.transcriptions) {
        showNotification('Transcription deleted successfully', 'success');
      } else {
        showNotification('Failed to delete transcription', 'danger');
      }
    } catch (error) {
      showNotification('An error occurred while deleting the transcription', 'danger');
    }
  };

  return (
    <TranscriptionsTableBase
      transcriptions={transcriptions || []}
      locale={en.transcription}
      onDelete={(id) => handleDelete(id)()}
      showActions={true}
    />
  );
};

export default TranscriptionsTable;

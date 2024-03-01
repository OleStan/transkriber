import React, { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useGetTranscriptionQuery } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import AudioPlayer from '../../player/AudioPlayer';
import TranscriptionShowTranscription from './TranscriptionShowTranscription';
import TranscriptionSegmentsSkeleton from './TranscriptionSegmentsSkeleton';
import TranscriptionShowSkeleton from './TranscriptionShowSkeleton';
import useActionCable from '../../../hooks/useActionCable';
import { LinearProgress, Typography, Stack } from '@mui/joy';

interface LoaderParams {
  params: {
    id: string;
  };
}

interface LoaderData {
  id: string;
}

export async function loader({ params }: LoaderParams) {
  const id = params.id;
  return { id };
}

const TranscriptionShow = () => {
  const { id } = useLoaderData<LoaderData>();
  const { data: transcription, isLoading } = useGetTranscriptionQuery(id);
  const [transcriptionText, setTranscriptionText] = useState<string | undefined>(undefined);
  const messages = useActionCable('TranscriptionChannel', id);

  useEffect(() => {
    // Update transcription text if a new message arrives
    const lastMessage = messages?.[messages.length - 1];
    if (lastMessage?.transcriptionJson) {
      setTranscriptionText(lastMessage.transcriptionJson);
    }
  }, [messages]);

  // Show skeleton if loading or no transcription data is available
  if (isLoading || !transcription) {
    return <TranscriptionShowSkeleton />;
  }


  const transcriptionInProgress = transcription?.status &&
    (transcription.status === 'in_progress' || transcription.status === 'pending');
  return (
    <>
      <Typography level={'h1'}>Transcription {id}</Typography>
      <AudioPlayer src={transcription.audioTranscriptionPath} />
      {transcriptionInProgress ? (
        <Stack spacing={2}>
          <Typography level={'body-md'}>
            Your transcription is being processed. Please wait.
          </Typography>
          <LinearProgress size={'lg'} />
          <TranscriptionSegmentsSkeleton />
        </Stack>
      ) : (
        transcription?.transcriptions && (
          <TranscriptionShowTranscription transcriptionSegments={transcription.transcriptions} />
        )
      )}
    </>
  );
};

// Assuming LoaderData interface is defined elsewhere if not, define it as:
interface LoaderData {
  id: string;
}

export default TranscriptionShow;

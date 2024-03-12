import React, { useEffect, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useGetTranscriptionQuery } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import AudioPlayer from '../../player/AudioPlayer';
import TranscriptionShowTranscription from './TranscriptionShowTranscription';
import TranscriptionSegmentsSkeleton from './TranscriptionSegmentsSkeleton';
import TranscriptionShowSkeleton from './TranscriptionShowSkeleton';
import useActionCable from '../../../hooks/useActionCable';
import { LinearProgress, Typography, Stack } from '@mui/joy';

interface LoaderData {
  id: string;
}

export async function loader({ params }: { params: LoaderData }) {
  return { id: params.id };
}

const TranscriptionShow = () => {
  const { id } = useLoaderData<LoaderData>();
  const { data: transcription, isLoading } = useGetTranscriptionQuery(id);
  const [transcriptionState, setTranscriptionState] = useState({
    text: '',
    isCompleted: false,
  });
  const messages = useActionCable('TranscriptionChannel', id);

  useEffect(() => {
    const lastMessage = messages?.[messages.length - 1];

    setTranscriptionState((prevState) => ({
      text: lastMessage?.transcription_json || prevState.text,
      isCompleted: lastMessage?.status === 'completed' || prevState.isCompleted,
    }));
  }, [messages]);

  if (isLoading || !transcription) {
    return <TranscriptionShowSkeleton />;
  }

  const showInProgress =
    (['in_progress', 'pending'].includes(transcription.status) && !transcriptionState.isCompleted) &&
    !transcription.transcriptions;

  return (
    <>
      <Typography level='h1'>{transcription.audioFilename}</Typography>
      <AudioPlayer src={transcription.audioTranscriptionPath} duration={transcription.duration} />
      {showInProgress ? (
        <Stack spacing={2}>
          <Typography level={'body-md'}>
            Your transcription is being processed. Please wait.
          </Typography>
          <LinearProgress size={'lg'} />
          <TranscriptionSegmentsSkeleton />
        </Stack>
      ) : (
        <TranscriptionShowTranscription
          transcriptionSegments={transcription.transcriptions || transcriptionState.text}
        />
      )}
    </>
  );
};

export default TranscriptionShow;

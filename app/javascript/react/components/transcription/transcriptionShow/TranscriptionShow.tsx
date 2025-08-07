import React, { useEffect, useState, useCallback } from 'react';
import { useLoaderData } from 'react-router-dom';
import { useGetTranscriptionQuery } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import AudioPlayer from '../../player/AudioPlayer';
import useAdjustableTranscription from '../../../hooks/useAdjustableTranscription';
import TranscriptionShowTranscription from './TranscriptionShowTranscription';
import TranscriptionSegmentsSkeleton from './TranscriptionSegmentsSkeleton';
import TranscriptionShowSkeleton from './TranscriptionShowSkeleton';
import useActionCable, { TranscriptionMessage } from '../../../hooks/useActionCable';
import AdjustSegmentSizeSlider from './AdjustSegmentSizeSlider';
import { Box, LinearProgress, Typography, Stack, Alert, Button, IconButton, CircularProgress } from '@mui/joy';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import ErrorIcon from '@mui/icons-material/Error';

import { LoaderFunctionArgs } from 'react-router-dom';

// Type definitions for the transcription data
interface ITranscriptionSegment {
  timestamp: string;
  text: string;
  start: number;
  end: number;
}

interface TranscriptionDetails {
  id: string;
  status: string;
  audioFilename: string;
  audioTranscriptionPath: string;
  duration: number;
  progress?: number;
  error_message?: string;
  transcriptions: ITranscriptionSegment[] | string;
}

interface TranscriptionDetailsResponse {
  id: string;
  status: string;
  audioFilename: string;
  audioTranscriptionPath: string;
  duration: number;
  progress?: number;
  error_message?: string;
  transcriptions: ITranscriptionSegment[] | string;
}

interface LoaderData {
  id: string;
}

export function loader({
  params,
}: LoaderFunctionArgs) {
  return { id: params.id };
}

// Adding interfaces for component props to fix type mismatches
interface TranscriptionShowProps {
  transcriptionSegments: any[]; // Using any[] to accommodate both types
}

type MergedSegmentChunk = any; // Define this based on your actual implementation

// Wrapper component to fix type mismatches with TranscriptionShowTranscription
interface TranscriptionShowContentProps {
  transcription: TranscriptionDetailsResponse;
  transcriptionSegments: any[];
}

const TranscriptionShowContent = ({ transcription, transcriptionSegments }: TranscriptionShowContentProps) => {
  // Create a compatible object for TranscriptionShowTranscription with proper types
  // Cast to expected types for TranscriptionShowTranscription component
  const formattedTranscription = {
    id: Number(transcription.id),
    status: transcription.status,
    audioFilename: transcription.audioFilename,
    audioTranscriptionPath: transcription.audioTranscriptionPath,
    createdAtFormatted: new Date(transcription.id).toLocaleDateString(),
    duration: String(transcription.duration), // Convert to string as expected by component
    transcriptionSegments: transcriptionSegments
  };

  return <TranscriptionShowTranscription {...formattedTranscription} />;
};

const TranscriptionShow = () => {
  const { id } = useLoaderData() as LoaderData;
  const { data: transcription, isLoading } = useGetTranscriptionQuery(Number(id)) as { data: TranscriptionDetailsResponse | undefined, isLoading: boolean };
  const [transcriptionState, setTranscriptionState] = useState({
    text: '',
    isCompleted: false,
    progress: 0,
    status: '',
    error: '',
    cancelled: false,
  });
  
  // Use our enhanced ActionCable hook
  const { latestMessage, messages, cancelTranscription } = useActionCable('TranscriptionChannel', id);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    if (window.confirm('Are you sure you want to cancel this transcription?')) {
      cancelTranscription();
    }
  }, [cancelTranscription]);

  useEffect(() => {
    if (!latestMessage) return;

    setTranscriptionState((prevState) => ({
      text: latestMessage.transcription_json || prevState.text,
      isCompleted: latestMessage.status === 'completed' || latestMessage.status === 'failed' || prevState.isCompleted,
      progress: latestMessage.progress !== undefined ? latestMessage.progress : prevState.progress,
      status: latestMessage.status || prevState.status,
      error: latestMessage.error || prevState.error,
      cancelled: latestMessage.status === 'cancelled' || prevState.cancelled,
    }));
  }, [latestMessage]);

  // Determine what status text to display
  const getStatusText = useCallback(() => {
    switch (transcriptionState.status) {
      case 'uploading':
        return 'Uploading audio file...';
      case 'processing':
        return 'Processing audio...';
      case 'in_progress':
        return 'Preparing for transcription...';
      case 'transcribing':
        return 'Transcribing audio...';
      case 'post_processing':
        return 'Finalizing transcription...';
      case 'completed':
        return 'Transcription completed!';
      case 'failed':
        return 'Transcription failed';
      case 'cancelled':
        return 'Transcription cancelled';
      default:
        return 'Please wait while we process your transcription';
    }
  }, [transcriptionState.status]);

  const transcriptionSegments = useAdjustableTranscription(
    (transcription?.transcriptions || transcriptionState.text || []) as ITranscriptionSegment[]
  );

  if (isLoading || !transcription) {
    return <TranscriptionShowSkeleton />;
  }

  // Determine if we should show the progress UI
  const showInProgress = (
    ['in_progress', 'pending', 'uploading', 'processing', 'transcribing', 'post_processing'].includes(
      transcriptionState.status || transcription.status
    ) &&
    !transcriptionState.isCompleted &&
    !transcription.transcriptions
  );

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          marginBottom: 4,
        }}
      >
        <Typography level='h1'>{transcription.audioFilename}</Typography>
        <AdjustSegmentSizeSlider />
      </Box>
      <AudioPlayer src={transcription.audioTranscriptionPath} />
      
      {/* Error message display */}
      {transcriptionState.error && (
        <Alert 
          color="danger" 
          variant="soft"
          startDecorator={<ErrorIcon />} 
          sx={{ mt: 2, mb: 2 }}
          endDecorator={
            <Button 
              variant="soft" 
              color="danger" 
              size="sm"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          }
        >
          {transcriptionState.error}
        </Alert>
      )}
      
      {/* Cancelled state */}
      {transcriptionState.cancelled && (
        <Alert 
          color="neutral" 
          variant="soft" 
          startDecorator={<CancelIcon />} 
          sx={{ mt: 2, mb: 2 }}
        >
          This transcription was cancelled. You can upload a new file to try again.
        </Alert>
      )}
      
      {/* In-progress UI with enhanced progress bar */}
      {showInProgress && !transcriptionState.cancelled && !transcriptionState.error ? (
        <Stack spacing={2} sx={{ mt: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography level="title-lg">
              {getStatusText()}
            </Typography>
            <IconButton 
              color="neutral" 
              variant="soft" 
              onClick={handleCancel}
              title="Cancel transcription"
            >
              <CancelIcon />
            </IconButton>
          </Box>
          
          {/* Progress indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              <LinearProgress 
                determinate 
                value={transcriptionState.progress} 
                color={transcriptionState.progress > 90 ? 'success' : 'primary'}
                size="lg" 
                sx={{ height: 10, borderRadius: 5 }} 
              />
            </Box>
            <Typography level="body-sm">
              {transcriptionState.progress}%
            </Typography>
          </Box>
          
          {/* Status description */}
          <Alert 
            color="primary" 
            variant="soft" 
            startDecorator={<InfoIcon />}
          >
            {transcriptionState.status === 'transcribing' && (
              <>
                Transcription is in progress. This may take a few minutes depending on the audio length. 
                You can safely navigate away from this page and come back later.
              </>
            )}
            {transcriptionState.status === 'uploading' && (
              <>Uploading your audio file. Please wait...</>
            )}
            {transcriptionState.status === 'processing' && (
              <>Processing your audio file to prepare it for transcription...</>
            )}
          </Alert>
          
          <TranscriptionSegmentsSkeleton />
        </Stack>
      ) : (
        /* Show transcription if not in progress and not cancelled/error */
        !transcriptionState.cancelled && !transcriptionState.error && (
          <TranscriptionShowContent 
            transcription={transcription} 
            transcriptionSegments={transcriptionSegments as unknown as any[]} 
          />
        )
      )}
    </>
  );
};

export default TranscriptionShow;

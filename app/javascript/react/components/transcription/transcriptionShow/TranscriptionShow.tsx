import { useLoaderData } from 'react-router-dom';
import { useGetTranscriptionQuery } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import AudioPlayer from '../../player/AudioPlayer';
import TranscriptionShowTranscription from './TranscriptionShowTranscription';
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
  const data = useLoaderData() as LoaderData;
  const { data: transcription, isLoading } = useGetTranscriptionQuery(data?.id);

  if (isLoading || !transcription) return <div>Loading...</div>;

  return (
    <>
      <h1>Transcriptions {data?.id}</h1>
      <AudioPlayer src={transcription.audioTranscriptionPath} />

      {/*<TranscriptionShowTranscription transcriptionSegments={transcription.transcriptions} />*/}
      {/*{transcription.id}*/}
      {/*{transcription.audioFilename}*/}
      {/*{transcription.createdAtFormatted}*/}
    </>
  );
};

export default TranscriptionShow;

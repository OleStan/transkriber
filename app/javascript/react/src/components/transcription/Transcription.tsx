import {useGetTranscriptionsQuery} from "../../../redux/domains/transcriptions/transcriptionsSlice";

const Transcription = () => {
  const { data, error, isLoading} = useGetTranscriptionsQuery();


  console.log(data, error, isLoading);
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error occurred: {error.toString()}</div>;

  return (
    <div>
      <h1>Transcription</h1>
    </div>
  )
}

export default Transcription

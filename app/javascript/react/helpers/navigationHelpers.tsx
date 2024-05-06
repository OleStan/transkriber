import { useNavigate } from 'react-router-dom';

export function useAppNavigate() {
  let navigate = useNavigate();

  const goToTranscriptions = (id: string | number) => navigate(`/transcriptions/${id}`);

  return { goToTranscriptions };
}

import React, { useRef, useEffect, useMemo } from 'react';
import Plyr from 'plyr-react';
import 'plyr/dist/plyr.css';
import { Box } from '@mui/joy';
import CircularProgress from '@mui/joy/CircularProgress';
import useAudioStore from '../../stores/useAudioStore';

interface AudioPlayerProps {
  src: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src }) => {
  const playerRef = useRef<any>(null);
  const seek = useAudioStore((state) => state.seek);

  useEffect(() => {
    if (playerRef.current) {
      playerRef.current.plyr.currentTime = seek;
    }
  }, [seek]);

  const memoSource = useMemo(
    () => ({ type: 'audio' as any, sources: [{ src, type: 'audio/mpeg' }] }),
    [src]
  );
  const memoOptions = useMemo(
    () => ({ controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings'] }),
    []
  );

  return (
    <Box sx={{ width: '100%' }}>
      {!src ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Plyr ref={playerRef} source={memoSource} options={memoOptions} />
      )}
    </Box>
  );
};

export default AudioPlayer;

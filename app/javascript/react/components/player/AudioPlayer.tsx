import React, { useState, useEffect, useRef } from 'react';
import ReactHowler from 'react-howler';
import Slider from '@mui/joy/Slider';
import Button from '@mui/joy/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import SpeedIcon from '@mui/icons-material/Speed';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { Box } from '@mui/joy';
import Typography from '@mui/joy/Typography';

interface AudioPlayerProps {
  src: string;
}

const formatTime = (seconds: number): string => {
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

function AudioPlayer({ src }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [duration, setDuration] = useState(0);
  const [seek, setSeek] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const howlerRef = useRef<ReactHowler>(null);

  const togglePlay = (): void => setPlaying(!playing);

  const handleVolumeChange = (_event: Event, newValue: number | number[]): void => {
    setVolume(Array.isArray(newValue) ? newValue[0] : newValue);
  };

  const updatePlaybackRate = (): void => {
    const newRate = playbackRate < 2 ? playbackRate + 0.25 : 0.5;
    setPlaybackRate(newRate);
    if (howlerRef.current) {
      howlerRef.current.howler.rate(newRate);
    }
  };

  const handleLoadAudio = (): void => {
    if (howlerRef.current) {
      const soundDuration = howlerRef.current.duration();
      setDuration(soundDuration);
    }
  };

  const handleSeekChange = (event: Event, newValue: number | number[]): void => {
    console.log(newValue,Array.isArray(newValue), event);
    const newSeek = Array.isArray(newValue) ? newValue[0] : newValue;
    if (howlerRef.current) {
      howlerRef.current.seek(newSeek); // Directly seek without updating state
    }
  };

  useEffect(() => {
    if (!playing) {
      return;
    }

    const interval = setInterval(() => {
      if (howlerRef.current) {
        const currentSeek = howlerRef.current.seek() as number;
        setSeek(currentSeek);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [playing]); // Only re-run this effect if `playing` changes

  useEffect(() => {
    setTimeout(handleLoadAudio, 100); // Adjust based on actual load behavior
  }, [src]);

  return (
    <>
      <ReactHowler
        src={src}
        playing={playing}
        volume={volume}
        ref={howlerRef}
        rate={playbackRate}
        onLoad={() => handleLoadAudio()}
        onEnd={() => setPlaying(false)}
      />
      <Box
        sx={{
          position: 'sticky',
          top: '-12px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '10px',
          maxWidth: '100vw',
          backgroundColor: '#F2F5F2',
          borderRadius: '12px',
          px: '20px',
          pt: '15px',
          pb: '7px',
          zIndex: 1100,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '15px',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <VolumeUpIcon />
            <Slider
              aria-label='Volume'
              value={volume}
              onChange={handleVolumeChange}
              min={0}
              color={'neutral'}
              max={1}
              step={0.01}
              size={'sm'}
              sx={{ width: '100px' }}
            />
          </Box>
          <Button
            onClick={togglePlay}
            color='success'
            variant='solid'
            sx={{ borderRadius: '50%', padding: '10px' }}
          >
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </Button>
          <Button
            onClick={updatePlaybackRate}
            variant='solid'
            color={'success'}
            startDecorator={<SpeedIcon />}
          >
            {playbackRate.toFixed(2)}
          </Button>
        </Box>
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '15px',
          }}
        >
          <Typography level='body-sm'>{formatTime(seek)}</Typography>
          <Slider
            aria-label='Seek'
            value={seek}
            min={0}
            max={duration}
            step={1}
            size={'sm'}
            color={'neutral'}
            onChange={handleSeekChange}
          />
          <Typography level='body-sm'>{formatTime(duration)}</Typography>
        </Box>
      </Box>
    </>
  );
}

export default AudioPlayer;

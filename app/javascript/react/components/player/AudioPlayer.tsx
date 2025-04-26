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
import CircularProgress from '@mui/joy/CircularProgress';
import useAudioStore from '../../stores/useAudioStore';
import { Howl } from 'howler';

// Suppress Howl stop push error
if (!(Howl.prototype as any)._origStop) {
  const origStop = Howl.prototype.stop;
  (Howl.prototype as any)._origStop = origStop;
  Howl.prototype.stop = function(...args: any[]) {
    try {
      return (this as any)._origStop.apply(this, args);
    } catch (e) {
      console.warn('Howl.stop error suppressed:', e);
    }
  };
}

interface AudioPlayerProps {
  src: string;
  duration: number;
}

const formatTime = (seconds: number): string => {
  const rounded = Math.floor(seconds);
  const minutes = Math.floor(rounded / 60);
  const remainingSeconds = rounded % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

// Error boundary to catch audio player errors
class AudioPlayerErrorBoundary extends React.Component<{children?: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
    this.resetError = this.resetError.bind(this);
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error: any, info: any) { console.error('AudioPlayer error:', error, info); }
  resetError() { this.setState({ hasError: false }); }
  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
          <Typography level='body-md' color='danger'>Audio player encountered an error.</Typography>
          <Button onClick={this.resetError}>Retry</Button>
        </Box>
      );
    }
    return <>{this.props.children}</>;
  }
}

function AudioPlayer({ src, duration }: AudioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [audioDuration, setAudioDuration] = useState(duration);
  const { seek, setSeek } = useAudioStore(state => ({ seek: state.seek, setSeek: state.setSeek }));
  const [playbackRate, setPlaybackRate] = useState(1);
  const [loading, setLoading] = useState(true);
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

      const audioSourceNode = howlerRef.current.audio.source;
      if (audioSourceNode) {
        audioSourceNode.playbackRate.value = playbackRate;
        audioSourceNode.preservesPitch = true;
      }
    }
  };

  const handleLoadAudio = (): void => {
    if (howlerRef.current) {
      const soundDuration = howlerRef.current.duration();
      setAudioDuration(soundDuration);
    }
    setLoading(false);
  };

  const handleSeekChange = (event: Event, newValue: number | number[]): void => {
    const newSeek = Array.isArray(newValue) ? newValue[0] : newValue;
    setSeek(newSeek);
    if (howlerRef.current) {
      howlerRef.current.seek(newSeek); // Seek the audio to the new position
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
    setLoading(true);
  }, [src]);

  useEffect(() => {
    if (howlerRef.current) {
      howlerRef.current.seek(seek); // Seek the audio to the new position
    }
  }, [seek]);

  const handleAudioEnd = () => {
    setSeek(audioDuration);
  };

  if (!src) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AudioPlayerErrorBoundary>
      <ReactHowler
        src={src}
        playing={playing}
        volume={volume}
        ref={howlerRef}
        rate={playbackRate}
        onLoad={() => handleLoadAudio()}
        onEnd={handleAudioEnd}
      />
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress />
        </Box>
      ) : (
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
            zIndex: 10,
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
              max={audioDuration}
              step={1}
              size={'sm'}
              color={'neutral'}
              onChange={handleSeekChange}
            />
            <Typography level='body-sm'>{formatTime(audioDuration)}</Typography>
          </Box>
        </Box>
      )}
    </AudioPlayerErrorBoundary>
  );
}

export default AudioPlayer;

import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Grid from '@mui/joy/Grid';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useState } from 'react';
import useAudioStore from '../../../stores/useAudioStore';
import { TranscriptionDetails, TranscriptionSegment } from '../../../redux/resourcesApi/transcriptions/types';

const TranscriptionShowTranscription = ({ transcriptionSegments }: TranscriptionDetails) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const setSeek = useAudioStore((state) => state.setSeek);
  const handleMouseEnter = (id: number) => {
    setHoveredId(id);
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  const handleClick = (startTime: number) => {
    setSeek(startTime);
  };

  return (
    <List>
      {transcriptionSegments?.map((transcription: TranscriptionSegment) => (
        <ListItem
          key={transcription.id}
          sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'self-start',
          }}
          onMouseEnter={() => handleMouseEnter(transcription.id)}
          onMouseLeave={handleMouseLeave}
        >
          <Grid container spacing={4} sx={{ flexGrow: 1 }}>
            <Grid
              xs={2}
              sm={1}
              sx={{
                cursor: 'pointer',
                height: '100%',
                display: 'flex',
                flexDirection: 'row',
                paddingTop: '1.25rem',
                userSelect: 'none',
              }}
              onClick={() => handleClick(transcription.startOfChunk)}
            >
              <Typography level={'body-xs'}>{transcription.timestampOfChunk}</Typography>
              <PlayArrowRoundedIcon
                fontSize={'small'} // change to xs
                sx={{
                  visibility: hoveredId === transcription.id ? 'visible' : 'hidden',
                }}
              />
            </Grid>
            <Grid xs={10} sm={11}>
              <Typography level={'body-md'}>
                {transcription.segments.map((segment) => (
                  <Typography key={segment.id}>{segment.text}</Typography>
                ))}
              </Typography>
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  );
};

export default TranscriptionShowTranscription;

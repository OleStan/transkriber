import { ITranscriptionDetails } from '../../../redux/resourcesApi/transcriptions/types';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Grid from '@mui/joy/Grid';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import { useState } from 'react';
import useAudioStore from '../../../stores/useAudioStore';

const TranscriptionShowTranscription = ({ transcriptionSegments }: ITranscriptionDetails) => {
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
      {transcriptionSegments?.map((transcription) => (
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
            }}
              onClick={() => handleClick(transcription.id, transcription.start)}
            >
              <Typography level={'body-xs'}>{transcription.timestamp}</Typography>
              <PlayArrowRoundedIcon
                fontSize={'2rem'}
                sx={{
                  visibility: hoveredId === transcription.id ? 'visible' : 'hidden',
                }}
              />
            </Grid>
            <Grid xs={10} sm={11}>
              <Typography level={'body-md'}>{transcription.text}</Typography>
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  );
};

export default TranscriptionShowTranscription;

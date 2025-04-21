import { useMemo, useState } from 'react';
import Button from '@mui/joy/Button';
import Grid from '@mui/joy/Grid';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Snackbar from '@mui/joy/Snackbar';
import Typography from '@mui/joy/Typography';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';

import useAudioStore from '../../../stores/useAudioStore';
import {
  TranscriptionDetails,
  TranscriptionSegment,
} from '../../../redux/resourcesApi/transcriptions/types';

const TranscriptionShowTranscription = ({ transcriptionSegments }: TranscriptionDetails) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const setSeek = useAudioStore((state) => state.setSeek);

  const handleMouseEnter = (id: number) => setHoveredId(id);
  const handleMouseLeave = () => setHoveredId(null);
  const handleClick = (startTime: number) => setSeek(startTime);

  const transcriptWithTimestamps = useMemo(
    () =>
      transcriptionSegments
        ?.map(
          (t) =>
            `${t.timestampOfChunk} ${t.segments
              .map((s) => s.text)
              .join('')
              .trim()}`
        )
        .join('\n') ?? '',
    [transcriptionSegments]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcriptWithTimestamps);
      setCopied(true);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  return (
    <>
      <Button
        variant='soft'
        size='sm'
        sx={{ mb: 1 }}
        onClick={handleCopy}
        disabled={!transcriptWithTimestamps}
      >
        Copy with Timestamps
      </Button>

      <List>
        {transcriptionSegments?.map((t: TranscriptionSegment) => (
          <ListItem
            key={t.id}
            sx={{ display: 'flex', gap: 1, alignItems: 'self-start' }}
            onMouseEnter={() => handleMouseEnter(t.id)}
            onMouseLeave={handleMouseLeave}
          >
            <Grid container spacing={4} sx={{ flexGrow: 1 }}>
              <Grid
                xs={2}
                sm={1}
                sx={{
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'row',
                  paddingTop: '1.25rem',
                  userSelect: 'none',
                }}
                onClick={() => handleClick(t.startOfChunk)}
              >
                <Typography level='body-xs'>{t.timestampOfChunk}</Typography>
                <PlayArrowRoundedIcon
                  fontSize='small'
                  sx={{
                    visibility: hoveredId === t.id ? 'visible' : 'hidden',
                  }}
                />
              </Grid>

              <Grid xs={10} sm={11}>
                <Typography level='body-md'>
                  {t.segments.map((s) => (
                    <Typography key={s.id}>{s.text}</Typography>
                  ))}
                </Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
       Copied to clipboard
      </Snackbar>
    </>
  );
};

export default TranscriptionShowTranscription;

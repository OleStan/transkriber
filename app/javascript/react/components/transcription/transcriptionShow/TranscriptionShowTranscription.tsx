import { useMemo, useState, useCallback, memo } from 'react';
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

type SegmentRowProps = {
  t: TranscriptionSegment;
  hoveredId: number | null;
  handleMouseEnter: (id: number) => void;
  handleMouseLeave: () => void;
  handleClick: (startTime: number) => void;
};

const SegmentRow = memo(({ t, hoveredId, handleMouseEnter, handleMouseLeave, handleClick }: SegmentRowProps) => (
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
          sx={{ visibility: hoveredId === t.id ? 'visible' : 'hidden' }}
        />
      </Grid>
      <Grid xs={10} sm={11}>
        <Typography level='body-md'>
          {t.segments.map((s: any) => (
            <span key={s.id}>{s.text}</span>
          ))}
        </Typography>
      </Grid>
    </Grid>
  </ListItem>
));

const TranscriptionShowTranscription = ({ transcriptionSegments }: TranscriptionDetails) => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const setSeek = useAudioStore((state) => state.setSeek);

  const handleMouseEnter = useCallback((id: number) => setHoveredId(id), []);
  const handleMouseLeave = useCallback(() => setHoveredId(null), []);
  const handleClick = useCallback((startTime: number) => setSeek(startTime), [setSeek]);

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

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(transcriptWithTimestamps);
      setCopied(true);
    } catch (err) {
      console.error('Copy failed', err);
    }
  }, [transcriptWithTimestamps]);

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
      {transcriptionSegments && transcriptionSegments.length > 0 ? (
        <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
          {transcriptionSegments.map((t) => (
            <SegmentRow
              key={t.id}
              t={t}
              hoveredId={hoveredId}
              handleMouseEnter={handleMouseEnter}
              handleMouseLeave={handleMouseLeave}
              handleClick={handleClick}
            />
          ))}
        </List>
      ) : (
        <Typography>No transcription segments available.</Typography>
      )}
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

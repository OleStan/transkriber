import { ITranscriptionDetails } from '../../../redux/resourcesApi/transcriptions/types';
import Typography from '@mui/joy/Typography';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Grid from '@mui/joy/Grid';

const TranscriptionShowTranscription = ({ transcriptionSegments }: ITranscriptionDetails) => {
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
        >
          <Grid container spacing={4} sx={{ flexGrow: 1 }}>
            <Grid xs={2} sm={1}>
              <Typography level={'body-xs'}>{transcription.timestamp}</Typography>
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

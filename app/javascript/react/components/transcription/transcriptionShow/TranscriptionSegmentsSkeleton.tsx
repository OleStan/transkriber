import React from 'react';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Skeleton from '@mui/joy/Skeleton';
import Grid from '@mui/joy/Grid';

const TranscriptionSegmentsSkeleton = () => {
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {Array.from(new Array(5)).map((item, index) => (
        <ListItem key={`skeleton-transcription-item-${index}`} sx={{ display: 'flex', gap: 2 }}>
          <Grid container spacing={4} sx={{ flexGrow: 1 }}>
            <Grid xs={2} sm={1}>
              <Skeleton variant={'text'} width='40px' />
            </Grid>
            <Grid xs={10} sm={11}>
              <Skeleton variant={'text'} width='100%' />
              <Skeleton variant={'text'} width='60%' />
            </Grid>
          </Grid>
        </ListItem>
      ))}
    </List>
  );
};

export default TranscriptionSegmentsSkeleton;

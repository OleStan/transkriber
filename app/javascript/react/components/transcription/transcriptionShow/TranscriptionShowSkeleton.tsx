import React from 'react';
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import Skeleton from '@mui/joy/Skeleton';
import TranscriptionSegmentsSkeleton from './TranscriptionSegmentsSkeleton';

import Stack from '@mui/joy/Stack';

const TranscriptionShowSkeleton = () => {
  // TODO: add spacing

  return (
    <Stack spacing={6}>
      <Skeleton variant={'text'} level={'h1'} width='40%' />
      <Skeleton
        variant={'overlay'}
        width='100%'
        sx={{
          maxHeight: 200,
        }}
      />
      <TranscriptionSegmentsSkeleton />
    </Stack>
  );
};

export default TranscriptionShowSkeleton;

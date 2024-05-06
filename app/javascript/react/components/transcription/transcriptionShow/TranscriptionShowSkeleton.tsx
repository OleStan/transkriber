import React from 'react';
import Skeleton from '@mui/joy/Skeleton';
import TranscriptionSegmentsSkeleton from './TranscriptionSegmentsSkeleton';

import Stack from '@mui/joy/Stack';
import { AspectRatio } from '@mui/joy';

const TranscriptionShowSkeleton = () => {
  // TODO: add spacing

  return (
    <Stack>
      <Skeleton variant={'text'} level={'h1'} width='40%' />
      <AspectRatio ratio={'32/8'}>
        <Skeleton animation={'wave'} variant='overlay'>
          <img alt='' src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=' />
        </Skeleton>
      </AspectRatio>
      <TranscriptionSegmentsSkeleton />
    </Stack>
  );
};

export default TranscriptionShowSkeleton;

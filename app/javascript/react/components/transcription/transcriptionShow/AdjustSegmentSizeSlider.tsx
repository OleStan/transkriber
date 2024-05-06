import React from 'react';

import useSegmentSizeStore from '../../../stores/useSegmentSizeStore';
import { Box, Slider } from '@mui/joy';
import DehazeRoundedIcon from '@mui/icons-material/DehazeRounded';
import ViewDayRoundedIcon from '@mui/icons-material/ViewDayRounded';

const AdjustSegmentSizeSlider = () => {
  const segmentSize = useSegmentSizeStore((state) => state.segmentSize);
  const setSegmentSize = useSegmentSizeStore((state) => state.setSegmentSize);

  return (
    <Box
    sx={{
      minWidth: '10rem',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    }}
    >
      <DehazeRoundedIcon fontSize={'1rem'} />
      <Slider
        value={segmentSize}
        color={'neutral'}
        track={false}
        size='sm'
        aria-label='segment-size-slider'
        onChange={(_, value) => setSegmentSize(value as number)}
        min={1}
        max={15}
        step={1}
      />
      <ViewDayRoundedIcon fontSize={'1rem'} />
    </Box>
  );
};

export default AdjustSegmentSizeSlider;

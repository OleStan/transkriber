import React, { useRef, useCallback } from 'react';
import { Box, TextField, Chip } from '@mui/material';

interface Segment {
  id?: number;
  timestamp: string;
  text: string;
  start: number;
  end: number;
}

interface Props {
  segments: Segment[];
  onChange: (segments: Segment[]) => void;
}

const TranscriptionEditor: React.FC<Props> = ({ segments, onChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTextChange = useCallback((index: number, newText: string) => {
    const updated = segments.map((seg, i) =>
      i === index ? { ...seg, text: newText } : seg
    );
    onChange(updated);
  }, [segments, onChange]);

  return (
    <Box ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      {segments.map((segment, index) => (
        <Box key={index} sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', px: 4, py: 1 }}>
          <Chip
            label={segment.timestamp}
            size="small"
            sx={{
              mt: 1,
              minWidth: 80,
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              flexShrink: 0,
              bgcolor: '#243947',
              color: '#93b3c8',
              border: '1px solid #345165',
            }}
          />
          <TextField
            multiline
            fullWidth
            variant="outlined"
            value={segment.text}
            onChange={(e) => handleTextChange(index, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const inputs = containerRef.current?.querySelectorAll('[data-segment-input]') ?? [];
                const currentIndex = Array.from(inputs).indexOf(e.currentTarget as Element);
                const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
                if (nextIndex >= 0 && nextIndex < inputs.length) {
                  (inputs[nextIndex] as HTMLElement).focus();
                }
              }
            }}
            inputProps={{ 'data-segment-input': true }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: '0.875rem',
                lineHeight: 1.6,
                color: 'white',
                bgcolor: '#1a2832',
                '& fieldset': {
                  borderColor: '#345165',
                },
                '&:hover fieldset': {
                  borderColor: '#1993e5',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#1993e5',
                },
              },
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default TranscriptionEditor;

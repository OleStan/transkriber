import Typography from '@mui/joy/Typography';
import React, { useEffect, useState } from 'react';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import { Link } from 'react-router-dom';
import useActionCable from '../../../hooks/useActionCable';
import { useGetTranscriptionQuery } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';

export type TemplateOutlineRowProps = {
  id: number;
  audioFilename: string | null;
  createdAtFormatted: string;
};

export const TemplateOutlineRow = ({ id, audioFilename: initialFilename, createdAtFormatted }: TemplateOutlineRowProps) => {
  // WebSocket for this transcription row
  const messages = useActionCable('TranscriptionChannel', String(id)) as any[];
  // Query for updated transcription details
  const { data: response, refetch } = useGetTranscriptionQuery(id);
  const [filename, setFilename] = useState<string | null>(initialFilename);

  useEffect(() => {
    if (messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (['in_progress', 'completed'].includes(last.status)) {
      refetch();
    }
  }, [messages, refetch]);

  useEffect(() => {
    const newFilename = response?.transcriptions?.[0]?.audioFilename;
    if (newFilename && newFilename !== filename) {
      setFilename(newFilename);
    }
  }, [response, filename]);

  return (
    <Box
      key={id}
      sx={{
        width: '100%', // Full width
        borderRadius: '8px', // Rounded borders
        border: '1px solid', // Border color
        borderColor: 'divider', // Theme-based color
        padding: '16px', // Internal spacing
        '&:hover': {
          backgroundColor: 'action.hover', // Hover effect
        },
        marginY: '8px', // Vertical margin for spacing between items
      }}
    >
      <Link to={`/transcriptions/${id}/`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Typography level='body-sm'>{filename ?? 'No Filename'}</Typography>
          <Typography level='body-sm'>{createdAtFormatted}</Typography>
        </Stack>
      </Link>
    </Box>
  );
};

export default TemplateOutlineRow;

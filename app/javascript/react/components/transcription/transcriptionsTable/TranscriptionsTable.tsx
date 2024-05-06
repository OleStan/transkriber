import React, { useState } from 'react';
import Table from '@mui/joy/Table';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ITranscription } from '../../../redux/resourcesApi/transcriptions/types';
import Sheet from '@mui/joy/Sheet';
import { Dropdown, Link, Menu, MenuButton, MenuItem } from '@mui/joy';
import { Link as RouterLink } from 'react-router-dom';
import { useDeleteTranscriptionMutation } from '../../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import Chip from '@mui/joy/Chip';
import { useNotification } from '../../../contexts/NotificationContext';

interface TranscriptionsTableProps {
  transcriptions: ITranscription[] | undefined;
}

const TranscriptionsTable: React.FC<TranscriptionsTableProps> = ({ transcriptions }) => {
  const [transcriptionsList, setTranscriptionsList] = useState<ITranscription[]>(transcriptions);
  const [deleteTranscription] = useDeleteTranscriptionMutation();
  const { showNotification } = useNotification();

  const getChipColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'pending':
        return 'warning';
      default:
        return 'neutral';
    }
  };

  const handleDelete = (transcriptionId: number) => async () => {
    try {
      const result = await deleteTranscription(transcriptionId).unwrap();
      if (result && result.transcriptions) {
        showNotification('Transcription deleted successfully', 'success');
        setTranscriptionsList(result.transcriptions);
      } else {
        // Handle any other responses or lack thereof
        showNotification('Failed to delete transcription', 'danger');
      }
    } catch (error) {
      // Handle error (e.g., network error, server error)
      showNotification('An error occurred while deleting the transcription', 'danger');
    }
  };

  return (
    <Sheet
      variant={'outlined'}
      sx={{
        borderRadius: 10,
        background: 'none',
      }}
    >
      <Table sx={{ minWidth: '650px' }} variant={'plain'}>
        <thead>
          <tr>
            <th style={{ width: '50%', paddingLeft: 16 }}>Name</th>
            <th>Date</th>
            <th>Duration</th>
            <th>Status</th>
            <th style={{ width: '6%' }}></th>
          </tr>
        </thead>
        <tbody>
          {transcriptionsList.map((transcription) => (
            <tr key={transcription.id}>
              <td style={{ width: '40%' }}>
                <Link
                  component={RouterLink}
                  to={`/transcriptions/${transcription.id}/`}
                  style={{
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'inline-block', // Makes the element respect width and overflow settings
                    maxWidth: '100%', // Set to the maximum width you want the text to take up
                    whiteSpace: 'nowrap', // Prevents the text from wrapping to a new line
                    overflow: 'hidden', // Hide overflow
                    textOverflow: 'ellipsis', // Add an ellipsis (...) at the end if the text is truncated
                  }}
                >
                  {transcription.audioFilename}
                </Link>
              </td>
              <td>{transcription.createdAtFormatted}</td>
              <td>{transcription.duration}</td>
              <td>
                <Chip variant='soft' color={getChipColor(transcription.status)}>
                  {transcription.status}
                </Chip>
              </td>
              <td>
                <Dropdown>
                  <MenuButton variant='plain' color='neutral' size='sm'>
                    <MoreVertIcon />
                  </MenuButton>
                  <Menu>
                    <MenuItem onClick={handleDelete(transcription.id)}>Delete</MenuItem>
                  </Menu>
                </Dropdown>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default TranscriptionsTable;

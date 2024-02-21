import React from 'react';
import Table from '@mui/joy/Table';

import Typography from '@mui/joy/Typography';
import IconButton from '@mui/joy/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import { ITranscription } from '../../../redux/resourcesApi/transcriptions/types';
import Sheet from '@mui/joy/Sheet';
import { Link } from '@mui/joy';
import { Link as RouterLink } from 'react-router-dom';

interface TranscriptionsTableProps {
  transcriptions: ITranscription[];
}

const TranscriptionsTable: React.FC<TranscriptionsTableProps> = ({ transcriptions }) => {
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
          {transcriptions.map((transcription) => (
            <tr key={transcription.id}>
              <td style={{ width: '40%' }}>
                <Link
                  component={RouterLink}
                  to={`/transcriptions/${transcription.id}/`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {transcription.audioFilename}
                </Link>
              </td>
              <td>{transcription.createdAtFormatted}</td>
              <td>{transcription.duration}</td>
              <td>
                <Typography
                  level='body-sm'
                  sx={{
                    color: transcription.status === 'Completed' ? 'success.main' : 'warning.main',
                  }}
                >
                  {transcription.status}
                </Typography>
              </td>
              <td>
                {transcription.status === 'Completed' ? (
                  <IconButton variant='plain' color='neutral' size='sm'>
                    <DownloadIcon />
                  </IconButton>
                ) : (
                  <IconButton variant='plain' color='neutral' size='sm'>
                    <EditIcon />
                  </IconButton>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default TranscriptionsTable;

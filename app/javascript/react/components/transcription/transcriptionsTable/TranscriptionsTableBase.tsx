import React from 'react';
import Table from '@mui/joy/Table';
import Chip from '@mui/joy/Chip';
import IconButton from '@mui/joy/IconButton';
import Sheet from '@mui/joy/Sheet';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@mui/joy/Link';

interface Transcription {
  id: number;
  audioFilename?: string | null;
  createdAtFormatted?: string;
  duration?: string;
  status: string;
}

interface TranscriptionsTableBaseProps {
  transcriptions: Transcription[];
  locale: any;
  onView?: (id: number) => void;
  onDelete?: (id: number) => void;
  deletingId?: number | null;
  showActions?: boolean;
}

const statusColors: Record<string, any> = {
  completed: 'success',
  in_progress: 'warning',
  pending: 'warning',
  uploading: 'neutral',
  transcribing: 'neutral',
  error: 'danger',
};

const TranscriptionsTableBase: React.FC<TranscriptionsTableBaseProps> = ({
  transcriptions,
  locale,
  onView,
  onDelete,
  deletingId,
  showActions = true,
}) => {
  return (
    <Sheet variant="outlined" sx={{ p: 2, borderRadius: 8 }}>
      <Table sx={{ minWidth: 600 }}>
        <thead>
          <tr>
            <th>{locale.table.name}</th>
            <th>{locale.table.status}</th>
            <th>{locale.table.date}</th>
            {transcriptions[0]?.duration !== undefined && <th>{locale.table.duration}</th>}
            {showActions && <th>{locale.table.actions}</th>}
          </tr>
        </thead>
        <tbody>
          {transcriptions.length === 0 ? (
            <tr>
              <td colSpan={showActions ? 5 : 4} style={{ textAlign: 'center', color: '#888' }}>
                {locale.table.noTranscriptions}
              </td>
            </tr>
          ) : (
            transcriptions.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link
                    component={RouterLink}
                    to={`/transcriptions/${row.id}/`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'inline-block',
                      maxWidth: '100%',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {row.audioFilename || `Transcription #${row.id}`}
                  </Link>
                </td>
                <td>
                  <Chip color={statusColors[row.status] || 'neutral'} variant="soft">
                    {locale.status[row.status as keyof typeof locale.status] || row.status}
                  </Chip>
                </td>
                <td>{row.createdAtFormatted}</td>
                {row.duration !== undefined && <td>{row.duration}</td>}
                {showActions && (
                  <td>
                    {onView && (
                      <IconButton size="sm" color="primary" title={locale.general.view} onClick={() => onView(row.id)}>
                        <VisibilityIcon />
                      </IconButton>
                    )}
                    {onDelete && (
                      <IconButton
                        size="sm"
                        color="danger"
                        title={locale.general.delete}
                        onClick={() => onDelete(row.id)}
                        disabled={deletingId === row.id}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Sheet>
  );
};

export default TranscriptionsTableBase;

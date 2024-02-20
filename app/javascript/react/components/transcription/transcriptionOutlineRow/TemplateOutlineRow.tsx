import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import Box from '@mui/joy/Box';
import { Link } from 'react-router-dom';

export type TemplateOutlineRowProps = {
  id: number;
  audioFilename: string | null;
  createdAtFormatted: string;
};

export const TemplateOutlineRow = ({
  id,
  audioFilename,
  createdAtFormatted,
}: TemplateOutlineRowProps) => {
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
          <Typography level='body-sm'>{audioFilename ?? 'No Filename'}</Typography>
          <Typography level='body-sm'>{createdAtFormatted}</Typography>
        </Stack>
      </Link>
    </Box>
  );
};

export default TemplateOutlineRow;

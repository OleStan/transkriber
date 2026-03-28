import React, { useEffect, useState } from 'react';
import { useGetTranscriptionsQuery } from '../../redux/resourcesApi/transcriptions/transcriptionsSlice';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  InputAdornment,
  Stack,
  Fab,
  Pagination,
} from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import QuickAddFileOrUrl from '../home/QuickAddFile/QuickAddFileOrUrl';
import StyledTranscriptionsTable from './transcriptionsTable/StyledTranscriptionsTable';
import { cable } from '../../lib/cable';
import { DS } from '../../theme';

const filterButtonSx = {
  bgcolor: DS.surfaceHigh,
  color: DS.onSurfaceVariant,
  borderRadius: '9999px',
  px: 2,
  py: 0.75,
  fontSize: '13px',
  fontFamily: '"Inter", sans-serif',
  border: `1px solid ${DS.outlineVariant}30`,
  '&:hover': { bgcolor: DS.surfaceHighest, color: DS.onSurface },
};

const Transcriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);

  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [typeAnchor, setTypeAnchor] = useState<null | HTMLElement>(null);

  const formatDateForAPI = (dateFilter: string | null): { start_date: string | null; end_date: string | null } => {
    if (!dateFilter) return { start_date: null, end_date: null };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    switch (dateFilter) {
      case 'today': {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { start_date: today.toISOString().split('T')[0], end_date: tomorrow.toISOString().split('T')[0] };
      }
      case 'week': {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return { start_date: weekAgo.toISOString().split('T')[0], end_date: null };
      }
      case 'month': {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return { start_date: monthAgo.toISOString().split('T')[0], end_date: null };
      }
      default:
        return { start_date: null, end_date: null };
    }
  };

  const dateRange = formatDateForAPI(dateFilter);

  const { data: transcriptions, error, isLoading } = useGetTranscriptionsQuery({
    page: currentPage,
    status: statusFilter,
    q: searchQuery || null,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    type: typeFilter,
  });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    setSearchParams({ page: value.toString() });
  };

  const records = transcriptions?.transcriptions || [];
  const [updates, setUpdates] = useState<Record<number, { status: string }>>({});
  useEffect(() => {
    if (!records.length) return;
    const subs = records.map(({ id }) =>
      cable.subscriptions.create(
        { channel: 'TranscriptionChannel', room: id.toString() },
        {
          received(data: { status: string }) {
            setUpdates((prev) => ({ ...prev, [id]: data }));
          },
        }
      )
    );
    return () => subs.forEach((sub: any) => sub.unsubscribe());
  }, [records]);

  const displayRecords = records.map((tr) => ({ ...tr, status: updates[tr.id]?.status || tr.status }));

  const isFilteringOrSearching = Boolean(
    (searchQuery && searchQuery.trim() !== '') || statusFilter || dateFilter || typeFilter
  );
  const isEmpty = Boolean(transcriptions?.transcriptions && transcriptions.transcriptions.length === 0);

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>, filterType: string) => {
    if (filterType === 'status') setStatusAnchor(event.currentTarget);
    else if (filterType === 'date') setDateAnchor(event.currentTarget);
    else if (filterType === 'type') setTypeAnchor(event.currentTarget);
  };

  const handleFilterClose = (filterType: string, value?: string | null) => {
    if (filterType === 'status') { setStatusAnchor(null); if (value !== undefined) setStatusFilter(value); }
    else if (filterType === 'date') { setDateAnchor(null); if (value !== undefined) setDateFilter(value); }
    else if (filterType === 'type') { setTypeAnchor(null); if (value !== undefined) setTypeFilter(value); }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: DS.bg }}>
        <CircularProgress sx={{ color: DS.primary }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: DS.bg, minHeight: '100vh', color: DS.onSurface, p: 4 }}>
        <Typography sx={{ color: DS.error, fontFamily: '"Inter", sans-serif' }}>
          Error occurred: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  const SearchAndFilters = () => (
    <>
      {/* Search Bar */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search your archive..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          variant="standard"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: DS.outline, fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiInput-root': {
              bgcolor: DS.surfaceLowest,
              color: DS.onSurface,
              fontFamily: '"Newsreader", serif',
              fontSize: '1.125rem',
              px: 2,
              py: 1,
              borderRadius: '12px 12px 0 0',
              '&::before': { display: 'none' },
              '&::after': { borderBottomColor: DS.primary },
              borderBottom: `2px solid ${DS.outlineVariant}30`,
              '&.Mui-focused': { borderBottomColor: DS.primary },
            },
            '& .MuiInputBase-input::placeholder': { color: `${DS.outline}80`, opacity: 1 },
          }}
        />
      </Box>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
        <Button onClick={(e) => handleFilterClick(e, 'status')} endIcon={<ArrowDownIcon />} sx={filterButtonSx}>
          {statusFilter ? `Status: ${statusFilter}` : 'Status'}
        </Button>
        <Menu anchorEl={statusAnchor} open={Boolean(statusAnchor)} onClose={() => handleFilterClose('status')}>
          <MenuItem onClick={() => handleFilterClose('status', null)}>All</MenuItem>
          <MenuItem onClick={() => handleFilterClose('status', 'completed')}>Completed</MenuItem>
          <MenuItem onClick={() => handleFilterClose('status', 'processing')}>Processing</MenuItem>
          <MenuItem onClick={() => handleFilterClose('status', 'failed')}>Failed</MenuItem>
        </Menu>

        <Button onClick={(e) => handleFilterClick(e, 'date')} endIcon={<ArrowDownIcon />} sx={filterButtonSx}>
          {dateFilter ? `Date: ${dateFilter}` : 'Date'}
        </Button>
        <Menu anchorEl={dateAnchor} open={Boolean(dateAnchor)} onClose={() => handleFilterClose('date')}>
          <MenuItem onClick={() => handleFilterClose('date', null)}>All time</MenuItem>
          <MenuItem onClick={() => handleFilterClose('date', 'today')}>Today</MenuItem>
          <MenuItem onClick={() => handleFilterClose('date', 'week')}>This week</MenuItem>
          <MenuItem onClick={() => handleFilterClose('date', 'month')}>This month</MenuItem>
        </Menu>

        <Button onClick={(e) => handleFilterClick(e, 'type')} endIcon={<ArrowDownIcon />} sx={filterButtonSx}>
          {typeFilter ? `Type: ${typeFilter}` : 'Type'}
        </Button>
        <Menu anchorEl={typeAnchor} open={Boolean(typeAnchor)} onClose={() => handleFilterClose('type')}>
          <MenuItem onClick={() => handleFilterClose('type', null)}>All</MenuItem>
          <MenuItem onClick={() => handleFilterClose('type', 'audio')}>Audio</MenuItem>
          <MenuItem onClick={() => handleFilterClose('type', 'video')}>Video</MenuItem>
        </Menu>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        bgcolor: DS.bg,
        pt: '64px',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 12, md: 6 },
      }}
    >
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: { xs: '2rem', md: '2.5rem' },
              color: DS.onSurface,
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              mb: 0.5,
            }}
          >
            Transcripts
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Newsreader", serif',
              fontSize: '1.125rem',
              color: DS.onSurfaceVariant,
              fontStyle: 'italic',
            }}
          >
            The archive of your digital narratives.
          </Typography>
        </Box>

        {isEmpty ? (
          isFilteringOrSearching ? (
            <>
              <SearchAndFilters />
              <Box
                sx={{
                  textAlign: 'center',
                  mt: 8,
                  p: 6,
                  bgcolor: DS.surfaceLow,
                  borderRadius: '16px',
                  border: `1px solid ${DS.outlineVariant}1a`,
                }}
              >
                <Typography sx={{ fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '1.125rem', color: DS.onSurface, mb: 1 }}>
                  No results found
                </Typography>
                <Typography sx={{ fontFamily: '"Newsreader", serif', fontSize: '1rem', color: DS.onSurfaceVariant, fontStyle: 'italic' }}>
                  Try adjusting your filters or search query.
                </Typography>
              </Box>
            </>
          ) : (
            <QuickAddFileOrUrl />
          )
        ) : (
          <>
            <SearchAndFilters />

            {/* Table */}
            <Box sx={{ mb: 4 }}>
              <StyledTranscriptionsTable transcriptions={displayRecords} />
            </Box>

            {/* Pagination */}
            {transcriptions && transcriptions.totalPages > 1 && (
              <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                <Pagination
                  count={transcriptions.totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: DS.onSurfaceVariant,
                      borderRadius: '8px',
                      fontFamily: '"Inter", sans-serif',
                      '&:hover': { bgcolor: DS.surfaceHighest },
                    },
                    '& .Mui-selected': {
                      bgcolor: `${DS.primary} !important`,
                      color: `${DS.onPrimary} !important`,
                    },
                  }}
                />
              </Stack>
            )}
          </>
        )}
      </Box>

      {/* FAB */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: { xs: 96, md: 48 },
          right: { xs: 24, md: 48 },
          background: DS.primaryGradient,
          color: DS.onPrimary,
          boxShadow: '0 20px 40px rgba(6, 14, 32, 0.4)',
          '&:hover': { transform: 'scale(1.05)', background: DS.primaryGradient },
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default Transcriptions;

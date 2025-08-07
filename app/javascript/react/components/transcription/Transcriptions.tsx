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
  Stack
} from '@mui/material';
import {
  Search as SearchIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { Pagination } from '@mui/material';
import QuickAddFileOrUrl from '../home/QuickAddFile/QuickAddFileOrUrl';
import StyledTranscriptionsTable from './transcriptionsTable/StyledTranscriptionsTable';
import { cable } from '../../lib/cable';

const Transcriptions = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [currentPage, setCurrentPage] = React.useState(initialPage);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  
  // Menu anchors for filters
  const [statusAnchor, setStatusAnchor] = useState<null | HTMLElement>(null);
  const [dateAnchor, setDateAnchor] = useState<null | HTMLElement>(null);
  const [typeAnchor, setTypeAnchor] = useState<null | HTMLElement>(null);

  const { data: transcriptions, error, isLoading } = useGetTranscriptionsQuery(currentPage);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    setSearchParams({ page: value.toString() }); // Update URL search params
  };

  useEffect(() => {
    if (isLoading) return;
  }, [transcriptions]);

  const records = transcriptions?.transcriptions || [];
  const [updates, setUpdates] = useState<Record<number, { status: string }>>({});
  useEffect(() => {
    if (!records.length) return;
    const subs = records.map(({ id }) =>
      cable.subscriptions.create(
        { channel: 'TranscriptionChannel', room: id.toString() },
        {
          received(data: { status: string }) {
            setUpdates(prev => ({ ...prev, [id]: data }));
          },
        }
      )
    );
    return () => subs.forEach((sub: any) => sub.unsubscribe());
  }, [records]);
  const displayRecords = records
    .map(tr => ({ ...tr, status: updates[tr.id]?.status || tr.status }))
    .filter(tr => {
      if (searchQuery && !tr.audioFilename?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (statusFilter && tr.status !== statusFilter) {
        return false;
      }
      return true;
    });



  const handleFilterClick = (event: React.MouseEvent<HTMLElement>, filterType: string) => {
    switch (filterType) {
      case 'status':
        setStatusAnchor(event.currentTarget);
        break;
      case 'date':
        setDateAnchor(event.currentTarget);
        break;
      case 'type':
        setTypeAnchor(event.currentTarget);
        break;
    }
  };

  const handleFilterClose = (filterType: string, value?: string | null) => {
    switch (filterType) {
      case 'status':
        setStatusAnchor(null);
        if (value !== undefined) setStatusFilter(value);
        break;
      case 'date':
        setDateAnchor(null);
        if (value !== undefined) setDateFilter(value);
        break;
      case 'type':
        setTypeAnchor(null);
        if (value !== undefined) setTypeFilter(value);
        break;
    }
  };



  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100vh',
          bgcolor: '#141b1f'
        }}
      >
        <CircularProgress sx={{ color: 'white' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ bgcolor: '#141b1f', minHeight: '100vh', color: 'white', p: 4 }}>
        <Typography variant="body1" sx={{ color: 'error.main' }}>
          Error occurred: {error instanceof Error ? error.message : 'Unknown error'}
        </Typography>
      </Box>
    );
  }

  return (
      <Box sx={{ px: { xs: 2, sm: 4, md: 8, lg: 12, xl: 20 }, py: { xs: 2, sm: 3, md: 5 } }}>
        <Box sx={{ maxWidth: '960px', mx: 'auto' }}>
          {/* Page Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
            <Typography 
              variant="h3" 
              sx={{ 
                fontWeight: 'bold', 
                color: 'white',
                fontSize: '32px',
                lineHeight: 1.2
              }}
            >
              My Files
            </Typography>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#2b3840',
                color: 'white',
                borderRadius: '20px',
                px: 2,
                py: 1,
                fontSize: '14px',
                fontWeight: 'medium',
                '&:hover': {
                  bgcolor: '#3d505c'
                }
              }}
            >
              New File
            </Button>
          </Box>

          {transcriptions?.transcriptions && transcriptions.transcriptions.length === 0 ? (
            <QuickAddFileOrUrl />
          ) : (
            <>
              {/* Search Bar */}
              <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
                <TextField
                  fullWidth
                  placeholder="Search files"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#9db1be' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#2b3840',
                      borderRadius: '12px',
                      height: '48px',
                      '& fieldset': {
                        border: 'none',
                      },
                      '&:hover fieldset': {
                        border: 'none',
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none',
                      },
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'white',
                      '&::placeholder': {
                        color: '#9db1be',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>

              {/* Filter Buttons */}
              <Box sx={{ display: 'flex', gap: 1.5, p: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
                <Button
                  onClick={(e) => handleFilterClick(e, 'status')}
                  endIcon={<ArrowDownIcon />}
                  sx={{
                    bgcolor: '#2b3840',
                    color: 'white',
                    borderRadius: '20px',
                    px: 2,
                    py: 1,
                    fontSize: '14px',
                    fontWeight: 'medium',
                    '&:hover': {
                      bgcolor: '#3d505c'
                    }
                  }}
                >
                  Status
                </Button>
                <Menu
                  anchorEl={statusAnchor}
                  open={Boolean(statusAnchor)}
                  onClose={() => handleFilterClose('status')}
                >
                  <MenuItem onClick={() => handleFilterClose('status', null)}>All</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('status', 'completed')}>Completed</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('status', 'processing')}>Processing</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('status', 'failed')}>Failed</MenuItem>
                </Menu>

                <Button
                  onClick={(e) => handleFilterClick(e, 'date')}
                  endIcon={<ArrowDownIcon />}
                  sx={{
                    bgcolor: '#2b3840',
                    color: 'white',
                    borderRadius: '20px',
                    px: 2,
                    py: 1,
                    fontSize: '14px',
                    fontWeight: 'medium',
                    '&:hover': {
                      bgcolor: '#3d505c'
                    }
                  }}
                >
                  Date
                </Button>
                <Menu
                  anchorEl={dateAnchor}
                  open={Boolean(dateAnchor)}
                  onClose={() => handleFilterClose('date')}
                >
                  <MenuItem onClick={() => handleFilterClose('date', null)}>All</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('date', 'today')}>Today</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('date', 'week')}>This Week</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('date', 'month')}>This Month</MenuItem>
                </Menu>

                <Button
                  onClick={(e) => handleFilterClick(e, 'type')}
                  endIcon={<ArrowDownIcon />}
                  sx={{
                    bgcolor: '#2b3840',
                    color: 'white',
                    borderRadius: '20px',
                    px: 2,
                    py: 1,
                    fontSize: '14px',
                    fontWeight: 'medium',
                    '&:hover': {
                      bgcolor: '#3d505c'
                    }
                  }}
                >
                  Type
                </Button>
                <Menu
                  anchorEl={typeAnchor}
                  open={Boolean(typeAnchor)}
                  onClose={() => handleFilterClose('type')}
                >
                  <MenuItem onClick={() => handleFilterClose('type', null)}>All</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('type', 'audio')}>Audio</MenuItem>
                  <MenuItem onClick={() => handleFilterClose('type', 'video')}>Video</MenuItem>
                </Menu>
              </Box>

              {/* Table */}
              <Box sx={{ px: { xs: 1, sm: 2 }, py: { xs: 2, sm: 3 } }}>
                <StyledTranscriptionsTable transcriptions={displayRecords} />
              </Box>

              {/* Pagination */}
              {transcriptions && transcriptions?.totalPages > 1 && (
                <Stack direction='row' spacing={2} justifyContent='center' mt={4}>
                  <Pagination
                    count={transcriptions?.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: 'white',
                        '&:hover': {
                          bgcolor: '#2b3840'
                        }
                      },
                      '& .Mui-selected': {
                        bgcolor: '#2b3840 !important',
                        color: 'white'
                      }
                    }}
                  />
                </Stack>
              )}
            </>
          )}
        </Box>
      </Box>
  );
};

export default Transcriptions;

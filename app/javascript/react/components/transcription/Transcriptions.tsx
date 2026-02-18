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

  // Format date for API
  const formatDateForAPI = (dateFilter: string | null): { start_date: string | null; end_date: string | null } => {
    if (!dateFilter) return { start_date: null, end_date: null };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (dateFilter) {
      case 'today':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return {
          start_date: today.toISOString().split('T')[0],
          end_date: tomorrow.toISOString().split('T')[0]
        };
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return {
          start_date: weekAgo.toISOString().split('T')[0],
          end_date: null
        };
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return {
          start_date: monthAgo.toISOString().split('T')[0],
          end_date: null
        };
      default:
        return { start_date: null, end_date: null };
    }
  };
  
  const dateRange = formatDateForAPI(dateFilter);
  
  const { data: transcriptions, error, isLoading, refetch } = useGetTranscriptionsQuery({
    page: currentPage,
    status: statusFilter,
    q: searchQuery || null,
    start_date: dateRange.start_date,
    end_date: dateRange.end_date,
    type: typeFilter
  });

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
  
  // Apply real-time status updates to the records
  const displayRecords = records.map(tr => ({ 
    ...tr, 
    status: updates[tr.id]?.status || tr.status 
  }));

  const isFilteringOrSearching = Boolean(
    (searchQuery && searchQuery.trim() !== '') ||
    statusFilter ||
    dateFilter ||
    typeFilter
  );
  const isEmpty = Boolean(transcriptions?.transcriptions && transcriptions.transcriptions.length === 0);



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
        break;ґ
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
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#111b22',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
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

          {isEmpty ? (
            isFilteringOrSearching ? (
              <>
                {/* Search Bar */}
                <Box sx={{ mb: 4 }}>
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
                <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
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

                {/* Empty State */}
                <Box sx={{ textAlign: 'center', mt: 8 }}>
                  <Typography variant="h6" sx={{ color: '#9db1be', mb: 1 }}>
                    No results found
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#9db1be' }}>
                    Try adjusting your filters or search.
                  </Typography>
                </Box>
              </>
            ) : (
              <QuickAddFileOrUrl />
            )
          ) : (
            <>
              {/* Search Bar */}
              <Box sx={{ mb: 4 }}>
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
              <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
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
              <Box sx={{ mb: 4 }}>
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

import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  Divider,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';

const Settings: React.FC = () => {
  const { showNotification } = useNotification();
  
  // Form states
  const [nameForm, setNameForm] = useState({
    name: '',
    loading: false
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    loading: false
  });
  
  const [errors, setErrors] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Handle name change
  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors(prev => ({ ...prev, name: '' }));
    
    // Validate
    if (!nameForm.name.trim()) {
      setErrors(prev => ({ ...prev, name: 'Name is required' }));
      return;
    }
    
    setNameForm(prev => ({ ...prev, loading: true }));
    
    try {
      // TODO: Make API call to update name
      // const response = await updateUserName({ name: nameForm.name });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('Name updated successfully', 'success');
      setNameForm({ name: '', loading: false });
    } catch (error) {
      showNotification('Failed to update name', 'danger');
      setNameForm(prev => ({ ...prev, loading: false }));
    }
  };

  // Handle password change
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
    
    // Validate
    let hasError = false;
    
    if (!passwordForm.currentPassword) {
      setErrors(prev => ({ ...prev, currentPassword: 'Current password is required' }));
      hasError = true;
    }
    
    if (!passwordForm.newPassword) {
      setErrors(prev => ({ ...prev, newPassword: 'New password is required' }));
      hasError = true;
    } else if (passwordForm.newPassword.length < 8) {
      setErrors(prev => ({ ...prev, newPassword: 'Password must be at least 8 characters' }));
      hasError = true;
    }
    
    if (!passwordForm.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      hasError = true;
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }));
      hasError = true;
    }
    
    if (hasError) return;
    
    setPasswordForm(prev => ({ ...prev, loading: true }));
    
    try {
      // TODO: Make API call to update password
      // const response = await updateUserPassword({
      //   currentPassword: passwordForm.currentPassword,
      //   newPassword: passwordForm.newPassword
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification('Password updated successfully', 'success');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
        loading: false
      });
    } catch (error) {
      showNotification('Failed to update password', 'danger');
      setPasswordForm(prev => ({ ...prev, loading: false }));
    }
  };

  const togglePasswordVisibility = (field: 'showCurrentPassword' | 'showNewPassword' | 'showConfirmPassword') => {
    setPasswordForm(prev => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        bgcolor: '#111b22',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
        <Typography
          variant="h4"
          sx={{
            color: 'white',
            fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
            fontWeight: 'bold',
            mb: 4
          }}
        >
          Settings
        </Typography>

        {/* Change Name Section */}
        <Paper
          sx={{
            bgcolor: '#1f282e',
            border: '1px solid #3d505c',
            borderRadius: '12px',
            p: 4,
            mb: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <PersonIcon sx={{ color: '#1994e6', mr: 2 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
                fontWeight: 'medium'
              }}
            >
              Change Name
            </Typography>
          </Box>

          <form onSubmit={handleNameChange}>
            <TextField
              fullWidth
              label="Name"
              value={nameForm.name}
              onChange={(e) => setNameForm(prev => ({ ...prev, name: e.target.value }))}
              error={!!errors.name}
              helperText={errors.name}
              disabled={nameForm.loading}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#3d505c',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4d606c',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1994e6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#93b3c8',
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff5252',
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              disabled={nameForm.loading}
              startIcon={nameForm.loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                bgcolor: '#1994e6',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#1578c2',
                },
                '&:disabled': {
                  bgcolor: '#345165',
                  color: '#93b3c8',
                },
              }}
            >
              {nameForm.loading ? 'Updating...' : 'Update Name'}
            </Button>
          </form>
        </Paper>

        {/* Change Password Section */}
        <Paper
          sx={{
            bgcolor: '#1f282e',
            border: '1px solid #3d505c',
            borderRadius: '12px',
            p: 4
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <LockIcon sx={{ color: '#1994e6', mr: 2 }} />
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontFamily: '"Spline Sans", "Noto Sans", sans-serif',
                fontWeight: 'medium'
              }}
            >
              Change Password
            </Typography>
          </Box>

          <form onSubmit={handlePasswordChange}>
            <TextField
              fullWidth
              type={passwordForm.showCurrentPassword ? 'text' : 'password'}
              label="Current Password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              disabled={passwordForm.loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('showCurrentPassword')}
                      edge="end"
                      sx={{ color: '#93b3c8' }}
                    >
                      {passwordForm.showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#3d505c',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4d606c',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1994e6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#93b3c8',
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff5252',
                },
              }}
            />

            <TextField
              fullWidth
              type={passwordForm.showNewPassword ? 'text' : 'password'}
              label="New Password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              disabled={passwordForm.loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('showNewPassword')}
                      edge="end"
                      sx={{ color: '#93b3c8' }}
                    >
                      {passwordForm.showNewPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#3d505c',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4d606c',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1994e6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#93b3c8',
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff5252',
                },
              }}
            />

            <TextField
              fullWidth
              type={passwordForm.showConfirmPassword ? 'text' : 'password'}
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={passwordForm.loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => togglePasswordVisibility('showConfirmPassword')}
                      edge="end"
                      sx={{ color: '#93b3c8' }}
                    >
                      {passwordForm.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  color: 'white',
                  '& fieldset': {
                    borderColor: '#3d505c',
                  },
                  '&:hover fieldset': {
                    borderColor: '#4d606c',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1994e6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#93b3c8',
                },
                '& .MuiFormHelperText-root': {
                  color: '#ff5252',
                },
              }}
            />

            <Alert 
              severity="info" 
              sx={{ 
                mb: 3,
                bgcolor: '#1b2632',
                color: '#93b3c8',
                '& .MuiAlert-icon': { color: '#1994e6' }
              }}
            >
              Password must be at least 8 characters long
            </Alert>

            <Button
              type="submit"
              variant="contained"
              disabled={passwordForm.loading}
              startIcon={passwordForm.loading ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{
                bgcolor: '#1994e6',
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none',
                borderRadius: '8px',
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: '#1578c2',
                },
                '&:disabled': {
                  bgcolor: '#345165',
                  color: '#93b3c8',
                },
              }}
            >
              {passwordForm.loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </Paper>
      </Box>
    </Box>
  );
};

export default Settings;

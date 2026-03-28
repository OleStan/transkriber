import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Lock as LockIcon,
  Save as SaveIcon,
  Group as TeamIcon,
  BarChart as UsageIcon,
  Payment as BillingIcon,
  Code as ApiIcon,
  Webhook as WebhookIcon,
} from '@mui/icons-material';
import { useNotification } from '../../contexts/NotificationContext';
import { useUpdateProfileMutation, useGetCurrentUserQuery, useUpdatePasswordMutation } from '../../redux/resourcesApi/auth/authSlice';
import { DS } from '../../theme';

const bottomBorderInputSx = {
  mb: 3,
  '& .MuiInput-root': {
    bgcolor: DS.surfaceLowest,
    color: DS.onSurface,
    fontFamily: '"Inter", sans-serif',
    fontSize: '15px',
    px: 0,
    py: 1,
    borderBottom: `2px solid ${DS.outlineVariant}50`,
    '&::before': { display: 'none' },
    '&::after': { borderBottomColor: DS.primary },
    '&.Mui-focused': { borderBottomColor: DS.primary },
  },
  '& .MuiInputLabel-root': {
    color: DS.outline,
    fontFamily: '"Inter", sans-serif',
    fontSize: '10px',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    transform: 'none',
    position: 'relative',
    mb: 0.5,
  },
  '& .MuiFormHelperText-root': {
    color: DS.error,
    fontFamily: '"Inter", sans-serif',
    fontSize: '11px',
    mt: 0.5,
  },
  '& .MuiInputBase-input::placeholder': {
    color: `${DS.outline}80`,
    opacity: 1,
  },
};

const NAV_ITEMS = [
  { icon: PersonIcon, label: 'Profile', key: 'profile', enabled: true },
  { icon: LockIcon, label: 'Security', key: 'security', enabled: true },
  { icon: TeamIcon, label: 'Team', key: 'team', enabled: false },
  { icon: UsageIcon, label: 'Usage', key: 'usage', enabled: false },
  { icon: BillingIcon, label: 'Billing', key: 'billing', enabled: false },
  { icon: ApiIcon, label: 'API', key: 'api', enabled: false },
  { icon: WebhookIcon, label: 'Webhooks', key: 'webhooks', enabled: false },
];

const getPasswordStrength = (password: string): { score: number; label: string } => {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) score++;
  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong'];
  return { score, label: labels[Math.min(score - 1, 3)] || '' };
};

const Settings: React.FC = () => {
  const { showNotification } = useNotification();
  const [updateProfile] = useUpdateProfileMutation();
  const [updatePassword] = useUpdatePasswordMutation();
  const { data: currentUserData } = useGetCurrentUserQuery();
  const [activeSection, setActiveSection] = useState<string>('profile');

  const currentUserName = currentUserData?.user
    ? [currentUserData.user.first_name, currentUserData.user.last_name].filter(Boolean).join(' ')
    : '';

  const [nameForm, setNameForm] = useState({ name: currentUserName, loading: false });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    loading: false,
  });
  const [errors, setErrors] = useState({ name: '', currentPassword: '', newPassword: '', confirmPassword: '' });

  const handleNameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, name: '' }));
    if (!nameForm.name.trim()) { setErrors((prev) => ({ ...prev, name: 'Name is required' })); return; }
    if (nameForm.name.trim().length < 2) { setErrors((prev) => ({ ...prev, name: 'Name must be at least 2 characters' })); return; }
    if (nameForm.name.trim().length > 60) { setErrors((prev) => ({ ...prev, name: 'Name must be at most 60 characters' })); return; }
    setNameForm((prev) => ({ ...prev, loading: true }));
    const parts = nameForm.name.trim().split(/\s+/);
    const first_name = parts[0] || '';
    const last_name = parts.slice(1).join(' ') || '';
    try {
      const result = await updateProfile({ first_name, last_name });
      if ('error' in result) { showNotification('Failed to update name', 'danger'); } else { showNotification('Name updated successfully', 'success'); }
    } catch { showNotification('Failed to update name', 'danger'); }
    setNameForm((prev) => ({ ...prev, loading: false }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
    let hasError = false;
    if (!passwordForm.currentPassword) { setErrors((prev) => ({ ...prev, currentPassword: 'Current password is required' })); hasError = true; }
    if (!passwordForm.newPassword) { setErrors((prev) => ({ ...prev, newPassword: 'New password is required' })); hasError = true; }
    else if (passwordForm.newPassword.length < 8) { setErrors((prev) => ({ ...prev, newPassword: 'Password must be at least 8 characters' })); hasError = true; }
    if (!passwordForm.confirmPassword) { setErrors((prev) => ({ ...prev, confirmPassword: 'Please confirm your password' })); hasError = true; }
    else if (passwordForm.newPassword !== passwordForm.confirmPassword) { setErrors((prev) => ({ ...prev, confirmPassword: 'Passwords do not match' })); hasError = true; }
    if (hasError) return;
    setPasswordForm((prev) => ({ ...prev, loading: true }));
    try {
      const result = await updatePassword({
        current_password: passwordForm.currentPassword,
        password: passwordForm.newPassword,
        password_confirmation: passwordForm.confirmPassword,
      });
      if ('error' in result) {
        const errorData = (result.error as { data?: { errors?: string[] } })?.data;
        const serverMessage = Array.isArray(errorData?.errors) ? errorData.errors.join(', ') : 'Failed to update password';
        showNotification(serverMessage, 'danger');
      } else {
        showNotification('Password updated successfully', 'success');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '', showCurrentPassword: false, showNewPassword: false, showConfirmPassword: false, loading: false });
      }
    } catch { showNotification('Failed to update password', 'danger'); }
    setPasswordForm((prev) => ({ ...prev, loading: false }));
  };

  const togglePasswordVisibility = (field: 'showCurrentPassword' | 'showNewPassword' | 'showConfirmPassword') => {
    setPasswordForm((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const passwordStrength = getPasswordStrength(passwordForm.newPassword);

  const sectionCard = (children: React.ReactNode) => (
    <Box
      sx={{
        bgcolor: DS.surfaceLow,
        borderRadius: '12px',
        border: `1px solid ${DS.outlineVariant}1a`,
        p: 4,
        mb: 3,
      }}
    >
      {children}
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        bgcolor: DS.bg,
        pt: '64px',
        py: { xs: 3, sm: 4, md: 5 },
        px: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: '1000px', mx: 'auto', display: 'flex', gap: 4, alignItems: 'flex-start' }}>
        {/* Left sidebar nav */}
        <Box
          sx={{
            width: 256,
            flexShrink: 0,
            bgcolor: DS.surfaceLow,
            borderRadius: '12px',
            border: `1px solid ${DS.outlineVariant}1a`,
            p: 2,
            position: 'sticky',
            top: '80px',
            display: { xs: 'none', md: 'block' },
          }}
        >
          <Typography
            sx={{
              color: DS.outline,
              fontFamily: '"Inter", sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              px: 1.5,
              mb: 1.5,
            }}
          >
            Settings
          </Typography>
          {NAV_ITEMS.map(({ icon: Icon, label, key, enabled }) => {
            const active = activeSection === key;
            return (
              <Box
                key={key}
                onClick={() => enabled && setActiveSection(key)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  px: 1.5,
                  py: 1,
                  borderRadius: '8px',
                  cursor: enabled ? 'pointer' : 'not-allowed',
                  mb: 0.5,
                  bgcolor: active ? `${DS.primary}1a` : 'transparent',
                  color: active ? DS.primary : enabled ? '#94a3b8' : `${DS.outline}60`,
                  fontFamily: '"Inter", sans-serif',
                  fontSize: '14px',
                  fontWeight: active ? 700 : 400,
                  transition: 'all 0.15s',
                  '&:hover': enabled ? { color: active ? DS.primary : DS.onSurface, bgcolor: active ? `${DS.primary}1a` : DS.surface } : {},
                }}
              >
                <Icon sx={{ fontSize: 18 }} />
                {label}
                {!enabled && (
                  <Box sx={{ ml: 'auto', bgcolor: `${DS.outlineVariant}40`, borderRadius: '4px', px: 0.75, py: 0.25, fontSize: '9px', color: DS.outline }}>
                    Soon
                  </Box>
                )}
              </Box>
            );
          })}

          {/* Upgrade Plan */}
          <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${DS.outlineVariant}30` }}>
            <Box
              component="button"
              sx={{
                width: '100%',
                py: 1,
                borderRadius: '8px',
                background: DS.primaryGradient,
                color: DS.onPrimary,
                fontFamily: '"Inter", sans-serif',
                fontSize: '13px',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                '&:hover': { opacity: 0.9 },
              }}
            >
              Upgrade Plan
            </Box>
          </Box>
        </Box>

        {/* Main content */}
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontFamily: '"Manrope", sans-serif',
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2rem' },
              color: DS.onSurface,
              letterSpacing: '-0.02em',
              mb: 4,
            }}
          >
            {activeSection === 'profile' ? 'Profile' : 'Security'}
          </Typography>

          {activeSection === 'profile' && sectionCard(
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PersonIcon sx={{ color: DS.primary, fontSize: 20 }} />
                <Typography sx={{ color: DS.onSurface, fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '15px' }}>
                  Display Name
                </Typography>
              </Box>
              <form onSubmit={handleNameChange}>
                <TextField
                  fullWidth
                  label="Name"
                  variant="standard"
                  value={nameForm.name}
                  onChange={(e) => setNameForm((prev) => ({ ...prev, name: e.target.value }))}
                  error={!!errors.name}
                  helperText={errors.name}
                  disabled={nameForm.loading}
                  InputLabelProps={{ shrink: true }}
                  sx={bottomBorderInputSx}
                />
                <Button
                  type="submit"
                  disabled={nameForm.loading}
                  startIcon={nameForm.loading ? <CircularProgress size={16} /> : <SaveIcon />}
                  sx={{
                    bgcolor: DS.surfaceHigh,
                    color: DS.primary,
                    border: `1px solid ${DS.outlineVariant}40`,
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    fontFamily: '"Inter", sans-serif',
                    fontWeight: 600,
                    fontSize: '14px',
                    '&:hover': { bgcolor: DS.surfaceHighest },
                    '&:disabled': { color: DS.outline },
                  }}
                >
                  {nameForm.loading ? 'Updating...' : 'Save Profile'}
                </Button>
              </form>
            </>
          )}

          {activeSection === 'security' && sectionCard(
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <LockIcon sx={{ color: DS.primary, fontSize: 20 }} />
                <Typography sx={{ color: DS.onSurface, fontFamily: '"Manrope", sans-serif', fontWeight: 700, fontSize: '15px' }}>
                  Change Password
                </Typography>
              </Box>

              <form onSubmit={handlePasswordChange}>
                <TextField
                  fullWidth
                  type={passwordForm.showCurrentPassword ? 'text' : 'password'}
                  label="Current Password"
                  variant="standard"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
                  error={!!errors.currentPassword}
                  helperText={errors.currentPassword}
                  disabled={passwordForm.loading}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('showCurrentPassword')} edge="end" sx={{ color: DS.outline }}>
                          {passwordForm.showCurrentPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={bottomBorderInputSx}
                />

                <TextField
                  fullWidth
                  type={passwordForm.showNewPassword ? 'text' : 'password'}
                  label="New Password"
                  variant="standard"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                  error={!!errors.newPassword}
                  helperText={errors.newPassword}
                  disabled={passwordForm.loading}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('showNewPassword')} edge="end" sx={{ color: DS.outline }}>
                          {passwordForm.showNewPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={bottomBorderInputSx}
                />

                {/* Password strength bar */}
                {passwordForm.newPassword && (
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography sx={{ color: DS.outline, fontFamily: '"Inter", sans-serif', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        Strength
                      </Typography>
                      <Typography sx={{ color: DS.onSurfaceVariant, fontFamily: '"Inter", sans-serif', fontSize: '11px' }}>
                        {passwordStrength.label}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75 }}>
                      {[0, 1, 2, 3].map((i) => (
                        <Box
                          key={i}
                          sx={{
                            flex: 1,
                            height: 4,
                            borderRadius: '9999px',
                            bgcolor: i < passwordStrength.score ? DS.primary : DS.surfaceHighest,
                            transition: 'background-color 0.3s',
                          }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                <TextField
                  fullWidth
                  type={passwordForm.showConfirmPassword ? 'text' : 'password'}
                  label="Confirm New Password"
                  variant="standard"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  disabled={passwordForm.loading}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => togglePasswordVisibility('showConfirmPassword')} edge="end" sx={{ color: DS.outline }}>
                          {passwordForm.showConfirmPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={bottomBorderInputSx}
                />

                <Button
                  type="submit"
                  disabled={passwordForm.loading}
                  startIcon={passwordForm.loading ? <CircularProgress size={16} sx={{ color: DS.onPrimary }} /> : <SaveIcon />}
                  sx={{
                    background: DS.primaryGradient,
                    color: DS.onPrimary,
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    fontFamily: '"Manrope", sans-serif',
                    fontWeight: 700,
                    fontSize: '14px',
                    '&:hover': { background: DS.primaryGradient, opacity: 0.9 },
                    '&:disabled': { background: 'none', bgcolor: DS.surfaceHighest, color: DS.outline },
                  }}
                >
                  {passwordForm.loading ? 'Updating...' : 'Update Password'}
                </Button>
              </form>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;

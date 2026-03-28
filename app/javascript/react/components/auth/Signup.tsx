import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Button, Typography, Alert, TextField, Stack } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { DS } from '../../theme';

const fieldLabelSx = {
  display: 'block',
  color: DS.outline,
  fontFamily: '"Inter", sans-serif',
  fontSize: '10px',
  fontWeight: 700,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.1em',
  mb: 1,
};

const bottomBorderFieldSx = {
  '& .MuiOutlinedInput-root': {
    bgcolor: DS.surfaceLowest,
    color: DS.onSurface,
    fontFamily: '"Inter", sans-serif',
    fontSize: '15px',
    borderRadius: 0,
    '& fieldset': { border: 'none' },
    '&:hover fieldset': { border: 'none' },
    '&.Mui-focused fieldset': { border: 'none' },
    borderBottom: `2px solid ${DS.outlineVariant}50`,
    '&.Mui-focused': { borderBottomColor: DS.primary },
    transition: 'border-color 0.2s',
  },
  '& .MuiOutlinedInput-input': {
    py: 1.25,
    px: 0,
    color: DS.onSurface,
    '&::placeholder': { color: `${DS.outline}80`, opacity: 1 },
  },
};

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) { setError('Email and password are required'); return; }
    setIsLoading(true);
    try {
      await signup(formData);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        bgcolor: DS.bg,
        background: `${DS.bg}, radial-gradient(circle at top right, rgba(208, 188, 255, 0.08), transparent 40%), radial-gradient(circle at bottom left, rgba(160, 120, 255, 0.05), transparent 40%)`,
        px: 2,
        pb: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: 72,
          bgcolor: 'rgba(11, 19, 38, 0.6)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Manrope", sans-serif',
            fontWeight: 800,
            fontSize: '20px',
            color: DS.primary,
            letterSpacing: '-0.01em',
          }}
        >
          Transcriber
        </Typography>
      </Box>

      {/* Card */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 440,
          bgcolor: DS.surface,
          borderRadius: '12px',
          p: { xs: 4, md: 6 },
          mt: 9,
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            right: -40,
            width: 160,
            height: 160,
            borderRadius: '50%',
            bgcolor: `${DS.primary}08`,
            filter: 'blur(48px)',
            pointerEvents: 'none',
          }}
        />

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography
              sx={{
                fontFamily: '"Manrope", sans-serif',
                fontWeight: 800,
                fontSize: '1.75rem',
                color: DS.onSurface,
                letterSpacing: '-0.02em',
                mb: 0.75,
              }}
            >
              Create Account
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Newsreader", serif',
                fontSize: '1.05rem',
                color: DS.onSurfaceVariant,
                fontStyle: 'italic',
              }}
            >
              Begin your archival journey
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                bgcolor: `${DS.errorContainer}33`,
                color: DS.error,
                '& .MuiAlert-icon': { color: DS.error },
                borderRadius: '8px',
                fontFamily: '"Inter", sans-serif',
                fontSize: '13px',
              }}
            >
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <Box>
                <Typography component="label" htmlFor="fullname" sx={fieldLabelSx}>Full Name</Typography>
                <TextField
                  id="fullname"
                  placeholder="Your full name"
                  name="first_name"
                  value={`${formData.first_name} ${formData.last_name}`.trim()}
                  onChange={(e) => {
                    const parts = e.target.value.split(' ');
                    setFormData({ ...formData, first_name: parts[0] || '', last_name: parts.slice(1).join(' ') });
                  }}
                  fullWidth
                  sx={bottomBorderFieldSx}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="email" sx={fieldLabelSx}>Email Address</Typography>
                <TextField
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={bottomBorderFieldSx}
                />
              </Box>

              <Box>
                <Typography component="label" htmlFor="password" sx={fieldLabelSx}>Password</Typography>
                <TextField
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={bottomBorderFieldSx}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                fullWidth
                sx={{
                  background: DS.primaryGradient,
                  color: DS.onPrimary,
                  borderRadius: '8px',
                  py: 1.75,
                  fontSize: '15px',
                  fontFamily: '"Manrope", sans-serif',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': { background: DS.primaryGradient, opacity: 0.9, boxShadow: 'none' },
                  '&:disabled': { background: 'none', bgcolor: DS.surfaceHigh, color: DS.outline },
                }}
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Box sx={{ position: 'relative', my: 3, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ flex: 1, height: '1px', bgcolor: `${DS.outlineVariant}30` }} />
            <Typography
              sx={{
                mx: 2,
                color: DS.outline,
                fontFamily: '"Inter", sans-serif',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.2em',
                whiteSpace: 'nowrap',
              }}
            >
              Or sign up with
            </Typography>
            <Box sx={{ flex: 1, height: '1px', bgcolor: `${DS.outlineVariant}30` }} />
          </Box>

          <Button
            fullWidth
            startIcon={<GoogleIcon sx={{ fontSize: '20px !important' }} />}
            onClick={() => (window.location.href = '/users/auth/google_oauth2')}
            sx={{
              bgcolor: DS.surfaceHigh,
              color: DS.onSurface,
              border: `1px solid ${DS.outlineVariant}30`,
              borderRadius: '8px',
              py: 1.5,
              fontSize: '14px',
              fontFamily: '"Inter", sans-serif',
              fontWeight: 500,
              textTransform: 'none',
              '&:hover': { bgcolor: DS.surfaceBright, borderColor: DS.outlineVariant },
            }}
          >
            Continue with Google
          </Button>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography sx={{ color: DS.onSurfaceVariant, fontFamily: '"Inter", sans-serif', fontSize: '13px' }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: DS.primary, textDecoration: 'none', fontWeight: 600 }}>
                Sign in
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;

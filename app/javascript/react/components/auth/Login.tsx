import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Button, FormControl, Stack, Typography, Alert, Input } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { DS } from '../../theme';

const inputSx = {
  bgcolor: DS.surfaceLowest,
  color: DS.onSurface,
  fontFamily: '"Inter", sans-serif',
  fontSize: '15px',
  px: 1.5,
  py: 1,
  width: '100%',
  borderBottom: `2px solid transparent`,
  transition: 'border-color 0.2s',
  '&:before': { display: 'none' },
  '&:after': { borderBottomColor: DS.primary },
  '&:hover:not(.Mui-disabled):before': { display: 'none' },
  '&.Mui-focused': { borderBottomColor: DS.primary },
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Email and password are required'); return; }
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to login');
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
        {/* Decorative blur circle */}
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
              Welcome Back
            </Typography>
            <Typography
              sx={{
                fontFamily: '"Newsreader", serif',
                fontSize: '1.05rem',
                color: DS.onSurfaceVariant,
                fontStyle: 'italic',
              }}
            >
              Continue your narrative
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
              <FormControl>
                <Typography
                  component="label"
                  htmlFor="email"
                  sx={{
                    display: 'block',
                    color: DS.outline,
                    fontFamily: '"Inter", sans-serif',
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    mb: 1,
                  }}
                >
                  Email Address
                </Typography>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  placeholder="name@company.com"
                  sx={inputSx}
                />
              </FormControl>

              <FormControl>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography
                    component="label"
                    htmlFor="password"
                    sx={{
                      color: DS.outline,
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                    }}
                  >
                    Password
                  </Typography>
                  <Typography
                    sx={{
                      color: DS.primary,
                      fontFamily: '"Inter", sans-serif',
                      fontSize: '11px',
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                  >
                    Forgot password?
                  </Typography>
                </Box>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  placeholder="••••••••"
                  sx={inputSx}
                />
              </FormControl>

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
                {isLoading ? 'Signing in...' : 'Sign In'}
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
              Or secure access with
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
            <Typography
              sx={{
                color: DS.onSurfaceVariant,
                fontFamily: '"Inter", sans-serif',
                fontSize: '13px',
              }}
            >
              New to Transcriber?{' '}
              <Link
                to="/signup"
                style={{
                  color: DS.primary,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Create an account
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 4,
        }}
      >
        {['Privacy Policy', 'Terms of Service', 'Help Center'].map((label) => (
          <Typography
            key={label}
            sx={{
              color: `${DS.outline}80`,
              fontFamily: '"Inter", sans-serif',
              fontSize: '10px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              cursor: 'pointer',
              '&:hover': { color: DS.outline },
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default Login;

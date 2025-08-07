import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

// MUI Components
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Divider, 
  FormControl, 
  FormLabel, 
  Input, 
  Stack, 
  Typography,
  Alert
} from '@mui/material';

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
    
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }

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
        padding: 2,
        bgcolor: '#141b1f',
        color: 'white',
        fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
      }}
    >
      <Card sx={{ 
        maxWidth: 400, 
        width: '100%',
        bgcolor: '#2b3840',
        borderRadius: '16px',
        boxShadow: 'none'
      }}>
        <CardContent sx={{ p: 4 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              color: 'white',
              fontWeight: 'bold',
              mb: 3
            }}
          >
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel sx={{ color: 'white', mb: 1, fontSize: '14px', fontWeight: 'medium' }}>Email</FormLabel>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    bgcolor: '#141b1f',
                    borderRadius: '8px',
                    p: 1.5,
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&:after': { display: 'none' },
                    '&:hover:not(.Mui-disabled):before': { display: 'none' },
                    '&::placeholder': {
                      color: '#9db1be',
                      opacity: 1,
                    },
                  }}
                />
              </FormControl>
              
              <FormControl>
                <FormLabel sx={{ color: 'white', mb: 1, fontSize: '14px', fontWeight: 'medium' }}>Password</FormLabel>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  fullWidth
                  sx={{
                    bgcolor: '#141b1f',
                    borderRadius: '8px',
                    p: 1.5,
                    color: 'white',
                    '&:before': { display: 'none' },
                    '&:after': { display: 'none' },
                    '&:hover:not(.Mui-disabled):before': { display: 'none' },
                  }}
                />
              </FormControl>
              
              <Button 
                type="submit" 
                variant="contained"
                disabled={isLoading}
                fullWidth
                sx={{
                  bgcolor: '#4a90e2',
                  color: 'white',
                  borderRadius: '8px',
                  py: 1.5,
                  fontSize: '16px',
                  fontWeight: 'medium',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#357abd'
                  },
                  '&:disabled': {
                    bgcolor: '#3d505c',
                    color: '#9db1be'
                  }
                }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </form>
          
          <Divider sx={{ my: 3, bgcolor: '#3d505c' }}>
            <Typography variant="body2" sx={{ color: '#9db1be', px: 2 }}>
              OR
            </Typography>
          </Divider>
          
          <Button 
            variant="outlined" 
            fullWidth 
            startIcon={<GoogleIcon />}
            sx={{ 
              mt: 2, 
              mb: 3,
              borderColor: '#3d505c',
              color: 'white',
              borderRadius: '8px',
              py: 1.5,
              fontSize: '16px',
              fontWeight: 'medium',
              textTransform: 'none',
              '&:hover': {
                borderColor: '#4a90e2',
                bgcolor: 'rgba(74, 144, 226, 0.1)'
              }
            }}
            onClick={() => window.location.href = '/users/auth/google_oauth2'}
          >
            Sign in with Google
          </Button>
          
          <Divider sx={{ my: 2, bgcolor: '#3d505c' }} />
          
          <Typography align="center" sx={{ color: '#9db1be' }}>
            Don't have an account?{' '}
            <Link 
              to="/signup" 
              style={{ 
                textDecoration: 'none', 
                color: '#4a90e2',
                fontWeight: 'medium'
              }}
            >
              Sign Up
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Box, Button, TextField, Typography, Alert } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

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
        minHeight: '100vh',
        bgcolor: '#111b22',
        color: 'white',
        fontFamily: '"Spline Sans", "Noto Sans", sans-serif'
      }}
    >
      {/* Header */}
      <Box 
        sx={{ 
          borderBottom: '1px solid #243947',
          px: 10,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ width: 16, height: 16, color: 'white' }}>
            {/* Database Icon SVG */}
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                fill="currentColor"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z"
                fill="currentColor"
              />
            </svg>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            TranscribeIt
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4.5 }}>
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'medium' }}>
              Product
            </Typography>
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'medium' }}>
              Pricing
            </Typography>
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'medium' }}>
              Enterprise
            </Typography>
            <Typography sx={{ color: 'white', fontSize: '14px', fontWeight: 'medium' }}>
              Resources
            </Typography>
          </Box>
          <Button
            component={Link}
            to="/login"
            sx={{
              bgcolor: '#243947',
              color: 'white',
              borderRadius: '20px',
              px: 2,
              py: 1.25,
              fontSize: '14px',
              fontWeight: 'bold',
              minWidth: '84px',
              '&:hover': {
                bgcolor: '#2d4452'
              }
            }}
          >
            Log in
          </Button>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ px: { xs: 4, md: 20 }, py: 5, display: 'flex', flex: 1, justifyContent: 'center' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            width: '512px', 
            maxWidth: '512px', 
            py: 5 
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              color: 'white',
              fontSize: '28px',
              fontWeight: 'bold',
              lineHeight: 1.2,
              px: 2,
              textAlign: 'center',
              pb: 3,
              pt: 5
            }}
          >
            Create your account
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2, 
                mx: 2,
                bgcolor: '#dc3545',
                color: 'white',
                '& .MuiAlert-icon': {
                  color: 'white'
                }
              }}
            >
              {error}
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            {/* Name Field */}
            <Box sx={{ maxWidth: '480px', px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '40px', flex: 1 }}>
                <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 'medium', pb: 1 }}>
                  Full Name
                </Typography>
                <TextField
                  placeholder="Enter your full name"
                  name="first_name"
                  value={`${formData.first_name} ${formData.last_name}`.trim()}
                  onChange={(e) => {
                    const fullName = e.target.value;
                    const parts = fullName.split(' ');
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join(' ');
                    setFormData({
                      ...formData,
                      first_name: firstName,
                      last_name: lastName
                    });
                  }}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#243947',
                      borderRadius: '12px',
                      height: '56px',
                      border: 'none',
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
                      fontSize: '16px',
                      '&::placeholder': {
                        color: '#93b3c8',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Email Field */}
            <Box sx={{ maxWidth: '480px', px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '40px', flex: 1 }}>
                <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 'medium', pb: 1 }}>
                  Email
                </Typography>
                <TextField
                  type="email"
                  placeholder="Enter your email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#243947',
                      borderRadius: '12px',
                      height: '56px',
                      border: 'none',
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
                      fontSize: '16px',
                      '&::placeholder': {
                        color: '#93b3c8',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Password Field */}
            <Box sx={{ maxWidth: '480px', px: 2, py: 1.5 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: '40px', flex: 1 }}>
                <Typography sx={{ color: 'white', fontSize: '16px', fontWeight: 'medium', pb: 1 }}>
                  Password
                </Typography>
                <TextField
                  type="password"
                  placeholder="Enter your password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      bgcolor: '#243947',
                      borderRadius: '12px',
                      height: '56px',
                      border: 'none',
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
                      fontSize: '16px',
                      '&::placeholder': {
                        color: '#93b3c8',
                        opacity: 1,
                      },
                    },
                  }}
                />
              </Box>
            </Box>



            {/* Create Account Button */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Button
                type="submit"
                disabled={isLoading}
                fullWidth
                sx={{
                  bgcolor: '#1994e6',
                  color: 'white',
                  borderRadius: '20px',
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#1680cc'
                  },
                  '&:disabled': {
                    bgcolor: '#666'
                  }
                }}
              >
                {isLoading ? 'Creating account...' : 'Create account'}
              </Button>
            </Box>

            {/* Google Sign Up Button */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Button
                fullWidth
                startIcon={<GoogleIcon />}
                onClick={() => window.location.href = '/users/auth/google_oauth2'}
                sx={{
                  bgcolor: '#243947',
                  color: 'white',
                  borderRadius: '20px',
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  gap: 1,
                  '&:hover': {
                    bgcolor: '#2d4452'
                  }
                }}
              >
                Sign up with Google
              </Button>
            </Box>
          </form>

          {/* Login Link */}
          <Typography 
            sx={{ 
              color: '#93b3c8', 
              fontSize: '14px', 
              pb: 3, 
              pt: 1, 
              px: 2, 
              textAlign: 'center' 
            }}
          >
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#93b3c8', 
                textDecoration: 'underline' 
              }}
            >
              Log in
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup;

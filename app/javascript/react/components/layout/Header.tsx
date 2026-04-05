import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import {
  NotificationsOutlined as NotificationsIcon,
  HelpOutlineOutlined as HelpIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { DS } from '../../theme';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);

  const userMenuOpen = Boolean(userMenuAnchor);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };

  const isActivePath = (path: string) => {
    if (path === '/home' || path === '/') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isAuthenticated) {
    return null;
  }

  const navLinks = [
    { label: 'Home', path: '/home' },
    { label: 'Transcripts', path: '/transcriptions' },
    { label: 'Settings', path: '/settings' },
  ];

  return (
    <Box
      component="header"
      sx={{
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1100,
        bgcolor: DS.bg,
        height: '64px',
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${DS.outlineVariant}22`,
      }}
    >
      {/* Logo */}
      <Typography
        component={RouterLink}
        to="/home"
        sx={{
          color: DS.primary,
          fontFamily: '"Manrope", sans-serif',
          fontWeight: 800,
          fontSize: '20px',
          textDecoration: 'none',
          letterSpacing: '-0.01em',
          flexShrink: 0,
        }}
      >
        Transcriber
      </Typography>

      {/* Desktop Nav Links */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
        {navLinks.map(({ label, path }) => {
          const active = isActivePath(path);
          return (
            <Typography
              key={path}
              component={RouterLink}
              to={path}
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: '14px',
                fontWeight: active ? 600 : 400,
                color: active ? DS.primary : '#94a3b8',
                textDecoration: 'none',
                pb: '4px',
                borderBottom: active ? `2px solid ${DS.primary}` : '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
                '&:hover': {
                  color: 'white',
                },
              }}
            >
              {label}
            </Typography>
          );
        })}
      </Box>

      {/* Right Side: Icons + Avatar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          sx={{
            color: '#94a3b8',
            borderRadius: '50%',
            p: 1,
            '&:hover': { color: 'white', bgcolor: DS.surface },
          }}
        >
          <NotificationsIcon fontSize="small" />
        </IconButton>

        <IconButton
          sx={{
            color: '#94a3b8',
            borderRadius: '50%',
            p: 1,
            '&:hover': { color: 'white', bgcolor: DS.surface },
          }}
        >
          <HelpIcon fontSize="small" />
        </IconButton>

        <IconButton
          onClick={handleUserMenuOpen}
          sx={{ p: 0.5, ml: 0.5 }}
        >
          {user?.avatar ? (
            <Avatar
              src={user.avatar}
              sx={{
                width: 32,
                height: 32,
                border: `2px solid ${DS.primary}33`,
              }}
            />
          ) : (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: DS.surfaceHigh,
                color: DS.primary,
                fontSize: '13px',
                fontWeight: 700,
                border: `2px solid ${DS.primary}33`,
                fontFamily: '"Inter", sans-serif',
              }}
            >
              {(user?.first_name?.[0] ?? user?.email?.[0] ?? 'U').toUpperCase()}
            </Avatar>
          )}
        </IconButton>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{
          mt: 1,
          '& .MuiPaper-root': {
            bgcolor: DS.surfaceHigh,
            border: `1px solid ${DS.outlineVariant}33`,
            borderRadius: '12px',
            minWidth: 160,
          },
        }}
      >
        <MenuItem
          onClick={handleLogout}
          sx={{
            color: DS.onSurface,
            fontFamily: '"Inter", sans-serif',
            fontSize: '14px',
            gap: 1.5,
            '&:hover': { bgcolor: DS.surface },
          }}
        >
          <LogoutIcon fontSize="small" sx={{ color: DS.outline }} />
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Header;

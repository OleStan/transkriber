import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import {
  Home as HomeIcon,
  LibraryBooks as LibraryIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { DS } from '../../theme';

const NAV_ITEMS = [
  { icon: HomeIcon, label: 'Home', path: '/home' },
  { icon: LibraryIcon, label: 'Library', path: '/transcriptions' },
  { icon: SearchIcon, label: 'Search', path: '/transcriptions?search=true' },
  { icon: SettingsIcon, label: 'Settings', path: '/settings' },
];

const MobileBottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    const basePath = path.split('?')[0];
    if (basePath === '/home') return location.pathname === '/' || location.pathname === '/home';
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };

  return (
    <Box
      sx={{
        display: { xs: 'flex', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        bgcolor: 'rgba(11, 19, 38, 0.85)',
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${DS.surfaceBright}33`,
        boxShadow: '0 -10px 30px rgba(0,0,0,0.5)',
        borderRadius: '16px 16px 0 0',
        zIndex: 1200,
        px: 1,
        py: 1,
        gap: 0,
      }}
    >
      {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
        const active = isActive(path);
        return (
          <Box
            key={path}
            onClick={() => navigate(path)}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              py: 1,
              px: 0.5,
              borderRadius: '12px',
              cursor: 'pointer',
              bgcolor: active ? `${DS.primary}1a` : 'transparent',
              transition: 'background-color 0.15s',
              gap: 0.5,
              '&:hover': { bgcolor: active ? `${DS.primary}1a` : `${DS.surface}80` },
            }}
          >
            <Icon
              sx={{
                fontSize: 22,
                color: active ? DS.primary : '#64748b',
                transition: 'color 0.15s',
              }}
            />
            <Typography
              sx={{
                fontSize: '9px',
                fontWeight: 700,
                fontFamily: '"Inter", sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: active ? DS.primary : '#64748b',
                transition: 'color 0.15s',
                lineHeight: 1,
              }}
            >
              {label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
};

export default MobileBottomNav;

import GlobalStyles from '@mui/joy/GlobalStyles';
import Sheet from '@mui/joy/Sheet';
import IconButton from '@mui/joy/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/joy/Button';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import Menu from '@mui/joy/Menu';
import MenuItem from '@mui/joy/MenuItem';
import { useState } from 'react';

import { toggleSidebar } from './utils';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleCloseMenu();
    await logout();
    navigate('/login');
  };

  return (
    <Sheet
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'fixed',
        top: 0,
        width: '100vw',
        height: 'var(--Header-height)',
        zIndex: 9995,
        p: 2,
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'background.level1',
        boxShadow: 'sm',
      }}
    >
      <GlobalStyles
        styles={(theme) => ({
          ':root': {
            '--Header-height': '52px',
            [theme.breakpoints.up('md')]: {
              '--Header-height': '0px',
            },
          },
        })}
      />
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          onClick={() => toggleSidebar()} 
          variant='outlined' 
          color='neutral' 
          size='sm'
          sx={{ display: { xs: 'flex', md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>
        <Typography 
          level="title-lg" 
          component="h1" 
          sx={{ display: { xs: 'none', md: 'block' }, ml: 2 }}
        >
          Transcriber App
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {isAuthenticated ? (
          <>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={handleOpenMenu}
              startDecorator={
                user?.avatar ? 
                <Avatar size="sm" src={user.avatar} /> : 
                <AccountCircleIcon />
              }
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              {user?.first_name || 'Account'}
            </Button>
            <IconButton 
              variant="plain" 
              color="neutral" 
              onClick={handleOpenMenu}
              sx={{ display: { xs: 'flex', sm: 'none' } }}
            >
              {user?.avatar ? (
                <Avatar size="sm" src={user.avatar} />
              ) : (
                <Avatar size="sm">{user?.first_name?.[0] || 'U'}</Avatar>
              )}
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleCloseMenu}
              placement="bottom-end"
            >
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button 
              component={RouterLink} 
              to="/login"
              variant="outlined"
              color="neutral"
              size="sm"
            >
              Sign In
            </Button>
            <Button 
              component={RouterLink} 
              to="/signup"
              variant="solid"
              color="primary"
              size="sm"
              sx={{ display: { xs: 'none', sm: 'flex' } }}
            >
              Sign Up
            </Button>
          </>
        )}
      </Box>
    </Sheet>
  );
};

export default Header;

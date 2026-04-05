import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import { CssVarsProvider as JoyCssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { DS } from './theme';

const materialTheme = materialExtendTheme({
  colorSchemes: {
    dark: {
      palette: {
        background: {
          default: DS.bg,
          paper: DS.surface,
        },
        primary: {
          main: DS.primary,
          contrastText: DS.onPrimary,
        },
        error: {
          main: DS.error,
        },
        text: {
          primary: DS.onSurface,
          secondary: DS.onSurfaceVariant,
        },
      },
    },
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans", sans-serif',
    h1: { fontFamily: '"Manrope", sans-serif' },
    h2: { fontFamily: '"Manrope", sans-serif' },
    h3: { fontFamily: '"Manrope", sans-serif' },
    h4: { fontFamily: '"Manrope", sans-serif' },
    h5: { fontFamily: '"Manrope", sans-serif' },
    h6: { fontFamily: '"Manrope", sans-serif' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: DS.bg,
          color: DS.onSurface,
          fontFamily: '"Inter", "Noto Sans", sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontFamily: '"Inter", sans-serif',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: DS.surfaceHigh,
          border: `1px solid ${DS.outlineVariant}33`,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: DS.onSurface,
          '&:hover': {
            backgroundColor: DS.surface,
          },
        },
      },
    },
  },
});

import Box from '@mui/joy/Box';

import Header from './components/layout/Header';
import MobileBottomNav from './components/layout/MobileBottomNav';

import { Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const App = () => {
  const { isAuthenticated } = useAuth();
  return (
    <MaterialCssVarsProvider theme={{ [MATERIAL_THEME_ID]: materialTheme }} defaultMode="dark">
      <JoyCssVarsProvider disableTransitionOnChange defaultMode="dark">
        <CssBaseline />
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Header />
          <Box
            bgcolor={DS.bg}
            minHeight='calc(100vh - 64px)'
            color={DS.onSurface}
            fontFamily='"Inter", "Noto Sans", sans-serif'
            component='main'
            className='MainContent'
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'auto',
            }}
          >
            <Outlet />
          </Box>
          {isAuthenticated && <MobileBottomNav />}
        </Box>
      </JoyCssVarsProvider>
    </MaterialCssVarsProvider>
  );
};

export default App;

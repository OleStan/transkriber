import { createTheme } from '@mui/material/styles';

export const DS = {
  bg: '#0b1326',
  surfaceLowest: '#060e20',
  surfaceLow: '#131b2e',
  surface: '#171f33',
  surfaceHigh: '#222a3d',
  surfaceHighest: '#2d3449',
  surfaceBright: '#31394d',
  primary: '#d0bcff',
  primaryContainer: '#a078ff',
  onPrimary: '#3c0091',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#cbc3d7',
  tertiary: '#ffb869',
  tertiaryContainer: 'rgba(202, 128, 30, 0.1)',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  outlineVariant: '#494454',
  outline: '#958ea0',
  secondaryContainer: '#513e7f',
  onSecondaryContainer: '#c3adf7',
  primaryGradient: 'linear-gradient(135deg, #d0bcff 0%, #a078ff 100%)',
} as const;

export const theme = createTheme({
  palette: {
    mode: 'dark',
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

import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import type { ReactNode } from 'react'

const theme = createTheme({
  palette: {
    primary: {
      main: '#F54264',
      light: '#F96741',
      dark: '#E03252',
      contrastText: '#fff',
    },
    secondary: {
      main: '#FC8C1E',
      light: '#FD9E3D',
      dark: '#E67A17',
      contrastText: '#fff',
    },
    background: {
      default: '#F8FAFC',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#0F172A',
      secondary: '#475569',
    },
    divider: '#E2E8F0',
    success: {
      main: '#16A34A',
      light: '#22C55E',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
    },
    info: {
      main: '#0EA5E9',
      light: '#38BDF8',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Helvetica Neue", Arial, sans-serif',
    h4: {
      fontWeight: 800,
      fontSize: '2.25rem',
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.015em',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: '-0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
      fontSize: '0.9375rem',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#F8FAFC',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#CBD5E1',
            borderRadius: '10px',
            '&:hover': {
              backgroundColor: '#94A3B8',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 28px',
          boxShadow: 'none',
          borderRadius: '8px',
        },
        contained: {
          boxShadow: '0 4px 12px rgba(245, 66, 100, 0.25)',
          '&:hover': {
            boxShadow: '0 8px 20px rgba(245, 66, 100, 0.35)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease',
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#E2E8F0',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: '#DBEAFE',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          color: '#0F172A',
          boxShadow: 'none',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          boxShadow: '1px 0 8px rgba(15, 23, 42, 0.06)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(15, 23, 42, 0.06)',
        },
        elevation2: {
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
        },
        elevation3: {
          boxShadow: '0 4px 16px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused fieldset': {
              borderWidth: '1px',
              borderColor: '#F54264',
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '6px 16px',
          padding: '14px 20px',
          '&.Mui-selected': {
            backgroundColor: '#FEE9F0',
            color: '#E03252',
            fontWeight: 700,
            borderLeft: '3px solid #F54264',
            paddingLeft: '17px',
            '&:hover': {
              backgroundColor: '#FDD5E3',
            },
            '& .MuiListItemIcon-root': {
              color: '#E03252',
            },
          },
          '&:hover': {
            backgroundColor: '#F1F5F9',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 600,
        },
      },
    },
  },
})

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SnackbarProvider maxSnack={3} autoHideDuration={2500}>
        {children}
      </SnackbarProvider>
    </ThemeProvider>
  )
}

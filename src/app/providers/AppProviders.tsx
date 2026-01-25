import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'
import { SnackbarProvider } from 'notistack'
import type { ReactNode } from 'react'

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
      contrastText: '#fff',
    },
    secondary: {
      main: '#475569',
      light: '#64748B',
      dark: '#334155',
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
      dark: '#15803D',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
    },
    info: {
      main: '#2563EB',
      light: '#3B82F6',
      dark: '#1D4ED8',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
    h1: {
      fontSize: '1.75rem',
      fontWeight: 700,
      lineHeight: 1.4,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 700,
      lineHeight: 1.5,
      letterSpacing: '-0.015em',
    },
    h3: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h4: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h5: {
      fontSize: '0.9375rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '0.9375rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.9375rem',
      fontWeight: 500,
      lineHeight: 1.5,
      textTransform: 'none',
      letterSpacing: '0',
    },
  },
  shape: {
    borderRadius: 12,
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
          fontWeight: 500,
          padding: '10px 24px',
          boxShadow: 'none',
          borderRadius: '12px',
          minHeight: '44px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease',
        },
        outlined: {
          borderWidth: '1px',
          borderColor: '#E2E8F0',
          backgroundColor: '#FFFFFF',
          '&:hover': {
            borderWidth: '1px',
            backgroundColor: '#F8FAFC',
            borderColor: '#CBD5E1',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: '#F1F5F9',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
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
          boxShadow: '0 0 24px rgba(15, 23, 42, 0.08)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          backgroundImage: 'none',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
        },
        elevation0: {
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
        },
        elevation2: {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
        },
        elevation3: {
          boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            minHeight: '44px',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#CBD5E1',
            },
            '&.Mui-focused': {
              boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.15)',
              '& fieldset': {
                borderWidth: '1px',
                borderColor: '#2563EB',
              },
            },
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          margin: '4px 12px',
          padding: '12px 16px',
          transition: 'all 0.2s ease',
          '&.Mui-selected': {
            backgroundColor: '#EFF6FF',
            color: '#1D4ED8',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#DBEAFE',
            },
            '& .MuiListItemIcon-root': {
              color: '#2563EB',
            },
          },
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '999px',
          fontWeight: 500,
          fontSize: '0.875rem',
        },
        colorSuccess: {
          backgroundColor: '#DCFCE7',
          color: '#15803D',
        },
        colorWarning: {
          backgroundColor: '#FEF3C7',
          color: '#D97706',
        },
        colorError: {
          backgroundColor: '#FEE2E2',
          color: '#B91C1C',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F1F5F9',
          '& .MuiTableCell-root': {
            fontWeight: 600,
            fontSize: '0.875rem',
            color: '#475569',
            borderBottom: '1px solid #E2E8F0',
          },
        },
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          '& .MuiTableRow-root': {
            '&:hover': {
              backgroundColor: '#F8FAFC',
            },
          },
          '& .MuiTableCell-root': {
            borderBottom: '1px solid #E2E8F0',
            fontSize: '0.9375rem',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
          borderRadius: '16px',
          border: '1px solid #E2E8F0',
          padding: '20px',
          '&:hover': {
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.12)',
          },
          transition: 'box-shadow 0.3s ease',
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

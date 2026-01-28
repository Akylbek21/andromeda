import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import {
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material'
import {
  People as PeopleIcon,
  Logout as LogoutIcon,
  EventNote as EventNoteIcon,
  ListAlt as ListAltIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material'
import logo from '../../assets/yadro.png'
import { useAuthStore } from '../../entities/auth'

const DRAWER_WIDTH = 280

export function AppLayout() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const user = useAuthStore((state) => state.user)

  const handleDrawerToggle = () => setMobileOpen((v) => !v)

  const menuItems: Array<{
    label: string
    icon: React.ReactNode
    path: string
    sectionKey?: keyof NonNullable<typeof user>['sections']
  }> = [
    { label: 'Сотрудники', icon: <PeopleIcon />, path: '/employees', sectionKey: 'employees' },
    { label: 'Мои сессии', icon: <EventNoteIcon />, path: '/my-sessions', sectionKey: 'mySessions' },
    { label: 'Все сессии', icon: <ListAltIcon />, path: '/sessions', sectionKey: 'admin' },
  ]

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.sectionKey) return true
    return Boolean(user?.sections?.[item.sectionKey])
  })

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', pt: 3 }}>
      {/* Логотип */}
      <Box sx={{ px: 3, pb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="img"
          src={logo}
          alt="Andromeda"
          onClick={() => navigate('/employees')}
          sx={{
            width: '100%',
            maxWidth: 220,
            height: 'auto',
            objectFit: 'contain',
            cursor: 'pointer',
            transition: 'transform 0.3s, opacity 0.2s',
            '&:hover': {
              transform: 'scale(1.08)',
              opacity: 0.9,
            },
          }}
        />
      </Box>

      {/* Диалог настроек (данные о пользователе) */}
      <Dialog open={settingsOpen} onClose={() => setSettingsOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Мои данные</DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 2 }}>
            Просмотр информации вашего профиля.
          </DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ color: 'text.secondary' }}>ID</Box>
              <Box>{user?.userId ?? '—'}</Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ color: 'text.secondary' }}>Фамилия</Box>
              <Box>{user?.lastName ?? '—'}</Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ color: 'text.secondary' }}>Имя</Box>
              <Box>{user?.firstName ?? '—'}</Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ color: 'text.secondary' }}>Email</Box>
              <Box>{user?.email ?? '—'}</Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ color: 'text.secondary' }}>Телефон</Box>
              <Box>{user?.phoneNumber ?? '—'}</Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ color: 'text.secondary' }}>Роли</Box>
              <Box>{user?.roles?.join(', ') ?? '—'}</Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box sx={{ color: 'text.secondary' }}>Доступ</Box>
              <Box>
                {user?.sections
                  ? Object.entries(user.sections)
                      .filter(([, val]) => val)
                      .map(([key]) => key)
                      .join(', ') || '—'
                  : '—'}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Меню */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', px: 1 }}>
        <List>
          {visibleMenuItems.map((item) => (
            <ListItem key={item.label} disablePadding>
              <ListItemButton
                onClick={() => {
                  navigate(item.path)
                  if (isMobile) setMobileOpen(false)
                }}
                selected={location.pathname === item.path}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Настройки и выход */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider', display: 'flex', gap: 1 }}>
        <IconButton
          onClick={() => setSettingsOpen(true)}
          sx={{
            borderRadius: '12px',
            color: 'text.primary',
            backgroundColor: 'rgba(102, 126, 234, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(102, 126, 234, 0.16)',
            },
          }}
          aria-label="Мои данные"
        >
          <SettingsIcon />
        </IconButton>

        <ListItemButton
          onClick={() => {
            localStorage.clear()
            navigate('/login')
            if (isMobile) setMobileOpen(false)
          }}
          sx={{
            borderRadius: '12px',
            color: 'error.main',
            flex: 1,
            '&:hover': {
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
            },
          }}
        >
          <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText
            primary="Выйти"
            primaryTypographyProps={{
              fontSize: '0.9375rem',
              fontWeight: 600,
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'background.default',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(900px 500px at 10% 10%, rgba(37,99,235,.18), transparent 60%),
             radial-gradient(900px 500px at 90% 15%, rgba(34,211,238,.14), transparent 60%),
             radial-gradient(900px 500px at 60% 90%, rgba(167,139,250,.14), transparent 60%)`,
          pointerEvents: 'none',
        },
      }}
    >
      <CssBaseline />

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: 'block', md: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: 'none', md: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH },
            }}
          >
            {drawer}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  )
}

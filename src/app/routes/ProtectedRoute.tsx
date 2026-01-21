import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { getAccessToken } from '../../shared/api/tokens'
import { useAuthStore } from '../../entities/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, loadMe } = useAuthStore()
  const token = getAccessToken()

  useEffect(() => {
    if (token && !user && !loading) {
      loadMe()
    }
  }, [token, user, loading, loadMe])

  // Нет токена - редирект на логин
  if (!token) {
    return <Navigate to="/login" replace />
  }

  // Токен есть, но данные пользователя загружаются
  if (loading || !user) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress size={60} />
      </Box>
    )
  }

  // Пользователь загружен - показываем контент
  return <>{children}</>
}

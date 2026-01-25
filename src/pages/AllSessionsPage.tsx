import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  TableContainer,
} from '@mui/material'
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { deleteUserSession, deleteUserSessions, getUserSessions } from '../entities/session'
import type { Session } from '../entities/session'
import { formatDate } from './employees/utils'

export function AllSessionsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [userId, setUserId] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingSid, setDeletingSid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    if (!userId.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await getUserSessions(userId.trim())
      setSessions(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить сессии'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // авто-запрос не делаем, только по кнопке
  }, [])

  const handleDelete = async (sid: string) => {
    if (!userId.trim()) return
    setDeletingSid(sid)
    setError(null)
    try {
      await deleteUserSession(userId.trim(), sid)
      enqueueSnackbar('Сессия удалена', { variant: 'success' })
      await fetchSessions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить сессию'
      setError(message)
    } finally {
      setDeletingSid(null)
    }
  }

  const handleDeleteAll = async () => {
    if (!userId.trim()) return
    setLoading(true)
    setError(null)
    try {
      await deleteUserSessions(userId.trim())
      enqueueSnackbar('Все сессии пользователя удалены', { variant: 'success' })
      setSessions([])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить сессии'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography
          variant="h1"
          sx={{
            fontWeight: 700,
            mb: 2,
            color: '#0F172A',
            fontSize: '2rem',
          }}
        >
          Все сессии пользователя
        </Typography>
      </Box>

      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: 2,
          border: '1px solid #E2E8F0',
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="userId"
            variant="outlined"
            size="medium"
            label="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 280, maxWidth: 480 }}
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={() => void fetchSessions()}
            disabled={!userId.trim() || loading}
            size="large"
            sx={{
              whiteSpace: 'nowrap',
              px: 3.5,
              py: 1.5,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #F54264 0%, #F96741 45%, #FC8C1E 100%)',
              boxShadow: '0 4px 12px rgba(245, 66, 100, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E03252 0%, #E85830 45%, #E67A17 100%)',
                boxShadow: '0 8px 20px rgba(245, 66, 100, 0.4)',
              },
            }}
          >
            Загрузить
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={() => void handleDeleteAll()}
            disabled={!userId.trim() || loading || sessions.length === 0}
            size="large"
            sx={{
              whiteSpace: 'nowrap',
              px: 3.5,
              py: 1.5,
              borderRadius: '8px',
              borderWidth: '1px',
              borderColor: '#E2E8F0',
              '&:hover': {
                borderWidth: '1px',
              },
            }}
          >
            Удалить все
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: '8px',
              border: '2px solid',
              borderColor: 'error.light',
            }}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative', minHeight: 400 }}>
          {loading && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(4px)',
                zIndex: 1,
              }}
            >
              <CircularProgress size={48} thickness={4} />
            </Box>
          )}

          <TableContainer>
            <Table>
            <TableHead>
              <TableRow>
                <TableCell>Создана</TableCell>
                <TableCell>Последний визит</TableCell>
                <TableCell>IP</TableCell>
                <TableCell>User-Agent</TableCell>
                <TableCell align="center">Текущая</TableCell>
                <TableCell align="right">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.sid} hover>
                  <TableCell>{formatDate(session.createdAt)}</TableCell>
                  <TableCell>{formatDate(session.lastSeenAt)}</TableCell>
                  <TableCell>{session.ip || '-'}</TableCell>
                  <TableCell sx={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <Tooltip title={session.userAgent}>
                      <span>{session.userAgent || '-'}</span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">
                    {session.isCurrent ? <Chip label="Текущая" color="success" size="small" /> : <Chip label="Другая" size="small" />}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Удалить сессию">
                      <span>
                        <IconButton
                          color="error"
                          size="small"
                          disabled={loading || deletingSid === session.sid}
                          onClick={() => void handleDelete(session.sid)}
                        >
                          {deletingSid === session.sid ? <CircularProgress size={18} /> : <DeleteIcon />}
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {sessions.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Нет сессий
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>          </TableContainer>        </Box>
      </Paper>
    </Box>
  )
}

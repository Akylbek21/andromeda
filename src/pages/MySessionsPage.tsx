import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Stack,
  Button,
  CircularProgress,
} from '@mui/material'
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material'
import { useSnackbar } from 'notistack'
import { deleteMySession, deleteOtherSessions, getMySessions } from '../entities/session'
import type { Session } from '../entities/session'
import { formatDate } from './employees/utils'

export function MySessionsPage() {
  const { enqueueSnackbar } = useSnackbar()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingSid, setDeletingSid] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMySessions()
      setSessions(data)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось загрузить сессии'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSessions()
  }, [])

  const handleDelete = async (sid: string) => {
    setDeletingSid(sid)
    setError(null)
    try {
      await deleteMySession(sid)
      enqueueSnackbar('Сессия удалена', { variant: 'success' })
      await fetchSessions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить сессию'
      setError(message)
    } finally {
      setDeletingSid(null)
    }
  }

  const handleDeleteOthers = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteOtherSessions()
      enqueueSnackbar('Все сессии, кроме текущей, удалены', { variant: 'success' })
      await fetchSessions()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Не удалось удалить сессии'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid #E2E8F0' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} justifyContent="space-between" spacing={2} mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Мои сессии
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Управляйте активными сессиями и завершайте лишние.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => void fetchSessions()}
              disabled={loading}
            >
              Обновить
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => void handleDeleteOthers()}
              disabled={loading || sessions.length === 0}
            >
              Завершить все кроме текущей
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ position: 'relative' }}>
          {loading && (
            <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(255,255,255,0.6)', zIndex: 1 }}>
              <CircularProgress />
            </Box>
          )}

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SID</TableCell>
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
                <TableRow key={session.sid} hover selected={session.isCurrent}>
                  <TableCell sx={{ maxWidth: 180, wordBreak: 'break-all' }}>{session.sid}</TableCell>
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
                    <Tooltip title={session.isCurrent ? 'Нельзя удалить текущую сессию' : 'Удалить сессию'}>
                      <span>
                        <IconButton
                          color="error"
                          size="small"
                          disabled={session.isCurrent || deletingSid === session.sid || loading}
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
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                    Нет активных сессий
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>
    </Box>
  )
}

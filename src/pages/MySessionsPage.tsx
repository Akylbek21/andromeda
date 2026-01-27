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
  Button,
  CircularProgress,
  TableContainer,
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
          Мои сессии
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
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            size="large"
            onClick={() => void fetchSessions()}
            disabled={loading}
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
            Обновить
          </Button>
          <Button
            variant="contained"
            onClick={() => void handleDeleteOthers()}
            disabled={loading || sessions.length === 0}
            size="large"
          >
            Завершить все кроме текущей
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
                <TableRow key={session.sid} hover selected={session.isCurrent}>
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
          </Table>          </TableContainer>        </Box>
      </Paper>
    </Box>
  )
}

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
} from '@mui/material'

interface FilterDialogProps {
  open: boolean
  initialRole: string
  initialStatus: string
  onClose: () => void
  onApply: (role: string, status: string) => void
}

export function FilterDialog({
  open,
  initialRole,
  initialStatus,
  onClose,
  onApply,
}: FilterDialogProps) {
  const [role, setRole] = useState(initialRole)
  const [status, setStatus] = useState(initialStatus)

  useEffect(() => {
    setRole(initialRole)
    setStatus(initialStatus)
  }, [initialRole, initialStatus])

  const handleApply = () => {
    onApply(role, status)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Фильтр</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          select
          label="Роль"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          margin="normal"
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="EXPERT">Expert</MenuItem>
          <MenuItem value="MENTOR">Mentor</MenuItem>
          <MenuItem value="TEACHER">Teacher</MenuItem>
          <MenuItem value="ACCOUNTANT">Accountant</MenuItem>
          <MenuItem value="HEAD">Head</MenuItem>
          <MenuItem value="DIRECTOR">Director</MenuItem>
          <MenuItem value="ADMIN">Admin</MenuItem>
        </TextField>
        <TextField
          fullWidth
          select
          label="Статус"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          margin="normal"
        >
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="ACTIVE">Активный</MenuItem>
          <MenuItem value="INACTIVE">Неактивный</MenuItem>
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отменить</Button>
        <Button onClick={handleApply} variant="contained">
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

import { useSnackbar } from 'notistack'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
import type { ExistingUserInfo } from '../../entities/employee'

interface ExistingUserDialogProps {
  open: boolean
  existingUser: ExistingUserInfo | null
  errorMessage: string
  isSubmitting: boolean
  onConfirm: () => void
  onTakePhone: () => void
  onClose: () => void
}

export function ExistingUserDialog({
  open,
  existingUser,
  errorMessage,
  isSubmitting,
  onConfirm,
  onTakePhone,
  onClose,
}: ExistingUserDialogProps) {
  const { enqueueSnackbar } = useSnackbar()

  const handleConfirm = async () => {
    try {
      onConfirm()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Ошибка при подтверждении'
      enqueueSnackbar(msg, { variant: 'error' })
    }
  }

  const handleTakePhone = async () => {
    try {
      onTakePhone()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Ошибка при отборе номера'
      enqueueSnackbar(msg, { variant: 'error' })
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Пользователь с таким номером уже существует, вот его данные:</DialogTitle>
      <DialogContent>
        {existingUser ? (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography>
              <strong>ID:</strong> {existingUser.userId}
            </Typography>
            <Typography>
              <strong>ФИО:</strong> {existingUser.lastName} {existingUser.firstName}
            </Typography>
            <Typography>
              <strong>WhatsApp номер:</strong> {existingUser.phoneNumber}
            </Typography>
            <Typography>
              <strong>ИИН:</strong> {existingUser.iin}
            </Typography>
          </Box>
        ) : (
          <Typography color="error" sx={{ mt: 2 }}>
            {errorMessage}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm} variant="contained" disabled={isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : 'Да, это он'}
        </Button>
        <Button onClick={handleTakePhone} color="error" disabled={isSubmitting}>
          Нет, это не он, отобрать номер
        </Button>
      </DialogActions>
    </Dialog>
  )
}

import { useState } from 'react'
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
import {
  confirmExistingUser,
  takePhoneAndCreate,
  type CreateEmployeeRequest,
  type ExistingUserInfo,
} from '../../entities/employee'

interface ConfirmExistingDialogProps {
  open: boolean
  existingUser: ExistingUserInfo
  formData: CreateEmployeeRequest
  onClose: () => void
  onSuccess: () => void
}

export function ConfirmExistingDialog({
  open,
  existingUser,
  formData,
  onClose,
  onSuccess,
}: ConfirmExistingDialogProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await confirmExistingUser(existingUser.userId, formData)
      enqueueSnackbar('Сотрудник подтвержден', { variant: 'success' })
      onSuccess()
    } catch (error) {
      enqueueSnackbar('Ошибка при подтверждении', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleTakePhone = async () => {
    setLoading(true)
    try {
      await takePhoneAndCreate(existingUser.userId, formData)
      enqueueSnackbar('Номер отобран, сотрудник создан', { variant: 'success' })
      onSuccess()
    } catch (error) {
      enqueueSnackbar('Ошибка при отборе номера', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Пользователь с таким номером уже существует</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Вот его данные:
        </Typography>
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography>
            <strong>ID:</strong> {existingUser.userId}
          </Typography>
          <Typography>
            <strong>Фамилия и имя:</strong> {existingUser.lastName} {existingUser.firstName}
          </Typography>
          <Typography>
            <strong>WhatsApp номер:</strong> {existingUser.phoneNumber}
          </Typography>
          <Typography>
            <strong>ИИН:</strong> {existingUser.iin}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleConfirm} variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Да, это он'}
        </Button>
        <Button onClick={handleTakePhone} color="error" disabled={loading}>
          Нет, это не он, отобрать номер
        </Button>
      </DialogActions>
    </Dialog>
  )
}

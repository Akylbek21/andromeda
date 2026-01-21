import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { useSnackbar } from 'notistack'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material'
import { updateEmployee, type Employee, type UpdateEmployeeRequest } from '../../entities/employee'
import { updateEmployeeSchema } from './schemas'

interface EditEmployeeDialogProps {
  open: boolean
  employee: Employee | null
  onClose: () => void
  onSuccess: () => void
}

export function EditEmployeeDialog({ open, employee, onClose, onSuccess }: EditEmployeeDialogProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(updateEmployeeSchema),
    defaultValues: {
      iin: employee?.iin || '',
      email: employee?.email || '',
      role: employee?.role || 'expert',
    },
  })

  const onSubmit = async (data: any) => {
    if (!employee) return
    setIsSubmitting(true)
    try {
      await updateEmployee(employee.userId, data as UpdateEmployeeRequest)
      enqueueSnackbar('Сотрудник обновлен', { variant: 'success' })
      reset()
      onClose()
      onSuccess()
    } catch (error) {
      enqueueSnackbar('Ошибка при обновлении', { variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Редактировать сотрудника</DialogTitle>
      <DialogContent>
        <Controller
          name="iin"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="ИИН"
              error={!!errors.iin}
              helperText={errors.iin?.message}
              margin="normal"
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              label="Email"
              type="email"
              error={!!errors.email}
              helperText={errors.email?.message}
              margin="normal"
            />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              select
              label="Роль"
              error={!!errors.role}
              helperText={errors.role?.message}
              margin="normal"
            >
              <MenuItem value="expert">Expert</MenuItem>
              <MenuItem value="mentor">Mentor</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="accountant">Accountant</MenuItem>
            </TextField>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Отменить</Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

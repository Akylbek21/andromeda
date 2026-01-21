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
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material'
import { createEmployee, type CreateEmployeeRequest } from '../../entities/employee'
import { createEmployeeSchema } from './schemas'
import { ConfirmExistingDialog } from './ConfirmExistingDialog'

interface CreateEmployeeDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateEmployeeDialog({ open, onClose, onSuccess }: CreateEmployeeDialogProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmData, setConfirmData] = useState<any>(null)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    resolver: yupResolver(createEmployeeSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      iin: '',
      notCitizen: false,
      role: 'expert' as const,
    },
  })

  const notCitizen = watch('notCitizen')

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await createEmployee(data as CreateEmployeeRequest)
      enqueueSnackbar('Сотрудник успешно добавлен', { variant: 'success' })
      reset()
      onClose()
      onSuccess()
    } catch (error: any) {
      if (error?.response?.status === 409) {
        // User exists
        setConfirmData({
          formData: data,
          existingUser: error.response.data,
        })
      } else {
        enqueueSnackbar('Ошибка при добавлении сотрудника', { variant: 'error' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Добавить сотрудника</DialogTitle>
        <DialogContent>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Фамилия"
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                margin="normal"
                required
              />
            )}
          />
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Имя"
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                margin="normal"
                required
              />
            )}
          />
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="WhatsApp номер"
                type="tel"
                error={!!errors.phoneNumber}
                helperText={errors.phoneNumber?.message}
                margin="normal"
                required
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
                label="Gmail"
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
                margin="normal"
                required
              />
            )}
          />
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
                required={!notCitizen}
                disabled={notCitizen}
              />
            )}
          />
          <Controller
            name="notCitizen"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Не гражданин РК"
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
                required
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
          <Button onClick={handleClose}>Отменить</Button>
          <Button
            onClick={handleSubmit(onSubmit)}
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>

      {confirmData && (
        <ConfirmExistingDialog
          open={!!confirmData}
          existingUser={confirmData.existingUser}
          formData={confirmData.formData}
          onClose={() => setConfirmData(null)}
          onSuccess={() => {
            setConfirmData(null)
            handleClose()
            onSuccess()
          }}
        />
      )}
    </>
  )
}

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
} from '@mui/material'
import type { CreateEmployeeFormData } from './schema'
import { createEmployeeSchema } from './schema'

interface CreateEmployeeDialogProps {
  open: boolean
  onClose: () => void
}

export function CreateEmployeeDialog({ open, onClose }: CreateEmployeeDialogProps) {
  const { enqueueSnackbar } = useSnackbar()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(createEmployeeSchema) as any,
    defaultValues: {
      firstName: '',
      lastName: '',
      email: undefined,
      phoneNumber: undefined,
      preferredLanguage: undefined,
    },
  })

  const onSubmit = (data: CreateEmployeeFormData | any) => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      console.log('Create employee:', data)

      enqueueSnackbar('Сотрудник успешно добавлен', { variant: 'success' })
      reset()
      onClose()
    } catch (error) {
      enqueueSnackbar('Ошибка при добавлении сотрудника', { variant: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Добавить сотрудника</DialogTitle>
      <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Имя"
              fullWidth
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          )}
        />

        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Фамилия"
              fullWidth
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          )}
        />

        <Controller
          name="phoneNumber"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Телефон"
              fullWidth
              error={!!errors.phoneNumber}
              helperText={errors.phoneNumber?.message}
            />
          )}
        />

        <Controller
          name="preferredLanguage"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Язык"
              select
              fullWidth
              error={!!errors.preferredLanguage}
              helperText={errors.preferredLanguage?.message}
            >
              <MenuItem value="ru">Русский</MenuItem>
              <MenuItem value="kz">Казахский</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </TextField>
          )}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isSubmitting}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Добавление...' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

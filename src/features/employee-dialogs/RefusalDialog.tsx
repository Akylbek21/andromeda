import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

interface RefusalDialogProps {
  open: boolean
  onClose: () => void
}

export function RefusalDialog({ open, onClose }: RefusalDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Сотрудник уже существует</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Вам нужно найти этого сотрудника в разделе Сотрудники и активировать. 
          А так же проверить актуальность его данных: ИИН, почта, должность/роль.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  )
}

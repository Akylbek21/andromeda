import { useEffect, useMemo, useState } from 'react'
import { Box, TextField, Typography, Alert, CircularProgress, Button } from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import type { GridColDef, GridPaginationModel } from '@mui/x-data-grid'
import { DataGrid } from '@mui/x-data-grid'
import { useEmployeeStore } from '../../entities/employee'
import { useDebounce } from '../../shared/hooks'
import { CreateEmployeeDialog } from '../../features/employee-create'
import { formatPhoneNumber, formatDate } from './utils'

export function EmployeesPage() {
  const { items, total, loading, error, page, size, q, setPage, setSize, setQuery, fetchEmployees } =
    useEmployeeStore()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const debouncedQuery = useDebounce(q, 400)

  // Fetch on first mount and when pagination/debouncedQuery changes
  useEffect(() => {
    fetchEmployees()
  }, [page, size, debouncedQuery, fetchEmployees])

  const handleSearchChange = (value: string) => {
    setQuery(value)
  }

  const handlePaginationChange = (model: GridPaginationModel) => {
    if (model.page !== page) {
      setPage(model.page)
    }
    if (model.pageSize !== size) {
      setSize(model.pageSize)
    }
  }

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: 'fullName',
        headerName: 'ФИО',
        width: 200,
        valueGetter: (_, row) => `${row.firstName} ${row.lastName}`.trim(),
      },
      {
        field: 'iin',
        headerName: 'ИИН',
        width: 150,
      },
      {
        field: 'phoneNumber',
        headerName: 'Телефон',
        width: 150,
        valueGetter: (_, row) => formatPhoneNumber(row.phoneNumber),
      },
      {
        field: 'email',
        headerName: 'Email',
        width: 200,
      },
      {
        field: 'preferredLanguage',
        headerName: 'Язык',
        width: 120,
      },
      {
        field: 'createdAt',
        headerName: 'Создано',
        width: 180,
        valueGetter: (_, row) => formatDate(row.createdAt),
      },
    ],
    []
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">Сотрудники</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Добавить сотрудника
        </Button>
      </Box>

      <TextField
        placeholder="Поиск..."
        variant="outlined"
        size="small"
        value={q}
        onChange={(e) => handleSearchChange(e.target.value)}
        sx={{ maxWidth: 300 }}
      />

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ position: 'relative', height: 600 }}>
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
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 1,
            }}
          >
            <CircularProgress />
          </Box>
        )}

        <DataGrid
          rows={items}
          rowCount={total}
          columns={columns}
          paginationModel={{ page, pageSize: size }}
          onPaginationModelChange={handlePaginationChange}
          pageSizeOptions={[10, 25, 50, 100]}
          loading={loading}
          paginationMode="server"
          disableRowSelectionOnClick
          sx={{
            height: '100%',
            '& .MuiDataGrid-root': {
              border: 'none',
            },
          }}
        />
      </Box>

      <CreateEmployeeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
      />
    </Box>
  )
}

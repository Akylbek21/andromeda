import { useState, useEffect } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Menu,
  MenuItem,
  TableContainer,
  TablePagination,
} from '@mui/material'
import {
  Add as AddIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material'
import { useEmployeeStore } from '../../entities/employee'
import { useAuthStore } from '../../entities/auth'
import { useDebounce } from '../../shared/hooks'
import { formatPhoneNumber } from './utils'
import type { Employee } from '../../entities/employee'
import {
  CreateEmployeeDialog,
  EditEmployeeDialog,
  EditPhoneDialog,
  FilterDialog,
} from '../../features/employee-dialogs'
import {
  toggleEmployeeStatus,
  makeHead,
} from '../../entities/employee'

export default function EmployeesPage() {
  const user = useAuthStore((state) => state.user)
  const isDirector = user?.roles?.includes('director')

  const {
    items,
    loading,
    error,
    roleFilter,
    statusFilter,
    total,
    page,
    size,
    setQuery,
    setRoleFilter,
    setStatusFilter,
    setPage,
    setSize,
    fetchEmployees,
    refetch,
  } = useEmployeeStore()

  const [q, setQ] = useState('')
  const debouncedQuery = useDebounce(q, 400)

  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editPhoneDialogOpen, setEditPhoneDialogOpen] = useState(false)
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [menuEmployee, setMenuEmployee] = useState<Employee | null>(null)

  useEffect(() => {
    setQuery(debouncedQuery)
  }, [debouncedQuery, setQuery])

  useEffect(() => {
    fetchEmployees()
  }, [debouncedQuery, roleFilter, statusFilter, page, size, fetchEmployees])

  const handleSearchChange = (value: string) => {
    setQ(value)
  }

  const handleFilterApply = (role: string, status: string) => {
    setRoleFilter(role)
    setStatusFilter(status)
    setPage(0)
    setFilterDialogOpen(false)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, employee: Employee) => {
    setMenuAnchor(event.currentTarget)
    setMenuEmployee(employee)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setMenuEmployee(null)
  }

  const handleEdit = () => {
    if (menuEmployee) {
      setSelectedEmployee(menuEmployee)
      setEditDialogOpen(true)
    }
    handleMenuClose()
  }

  const handleEditPhone = () => {
    if (menuEmployee) {
      setSelectedEmployee(menuEmployee)
      setEditPhoneDialogOpen(true)
    }
    handleMenuClose()
  }

  const handleToggleStatus = async () => {
    if (menuEmployee) {
      const newActiveStatus = menuEmployee.status !== 'active'
      await toggleEmployeeStatus(menuEmployee.userId, newActiveStatus)
      refetch()
    }
    handleMenuClose()
  }

  const handleMakeHead = async () => {
    if (menuEmployee) {
      await makeHead(menuEmployee.userId)
      refetch()
    }
    handleMenuClose()
  }

  const handleRefetch = () => {
    refetch()
  }

  const itemsSafe = Array.isArray(items) ? items : []
  const sortedItems = [...itemsSafe]

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 1,
            background: 'linear-gradient(135deg, #F54264 0%, #F96741 45%, #FC8C1E 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Сотрудники
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
          <TextField
            placeholder="Поиск сотрудников..."
            variant="outlined"
            size="medium"
            value={q}
            onChange={(e) => handleSearchChange(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 280, maxWidth: 480 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            size="large"
            onClick={() => setFilterDialogOpen(true)}
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
            Фильтр
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
            size="large"
            sx={{
              whiteSpace: 'nowrap',
              px: 3.5,
              py: 1.5,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #F54264 0%, #F96741 45%, #FC8C1E 100%)',
              boxShadow: '0 4px 12px rgba(245, 66, 100, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #E03252 0%, #E85830 45%, #E67A17 100%)',
                boxShadow: '0 8px 20px rgba(245, 66, 100, 0.4)',
              },
            }}
          >
            Добавить
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
                  <TableCell>ID</TableCell>
                  <TableCell>Фамилия</TableCell>
                  <TableCell>Имя</TableCell>
                  <TableCell>WhatsApp номер</TableCell>
                  <TableCell>ИИН</TableCell>
                  <TableCell>Роль</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedItems.map((employee, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{employee.userId}</TableCell>
                    <TableCell>{employee.lastName}</TableCell>
                    <TableCell>{employee.firstName}</TableCell>
                    <TableCell>{formatPhoneNumber(employee.phoneNumber)}</TableCell>
                    <TableCell>{employee.iin}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      {employee.status === 'active' ? 'Активен' : 'Неактивен'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, employee)}
                        aria-label="Открыть действия"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleEdit}>Редактировать</MenuItem>
          <MenuItem onClick={handleEditPhone}>Редактировать номер</MenuItem>
          <MenuItem onClick={handleToggleStatus}>
            {menuEmployee?.status === 'active' ? 'Деактивировать' : 'Активировать'}
          </MenuItem>
          {isDirector && (
            <MenuItem onClick={handleMakeHead}>Назначить руководителем</MenuItem>
          )}
        </Menu>

        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          rowsPerPage={size}
          onRowsPerPageChange={(event) => setSize(parseInt(event.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50]}
          labelRowsPerPage="Строк на странице"
        />
      </Paper>

      <CreateEmployeeDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={handleRefetch}
      />

      <EditEmployeeDialog
        open={editDialogOpen}
        employee={selectedEmployee}
        onClose={() => {
          setEditDialogOpen(false)
          setSelectedEmployee(null)
        }}
        onSuccess={handleRefetch}
      />

      <EditPhoneDialog
        open={editPhoneDialogOpen}
        employee={selectedEmployee}
        onClose={() => {
          setEditPhoneDialogOpen(false)
          setSelectedEmployee(null)
        }}
        onSuccess={handleRefetch}
      />

      <FilterDialog
        open={filterDialogOpen}
        initialRole={roleFilter}
        initialStatus={statusFilter}
        onClose={() => setFilterDialogOpen(false)}
        onApply={handleFilterApply}
      />
    </Box>
  )
}

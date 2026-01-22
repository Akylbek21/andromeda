import { http } from '../../shared/api'
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdatePhoneRequest,
  ApiErrorResponse,
} from './types'
import { EmployeesConflictError } from './types'

interface AxiosErrorResponse {
  response?: {
    status: number
    data?: unknown
  }
}

// Helper to handle API errors consistently
function handleApiError(error: unknown, defaultMessage: string): never {
  const axiosError = error as AxiosErrorResponse
  // Handle 400 conflicts
  if (axiosError?.response?.status === 400) {
    const errorData = axiosError.response.data as ApiErrorResponse
    throw new EmployeesConflictError(
      errorData.message || defaultMessage,
      400,
      {
        userId: errorData.userId,
        existingUser: errorData.existingUser,
        conflictType: errorData.conflictType,
      }
    )
  }
  // Re-throw other errors with default message
  const message = (axiosError?.response?.data as { message?: string })?.message || 'Произошла непредвиденная ошибка'
  throw new Error(message)
}

interface GetEmployeesParams {
  page?: number
  size?: number
  q?: string
  role?: string
  status?: string
}

type EmployeesResponse = {
  items?: Employee[]
  content?: Employee[]
  total?: number
  totalElements?: number
} | Employee[]

const normalizeEmployeesResponse = (data: EmployeesResponse): { items: Employee[]; total: number } => {
  if (Array.isArray(data)) {
    return { items: data, total: data.length }
  }

  const items = data.items ?? data.content ?? []
  const total = data.total ?? data.totalElements ?? items.length

  return { items, total }
}

export async function getEmployees(params?: GetEmployeesParams): Promise<{ items: Employee[]; total: number }> {
  const { data } = await http.get<EmployeesResponse>('/api/v1/employees', {
    params,
  })

  return normalizeEmployeesResponse(data)
}

export async function searchEmployees(params: { q: string; page?: number; size?: number }): Promise<{ items: Employee[]; total: number }> {
  const { data } = await http.get<EmployeesResponse>('/api/v1/employees/search', {
    params,
  })

  return normalizeEmployeesResponse(data)
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<Employee> {
  try {
    const { data } = await http.post<Employee>('/api/v1/employees', payload)
    return data
  } catch (error: unknown) {
    handleApiError(error, 'Конфликт при добавлении сотрудника')
  }
}

export async function confirmExistingUser(
  userId: number,
  payload: CreateEmployeeRequest
): Promise<Employee> {
  try {
    const { data } = await http.post<Employee>(
      `/api/v1/employees/confirm-existing/${userId}`,
      payload
    )
    return data
  } catch (error: unknown) {
    handleApiError(error, 'Конфликт при подтверждении пользователя')
  }
}

// Alias for confirmExistingUser for consistency with ТЗ naming
export const confirmExistingEmployee = confirmExistingUser

export async function takePhoneAndCreate(
  userId: number,
  payload: CreateEmployeeRequest
): Promise<Employee> {
  try {
    const { data } = await http.post<Employee>(
      `/api/v1/employees/take-phone-create/${userId}`,
      payload
    )
    return data
  } catch (error: unknown) {
    handleApiError(error, 'Конфликт при создании сотрудника')
  }
}

export async function updateEmployee(
  userId: number,
  payload: UpdateEmployeeRequest
): Promise<Employee> {
  try {
    const { data } = await http.patch<Employee>(`/api/v1/employees/${userId}`, payload)
    return data
  } catch (error: unknown) {
    handleApiError(error, 'Конфликт при обновлении сотрудника')
  }
}

export async function updateEmployeePhone(
  userId: number,
  payload: UpdatePhoneRequest
): Promise<Employee> {
  try {
    const { data } = await http.patch<Employee>(
      `/api/v1/employees/${userId}/phone`,
      payload
    )
    return data
  } catch (error: unknown) {
    handleApiError(error, 'Конфликт при обновлении номера телефона')
  }
}

export async function takePhoneFrom(
  targetUserId: number,
  sourceUserId: number,
  phone: string
): Promise<void> {
  await http.post(
    `/api/v1/employees/${targetUserId}/take-phone-from/${sourceUserId}`,
    null,
    { params: { phone } }
  )
}

export async function toggleEmployeeStatus(
  userId: number,
  active: boolean
): Promise<void> {
  await http.patch(`/api/v1/employees/${userId}/status`, null, {
    params: { active },
  })
}

export async function makeHead(userId: number): Promise<void> {
  await http.post(`/api/v1/employees/${userId}/make-head`)
}

import { http } from '../../shared/api'
import type {
  Employee,
  PageResponse,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdatePhoneRequest,
  ExistingUserInfo,
} from './types'

interface GetEmployeesParams {
  page?: number
  size?: number
  q?: string
  role?: string
  status?: string
}

export async function getEmployees(params?: GetEmployeesParams): Promise<Employee[]> {
  const { data } = await http.get<Employee[]>('/api/v1/employees', { params })
  return data
}

export async function searchEmployees(q: string): Promise<Employee[]> {
  const { data } = await http.get<Employee[]>('/api/v1/employees/search', {
    params: { q },
  })
  return data
}

export async function createEmployee(payload: CreateEmployeeRequest): Promise<Employee> {
  const { data } = await http.post<Employee>('/api/v1/employees', payload)
  return data
}

export async function confirmExistingUser(
  userId: number,
  payload: CreateEmployeeRequest
): Promise<Employee> {
  const { data } = await http.post<Employee>(
    `/api/v1/employees/confirm-existing/${userId}`,
    payload
  )
  return data
}

export async function takePhoneAndCreate(
  userId: number,
  payload: CreateEmployeeRequest
): Promise<Employee> {
  const { data } = await http.post<Employee>(
    `/api/v1/employees/take-phone-create/${userId}`,
    payload
  )
  return data
}

export async function updateEmployee(
  userId: number,
  payload: UpdateEmployeeRequest
): Promise<Employee> {
  const { data } = await http.patch<Employee>(`/api/v1/employees/${userId}`, payload)
  return data
}

export async function updateEmployeePhone(
  userId: number,
  payload: UpdatePhoneRequest
): Promise<Employee> {
  const { data } = await http.patch<Employee>(
    `/api/v1/employees/${userId}/phone`,
    payload
  )
  return data
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

export type EmployeeRole = 'expert' | 'mentor' | 'teacher' | 'accountant' | 'head' | 'director'
export type EmployeeStatus = 'active' | 'inactive'

export type Employee = {
  userId: number
  firstName: string
  lastName: string
  phoneNumber: string | null
  email: string | null
  iin: string
  role: EmployeeRole
  status: EmployeeStatus
  preferredLanguage?: string | null
  createdAt?: string
}

export type PageResponse<T> = {
  items: T[]
  total: number
}

export interface CreateEmployeeRequest {
  lastName: string
  firstName: string
  phoneNumber: string
  email: string
  iin: string
  notCitizen: boolean
  role: 'expert' | 'mentor' | 'teacher' | 'accountant'
}

export interface UpdateEmployeeRequest {
  iin?: string
  email?: string
  role?: 'expert' | 'mentor' | 'teacher' | 'accountant'
}

export interface UpdatePhoneRequest {
  phoneNumber: string
}

export interface ExistingUserInfo {
  userId: number
  firstName: string
  lastName: string
  phoneNumber: string
  iin: string
}

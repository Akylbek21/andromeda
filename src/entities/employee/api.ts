import { http } from '../../shared/api'
import type { Employee, PageResponse } from './types'

interface GetEmployeesParams {
  page: number
  size: number
  q?: string
}

interface ServerPageResponse {
  content?: Employee[]
  items?: Employee[]
  totalElements?: number
  total?: number
}

export async function getEmployees(
  params: GetEmployeesParams
): Promise<PageResponse<Employee>> {
  const { data } = await http.get<ServerPageResponse>('/api/v1/employees', {
    params: {
      page: params.page,
      size: params.size,
      ...(params.q && { q: params.q }),
    },
  })

  // Support both response shapes
  const items = data.items || data.content || []
  const total = data.total !== undefined ? data.total : data.totalElements || 0

  return {
    items,
    total,
  }
}

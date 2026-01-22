import { create } from 'zustand'
import type { Employee } from './index'
import { getEmployees, searchEmployees } from './index'

export interface EmployeeStoreState {
  items: Employee[]
  total: number
  loading: boolean
  error?: string
  q: string
  roleFilter: string
  statusFilter: string
  page: number
  size: number
}

export interface EmployeeStoreActions {
  setQuery: (q: string) => void
  setRoleFilter: (role: string) => void
  setStatusFilter: (status: string) => void
  setPage: (page: number) => void
  setSize: (size: number) => void
  fetchEmployees: () => Promise<void>
  refetch: () => Promise<void>
}

export type EmployeeStore = EmployeeStoreState & EmployeeStoreActions

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  error: undefined,
  q: '',
  roleFilter: '',
  statusFilter: '',
  page: 0,
  size: 20,

  setQuery: (q: string) => {
    set({ q, error: undefined, page: 0 })
  },

  setRoleFilter: (role: string) => {
    set({ roleFilter: role, error: undefined, page: 0 })
  },

  setStatusFilter: (status: string) => {
    set({ statusFilter: status, error: undefined, page: 0 })
  },

  setPage: (page: number) => {
    set({ page })
  },

  setSize: (size: number) => {
    set({ size, page: 0 })
  },

  fetchEmployees: async () => {
    const { loading, q, roleFilter, statusFilter, page, size } = get()

    if (loading) {
      return
    }

    set({ loading: true, error: undefined })

    try {
      const fetcher = q ? searchEmployees : getEmployees
      const { items, total } = await fetcher({
        q: q || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
        page,
        size,
      } as any)

      set({
        items,
        total,
        loading: false,
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch employees'

      set({
        error: errorMessage,
        loading: false,
      })
    }
  },

  refetch: async () => {
    await get().fetchEmployees()
  },
}))

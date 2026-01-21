import { create } from 'zustand'
import type { Employee } from './index'
import { getEmployees } from './index'

export interface EmployeeStoreState {
  items: Employee[]
  total: number
  loading: boolean
  error?: string
  q: string
  roleFilter: string
  statusFilter: string
}

export interface EmployeeStoreActions {
  setQuery: (q: string) => void
  setRoleFilter: (role: string) => void
  setStatusFilter: (status: string) => void
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

  setQuery: (q: string) => {
    set({ q, error: undefined })
  },

  setRoleFilter: (role: string) => {
    set({ roleFilter: role, error: undefined })
  },

  setStatusFilter: (status: string) => {
    set({ statusFilter: status, error: undefined })
  },

  fetchEmployees: async () => {
    const { loading, q, roleFilter, statusFilter } = get()

    if (loading) {
      return
    }

    set({ loading: true, error: undefined })

    try {
      const items = await getEmployees({
        q: q || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      })

      set({
        items,
        total: items.length,
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

import { create } from 'zustand'
import type { Employee } from './index'
import { getEmployees } from './index'

export interface EmployeeStoreState {
  items: Employee[]
  total: number
  loading: boolean
  error?: string
  page: number
  size: number
  q: string
}

export interface EmployeeStoreActions {
  setPage: (page: number) => void
  setSize: (size: number) => void
  setQuery: (q: string) => void
  fetchEmployees: () => Promise<void>
}

export type EmployeeStore = EmployeeStoreState & EmployeeStoreActions

export const useEmployeeStore = create<EmployeeStore>((set, get) => ({
  items: [],
  total: 0,
  loading: false,
  error: undefined,
  page: 0,
  size: 10,
  q: '',

  setPage: (page: number) => {
    set({ page, error: undefined })
  },

  setSize: (size: number) => {
    set({ size, page: 0, error: undefined })
  },

  setQuery: (q: string) => {
    set({ q, page: 0, error: undefined })
  },

  fetchEmployees: async () => {
    const { loading, page, size, q } = get()

    // Prevent duplicate calls
    if (loading) {
      return
    }

    set({ loading: true, error: undefined })

    try {
      const response = await getEmployees({
        page,
        size,
        ...(q && { q }),
      })

      set({
        items: response.items,
        total: response.total,
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
}))

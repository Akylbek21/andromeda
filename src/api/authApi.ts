import { api } from './apiClient'
import type { Tokens } from '../auth/tokens'

export async function me() {
  const { data } = await api.get('/api/v1/auth/me')
  return data
}

export async function logout() {
  await api.post('/api/v1/auth/logout')
}

export async function refresh(refreshToken: string): Promise<Tokens> {
  const { data } = await api.post<Tokens>('/api/v1/auth/refresh', { refreshToken })
  return data
}

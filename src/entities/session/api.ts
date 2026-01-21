import { http } from '../../shared/api'
import type { Session } from './types'

export async function getMySessions(): Promise<Session[]> {
  const { data } = await http.get<Session[]>('/api/v1/me/sessions')
  return data
}

export async function deleteMySession(sid: string): Promise<void> {
  await http.delete(`/api/v1/me/sessions/${sid}`)
}

export async function deleteOtherSessions(): Promise<void> {
  await http.delete('/api/v1/me/sessions')
}

// Admin APIs
export async function getUserSessions(userId: string | number): Promise<Session[]> {
  const { data } = await http.get<Session[]>(`/api/v1/admin/users/${userId}/sessions`)
  return data
}

export async function deleteUserSession(userId: string | number, sid: string): Promise<void> {
  await http.delete(`/api/v1/admin/users/${userId}/sessions/${sid}`)
}

export async function deleteUserSessions(userId: string | number): Promise<void> {
  await http.delete(`/api/v1/admin/users/${userId}/sessions`)
}

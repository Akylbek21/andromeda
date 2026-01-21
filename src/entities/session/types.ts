export interface Session {
  sid: string
  createdAt: string
  lastSeenAt: string | null
  ip: string
  userAgent: string
  isCurrent: boolean
}

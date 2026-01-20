export type Employee = {
  id: string
  firstName: string
  lastName: string
  iin?: string | null
  phoneNumber?: string | null
  email?: string | null
  preferredLanguage?: string | null
  createdAt?: string
}

export type PageResponse<T> = {
  items: T[]
  total: number
}

import { parsePhoneNumber } from 'libphonenumber-js'

export function formatPhoneNumber(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '-'

  try {
    const parsed = parsePhoneNumber(phoneNumber)
    if (parsed) {
      return parsed.formatInternational()
    }
    return phoneNumber
  } catch {
    return phoneNumber
  }
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-'

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return dateString
    }

    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  } catch {
    return dateString
  }
}

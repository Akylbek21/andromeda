import type { User } from '../../entities/auth/types'

/**
 * Проверяет, имеет ли пользователь хотя бы одну из требуемых ролей
 * @param user - объект пользователя с ролями
 * @param requiredRoles - массив требуемых ролей
 * @returns true, если пользователь имеет хотя бы одну из требуемых ролей
 */
export function hasAnyRole(user: User | null, requiredRoles: string[]): boolean {
  if (!user || !requiredRoles || requiredRoles.length === 0) {
    return false
  }

  // Если роли - строка, конвертируем в массив
  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles]

  // Проверяем, есть ли пересечение между ролями пользователя и требуемыми ролями
  return requiredRoles.some((role) => userRoles.includes(role))
}

/**
 * Проверяет, имеет ли пользователь все требуемые роли
 * @param user - объект пользователя с ролями
 * @param requiredRoles - массив требуемых ролей
 * @returns true, если пользователь имеет все требуемые роли
 */
export function hasAllRoles(user: User | null, requiredRoles: string[]): boolean {
  if (!user || !requiredRoles || requiredRoles.length === 0) {
    return false
  }

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles]

  return requiredRoles.every((role) => userRoles.includes(role))
}

# Employee API Error Handling

## Overview

The employee API layer implements specialized error handling for 400-status conflicts and other errors.

## Types

### `ApiErrorResponse`

Represents the API error response structure from the backend:

```typescript
interface ApiErrorResponse {
  error: string
  message: string
  path: string
  status: number
  timestamp: string
  userId?: number
  existingUser?: ExistingUserInfo
  conflictType?: ConflictType
}
```

### `EmployeesConflictError`

Custom error class for 400-status conflicts. Extends `Error` with additional properties:

```typescript
class EmployeesConflictError extends Error {
  status: number
  userId?: number
  existingUser?: ExistingUserInfo
  conflictType?: ConflictType
}
```

## Usage

### Type Guard Function

Use `isEmployeesConflictError()` to check if an error is a conflict error:

```typescript
import { isEmployeesConflictError } from '../../entities/employee'

try {
  await createEmployee(payload)
} catch (error) {
  if (isEmployeesConflictError(error)) {
    // Handle conflict (400)
    console.log(error.conflictType) // 'USER_EXISTS' | 'EMPLOYEE_EXISTS' | undefined
    console.log(error.existingUser) // { userId, firstName, lastName, phoneNumber, iin }
    console.log(error.message) // Error message from backend
  } else {
    // Handle other errors
    console.log(error.message) // 'Произошла непредвиденная ошибка'
  }
}
```

### API Functions That Throw `EmployeesConflictError`

All these functions handle 400 status and throw `EmployeesConflictError`:
- `createEmployee()`
- `confirmExistingUser()`
- `takePhoneAndCreate()`
- `updateEmployee()`
- `updateEmployeePhone()`

Other functions (`getEmployees`, `searchEmployees`, etc.) re-throw with default messages.

## Error Handling Flow

```
API Request
    ↓
Status 400? → EmployeesConflictError
Status other? → Generic Error (with message or default)
    ↓
Component catches error
    ↓
isEmployeesConflictError(error)?
    ├─ YES → Show conflict dialog with existingUser data
    └─ NO → Show generic error snackbar
```

## Component Integration Example

### CreateEmployeeDialog

```typescript
import { isEmployeesConflictError } from '../../entities/employee'

const onSubmit = async (data) => {
  try {
    await createEmployee(data)
    // Success
  } catch (error) {
    if (isEmployeesConflictError(error)) {
      // Conflict - show dialog with existingUser
      setConflictData({
        conflictType: error.conflictType || 'USER_EXISTS',
        user: error.existingUser || { /* fallback */ },
        formData: data,
      })
    } else {
      // Generic error
      enqueueSnackbar(error.message, { variant: 'error' })
    }
  }
}
```

## Backend Contract

The backend should return this for 400 conflicts:

```json
{
  "error": "Bad Request",
  "message": "User with this phone already exists",
  "path": "/api/v1/employees",
  "status": 400,
  "timestamp": "2025-01-22T10:30:00Z",
  "userId": 123,
  "existingUser": {
    "userId": 123,
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "+7 700 123 4567",
    "iin": "123456789012"
  },
  "conflictType": "USER_EXISTS"
}
```

### Optional Fields

- `userId`: User ID of the conflicting user
- `existingUser`: Full existing user data for UI display
- `conflictType`: `'USER_EXISTS' | 'EMPLOYEE_EXISTS'` for routing logic

If not provided, the error is still properly typed, but fields will be `undefined`.

## Migration from Previous Implementation

Previous code checked `error?.response?.status === 409` or `=== 400` directly.

Now use the type guard instead:

```typescript
// OLD
if (error?.response?.status === 400) {
  const data = error.response.data
  // Process...
}

// NEW
if (isEmployeesConflictError(error)) {
  // error is typed as EmployeesConflictError
  console.log(error.conflictType, error.existingUser)
}
```

## Error Messages

### Default Messages

- Create: `'Конфликт при добавлении сотрудника'`
- Confirm: `'Конфликт при подтверждении пользователя'`
- TakePhone: `'Конфликт при создании сотрудника'`
- Update: `'Конфликт при обновлении сотрудника'`
- UpdatePhone: `'Конфликт при обновлении номера телефона'`
- Generic: `'Произошла непредвиденная ошибка'`

These are used when backend doesn't provide a `message` field.

## Testing

```typescript
// Simulate a conflict
const mockError = new EmployeesConflictError(
  'User exists',
  400,
  {
    userId: 1,
    existingUser: { userId: 1, firstName: 'John', lastName: 'Doe', phoneNumber: '...', iin: '...' },
    conflictType: 'USER_EXISTS',
  }
)

console.log(isEmployeesConflictError(mockError)) // true
console.log(mockError.status) // 400
console.log(mockError.conflictType) // 'USER_EXISTS'
```

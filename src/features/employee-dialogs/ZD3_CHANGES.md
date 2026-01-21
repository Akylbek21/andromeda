# ЗД №3 — Реализовать confirm-existing запрос и обработка 500 без падения UI

## Что было реализовано

### 1. **API метод `confirmExistingEmployee()`** (`api.ts`)
- ✅ Добавлен alias `confirmExistingEmployee` для соответствия ТЗ
- ✅ Используется существующая функция `confirmExistingUser()` которая:
  - Отправляет POST запрос на `/api/v1/employees/confirm-existing/{userId}`
  - Передает payload: `{ lastName, firstName, phoneNumber, email, iin, notCitizen, role }`
  - Типизирует ответ через `Employee`

### 2. **Обработка ошибок API**
- ✅ При 400 конфликте: выбрасывает `EmployeesConflictError` с деталями
- ✅ При 500 или других ошибках: выбрасывает `Error` с message из ответа
- ✅ Все ошибки типизированы через `ApiErrorResponse`

### 3. **Обработка в UI** (`CreateEmployeeDialog.tsx`)
- ✅ Функция `handleExistingUserConfirm()`:
  1. Устанавливает `isSubmitting = true` для loading на кнопке
  2. Вызывает `confirmExistingUser()` с userId и payload
  3. **При успехе**:
     - Показывает snackbar "Сотрудник добавлен"
     - Закрывает все диалоги
     - Вызывает `onSuccess()` для refetch таблицы
  4. **При ошибке** (включая 500):
     - Показывает snackbar с `error.message`
     - **Диалог остается открытым** (не закрывается)
     - Пользователь может попробовать снова

- ✅ Loading состояние:
  - `isSubmitting` передается в ExistingUserDialog
  - Кнопка "Да, это он" показывает CircularProgress при loading
  - Кнопка "Нет, это не он..." становится disabled при loading

### 4. **Цепочка успешного потока**
```
POST /api/v1/employees
  ↓ [400] ExistingUserDialog открывается
    ↓
    [Да, это он]
      ↓
      confirmExistingUser() API
        ↓
        [Success] → snackbar + close dialogs + onSuccess(refetch)
        ↓
        [Error 500] → snackbar + диалог ОСТАЕТСЯ ОТКРЫТЫМ
```

### 5. **Обработка состояния ошибок**
- ✅ Диалог остается открытым при ошибке
- ✅ Пользователь видит сообщение об ошибке в snackbar
- ✅ Пользователь может нажать "Да, это он" еще раз
- ✅ UI не падает на 500 ошибке

## Типизация

### ApiErrorResponse (из ЗД №1)
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

### Обработка в handleApiError()
```typescript
function handleApiError(error: unknown, defaultMessage: string): never {
  const axiosError = error as AxiosErrorResponse
  // 400 → EmployeesConflictError
  // 500+ → Error с message из ответа
}
```

## Файлы, обновленные

1. **src/entities/employee/api.ts**
   - Добавлен alias `confirmExistingEmployee`
   - Существующая `confirmExistingUser()` уже правильно обрабатывает ошибки

2. **src/features/employee-dialogs/CreateEmployeeDialog.tsx**
   - Функция `handleExistingUserConfirm()` уже реализована
   - Правильная обработка успеха и ошибок
   - Loading состояние передается в диалоги

3. **src/features/employee-dialogs/ExistingUserDialog.tsx**
   - Получает `isSubmitting` пропс
   - Кнопки показывают loading состояние

## Acceptance Criteria — ВСЕ ВЫПОЛНЕНЫ ✅

| Требование | Статус | Детали |
|-----------|--------|--------|
| API метод `confirmExistingEmployee()` существует | ✅ | Alias на `confirmExistingUser()` |
| Отправляет POST на `/api/v1/employees/confirm-existing/{userId}` | ✅ | Реализовано в API |
| Payload содержит все поля create | ✅ | `CreateEmployeeRequest` |
| 500 не ломает страницу | ✅ | Обработка в try-catch, диалог остается |
| При 500 показывается snackbar | ✅ | В `catch` блоке `handleExistingUserConfirm()` |
| Диалог остается открытым при ошибке | ✅ | `setConflictState()` не вызывается в catch |
| Пользователь может попробовать снова | ✅ | Кнопка доступна после ошибки |
| При успехе: закрыть диалоги + refetch | ✅ | `onClose()` + `onSuccess()` |
| Loading показывается на кнопке | ✅ | `isSubmitting` → CircularProgress |
| Типизация через ApiErrorResponse | ✅ | Используется в `handleApiError()` |

## Примеры обработки ошибок

### Успешное добавление сотрудника через confirm-existing
```typescript
// 1. Пользователь видит ExistingUserDialog
// 2. Нажимает "Да, это он"
// 3. API вызывает confirmExistingUser(userId, payload)
// 4. Сервер возвращает 201 + Employee
// 5. Видит snackbar "Сотрудник добавлен"
// 6. Диалоги закрываются
// 7. Таблица обновляется (refetch)
```

### Ошибка 500 при confirm-existing
```typescript
// 1. Пользователь видит ExistingUserDialog
// 2. Нажимает "Да, это он"
// 3. API вызывает confirmExistingUser()
// 4. Сервер возвращает 500 + error message
// 5. Видит snackbar "Произошла непредвиденная ошибка"
// 6. Диалог ОСТАЕТСЯ ОТКРЫТЫМ
// 7. Кнопка "Да, это он" еще раз доступна
// 8. Пользователь может попробовать снова
```

## Notes

- Функция `confirmExistingUser()` уже была реализована в ЗД №1
- Добавлен только alias `confirmExistingEmployee` для соответствия ТЗ
- Все обработки ошибок и loading состояния уже реализованы в CreateEmployeeDialog
- Цепочка refetch работает через `onSuccess` → `handleRefetch` → `refetch()`
- ESLint проходит без ошибок ✅

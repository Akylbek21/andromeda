# ЗД №4 — Фронт готов к расширенному 400-ответу

## Статус

✅ **ФРОНТ ПОЛНОСТЬЮ ПОДГОТОВЛЕН** — не требует изменений при добавлении данных на бэке

---

## Задача

Подготовить фронтенд к автоматическому отображению полей `conflictType` и `existingUser` в 400-ответах бэка без необходимости дополнительных изменений в коде.

---

## Текущее состояние фронта

### Типы (✅ Уже поддерживают опциональные поля)

[src/entities/employee/types.ts](src/entities/employee/types.ts):

```typescript
// Опциональные поля в ApiErrorResponse
export interface ApiErrorResponse {
  error: string
  message: string
  path: string
  status: number
  timestamp: string
  userId?: number                    // ← Опционально
  existingUser?: ExistingUserInfo    // ← Опционально
  conflictType?: ConflictType        // ← Опционально
}

// Данные пользователя
export interface ExistingUserInfo {
  userId: number
  firstName: string
  lastName: string
  phoneNumber: string
  iin: string
}

export type ConflictType = 'USER_EXISTS' | 'EMPLOYEE_EXISTS'
```

### API обработка (✅ Правильно передаёт поля)

[src/entities/employee/api.ts](src/entities/employee/api.ts) — функция `handleApiError()`:

```typescript
function handleApiError(error: unknown, defaultMessage: string): never {
  const axiosError = error as AxiosErrorResponse
  if (axiosError?.response?.status === 400) {
    const errorData = axiosError.response.data as ApiErrorResponse
    throw new EmployeesConflictError(
      errorData.message || defaultMessage,
      400,
      {
        userId: errorData.userId,              // ← Передаётся если есть
        existingUser: errorData.existingUser,  // ← Передаётся если есть
        conflictType: errorData.conflictType,  // ← Передаётся если есть
      }
    )
  }
  // ...
}
```

### Логика определения сценария (✅ Работает с опциональными данными)

[src/features/employee-dialogs/conflict-utils.ts](src/features/employee-dialogs/conflict-utils.ts):

```typescript
/**
 * Приоритет определения сценария:
 * 1. conflictType поле (если есть) ← Будет использовано автоматически
 * 2. Fallback на substring matching сообщения (если нет conflictType)
 * 3. 'UNKNOWN'
 */
export function determineConflictScenario(error: unknown): ConflictScenario {
  if (!isEmployeesConflictError(error)) {
    return 'UNKNOWN'
  }

  // Priority 1: Use conflictType if provided ← ЭТО СРАБОТАЕТ СРАЗУ ПРИ ДОБАВЛЕНИИ НА БЭКЕ
  if (error.conflictType) {
    return error.conflictType
  }

  // Priority 2: Fallback to message matching
  const message = error.message || ''
  if (message.includes('Пользователь с таким номером')) {
    return 'USER_EXISTS'
  }
  if (message.includes('Сотрудник с таким номером')) {
    return 'EMPLOYEE_EXISTS'
  }

  return 'UNKNOWN'
}

/**
 * Валидация наличия данных для отображения
 */
export function hasValidExistingUserData(error: unknown): boolean {
  if (!isEmployeesConflictError(error)) {
    return false
  }
  return !!(error.existingUser?.userId && 
           error.existingUser?.firstName && 
           error.existingUser?.lastName)
}
```

### UI компоненты (✅ Готовы к отображению данных)

#### ExistingUserDialog

[src/features/employee-dialogs/ExistingUserDialog.tsx](src/features/employee-dialogs/ExistingUserDialog.tsx):

```tsx
// Условная отрисовка: данные если есть, иначе сообщение об ошибке
{existingUser ? (
  <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
    <Typography><strong>ID:</strong> {existingUser.userId}</Typography>
    <Typography><strong>ФИО:</strong> {existingUser.lastName} {existingUser.firstName}</Typography>
    <Typography><strong>WhatsApp номер:</strong> {existingUser.phoneNumber}</Typography>
    <Typography><strong>ИИН:</strong> {existingUser.iin}</Typography>
  </Box>
) : (
  <Typography color="error" sx={{ mt: 2 }}>
    {errorMessage}
  </Typography>
)}
```

#### EmployeeExistsDialog

[src/features/employee-dialogs/EmployeeExistsDialog.tsx](src/features/employee-dialogs/EmployeeExistsDialog.tsx) — идентична ExistingUserDialog

### CreateEmployeeDialog логика (✅ Правильно обрабатывает оба случая)

[src/features/employee-dialogs/CreateEmployeeDialog.tsx](src/features/employee-dialogs/CreateEmployeeDialog.tsx) — функция `onSubmit()`:

```tsx
const onSubmit = async (data: unknown) => {
  // ...
  try {
    await createEmployee(payload)
    // success...
  } catch (error: unknown) {
    if (isEmployeesConflictError(error)) {
      const scenario = determineConflictScenario(error)  // ← Автоматически использует conflictType
      const hasData = hasValidExistingUserData(error)

      if (!hasData) {
        // Бэк не вернул данные → показываем предупреждение
        enqueueSnackbar('Бэк не вернул данные существующего пользователя', { variant: 'warning' })
        setConflictState({
          scenario,
          existingUser: null,
          formData,
          errorMessage: error.message,
        })
      } else {
        // Бэк вернул данные → показываем диалог с данными
        setConflictState({
          scenario,
          existingUser: error.existingUser || null,  // ← Автоматически установится из 400-ответа
          formData,
          errorMessage: error.message,
        })
      }
    }
    // ...
  }
}
```

---

## Что должен вернуть бэк (Спецификация для бэка)

### Текущее поведение (Работает с fallback)

```json
HTTP 400
{
  "error": "Bad Request",
  "message": "Пользователь с таким номером уже существует",
  "status": 400,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees"
}
```

**Фронт**: Используем substring matching на сообщение → определяем сценарий → показываем диалог БЕЗ данных (с предупреждением)

---

### ✅ ЖЕЛАЕМОЕ расширение (Оптимальное решение)

```json
HTTP 400
{
  "error": "Bad Request",
  "message": "Пользователь с таким номером уже существует",
  "status": 400,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees",
  
  // ← НОВЫЕ ПОЛЯ (опциональные для обратной совместимости)
  "userId": 42,
  "existingUser": {
    "userId": 42,
    "firstName": "Иван",
    "lastName": "Иванов",
    "phoneNumber": "+7 (700) 123-45-67",
    "iin": "850101123456"
  },
  "conflictType": "USER_EXISTS"
}
```

**ИЛИ для сценария "Сотрудник уже существует":**

```json
HTTP 400
{
  "error": "Bad Request",
  "message": "Сотрудник с таким номером уже существует",
  "status": 400,
  "timestamp": "2026-01-22T12:00:00Z",
  "path": "/api/v1/employees",
  "userId": 43,
  "existingUser": {
    "userId": 43,
    "firstName": "Петр",
    "lastName": "Петров",
    "phoneNumber": "+7 (700) 234-56-78",
    "iin": "851202654321"
  },
  "conflictType": "EMPLOYEE_EXISTS"
}
```

---

## Acceptance Criteria

### ✅ AC1: После добавления полей на бэке фронт автоматически показывает данные

**Сценарий**: 400 с `conflictType: "USER_EXISTS"` и `existingUser` объектом

**Ожидаемое поведение**:
1. ✅ Диалог ExistingUserDialog откроется
2. ✅ Отобразятся все 4 поля: ID, ФИО, WhatsApp, ИИН
3. ✅ Красивое форматирование в сером box'е
4. ✅ Кнопки "Да, это он" и "Нет, это не он, отобрать номер" активны

**Код**: ExistingUserDialog.tsx (уже готов)

---

### ✅ AC2: Если данные отсутствуют на бэке, показываем только текст message

**Сценарий**: 400 БЕЗ `existingUser`

**Ожидаемое поведение**:
1. ✅ Диалог откроется (если scenario определён корректно)
2. ✅ Вместо box'а с данными → красный текст с `errorMessage`
3. ✅ Снэкбар с предупреждением "Бэк не вернул данные существующего пользователя"
4. ✅ Кнопки остаются активны для retry

**Код**: CreateEmployeeDialog.tsx линия 88-101 (уже готов)

---

### ✅ AC3: Fallback-механизм остаётся при отсутствии conflictType

**Сценарий**: 400 БЕЗ `conflictType`, только `message`

**Ожидаемое поведение**:
1. ✅ Строка вычисляет scenario по substring matching сообщения
2. ✅ Пользователь видит корректный диалог
3. ✅ **Это не сломается при добавлении `conflictType` на бэке** (приоритет на conflictType)

**Код**: conflict-utils.ts функция `determineConflictScenario()` (уже готов)

---

## Что меняется в коде при добавлении полей на бэке?

### 🎯 НИЧЕГО не меняется в фронте!

Все поля уже поддерживаются как опциональные и корректно обрабатываются:

| Файл | Текущее состояние | При добавлении полей на бэке |
|------|------------------|------|
| `types.ts` | ✅ Поля опциональные | ✅ Автоматически используются |
| `api.ts` | ✅ Передаёт всё из errorData | ✅ Просто передаст новые поля |
| `conflict-utils.ts` | ✅ Проверяет conflictType | ✅ Сразу приоритизирует его |
| `CreateEmployeeDialog.tsx` | ✅ Использует hasValidExistingUserData() | ✅ Покажет данные автоматически |
| `ExistingUserDialog.tsx` | ✅ Условная отрисовка | ✅ Отобразит данные если есть |
| `EmployeeExistsDialog.tsx` | ✅ Условная отрисовка | ✅ Отобразит данные если есть |

---

## Инструкция для бэка

### Что нужно реализовать на endpoints:

#### 1. POST `/api/v1/employees` (Создание сотрудника)

При конфликте (400):

**Для USER_EXISTS** (пользователь в БД, но не сотрудник):
```json
{
  "error": "Bad Request",
  "message": "Пользователь с таким номером уже существует",
  "status": 400,
  "timestamp": "...",
  "path": "/api/v1/employees",
  "userId": <USER_ID>,
  "existingUser": {
    "userId": <USER_ID>,
    "firstName": "<First Name>",
    "lastName": "<Last Name>",
    "phoneNumber": "<Formatted Phone>",
    "iin": "<IIN>"
  },
  "conflictType": "USER_EXISTS"
}
```

**Для EMPLOYEE_EXISTS** (уже полноценный сотрудник):
```json
{
  "error": "Bad Request",
  "message": "Сотрудник с таким номером уже существует",
  "status": 400,
  "timestamp": "...",
  "path": "/api/v1/employees",
  "userId": <EMPLOYEE_ID>,
  "existingUser": {
    "userId": <EMPLOYEE_ID>,
    "firstName": "<First Name>",
    "lastName": "<Last Name>",
    "phoneNumber": "<Formatted Phone>",
    "iin": "<IIN>"
  },
  "conflictType": "EMPLOYEE_EXISTS"
}
```

#### 2. POST `/api/v1/employees/confirm-existing/{userId}` (Подтверждение пользователя)

При успехе:
```json
{
  "userId": <ID>,
  "firstName": "...",
  "lastName": "...",
  "phoneNumber": "...",
  "email": "...",
  "iin": "...",
  "role": "...",
  "status": "active",
  "preferredLanguage": null
}
```

При 500 ошибке (например, бизнес-логика):
```json
{
  "error": "Internal Server Error",
  "message": "Не удалось подтвердить пользователя",
  "status": 500,
  "timestamp": "..."
}
```

#### 3. POST `/api/v1/employees/take-phone-create/{userId}` (Отобрать номер и создать)

Аналогично `confirm-existing` — возвращает Employee или ошибку

---

## Тестирование фронта

### Тестовые сценарии (Все работают прямо сейчас):

#### ✅ Сценарий 1: Нет conflictType, только message

**Бэк возвращает**:
```json
HTTP 400
{ "message": "Пользователь с таким номером уже существует" }
```

**Фронт**: 
- ✅ Определит scenario по message → USER_EXISTS
- ✅ Покажет ExistingUserDialog (БЕЗ данных, будет предупреждение)

---

#### ✅ Сценарий 2: Есть conflictType и existingUser

**Бэк возвращает** (расширенная версия):
```json
HTTP 400
{
  "message": "Пользователь с таким номером уже существует",
  "conflictType": "USER_EXISTS",
  "userId": 42,
  "existingUser": {
    "userId": 42,
    "firstName": "Иван",
    "lastName": "Иванов",
    "phoneNumber": "+7 (700) 123-45-67",
    "iin": "850101123456"
  }
}
```

**Фронт**: 
- ✅ Приоритизирует conflictType → USER_EXISTS
- ✅ Найдёт existingUser → покажет в красивом box'е
- ✅ **БЕЗ изменений в коде**

---

#### ✅ Сценарий 3: EMPLOYEE_EXISTS с данными

**Бэк возвращает**:
```json
HTTP 400
{
  "message": "Сотрудник с таким номером уже существует",
  "conflictType": "EMPLOYEE_EXISTS",
  "userId": 43,
  "existingUser": {
    "userId": 43,
    "firstName": "Петр",
    "lastName": "Петров",
    "phoneNumber": "+7 (700) 234-56-78",
    "iin": "851202654321"
  }
}
```

**Фронт**: 
- ✅ Приоритизирует conflictType → EMPLOYEE_EXISTS
- ✅ Покажет EmployeeExistsDialog с данными
- ✅ Кнопка "Да, это он" покажет RefusalDialog
- ✅ **БЕЗ изменений в коде**

---

## Резюме

### Текущее состояние

Фронтенд **полностью готов** к расширению. Все механизмы уже реализованы:

1. ✅ Типы поддерживают опциональные поля
2. ✅ API слой правильно передаёт поля из 400-ответа
3. ✅ Утилиты определяют сценарий по `conflictType` с fallback на message
4. ✅ UI компоненты показывают данные если есть, иначе текст
5. ✅ Обработка ошибок не сломается без данных

### Что нужно делать на бэке

Просто добавить в 400-ответ 3 новых поля:
- `userId: number`
- `existingUser: { userId, firstName, lastName, phoneNumber, iin }`
- `conflictType: "USER_EXISTS" | "EMPLOYEE_EXISTS"`

**Обратная совместимость**: Фронт продолжит работать и со старыми ответами (без полей)

### Когда полностью готово?

После того, как бэк добавит поля и начнёт их возвращать — фронт **автоматически** начнёт показывать данные в диалогах.

**Никаких правок в коде фронта не требуется!** ✨

---

## Файлы ЗД №4

- 📄 [Эта документация](ZD4_BACKEND_SPEC.md)
- 📝 Изменения в коде: **0 файлов изменено** (уже всё готово)

---

**Дата**: 22 января 2026  
**Статус**: ✅ Готово к интеграции с бэком

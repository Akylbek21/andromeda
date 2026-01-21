# 🚀 QUICK REFERENCE — ЗД №1-4 Cheat Sheet

**Сохраните эту страницу для быстрого доступа!**

---

## ⚡ TL;DR

### ЗД №1: Типы ошибок 400
```typescript
// Throw
throw new EmployeesConflictError(
  "Пользователь существует",
  400,
  { userId: 42, existingUser, conflictType: 'USER_EXISTS' }
)

// Catch
if (isEmployeesConflictError(error)) {
  console.log(error.conflictType) // 'USER_EXISTS'
}
```

### ЗД №2: Диалоги по сценариям
```typescript
const scenario = determineConflictScenario(error)
// 'USER_EXISTS' → ExistingUserDialog
// 'EMPLOYEE_EXISTS' → EmployeeExistsDialog
// 'UNKNOWN' → снэкбар ошибки
```

### ЗД №3: confirmExistingEmployee
```typescript
// ЗД №3 добавил alias
const confirmExistingEmployee = confirmExistingUser

await confirmExistingEmployee(42, formData)
  .then(() => refetch()) // success
  .catch(err => snackbar(err.message)) // 500 → диалог открыт
```

### ЗД №4: Готовность бэка
```json
// Бэк добавляет 3 поля в 400-ответ:
{
  "userId": 42,
  "existingUser": { "userId": 42, "firstName": "...", ... },
  "conflictType": "USER_EXISTS"
}
// Фронт автоматически всё покажет! ✨
```

---

## 📂 Где что лежит?

```
Types & Errors      → src/entities/employee/types.ts
API Functions       → src/entities/employee/api.ts
Conflict Routing    → src/features/employee-dialogs/conflict-utils.ts
Main Dialog         → src/features/employee-dialogs/CreateEmployeeDialog.tsx
Existing User       → src/features/employee-dialogs/ExistingUserDialog.tsx
Employee Exists     → src/features/employee-dialogs/EmployeeExistsDialog.tsx
```

---

## 🎯 Main Types

```typescript
// Error class
class EmployeesConflictError extends Error {
  status: number
  userId?: number
  existingUser?: ExistingUserInfo
  conflictType?: ConflictType
}

// Conflict types
type ConflictType = 'USER_EXISTS' | 'EMPLOYEE_EXISTS'

// User info
interface ExistingUserInfo {
  userId: number
  firstName: string
  lastName: string
  phoneNumber: string
  iin: string
}

// Type guard
function isEmployeesConflictError(error: unknown): error is EmployeesConflictError
```

---

## 🔧 Main Functions

### API Layer
```typescript
// ЗД №1: Обработка ошибок
function handleApiError(error: unknown, defaultMessage: string): never

// ЗД №3: Подтверждение пользователя
async function confirmExistingUser(userId: number, payload: CreateEmployeeRequest): Promise<Employee>

// ЗД №3: Alias
const confirmExistingEmployee = confirmExistingUser

// Отобрать номер и создать
async function takePhoneAndCreate(userId: number, payload: CreateEmployeeRequest): Promise<Employee>
```

### Dialog Utils (ЗД №2)
```typescript
// Определить сценарий (приоритет: conflictType → message → UNKNOWN)
function determineConflictScenario(error: unknown): ConflictScenario

// Проверить наличие данных
function hasValidExistingUserData(error: unknown): boolean
```

---

## 💡 Dialog Flow

```
CreateEmployeeDialog
    ↓
onSubmit() — createEmployee()
    ↓
[Catch EmployeesConflictError]
    ↓
determineConflictScenario() → scenario
hasValidExistingUserData() → hasData
    ↓
setConflictState({ scenario, existingUser, formData, errorMessage })
    ↓
Render:
    USER_EXISTS + hasData      → ExistingUserDialog с данными
    USER_EXISTS + !hasData     → ExistingUserDialog с ошибкой
    EMPLOYEE_EXISTS + hasData  → EmployeeExistsDialog с данными
    EMPLOYEE_EXISTS + !hasData → EmployeeExistsDialog с ошибкой
    UNKNOWN                    → snackbar ошибка
    ↓
User action:
    "Да, это он"              → handleExistingUserConfirm() или handleEmployeeExistsConfirm()
    "Отобрать номер"          → handleTakePhone()
    ↓
confirmExistingUser(userId, formData)
    200 OK → success snackbar, close, refetch
    500    → error snackbar, dialog open, user can retry
```

---

## 🧪 Что тестировать?

### ✅ Тест 1: USER_EXISTS с данными
```bash
1. Заполнить форму с номером конфликтующего пользователя
2. Нажать "Добавить"
3. Ожидается: ExistingUserDialog с данными
4. Нажать "Да, это он"
5. Ожидается: success, диалог закроется
```

### ✅ Тест 2: EMPLOYEE_EXISTS с данными
```bash
1. Заполнить форму с номером конфликтующего сотрудника
2. Нажать "Добавить"
3. Ожидается: EmployeeExistsDialog с данными
4. Нажать "Да, это он"
5. Ожидается: RefusalDialog откроется
```

### ✅ Тест 3: 500 ошибка при confirmExistingUser
```bash
1. В dialogе нажать "Да, это он"
2. Смоделировать 500 ошибку на бэке
3. Ожидается: error snackbar, диалог остаётся открыт
4. Пользователь может нажать кнопку ещё раз (retry)
```

### ✅ Тест 4: Отобрать номер (takePhoneAndCreate)
```bash
1. В dialogе нажать "Нет, это не он, отобрать номер"
2. Ожидается: новый сотрудник создан с этим номером
3. Диалоги закрываются, refetch запускается
```

---

## 🐛 Debug Tips

### Если диалог не показывается
```typescript
// 1. Проверить, что error является EmployeesConflictError
console.log(error instanceof EmployeesConflictError)

// 2. Проверить scenario
console.log(determineConflictScenario(error))

// 3. Проверить conflictState
console.log(conflictState)
```

### Если показывается неправильный диалог
```typescript
// Проверить приоритет определения
// Priority 1: conflictType (из бэка)
console.log(error.conflictType)
// Priority 2: message substring
console.log(error.message)
```

### Если данные не показываются
```typescript
// Проверить наличие existingUser
console.log(error.existingUser)

// Проверить валидацию
console.log(hasValidExistingUserData(error))

// Проверить, что все 3 поля есть: userId, firstName, lastName
```

### Если 500 ошибка крешит UI
```typescript
// Проверить, что в catch блоке:
// 1. Не очищаем conflictState
// 2. Не закрываем диалоги
// 3. Только показываем snackbar
```

---

## 🔄 Backend Integration Checklist

### Что нужно добавить на бэке?

- [ ] Enum `ConflictType` с `USER_EXISTS` и `EMPLOYEE_EXISTS`
- [ ] DTO `ExistingUserInfoDto` с userId, firstName, lastName, phoneNumber, iin
- [ ] Расширить `ErrorResponse` с userId, existingUser, conflictType
- [ ] Обновить exception handlers возвращать новые поля
- [ ] Протестировать 3 endpoints:
  - [ ] POST `/api/v1/employees` (create)
  - [ ] POST `/api/v1/employees/confirm-existing/{id}` (confirm)
  - [ ] POST `/api/v1/employees/take-phone-create/{id}` (take phone)

### Что вернуть в 200?

Остаётся как было — просто Employee DTO.

### Что вернуть в 400?

```json
{
  "error": "Bad Request",
  "message": "...",
  "status": 400,
  "timestamp": "...",
  "path": "/api/v1/employees",
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

### Что вернуть в 500?

```json
{
  "error": "Internal Server Error",
  "message": "...",
  "status": 500,
  "timestamp": "...",
  "path": "..."
}
```

---

## 📋 Commands

```bash
# Проверить ESLint
npx eslint src/entities/employee/ src/features/employee-dialogs/

# Исправить ESLint
npx eslint --fix src/entities/employee/ src/features/employee-dialogs/

# Проверить типы
npx tsc --noEmit

# Сборка
npm run build

# Предпросмотр production
npm run preview

# Разработка
npm run dev
```

---

## 🗂️ Документация Quick Links

| Файл | Для кого | Назначение |
|------|---------|-----------|
| [ALL_ZD_SUMMARY.md](ALL_ZD_SUMMARY.md) | Всем | 📊 General overview |
| [ERROR_HANDLING.md](ERROR_HANDLING.md) | Frontend | 🔍 Архитектура ошибок |
| [ZD2_CHANGES.md](ZD2_CHANGES.md) | Frontend | 🎨 Диалоги |
| [ZD3_INTEGRATION.ts](ZD3_INTEGRATION.ts) | Frontend | 💻 Примеры error handling |
| [BACKEND_IMPLEMENTATION_GUIDE.md](BACKEND_IMPLEMENTATION_GUIDE.md) | Backend | 🔧 Как реализовать |
| [ZD4_BACKEND_SPEC.md](ZD4_BACKEND_SPEC.md) | Backend | 📖 API spec |
| [README_DOCS.md](README_DOCS.md) | Всем | 🗺️ Navigation |

---

## ⚙️ Configuration

### Current Settings

```typescript
// vite.config.ts
VITE_PORT = 3000

// HTTP interceptor (shared/api/http.ts)
Token refresh: Automatic on 401
Queue-based: Multiple 401s → single refresh

// Theme (app/providers/AppProviders.tsx)
Primary: #F54264 (red)
Secondary: #FC8C1E (orange)
```

---

## 📞 Common Questions

**Q: Почему диалог не закрывается при 500 ошибке?**  
A: Это **по дизайну**! Пользователь может попробовать ещё раз. Смотрите `handleExistingUserConfirm()` catch блок.

**Q: Как различить USER_EXISTS от EMPLOYEE_EXISTS?**  
A: Используйте `error.conflictType` или `determineConflictScenario(error)`. Приоритет: conflictType → message matching.

**Q: Что если бэк не вернёт новые поля?**  
A: Всё равно будет работать! Используется fallback на message substring matching.

**Q: Нужно ли что-то менять в фронте для ЗД №4?**  
A: **НЕТ!** Фронт уже готов. Просто добавьте 3 поля на бэке.

**Q: Как протестировать локально?**  
A: Смотрите раздел "Что тестировать" выше. Или модифицируйте mock responses в dev mode.

---

## ✅ Final Checklist

- [ ] Прочитал этот файл (5 минут)
- [ ] Знаю где 6 основных файлов кода
- [ ] Знаю 4 основные функции (EmployeesConflictError, determineConflictScenario, confirmExistingUser, handleApiError)
- [ ] Знаю как работает dialog flow
- [ ] Знаю что тестировать
- [ ] Знаю что нужно на бэке

**Готов к работе! 🚀**

---

**Дата**: 22 января 2026  
**Версия**: 1.0  
**Статус**: ✅ Ready to use

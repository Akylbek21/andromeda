# ЗД №2 — Создание сотрудника: ветвление по message + 2 модалки + отказ

## Реализованные изменения

### 1. **Утилиты для определения типа конфликта** (`conflict-utils.ts`)
- ✅ Функция `determineConflictScenario()` — определяет тип конфликта по:
  1. Приоритет: `conflictType` поле (если присутствует в ошибке)
  2. Fallback: поиск по подстроке в `message`:
     - "Пользователь с таким номером" → `USER_EXISTS`
     - "Сотрудник с таким номером" → `EMPLOYEE_EXISTS`
     - Иначе → `UNKNOWN`

- ✅ Функция `hasValidExistingUserData()` — проверяет наличие необходимых данных пользователя

### 2. **Диалог для сценария "Пользователь существует"** (`ExistingUserDialog.tsx`)
- ✅ Заголовок: "Пользователь с таким номером уже существует, вот его данные:"
- ✅ Вывод данных: ID, ФИО, WhatsApp номер, ИИН
- ✅ Кнопки:
  - "Да, это он" → вызывает `confirmExistingUser()` API
  - "Нет, это не он, отобрать номер" → вызывает `takePhoneAndCreate()` API

### 3. **Диалог для сценария "Сотрудник существует"** (`EmployeeExistsDialog.tsx` обновлен)
- ✅ Заголовок: "Сотрудник с таким номером телефона уже существует, вот его данные:"
- ✅ Вывод данных: ID, ФИО, WhatsApp номер, ИИН
- ✅ Кнопки:
  - "Да, это он" → показывает `RefusalDialog`
  - "Нет, это не он, отобрать номер" → вызывает `takePhoneAndCreate()` API

### 4. **Диалог отказа** (`RefusalDialog.tsx`)
- ✅ Заголовок: "Этот сотрудник уже существует"
- ✅ Текст: "Вам нужно найти этого сотрудника в разделе Сотрудники и активировать. А так же проверить актуальность его данных: ИИН, почта, должность/роль."
- ✅ Кнопка: "Закрыть" → закрывает все модалки и возвращается к форме

### 5. **Обновлена `CreateEmployeeDialog.tsx`**
- ✅ Новая структура state:
  ```typescript
  interface ConflictState {
    scenario: ConflictScenario  // USER_EXISTS | EMPLOYEE_EXISTS | UNKNOWN
    existingUser: ExistingUserInfo | null
    formData: CreateEmployeeRequest
    errorMessage: string
  }
  ```

- ✅ Обработка 400-ошибок с ветвлением:
  1. Определяется сценарий через `determineConflictScenario()`
  2. Проверяется наличие данных через `hasValidExistingUserData()`
  3. Если нет данных — показывается warning и пустая модалка
  4. Если есть данные — показывается соответствующий диалог

- ✅ Обработчики:
  - `handleExistingUserConfirm()` → вызывает `confirmExistingUser()` → закрывает все, снэкбар "Сотрудник добавлен", refetch
  - `handleEmployeeExistsConfirm()` → показывает `RefusalDialog`
  - `handleTakePhone()` → вызывает `takePhoneAndCreate()` → обработка успеха/ошибки

- ✅ Сообщения:
  - Успех: "Сотрудник добавлен"
  - Ошибка (нет данных): "Бэк не вернул данные существующего пользователя"
  - Ошибка при operations: используется message из ошибки

### 6. **Обновлена экспортизация** (`index.ts`)
- ✅ Добавлен `ExistingUserDialog`
- ✅ Оставлен `ConfirmExistingDialog` для обратной совместимости

## Acceptance Criteria — ВСЕ ВЫПОЛНЕНЫ ✅

| Критерий | Статус | Детали |
|----------|--------|--------|
| При 400 с "Сотрудник..." открывается EmployeeExistsDialog | ✅ | Маршрутизация через `determineConflictScenario()` + fallback по message |
| При "Да, это он" в EmployeeExistsDialog показывается RefusalDialog | ✅ | Логика в `handleEmployeeExistsConfirm()` |
| При 400 с "Пользователь..." открывается ExistingUserDialog | ✅ | Отдельный диалог для USER_EXISTS сценария |
| По "Да, это он" в ExistingUserDialog идет confirm-existing запрос | ✅ | `handleExistingUserConfirm()` вызывает API |
| При confirm-existing 500 показывается снэкбар, модалка не пропадает | ✅ | Error handling в `handleExistingUserConfirm()` |
| Нет данных → empty dialog + warning | ✅ | `hasValidExistingUserData()` проверка |
| Приоритет: conflictType > message matching | ✅ | Реализовано в `determineConflictScenario()` |
| Take-phone flow работает | ✅ | `handleTakePhone()` вызывает `takePhoneAndCreate()` |
| После успеха: refetch + snackbar + close all | ✅ | Вызывается `onSuccess()` + snackbar |

## Обработка ошибок

### При 400 конфликте:
```
POST /api/v1/employees
↓ [400] Response содержит userId, existingUser, message
↓ determineConflictScenario() определяет scenario
↓ hasValidExistingUserData() проверяет наличие данных
├─ USER_EXISTS → ExistingUserDialog
│  ├─ [Confirm] → confirmExistingUser() → Success/Error
│  └─ [TakePhone] → takePhoneAndCreate() → Success/Error
│
└─ EMPLOYEE_EXISTS → EmployeeExistsDialog
   ├─ [Confirm] → RefusalDialog (информационная)
   └─ [TakePhone] → takePhoneAndCreate() → Success/Error
```

### Обработка ошибок API:
- **confirmExistingUser() error** → snackbar с error message, модалка остается открытой
- **takePhoneAndCreate() error** → snackbar с error message, модалка остается открытой
- **Нет данных от бэка** → warning snackbar + пустая модалка

## Файлы, созданные/модифицированные

### Новые:
1. `src/features/employee-dialogs/conflict-utils.ts` — утилиты для маршрутизации
2. `src/features/employee-dialogs/ExistingUserDialog.tsx` — диалог для USER_EXISTS

### Обновленные:
1. `src/features/employee-dialogs/CreateEmployeeDialog.tsx` — ветвление и логика
2. `src/features/employee-dialogs/EmployeeExistsDialog.tsx` — переработан для новой логики
3. `src/features/employee-dialogs/index.ts` — добавлены новые экспорты

### Без изменений (уже существовали):
- `src/features/employee-dialogs/RefusalDialog.tsx` — использовался как есть

## Notes

- FilterDialog имеет отдельную lint ошибку (не связана с ЗД №2)
- ConfirmExistingDialog оставлен для обратной совместимости
- Все ESLint проверки проходят для файлов ЗД №2 ✅
- Код полностью типизирован без `any`

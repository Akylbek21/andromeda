# AI Agent Instructions — my-react-app

## 🏗️ Архитектура

### 5-слойная структура (Feature-Sliced Design inspired)
1. **app/** — Инициализация: providers (MUI theme, Snackbar, Router), layout, routing, ProtectedRoute
2. **shared/** — Инфраструктура: Axios HTTP с refresh queue, tokens, хуки (useDebounce), утилиты (roleUtils)
3. **entities/** — Доменные модели: auth, employee, session (типы, API, Zustand сторы)
4. **features/** — UI фичи: employee-dialogs, auth-login (бизнес-логика + UI)
5. **pages/** — Композиция: собирают features + entities в полные экраны

### Критичные компоненты

**[src/shared/api/http.ts](src/shared/api/http.ts)** — Axios instance с интеллектуальным refresh механизмом:
- **401-handling**: единственный refresh, остальные 401-запросы ждут в очереди `failedQueue` (предотвращает race conditions при параллельных запросах)
- **AUTH_EXCLUDE**: `/api/v1/auth/send-code`, `/api/v1/auth/login`, `/api/v1/auth/refresh` — не имеют токена, не триггерят refresh
- **Критичный паттерн**: если refresh токена нет → `clearTokens()` + редирект на `/login` (предотвращает 401 loops)
- **Queue processing**: после успешного refresh все отложенные запросы повторяются с новым токеном

**[src/app/routes/ProtectedRoute.tsx](src/app/routes/ProtectedRoute.tsx)** — Auth guard с строгой последовательностью проверок:
- **Без токена** → редирект на `/login`, `loadMe()` НЕ вызывается (критично для предотвращения 401 loops)
- **С токеном** → вызывает `loadMe()` один раз → проверяет `requiredSections`/`requiredRoles` → рендерит 403 если нет доступа
- **Loading state**: показывает CircularProgress пока загружаются данные пользователя

**[src/entities/auth/store.ts](src/entities/auth/store.ts)** — Zustand store с localStorage persistence:
- `sendCode(phone)` → сохраняет `tempPhoneNumber` в localStorage (восстановление после перезагрузки)
- `login(phone, code)` → очищает `tempPhoneNumber` ТОЛЬКО после успешного логина
- `loadMe()` → вызывается только при наличии accessToken (guard в ProtectedRoute)
- **Паттерн**: все async actions → set loading → try/catch → set error/result

---

## 📋 Типовые паттерны

### HTTP + обработка ошибок
- Все API в entities (auth, employee, session) используют единый `http` из [src/shared/api](src/shared/api)
- [src/entities/employee/api.ts](src/entities/employee/api.ts) — специализированная обработка через `handleApiError()`:
  - **400 conflicts** → выбрасывает `EmployeesConflictError` с деталями: `{ userId, existingUser, conflictType }`
  - **500+ errors** → выбрасывает generic `Error`, диалог остаётся открытым для повтора (не auto-close)
- **Type guard**: используйте `isEmployeesConflictError(error)` для проверки типа ошибки в catch-блоках
- **Почему так**: UI показывает разные диалоги в зависимости от `conflictType` (USER_EXISTS/EMPLOYEE_EXISTS/UNKNOWN)

### Конфликты создания сотрудника (employee creation conflicts)
[src/features/employee-dialogs/CreateEmployeeDialog.tsx](src/features/employee-dialogs/CreateEmployeeDialog.tsx) использует `determineConflictScenario()` для маршрутизации:
- **USER_EXISTS** → ExistingUserDialog (выбор: использовать существующего пользователя или взять только телефон)
- **EMPLOYEE_EXISTS** → EmployeeExistsDialog (информационный диалог: сотрудник уже существует)
- **CONFLICT_UNCLEAR** → RefusalDialog (отказ без действия)

**Критичный flow**:
1. `createEmployee()` → 400 conflict → catch `EmployeesConflictError`
2. `determineConflictScenario(error)` → определяет сценарий (приоритет: `conflictType` field → message matching → UNKNOWN)
3. Открывает соответствующий диалог с данными `existingUser`
4. Пользователь выбирает действие → вызывает `confirmExistingEmployee()` или `takePhoneAndCreate()`
5. При ошибке (включая 500) диалог остаётся открытым для повтора

Детали: [src/features/employee-dialogs/ZD3_CHANGES.md](src/features/employee-dialogs/ZD3_CHANGES.md), типы: [src/entities/employee/types.ts](src/entities/employee/types.ts), архитектура: [src/entities/employee/ERROR_HANDLING.md](src/entities/employee/ERROR_HANDLING.md)

### UI/Формы
- **React Hook Form** + **Yup-валидация**: используйте `yupResolver(schema)` из `@hookform/resolvers/yup`
- **Snackbar**: `const { enqueueSnackbar } = useSnackbar(); enqueueSnackbar(msg, { variant: 'success'|'error'|'warning'|'info' })`
- **Форматирование телефонов**: `formatPhoneNumber()` в [src/pages/employees/utils.ts](src/pages/employees/utils.ts) (использует libphonenumber-js)
- **Иконки**: `@mui/icons-material` (Add, FilterList, MoreVert, Edit, Delete и т.д.)
- **MUI темы**: Primary #F54264 (красный), Secondary #FC8C1E (оранжевый) — НЕ изменять без согласования

### Пагинация & фильтры
- **[src/pages/employees/EmployeesPage.tsx](src/pages/employees/EmployeesPage.tsx)**: 
  - Дебаунс 400 мс через `useDebounce` для поиска (предотвращает частые запросы)
  - Пагинация 0-based: `{ page: 0, size: 10 }` (backend ожидает page с 0)
  - Фильтры: role (teacher/student), status (active/inactive)
- **[src/pages/MySessionsPage.tsx](src/pages/MySessionsPage.tsx)**: авто-фетч на mount, рефетч после удаления
- **[src/pages/AllSessionsPage.tsx](src/pages/AllSessionsPage.tsx)**: ленивая загрузка (только по кнопке + фильтр userId)

### Zustand сторы (только в entities/)
- Сторы ТОЛЬКО в entities (auth, employee, session), NOT в features или pages
- Экспортируются как хуки: `export const useAuthStore = create<AuthStore>(...)`
- **Структура**:
```typescript
export const useXStore = create<XStore>((set, get) => ({
  // State
  data: null,
  loading: false,
  error: null,
  
  // Actions
  fetchData: async () => {
    set({ loading: true, error: null })
    try {
      const result = await api.fetch()
      set({ data: result, loading: false })
    } catch (error) {
      set({ error: error.message, loading: false })
      throw error
    }
  }
}))
```
- **Паттерн**: все async actions → set loading → try/catch → set error/результат → always reset loading

---

## 🔧 Разработка

**Скрипты** (npm):
- `npm run dev` — Vite на порту 3000 с HMR, прокси `/api` на `https://api.andromedaedu.kz` (или env `VITE_API_BASE_URL`)
- `npm run build` — TypeScript check + Vite production build (в `dist/`)
- `npm run lint` — ESLint с автофиксом (`--fix`)
- `npm run preview` — Vite preview сборки (обслуживает статик из dist/)

**Окружение**:
- `.env.local`: `VITE_API_BASE_URL=http://localhost:8080` (для локальной разработки с backend)
- По умолчанию прокси на `https://api.andromedaedu.kz` (см. [vite.config.ts](vite.config.ts))
- Docker: `docker compose up -d --build` → приложение на http://127.0.0.1:8082 (nginx проксирует на Vite)

**Тема (MUI)**: 
- Primary: #F54264 (красный) — основной цвет бренда
- Secondary: #FC8C1E (оранжевый) — акцентный цвет
- Конфигурация: [src/app/providers/AppProviders.tsx](src/app/providers/AppProviders.tsx)
- НЕ изменять цвета без согласования!

**Маршруты** (React Router):
- `/login` — публичный (LoginPage + CodePage)
- `/` — ProtectedRoute → Dashboard
- `/employees` — ProtectedRoute (требует section: `employees`) → EmployeesPage
- `/my-sessions` — ProtectedRoute → MySessionsPage
- `/all-sessions` — ProtectedRoute → AllSessionsPage

---

## 🛠️ Ключевые потоки

**Логин** → sendCode(phone) → сохраняет phone в localStorage → login(phone, code) → сохраняет tokens → clearPhone → редирект на `/`

**Защита маршрутов** → ProtectedRoute проверяет token → если нет → `/login`, если есть → loadMe() один раз → проверяет requiredSections/requiredRoles → 403 если нет доступа

**401 Refresh** → запрос получит 401 → если isRefreshing=false → trigger refresh → добавить остальные запросы в queue → после refresh → processQueue → повторить все запросы

**Создание сотрудника с конфликтом**:
1. Попытка создания → `POST /api/v1/employees` → 400 EmployeesConflictError
2. Определение сценария → `determineConflictScenario(error)` → USER_EXISTS/EMPLOYEE_EXISTS/UNKNOWN
3. Открытие соответствующего диалога (ExistingUserDialog/EmployeeExistsDialog/RefusalDialog)
4. Действие пользователя → `confirmExistingEmployee(userId, payload)` или `takePhoneAndCreate(payload)`
5. При ошибке 500 → диалог остаётся открытым, пользователь может повторить

---

---

## 🔌 Критичные мелкие детали

### Tokens & localStorage
- `getAccessToken()` / `getRefreshToken()` / `setTokens()` / `clearTokens()` в [src/shared/api/tokens.ts](src/shared/api/tokens.ts)
- Временный номер телефона хранится как `tempPhoneNumber` в localStorage (для восстановления при перезагрузке)
- После успешного логина номер очищается (`localStorage.removeItem(PHONE_NUMBER_KEY)`)

### Zustand Store Pattern
**Только** в entities (auth, employee, session). Структура:
```typescript
export const useXStore = create<XStore>((set, get) => ({
  // State
  data: null,
  loading: false,
  error: null,
  
  // Actions
  fetchData: async () => { set({ loading: true }); ... }
}))
```

### Error Classes
- `EmployeesConflictError` — специальная ошибка 400 для конфликтов создания сотрудников
- Содержит `{ userId, existingUser, conflictType }` для определения сценария в UI

### API Versioning
- Все запросы идут на `/api/v1/**` (не изменяется вручную)
- Base URL из env: `VITE_API_BASE_URL` (по умолчанию `https://api.andromedaedu.kz`)

### Role & Section Access
- Роли: `head`, `director`, `admin`, `ADMIN` (в `User.roles: string[]`)
- Разделы: `admin`, `employees`, `mySessions` (в `User.sections: UserSections`)
- Проверка: `hasAnyRole(user, roles)` в [src/shared/utils/roleUtils.ts](src/shared/utils/roleUtils.ts)

---

## 📚 Документация
- [INDEX.md](INDEX.md) — Полный навигатор по ЗД и доками
- [src/entities/employee/ERROR_HANDLING.md](src/entities/employee/ERROR_HANDLING.md) — Архитектура обработки ошибок 400/500
- [src/features/employee-dialogs/ZD3_CHANGES.md](src/features/employee-dialogs/ZD3_CHANGES.md) — Детали создания сотрудников с конфликтами

# AI Agent Instructions — my-react-app

**Stack**: React 19 + TypeScript + Vite. UI — MUI v7, состояние — Zustand, формы — React Hook Form + Yup, HTTP — Axios, уведомления — notistack.

---

## 🏗️ Архитектура

### Слои
1. **app/**: Провайдеры (MUI theme, Snackbar, Router), layout, ProtectedRoute (гвард доступа)
2. **shared/**: Axios HTTP-клиент с рефреш-очередью, токены, хуки (useDebounce), утилиты
3. **entities/**: Доменные модели (auth, employee, session): типы, API, Zustand сторы
4. **features/**: Самостоятельные UI-модули (employee-dialogs, auth-login) с бизнес-логикой
5. **pages/**: Сборка фич + сторов в полные страницы (EmployeesPage, MySessionsPage и т.д.)

### Критичные компоненты

**[src/shared/api/http.ts](src/shared/api/http.ts)**: Axios-инстанс с перехватчиками:
- **401-handling**: один refresh, остальные 401-запросы ждут в очереди `failedQueue`
- **AUTH_EXCLUDE**: `/api/v1/auth/send-code`, `/api/v1/auth/login`, `/api/v1/auth/refresh` не имеют токена и не триггерят refresh
- Если refresh токена нет → clear + редирект на `/login`

**[src/app/routes/ProtectedRoute.tsx](src/app/routes/ProtectedRoute.tsx)**: Гвард маршрутов:
- Нет токена → редирект на `/login`, `loadMe()` не вызывается
- Есть токен → вызывает `loadMe()` один раз и проверяет `requiredSections`/`requiredRoles`

**[src/entities/auth/store.ts](src/entities/auth/store.ts)**: Zustand, хранит пользователя + временный телефон в localStorage:
- `sendCode(phone)` → сохраняет phone в localStorage + state
- `login(phone, code)` → очищает phone из localStorage
- `loadMe()` → вызывается только при наличии accessToken

---

## 📋 Типовые паттерны

### HTTP + API ошибки
- Все API в entities (auth, employee, session) используют единый `http` из `src/shared/api`
- Employees API нормализует ответы и дебаунсит ошибки через `handleApiError()` → выбрасывает `EmployeesConflictError` с деталями на 400
- 500+ ошибки — показывают snackbar, диалог остаётся открытым для повтора (требует явного закрытия)

### Конфликты создания сотрудника (Employees domain)
[src/features/employee-dialogs/CreateEmployeeDialog.tsx](src/features/employee-dialogs/CreateEmployeeDialog.tsx) использует `determineConflictScenario()`:
- `USER_EXISTS` → ExistingUserDialog (действие: confirmExistingUser / takePhoneAndCreate)
- `EMPLOYEE_EXISTS` → EmployeeExistsDialog (действие: confirmExistingEmployee)
- `CONFLICT_UNCLEAR` → RefusalDialog (закрытие без действия)

Детали в [src/features/employee-dialogs/ZD3_CHANGES.md](src/features/employee-dialogs/ZD3_CHANGES.md), типы в [src/entities/employee/types.ts](src/entities/employee/types.ts).

### UI/Формы
- React Hook Form + Yup-валидация (resolver: `yupResolver`)
- Snackbar: `const { enqueueSnackbar } = useSnackbar(); enqueueSnackbar(msg, { variant: 'success'|'error' })`
- Форматирование: `formatPhoneNumber()` в [src/pages/employees/utils.ts](src/pages/employees/utils.ts)
- Иконки из `@mui/icons-material` (Add, FilterList, MoreVert и т.д.)

### Пагинация & фильтры
- [src/pages/employees/EmployeesPage.tsx](src/pages/employees/EmployeesPage.tsx): дебаунс 400 мс (useDebounce), пагинация 0-based (page, size)
- [src/pages/MySessionsPage.tsx](src/pages/MySessionsPage.tsx): авто-фетч на mount, рефетч после удаления
- [src/pages/AllSessionsPage.tsx](src/pages/AllSessionsPage.tsx): ленивая загрузка (только по кнопке + фильтр userId)

---

## 🔧 Разработка

**Скрипты** (npm):
- `npm run dev` — Vite (порт 3000, HMR), прокси `/api` на `https://api.andromedaedu.kz`
- `npm run build` — TypeScript check + Vite production
- `npm run lint` — ESLint с автофиксом
- `npm run preview` — Vite preview сборки

**Env**:
- `.env.local`: `VITE_API_BASE_URL=http://localhost:8080` (по умолчанию — https://api.andromedaedu.kz)
- Docker: `docker compose up -d --build` → http://127.0.0.1:8082

**Тема**:
Primary #F54264 (красный), Secondary #FC8C1E (оранжевый) в [src/app/providers/AppProviders.tsx](src/app/providers/AppProviders.tsx)

---

## 📚 Документация
- [INDEX.md](INDEX.md) — Полный навигатор по ЗД и доками
- [src/entities/employee/ERROR_HANDLING.md](src/entities/employee/ERROR_HANDLING.md) — Архитектура обработки ошибок 400/500

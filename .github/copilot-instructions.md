# AI Agent Instructions for my-react-app

## Project Overview

**Type**: React HR Employee Management Application  
**Stack**: React 19 + TypeScript + Vite + Material-UI (v7)  
**State Management**: Zustand  
**Form Handling**: React Hook Form + Yup validation  
**HTTP Client**: Axios with token refresh interceptor  
**API**: RESTful backend with pagination support  
**Auth**: Phone-based SMS code authentication with JWT access/refresh tokens

## Architecture

### Folder Structure Philosophy
- `entities/` - Domain models (`employee/`, `auth/`, `session/`). Contains types, API calls, and Zustand store. **Single responsibility per entity**.
- `features/` - Feature-specific components (e.g., `employee-dialogs/`, `auth-login/`). Encapsulates business logic tied to one feature.
- `pages/` - Page-level routes. Compose entities and features, handle layout and navigation.
- `shared/` - Reusable across project: API client (`http.ts`), hooks (`useDebounce`), types, UI utilities (`roleUtils`).
- `app/` - App-level setup: providers (theme, snackbars), router, layout.

### Data Flow Pattern

1. **API Boundary** (`shared/api/http.ts`): Single Axios instance with interceptors for token refresh
2. **Entity API** (`entities/{name}/api.ts`): Normalize backend responses. Use `handleApiError()` helper for consistent error handling (400 → `EmployeesConflictError`, others → `Error`)
3. **Entity Store** (`entities/{name}/store.ts`): Zustand store manages state + side effects. **Actions fetch AND update state.** Check `loading` flag to prevent duplicate fetches.
4. **Page Component** (`pages/{name}/`): Consumes store, renders UI, calls handlers on user interaction. Never calls API directly—always through store.
5. **Feature Components** (`features/{name}/`): Isolated feature dialogs/modals. Handle local form state, call API endpoints or dispatch store actions.

**Example**: In `EmployeesPage`, the store's `fetchEmployees()` is called from `useEffect` when filters/pagination change. The page never directly calls the API—always through the store.

### Error Handling & Conflict Resolution (ЗД №1-3)

**Conflict Flow** for employee creation/updates (see `features/employee-dialogs/`):

1. API returns 400 with `ApiErrorResponse` containing `conflictType`, `existingUser`, `userId`
2. `EmployeesConflictError` thrown by `handleApiError()` in `entities/employee/api.ts`
3. `conflict-utils.ts` determines scenario: `USER_EXISTS` (user exists, not employee) or `EMPLOYEE_EXISTS` (already an employee)
4. Appropriate dialog shown (`ExistingUserDialog`, `EmployeeExistsDialog`, `RefusalDialog`)
5. User resolves via:
   - `confirmExistingUser(userId, payload)` → POST `/api/v1/employees/confirm-existing/{userId}` (link existing user to employee)
   - `takePhoneAndCreate(userId, payload)` → POST `/api/v1/employees/take-phone` (reassign phone number and create new)
   - Cancel and retry with different data

**Critical**: Dialog remains open on 500 errors—users can retry. Always show error message via snackbar but keep form accessible.

### Role-Based Access Control

**Roles**: `expert`, `head`, `director` (see `shared/utils/roleUtils.ts`)  
**Protected Routes**: Use `<ProtectedRoute requiredRoles={['head', 'director']}>` in `app/routes/AppRouter.tsx`  
**Check**: `hasAnyRole(user, requiredRoles)` returns true if user has ANY of the required roles  
**User data**: Stored in `auth` entity store after login, fetched via `getMe()` API

## Critical Developer Workflows

### Development
```bash
npm run dev      # Start Vite dev server with HMR (http://localhost:3000)
npm run build    # Compile TypeScript + bundle with Vite
npm run lint     # Run ESLint checks
npm run preview  # Preview production build locally
```

**Note**: Dev server runs on **port 3000** (configured in `vite.config.ts`), NOT the default Vite port 5173.

### API Proxy & Authentication
- **API Proxy**: `/api` requests are proxied to `https://yadro.andromedaedu.kz` in development (see `vite.config.ts`). This avoids CORS issues.
- **Auth Flow**: SMS code sent via `sendCode()` → user enters code → `login()` returns tokens → stored in localStorage
- Token refresh is **automatic** via `http.interceptors.response`. Failed requests with 401 are retried with a fresh token.
- Tokens stored in localStorage via `getAccessToken()`, `setTokens()`, `clearTokens()` from `shared/api/tokens.ts`.
- **Queue-based refresh**: Multiple simultaneous 401s trigger only ONE refresh request. Other requests wait in queue.
- On refresh failure: tokens cleared, user redirected to `/login` via `window.location.href`.
- **Auth endpoint exclusions**: Request interceptor skips adding `Authorization` header for `/auth/send-code`, `/auth/login`, `/auth/refresh`

### Component Type Safety

Always import types from entity index exports:
```typescript
import type { Employee, PageResponse } from '../../entities/employee'
import { useEmployeeStore } from '../../entities/employee'
```

### Form Validation Pattern

Use Yup schemas in `features/{feature}/schema.ts`, apply with `react-hook-form` + `@hookform/resolvers/yup`:
```typescript
const { control, handleSubmit, formState: { errors }, reset } = useForm({
  resolver: yupResolver(mySchema),
  defaultValues: { /* ... */ }
})
```

### UI Library

Material-UI v7 with Emotion styling. Theme configured in `app/providers/AppProviders.tsx`:
- Primary: `#F54264` (red), Secondary: `#FC8C1E` (orange)
- Use `<ThemeProvider>`, `<CssBaseline>`, `<SnackbarProvider>` at root

### Pagination & Search

DataGrid pagination in `pages/employees/EmployeesPage.tsx` uses 0-based pages. Search uses `useDebounce` hook (400ms delay) to avoid excessive API calls:
```typescript
const debouncedQuery = useDebounce(q, 400)
useEffect(() => { fetchEmployees() }, [page, size, debouncedQuery, ...])
```

### Session Management (ЗД №4)

Two pages manage user sessions:
- **MySessionsPage**: Current user's sessions via `getMySessions()`, `deleteMySession(sid)`, `deleteOtherSessions()`
- **AllSessionsPage**: Admin view of any user's sessions via `getUserSessions(userId)`, `deleteUserSession(userId, sid)`, `deleteUserSessions(userId)`

Pattern: Load sessions on demand (button click), show loading state, handle deletion with optimistic update + refetch on error.

### Phone Number Formatting

Use `libphonenumber-js` for phone validation and formatting:
```typescript
import { formatPhoneNumber } from './utils'  // Uses parsePhoneNumber from libphonenumber-js
```

## Conventions & Patterns

1. **Zustand Store Actions**: Include both fetch logic AND state updates. Store is single source of truth.
2. **API Response Normalization**: Backend may return `content`/`items` and `total`/`totalElements`. Normalize in entity API layer (see `getEmployees()` in `entities/employee/api.ts`).
3. **Error Handling**: Errors set on store. Pages display via `Alert` component. Network errors trigger snackbar notifications.
4. **Async Loading States**: All stores track `loading` boolean. Prevents duplicate fetches via `if (loading) return` check.
5. **Type Exports**: Always export types from `entities/{name}/index.ts` barrel file for consistency.
6. **Localization**: UI text is Russian (Cyrillic). Keep existing language in feature schemas and component labels.

## Key Files to Reference

- **API Setup**: [src/shared/api/http.ts](src/shared/api/http.ts) - Axios instance, token refresh interceptor
- **Entity Example**: [src/entities/employee/](src/entities/employee/) - Complete store + API pattern
- **Page Example**: [src/pages/employees/EmployeesPage.tsx](src/pages/employees/EmployeesPage.tsx) - DataGrid integration, pagination, search
- **Feature Example**: [src/features/employee-create/](src/features/employee-create/) - Form handling with Yup
- **Theme & Providers**: [src/app/providers/AppProviders.tsx](src/app/providers/AppProviders.tsx) - MUI theme, snackbars

## Common Tasks

### Adding a New Entity
1. Create `src/entities/{name}/` with `types.ts`, `api.ts`, `store.ts`, `index.ts`
2. Store fetches via API function, handles loading/error
3. Export types and store from `index.ts`

### Adding a New Page
1. Create `src/pages/{name}/` 
2. Consume entity store: `const { items, loading } = use{Entity}Store()`
3. Handle pagination/search via store setters

### Adding a Feature Dialog
1. Create `src/features/{feature-name}/` with component, schema, index
2. Use `react-hook-form` + Yup schema for validation
3. On submit: call entity API directly or dispatch store action
4. Close dialog and optionally refetch: `fetchEmployees()`

## Environment Setup

Create `.env.local` (not tracked):
```env
VITE_API_BASE_URL=http://localhost:8080
```

Build outputs to `dist/`. Source maps included in development.

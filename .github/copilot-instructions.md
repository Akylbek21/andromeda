# AI Agent Instructions for my-react-app

## Overview
- HR employee management frontend (Russian UI) on React 19 + TypeScript + Vite; uses MUI v7, Zustand, Axios, React Hook Form + Yup. Theme colors primary #F54264, secondary #FC8C1E (see [src/app/providers/AppProviders.tsx](src/app/providers/AppProviders.tsx)).
- Auth is SMS code → JWT (access/refresh) stored in localStorage; axios interceptors auto-refresh tokens with a queued retry flow.

## Architecture & Flow
- app/: global providers, router/layout; [src/app/routes/ProtectedRoute.tsx](src/app/routes/ProtectedRoute.tsx) gates children by presence of token and optional roles (legacy) and calls `loadMe()` only when a token exists.
- shared/: single axios instance with refresh queue and auth exclusions in [src/shared/api/http.ts](src/shared/api/http.ts); token helpers in [src/shared/api/tokens.ts](src/shared/api/tokens.ts); role utilities in [src/shared/utils/roleUtils.ts](src/shared/utils/roleUtils.ts); debounce, misc utils.
- entities/: domain types/api/store. Auth store handles sendCode/login/refresh/loadMe/logout, keeping temp phone in localStorage. Employee API centralizes conflict handling (`EmployeesConflictError` on 400) in [src/entities/employee/api.ts](src/entities/employee/api.ts); stores guard duplicate requests with `loading`. Session APIs live in [src/entities/session/api.ts](src/entities/session/api.ts).
- features/: dialogs/forms per feature using React Hook Form + yupResolver; employee conflict dialogs in [src/features/employee-dialogs/](src/features/employee-dialogs/) stay open on 500 so users can retry (see [src/features/employee-dialogs/ZD3_CHANGES.md](src/features/employee-dialogs/ZD3_CHANGES.md)).
- pages/: compose stores/features. [src/pages/employees/EmployeesPage.tsx](src/pages/employees/EmployeesPage.tsx) uses MUI DataGrid with 0-based pagination and 400ms `useDebounce` search. [src/pages/MySessionsPage.tsx](src/pages/MySessionsPage.tsx) auto-fetches on mount and refetches after deletes; [src/pages/AllSessionsPage.tsx](src/pages/AllSessionsPage.tsx) loads only after userId input + button click.
- Navigation visibility driven by user.sections (admin/employees/mySessions) from profile; see [src/pages/HomePage.tsx](src/pages/HomePage.tsx). Sidebar still filters menu by roles; sections are authoritative for new UI gating.

## Auth & Access Control
- Flow: `sendCode()` → `login()` → `setTokens()` → `loadMe()`; refresh failures clear tokens and redirect to `/login`. Token keys are `accessToken`/`refreshToken` in localStorage.
- ProtectedRoute redirects to `/login` if no token before calling `loadMe()`; while loading or user null shows spinner. Role checks use `hasAnyRole`; prefer section flags for visibility but keep role requirements aligned when using ProtectedRoute.

## Conventions & Patterns
- Keep API normalization/transforms inside entity APIs; pages should consume stores, not call APIs directly. Stores use `loading` guards to avoid duplicate fetches and expose error state for UI alerts/snackbars.
- Employee conflicts handled via `handleApiError` in [src/entities/employee/api.ts](src/entities/employee/api.ts) throwing EmployeesConflictError with conflict details; dialogs catch and stay open on error per [src/features/employee-dialogs/CreateEmployeeDialog.tsx](src/features/employee-dialogs/CreateEmployeeDialog.tsx).
- Use `formatPhoneNumber` util for phone display; keep Russian copy consistent with existing pages and dialogs. Reuse existing MUI theme/gradients for buttons/cards.

## Dev & Ops
- Commands: `npm run dev` (port 3000), `npm run build`, `npm run lint`, `npm run preview`.
- Env: `.env.local` with `VITE_API_BASE_URL=http://localhost:8080`; defaults to https://api.andromedaedu.kz.
- Dev proxy: `/api` → https://yadro.andromedaedu.kz (see [vite.config.ts](vite.config.ts)); avoid bypassing the shared http client/stores.
- Docker: `docker compose up -d --build`; app served at http://127.0.0.1:8082. Optional check: `docker compose exec frontend grep -r "localhost:8080" /usr/share/nginx/html || echo "OK"`.

## Key References
- HTTP/client & tokens: [src/shared/api/http.ts](src/shared/api/http.ts), [src/shared/api/tokens.ts](src/shared/api/tokens.ts)
- Auth domain: [src/entities/auth/store.ts](src/entities/auth/store.ts), [src/app/routes/ProtectedRoute.tsx](src/app/routes/ProtectedRoute.tsx)
- Employee domain: [src/entities/employee/api.ts](src/entities/employee/api.ts), [src/features/employee-dialogs/](src/features/employee-dialogs/)
- Sessions: [src/entities/session/api.ts](src/entities/session/api.ts), [src/pages/MySessionsPage.tsx](src/pages/MySessionsPage.tsx), [src/pages/AllSessionsPage.tsx](src/pages/AllSessionsPage.tsx)
- Navigation/sections: [src/pages/HomePage.tsx](src/pages/HomePage.tsx), [src/components/Sidebar.tsx](src/components/Sidebar.tsx)

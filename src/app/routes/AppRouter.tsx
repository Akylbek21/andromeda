import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { LoginPage, CodePage } from '../../features/auth-login'
import { HomePage } from '../../pages/HomePage'
import { EmployeesPage } from '../../pages/employees/EmployeesPage'
import { ProtectedRoute } from './ProtectedRoute'

const router = createBrowserRouter([
  // Публичные маршруты
  { path: '/login', element: <LoginPage /> },
  { path: '/login/code', element: <CodePage /> },
  
  // Защищенные маршруты
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <HomePage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/employees',
    element: (
      <ProtectedRoute>
        <EmployeesPage />
      </ProtectedRoute>
    ),
  },
  
  // Редирект всех неизвестных путей на /login
  { path: '*', element: <Navigate to="/login" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

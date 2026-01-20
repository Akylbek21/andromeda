import { Navigate, createBrowserRouter } from 'react-router-dom'
import { EmployeesPage } from '../pages/employees/EmployeesPage'
import { AppLayout } from './layout/AppLayout'

function LoginPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Страница входа (заглушка)</div>
    </div>
  )
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        path: '/',
        element: <Navigate to="/employees" replace />,
      },
      {
        path: '/employees',
        element: <EmployeesPage />,
      },
    ],
  },
])

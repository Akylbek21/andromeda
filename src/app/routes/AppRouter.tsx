import { Navigate, RouterProvider, createBrowserRouter } from 'react-router-dom'
import { EmployeesPage } from '../../pages/employees/EmployeesPage'

const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/employees" replace /> },
  { path: '/employees', element: <EmployeesPage /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

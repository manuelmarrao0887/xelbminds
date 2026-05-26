import { Navigate, createHashRouter } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { RouteGuard } from '@/components/layout/RouteGuard'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { SchedulePage } from '@/pages/SchedulePage'
import { StudentsPage } from '@/pages/StudentsPage'
import { FinancialPage } from '@/pages/FinancialPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { TeacherPage } from '@/pages/TeacherPage'
import { StudentAreaPage } from '@/pages/StudentAreaPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { LeadsPage } from '@/pages/LeadsPage'
import { CommunicationsPage } from '@/pages/CommunicationsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { LibraryPage } from '@/pages/LibraryPage'
import { GoalsPage } from '@/pages/GoalsPage'
import { PomodoroPage } from '@/pages/PomodoroPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { BillingPage } from '@/pages/BillingPage'
import type { Role } from '@/types'

export function homeForRole(role: Role): string {
  if (role === 'admin') return '/dashboard'
  if (role === 'teacher') return '/teacher'
  return '/student-area'
}

export const router = createHashRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RouteGuard><AppShell /></RouteGuard>,
    children: [
      { path: '/', element: <RoleHome /> },
      { path: '/dashboard', element: <RouteGuard roles={['admin', 'teacher']}><DashboardPage /></RouteGuard> },
      { path: '/schedule', element: <RouteGuard roles={['admin', 'teacher']}><SchedulePage /></RouteGuard> },
      { path: '/students', element: <RouteGuard roles={['admin']}><StudentsPage /></RouteGuard> },
      { path: '/financial', element: <RouteGuard roles={['admin']}><FinancialPage /></RouteGuard> },
      { path: '/expenses', element: <RouteGuard roles={['admin']}><ExpensesPage /></RouteGuard> },
      { path: '/leads', element: <RouteGuard roles={['admin']}><LeadsPage /></RouteGuard> },
      { path: '/communications', element: <RouteGuard roles={['admin']}><CommunicationsPage /></RouteGuard> },
      { path: '/reports', element: <RouteGuard roles={['admin']}><ReportsPage /></RouteGuard> },
      { path: '/teacher', element: <RouteGuard roles={['admin', 'teacher']}><TeacherPage /></RouteGuard> },
      { path: '/library', element: <RouteGuard roles={['admin', 'teacher']}><LibraryPage /></RouteGuard> },
      { path: '/student-area', element: <RouteGuard roles={['admin', 'student']}><StudentAreaPage /></RouteGuard> },
      { path: '/goals', element: <RouteGuard roles={['student']}><GoalsPage /></RouteGuard> },
      { path: '/pomodoro', element: <RouteGuard roles={['student']}><PomodoroPage /></RouteGuard> },
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/billing', element: <RouteGuard roles={['admin']}><BillingPage /></RouteGuard> },
      { path: '/settings', element: <RouteGuard roles={['admin']}><SettingsPage /></RouteGuard> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
])

function RoleHome() {
  const role = JSON.parse(localStorage.getItem('xelbminds.auth') || '{}')?.state?.user?.role as Role | undefined
  return <Navigate to={role ? homeForRole(role) : '/login'} replace />
}

import { Navigate, createHashRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { RouteGuard } from '@/components/layout/RouteGuard'
import { PageLoader } from '@/components/layout/PageLoader'
import { LoginPage } from '@/pages/LoginPage'
import type { Role } from '@/types'

const DashboardPage = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const SchedulePage = lazy(() => import('@/pages/SchedulePage').then(m => ({ default: m.SchedulePage })))
const StudentsPage = lazy(() => import('@/pages/StudentsPage').then(m => ({ default: m.StudentsPage })))
const FinancialPage = lazy(() => import('@/pages/FinancialPage').then(m => ({ default: m.FinancialPage })))
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage').then(m => ({ default: m.ExpensesPage })))
const TeacherPage = lazy(() => import('@/pages/TeacherPage').then(m => ({ default: m.TeacherPage })))
const StudentAreaPage = lazy(() => import('@/pages/StudentAreaPage').then(m => ({ default: m.StudentAreaPage })))
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })))
const LeadsPage = lazy(() => import('@/pages/LeadsPage').then(m => ({ default: m.LeadsPage })))
const CommunicationsPage = lazy(() => import('@/pages/CommunicationsPage').then(m => ({ default: m.CommunicationsPage })))
const ReportsPage = lazy(() => import('@/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const LibraryPage = lazy(() => import('@/pages/LibraryPage').then(m => ({ default: m.LibraryPage })))
const GoalsPage = lazy(() => import('@/pages/GoalsPage').then(m => ({ default: m.GoalsPage })))
const PomodoroPage = lazy(() => import('@/pages/PomodoroPage').then(m => ({ default: m.PomodoroPage })))
const NotificationsPage = lazy(() => import('@/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))
const BillingPage = lazy(() => import('@/pages/BillingPage').then(m => ({ default: m.BillingPage })))

export function homeForRole(role: Role): string {
  if (role === 'admin') return '/dashboard'
  if (role === 'teacher') return '/teacher'
  return '/student-area'
}

function L({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createHashRouter([
  { path: '/login', element: <LoginPage /> },
  {
    element: <RouteGuard><AppShell /></RouteGuard>,
    children: [
      { path: '/', element: <RoleHome /> },
      { path: '/dashboard', element: <RouteGuard roles={['admin', 'teacher']}><L><DashboardPage /></L></RouteGuard> },
      { path: '/schedule', element: <RouteGuard roles={['admin', 'teacher']}><L><SchedulePage /></L></RouteGuard> },
      { path: '/students', element: <RouteGuard roles={['admin']}><L><StudentsPage /></L></RouteGuard> },
      { path: '/financial', element: <RouteGuard roles={['admin']}><L><FinancialPage /></L></RouteGuard> },
      { path: '/expenses', element: <RouteGuard roles={['admin']}><L><ExpensesPage /></L></RouteGuard> },
      { path: '/leads', element: <RouteGuard roles={['admin']}><L><LeadsPage /></L></RouteGuard> },
      { path: '/communications', element: <RouteGuard roles={['admin']}><L><CommunicationsPage /></L></RouteGuard> },
      { path: '/reports', element: <RouteGuard roles={['admin']}><L><ReportsPage /></L></RouteGuard> },
      { path: '/teacher', element: <RouteGuard roles={['admin', 'teacher']}><L><TeacherPage /></L></RouteGuard> },
      { path: '/library', element: <RouteGuard roles={['admin', 'teacher']}><L><LibraryPage /></L></RouteGuard> },
      { path: '/student-area', element: <RouteGuard roles={['admin', 'student']}><L><StudentAreaPage /></L></RouteGuard> },
      { path: '/goals', element: <RouteGuard roles={['student']}><L><GoalsPage /></L></RouteGuard> },
      { path: '/pomodoro', element: <RouteGuard roles={['student']}><L><PomodoroPage /></L></RouteGuard> },
      { path: '/notifications', element: <L><NotificationsPage /></L> },
      { path: '/billing', element: <RouteGuard roles={['admin']}><L><BillingPage /></L></RouteGuard> },
      { path: '/settings', element: <RouteGuard roles={['admin']}><L><SettingsPage /></L></RouteGuard> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
])

function RoleHome() {
  const role = JSON.parse(localStorage.getItem('xelbminds.auth') || '{}')?.state?.user?.role as Role | undefined
  return <Navigate to={role ? homeForRole(role) : '/login'} replace />
}

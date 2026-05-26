import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'
import { homeForRole } from '@/routes/routes'
import type { Role } from '@/types'

type Props = { roles?: Role[]; children: ReactNode }

export function RouteGuard({ roles, children }: Props) {
  const user = useAuthStore(s => s.user)
  const location = useLocation()

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />
  }
  return <>{children}</>
}

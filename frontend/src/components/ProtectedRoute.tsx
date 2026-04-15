import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore, type Role } from '@/store/auth'
import { useMeQuery } from '@/hooks/useMeQuery'

type Props = {
  children: ReactNode
  roles?: Role[]
}

export function ProtectedRoute({ children, roles }: Props) {
  const location = useLocation()
  const { isPending, data } = useMeQuery()
  const user = useAuthStore((s) => s.user)

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center p-10 text-[var(--gray)]">
        Loading session…
      </div>
    )
  }

  const resolved = data ?? user
  if (!resolved) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(resolved.role)) {
    return <Navigate to="/access-denied" replace />
  }
  return children
}

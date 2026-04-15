import { useQuery } from '@tanstack/react-query'
import type { AuthUser } from '@/store/auth'

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async (): Promise<AuthUser | null> => {
      const res = await fetch('/api/auth/me', { credentials: 'include' })
      if (res.status === 401) return null
      if (!res.ok) throw new Error('auth/me failed')
      const data = (await res.json()) as { user: AuthUser }
      return data.user
    },
    retry: false,
  })
}

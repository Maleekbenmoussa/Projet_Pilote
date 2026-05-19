import { create } from 'zustand'

export type Role = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: Role
  avatarUrl?: string | null
}

type AuthState = {
  user: AuthUser | null
  setUser: (u: AuthUser | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}))

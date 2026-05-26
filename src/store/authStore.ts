import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authService } from '@/services/authService'
import type { Role, User } from '@/types'

type AuthState = {
  user: User | null
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginAs: (role: Role) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,
      login: async (email, password) => {
        set({ loading: true, error: null })
        try {
          const user = await authService.login(email, password)
          set({ user, loading: false })
        } catch (e) {
          set({ loading: false, error: e instanceof Error ? e.message : 'Erro no login' })
          throw e
        }
      },
      loginAs: async (role) => {
        set({ loading: true, error: null })
        try {
          const user = await authService.loginAs(role)
          set({ user, loading: false })
        } catch (e) {
          set({ loading: false, error: e instanceof Error ? e.message : 'Erro' })
          throw e
        }
      },
      logout: async () => {
        await authService.logout()
        set({ user: null, error: null })
      },
      clearError: () => set({ error: null })
    }),
    { name: 'xelbminds.auth' }
  )
)

import { create } from 'zustand'
import { uid } from '@/lib/utils'

export type ToastType = 'success' | 'error' | 'info'

type Toast = { id: string; type: ToastType; message: string }

type ToastState = {
  toasts: Toast[]
  push: (type: ToastType, message: string) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  push: (type, message) => {
    const id = uid('t-')
    set({ toasts: [...get().toasts, { id, type, message }] })
    setTimeout(() => get().remove(id), 3500)
  },
  remove: (id) => set({ toasts: get().toasts.filter(t => t.id !== id) })
}))

export const toast = {
  success: (msg: string) => useToastStore.getState().push('success', msg),
  error: (msg: string) => useToastStore.getState().push('error', msg),
  info: (msg: string) => useToastStore.getState().push('info', msg)
}

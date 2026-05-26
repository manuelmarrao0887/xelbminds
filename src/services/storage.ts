import { STORAGE_KEY } from '@/lib/constants'

type DataKey =
  | 'students' | 'payments' | 'lessons' | 'expenses'
  | 'leads' | 'materials' | 'extraClassRequests' | 'goals'
  | 'notifications' | 'commLogs' | 'settings'

function namespace(key: DataKey): string {
  return `${STORAGE_KEY}.${key}`
}

export const storage = {
  get<T>(key: DataKey): T | null {
    try {
      const raw = localStorage.getItem(namespace(key))
      if (!raw) return null
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  set<T>(key: DataKey, value: T): void {
    try {
      localStorage.setItem(namespace(key), JSON.stringify(value))
    } catch (e) {
      console.warn('storage.set failed', e)
    }
  },
  remove(key: DataKey): void {
    localStorage.removeItem(namespace(key))
  },
  reset(): void {
    const keys: DataKey[] = ['students', 'payments', 'lessons', 'expenses', 'leads', 'materials', 'extraClassRequests', 'goals', 'notifications', 'commLogs', 'settings']
    keys.forEach(k => localStorage.removeItem(namespace(k)))
  }
}

export type { DataKey }

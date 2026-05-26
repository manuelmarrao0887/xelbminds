import { storage } from './storage'
import { uid } from '@/lib/utils'
import type {
  Student, Payment, Lesson, Expense, Lead, Material,
  ExtraClassRequest, Goal, Notification, CommunicationLog, AppSettings
} from '@/types'
import { DEFAULT_SETTINGS } from '@/data/seed'

// Generic CRUD factory — same shape works for all collections.
function makeCrud<T extends { id: string }>(key: Parameters<typeof storage.get>[0]) {
  return {
    async list(): Promise<T[]> {
      return storage.get<T[]>(key) ?? []
    },
    async get(id: string): Promise<T | null> {
      const all = storage.get<T[]>(key) ?? []
      return all.find(x => x.id === id) ?? null
    },
    async create(data: Omit<T, 'id'> & { id?: string }): Promise<T> {
      const all = storage.get<T[]>(key) ?? []
      const created = { ...data, id: data.id ?? uid('x-') } as T
      storage.set(key, [...all, created])
      return created
    },
    async update(id: string, patch: Partial<T>): Promise<T | null> {
      const all = storage.get<T[]>(key) ?? []
      const idx = all.findIndex(x => x.id === id)
      if (idx === -1) return null
      const updated = { ...all[idx], ...patch }
      const next = [...all]
      next[idx] = updated
      storage.set(key, next)
      return updated
    },
    async remove(id: string): Promise<void> {
      const all = storage.get<T[]>(key) ?? []
      storage.set(key, all.filter(x => x.id !== id))
    },
    async replaceAll(items: T[]): Promise<void> {
      storage.set(key, items)
    }
  }
}

export const studentsService = makeCrud<Student>('students')
export const paymentsService = makeCrud<Payment>('payments')
export const lessonsService = makeCrud<Lesson>('lessons')
export const expensesService = makeCrud<Expense>('expenses')
export const leadsService = makeCrud<Lead>('leads')
export const materialsService = makeCrud<Material>('materials')
export const extraClassService = makeCrud<ExtraClassRequest>('extraClassRequests')
export const goalsService = makeCrud<Goal>('goals')
export const notificationsService = makeCrud<Notification>('notifications')
export const commLogsService = makeCrud<CommunicationLog>('commLogs')

export const settingsService = {
  async get(): Promise<AppSettings> {
    return storage.get<AppSettings>('settings') ?? DEFAULT_SETTINGS
  },
  async update(patch: Partial<AppSettings>): Promise<AppSettings> {
    const current = await settingsService.get()
    const next = { ...current, ...patch }
    storage.set('settings', next)
    return next
  }
}

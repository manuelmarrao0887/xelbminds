import { storage } from './storage'
import {
  genStudents, genPayments, genLessons, genExpenses,
  genLeads, genNotifications, genMaterials, genExtraClassRequests,
  genGoals, DEFAULT_SETTINGS
} from '@/data/seed'
import type {
  Student, Payment, Lesson, Expense, Lead, Material,
  ExtraClassRequest, Goal, Notification, CommunicationLog, AppSettings
} from '@/types'

/**
 * Bootstrap localStorage with seed data on first run.
 * Idempotent — won't overwrite existing data.
 */
export function ensureSeed(): void {
  if (!storage.get<Student[]>('students')) {
    const students = genStudents()
    storage.set('students', students)
    storage.set('payments', genPayments(students))
    storage.set('lessons', genLessons(students))
    storage.set('expenses', genExpenses())
    storage.set('leads', genLeads())
    storage.set('materials', genMaterials())
    storage.set('extraClassRequests', genExtraClassRequests())
    storage.set('goals', genGoals())
    storage.set<Notification[]>('notifications', [])
    storage.set<CommunicationLog[]>('commLogs', [])
    storage.set<AppSettings>('settings', DEFAULT_SETTINGS)
  }
}

export function resetDemo(): void {
  storage.reset()
  ensureSeed()
}

export function exportBackup(): Record<string, unknown> {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    students: storage.get<Student[]>('students') ?? [],
    payments: storage.get<Payment[]>('payments') ?? [],
    lessons: storage.get<Lesson[]>('lessons') ?? [],
    expenses: storage.get<Expense[]>('expenses') ?? [],
    leads: storage.get<Lead[]>('leads') ?? [],
    materials: storage.get<Material[]>('materials') ?? [],
    extraClassRequests: storage.get<ExtraClassRequest[]>('extraClassRequests') ?? [],
    goals: storage.get<Goal[]>('goals') ?? [],
    notifications: storage.get<Notification[]>('notifications') ?? [],
    commLogs: storage.get<CommunicationLog[]>('commLogs') ?? [],
    settings: storage.get<AppSettings>('settings') ?? DEFAULT_SETTINGS
  }
}

export function importBackup(data: Record<string, unknown>): void {
  if (Array.isArray(data.students)) storage.set('students', data.students)
  if (Array.isArray(data.payments)) storage.set('payments', data.payments)
  if (Array.isArray(data.lessons)) storage.set('lessons', data.lessons)
  if (Array.isArray(data.expenses)) storage.set('expenses', data.expenses)
  if (Array.isArray(data.leads)) storage.set('leads', data.leads)
  if (Array.isArray(data.materials)) storage.set('materials', data.materials)
  if (Array.isArray(data.extraClassRequests)) storage.set('extraClassRequests', data.extraClassRequests)
  if (Array.isArray(data.goals)) storage.set('goals', data.goals)
  if (Array.isArray(data.notifications)) storage.set('notifications', data.notifications)
  if (Array.isArray(data.commLogs)) storage.set('commLogs', data.commLogs)
  if (data.settings && typeof data.settings === 'object') storage.set('settings', data.settings as AppSettings)
}

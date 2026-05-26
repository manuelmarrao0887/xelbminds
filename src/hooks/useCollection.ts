import { useEffect, useState, useCallback } from 'react'
import {
  studentsService, paymentsService, lessonsService, expensesService,
  leadsService, materialsService, extraClassService, goalsService,
  notificationsService, commLogsService, settingsService
} from '@/services/domain'
import type {
  Student, Payment, Lesson, Expense, Lead, Material,
  ExtraClassRequest, Goal, Notification, CommunicationLog, AppSettings
} from '@/types'

/**
 * Factory that closes over the service once. The returned hook has a stable
 * reload reference (empty dep array), so useEffect runs exactly once per mount.
 */
function makeCollectionHook<T>(fetcher: () => Promise<T[]>) {
  return function useCollection(): [T[], () => Promise<void>, boolean] {
    const [data, setData] = useState<T[]>([])
    const [loading, setLoading] = useState(true)
    const reload = useCallback(async () => {
      setLoading(true)
      const next = await fetcher()
      setData(next)
      setLoading(false)
    }, [])
    useEffect(() => { void reload() }, [reload])
    return [data, reload, loading]
  }
}

export const useStudents = makeCollectionHook<Student>(() => studentsService.list())
export const usePayments = makeCollectionHook<Payment>(() => paymentsService.list())
export const useLessons = makeCollectionHook<Lesson>(() => lessonsService.list())
export const useExpenses = makeCollectionHook<Expense>(() => expensesService.list())
export const useLeads = makeCollectionHook<Lead>(() => leadsService.list())
export const useMaterials = makeCollectionHook<Material>(() => materialsService.list())
export const useExtraClasses = makeCollectionHook<ExtraClassRequest>(() => extraClassService.list())
export const useGoals = makeCollectionHook<Goal>(() => goalsService.list())
export const useNotifications = makeCollectionHook<Notification>(() => notificationsService.list())
export const useCommLogs = makeCollectionHook<CommunicationLog>(() => commLogsService.list())

export function useSettings(): [AppSettings | null, (patch: Partial<AppSettings>) => Promise<void>] {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  useEffect(() => { void settingsService.get().then(setSettings) }, [])
  const update = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await settingsService.update(patch)
    setSettings(next)
  }, [])
  return [settings, update]
}

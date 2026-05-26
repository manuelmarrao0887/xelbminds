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

function useService<T>(serviceList: () => Promise<T[]>): [T[], () => Promise<void>, boolean] {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const reload = useCallback(async () => {
    setLoading(true)
    setData(await serviceList())
    setLoading(false)
  }, [serviceList])
  useEffect(() => { void reload() }, [reload])
  return [data, reload, loading]
}

export const useStudents = () => useService<Student>(() => studentsService.list())
export const usePayments = () => useService<Payment>(() => paymentsService.list())
export const useLessons = () => useService<Lesson>(() => lessonsService.list())
export const useExpenses = () => useService<Expense>(() => expensesService.list())
export const useLeads = () => useService<Lead>(() => leadsService.list())
export const useMaterials = () => useService<Material>(() => materialsService.list())
export const useExtraClasses = () => useService<ExtraClassRequest>(() => extraClassService.list())
export const useGoals = () => useService<Goal>(() => goalsService.list())
export const useNotifications = () => useService<Notification>(() => notificationsService.list())
export const useCommLogs = () => useService<CommunicationLog>(() => commLogsService.list())

export function useSettings(): [AppSettings | null, (patch: Partial<AppSettings>) => Promise<void>] {
  const [settings, setSettings] = useState<AppSettings | null>(null)
  useEffect(() => { void settingsService.get().then(setSettings) }, [])
  const update = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await settingsService.update(patch)
    setSettings(next)
  }, [])
  return [settings, update]
}

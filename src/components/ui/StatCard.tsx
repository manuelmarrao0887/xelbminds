import type { ReactNode } from 'react'
import { Card } from './Card'

type Props = {
  label: string
  value: string | number
  hint?: string
  icon: ReactNode
  tone?: 'sage' | 'teal' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
}

const tones = {
  sage: 'bg-sage-50 text-sage-700',
  teal: 'bg-teal-50 text-teal-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  purple: 'bg-purple-50 text-purple-700'
}

export function StatCard({ label, value, hint, icon, tone = 'teal' }: Props) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-xs font-semibold text-ink-500 uppercase tracking-wide">{label}</div>
        <div className="text-2xl font-display font-bold text-ink-900 leading-tight truncate">{value}</div>
        {hint && <div className="text-xs text-ink-400 mt-0.5">{hint}</div>}
      </div>
    </Card>
  )
}

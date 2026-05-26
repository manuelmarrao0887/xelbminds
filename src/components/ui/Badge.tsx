import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'neutral' | 'sage' | 'teal' | 'success' | 'warning' | 'danger' | 'info' | 'purple'

const tones: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700',
  sage: 'bg-sage-50 text-sage-700',
  teal: 'bg-teal-50 text-teal-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-red-50 text-red-700',
  info: 'bg-blue-50 text-blue-700',
  purple: 'bg-purple-50 text-purple-700'
}

export function Badge({ tone = 'neutral', children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap', tones[tone], className)}>
      {children}
    </span>
  )
}

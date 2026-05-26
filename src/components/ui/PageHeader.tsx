import type { ReactNode } from 'react'

type Props = { title: string; subtitle?: string; action?: ReactNode }

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="flex items-end justify-between gap-4 mb-6 flex-wrap">
      <div>
        <h1 className="text-2xl font-display font-extrabold text-ink-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-ink-500 mt-1">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      {icon && <div className="text-ink-300 mb-4">{icon}</div>}
      <h3 className="font-display font-bold text-ink-800 mb-1">{title}</h3>
      {description && <p className="text-sm text-ink-500 mb-4 max-w-md">{description}</p>}
      {action}
    </div>
  )
}

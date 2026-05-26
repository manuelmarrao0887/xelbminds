import { cn } from '@/lib/utils'

type Tab<T extends string> = { value: T; label: string; count?: number }

type Props<T extends string> = {
  tabs: Tab<T>[]
  value: T
  onChange: (value: T) => void
}

export function Tabs<T extends string>({ tabs, value, onChange }: Props<T>) {
  return (
    <div className="flex gap-1 border-b border-ink-200 overflow-x-auto" role="tablist">
      {tabs.map(t => {
        const active = t.value === value
        return (
          <button
            key={t.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(t.value)}
            className={cn(
              'px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap cursor-pointer -mb-px border-b-2',
              active
                ? 'text-teal-700 border-teal-600'
                : 'text-ink-500 border-transparent hover:text-ink-800'
            )}
          >
            {t.label}
            {typeof t.count === 'number' && (
              <span className={cn('ml-1.5 px-1.5 rounded-full text-[10px]', active ? 'bg-teal-100 text-teal-700' : 'bg-ink-100 text-ink-500')}>
                {t.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

type Props = { value: number; max: number; tone?: 'teal' | 'sage' | 'success' | 'danger' | 'warning' | 'info' | 'purple'; height?: number }

const tones = {
  teal: 'bg-teal-500',
  sage: 'bg-sage-500',
  success: 'bg-emerald-500',
  danger: 'bg-red-500',
  warning: 'bg-amber-500',
  info: 'bg-blue-500',
  purple: 'bg-purple-500'
}

export function ProgressBar({ value, max, tone = 'teal', height = 8 }: Props) {
  const pct = Math.min(Math.max((value / Math.max(max, 1)) * 100, 0), 100)
  return (
    <div className="w-full bg-ink-100 rounded-full overflow-hidden" style={{ height }}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${tones[tone]}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  )
}

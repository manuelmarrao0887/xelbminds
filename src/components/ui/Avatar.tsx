import { hueFromString, initials } from '@/lib/utils'

type Props = { name: string; size?: number; className?: string }

export function Avatar({ name, size = 36, className = '' }: Props) {
  const hue = hueFromString(name)
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `hsl(${hue}, 42%, 62%)`,
        fontSize: size * 0.38
      }}
      className={`rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
      aria-label={name}
    >
      {initials(name)}
    </div>
  )
}

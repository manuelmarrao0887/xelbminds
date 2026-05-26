type Props = { size?: 'sm' | 'md' | 'lg'; withTagline?: boolean }

const sizes = {
  sm: { img: 28, title: 'text-base', tag: 'text-[8px]' },
  md: { img: 36, title: 'text-lg', tag: 'text-[9px]' },
  lg: { img: 56, title: 'text-2xl', tag: 'text-[10px]' }
}

export function Logo({ size = 'md', withTagline = true }: Props) {
  const s = sizes[size]
  return (
    <div className="flex items-center gap-3">
      <img
        src={`${import.meta.env.BASE_URL}logo.png`}
        alt="XelbMinds"
        width={s.img}
        height={s.img}
        className="shrink-0"
      />
      <div className="leading-tight">
        <div className={`font-display font-extrabold tracking-tight ${s.title}`}>
          <span className="text-sage-600">Xelb</span>
          <span className="text-teal-700">Minds</span>
        </div>
        {withTagline && (
          <div className={`uppercase tracking-[0.18em] text-ink-400 ${s.tag} mt-0.5`}>
            Aprender &amp; Crescer
          </div>
        )}
      </div>
    </div>
  )
}

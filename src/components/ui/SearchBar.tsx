import { Search } from 'lucide-react'

type Props = { value: string; onChange: (v: string) => void; placeholder?: string }

export function SearchBar({ value, onChange, placeholder = 'Pesquisar...' }: Props) {
  return (
    <div className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-ink-200 bg-white text-sm outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
      />
    </div>
  )
}

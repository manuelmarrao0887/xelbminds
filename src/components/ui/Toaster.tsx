import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { cn } from '@/lib/utils'

const iconByType = {
  success: <CheckCircle2 size={18} className="text-emerald-600" />,
  error: <AlertCircle size={18} className="text-red-600" />,
  info: <Info size={18} className="text-teal-600" />
}

const tone = {
  success: 'border-emerald-200 bg-emerald-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-teal-200 bg-teal-50'
}

export function Toaster() {
  const toasts = useToastStore(s => s.toasts)
  const remove = useToastStore(s => s.remove)

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" role="status" aria-live="polite">
      {toasts.map(t => (
        <div
          key={t.id}
          className={cn('flex items-center gap-3 pl-3 pr-2 py-3 rounded-xl border shadow-soft animate-slide-up', tone[t.type])}
        >
          {iconByType[t.type]}
          <span className="text-sm text-ink-800 flex-1">{t.message}</span>
          <button onClick={() => remove(t.id)} className="p-1 rounded-md text-ink-400 hover:bg-white cursor-pointer">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Bell, LogOut, Menu, RefreshCw } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Avatar, Button } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { notificationsService } from '@/services/domain'
import { genNotifications } from '@/data/seed'
import { storage } from '@/services/storage'
import { resetDemo } from '@/services/db'
import { formatDateTime } from '@/lib/utils'
import { homeForRole } from '@/routes/routes'
import type { Notification } from '@/types'

type Props = { onMenuClick?: () => void }

export function Topbar({ onMenuClick }: Props) {
  const user = useAuthStore(s => s.user)!
  const logout = useAuthStore(s => s.logout)
  const navigate = useNavigate()
  const location = useLocation()
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    void (async () => {
      let all = await notificationsService.list()
      const mine = all.filter(n => n.userId === user.id)
      if (mine.length === 0) {
        const seed = genNotifications(user.id, user.role)
        await Promise.all(seed.map(n => notificationsService.create(n)))
        all = await notificationsService.list()
      }
      setNotifs(all.filter(n => n.userId === user.id))
    })()
  }, [user.id, user.role, location.pathname])

  const unread = notifs.filter(n => !n.read).length

  const markRead = async (id: string) => {
    await notificationsService.update(id, { read: true })
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const handleReset = () => {
    if (!confirm('Repor todos os dados demo? Vai perder alterações feitas.')) return
    resetDemo()
    storage.remove('notifications')
    toast.success('Demo reposto. A recarregar...')
    setTimeout(() => window.location.reload(), 600)
  }

  const handleLogout = async () => {
    await logout()
    toast.info('Sessão terminada')
    navigate('/login', { replace: true })
  }

  const roleLabel = user.role === 'admin' ? 'Administrador' : user.role === 'teacher' ? 'Professor' : 'Encarregado'

  return (
    <header className="h-16 bg-white border-b border-ink-100 sticky top-0 z-30 flex items-center px-4 lg:px-6 gap-3">
      <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-ink-100 cursor-pointer" aria-label="Menu">
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={handleReset}>
        <span className="hidden md:inline">Reset demo</span>
      </Button>

      <div className="relative">
        <button
          onClick={() => setOpen(v => !v)}
          className="relative p-2 rounded-xl hover:bg-ink-100 cursor-pointer text-ink-600"
          aria-label="Notificações"
        >
          <Bell size={18} />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 mt-2 w-80 bg-white border border-ink-200 rounded-2xl shadow-pop z-50 overflow-hidden animate-slide-up">
              <div className="px-4 py-3 border-b border-ink-100 flex items-center justify-between">
                <h4 className="font-display font-bold text-ink-900">Notificações</h4>
                <button
                  className="text-xs text-teal-600 hover:underline cursor-pointer"
                  onClick={() => { setOpen(false); navigate('/notifications') }}
                >
                  Ver todas
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifs.length === 0 ? (
                  <div className="p-6 text-center text-sm text-ink-400">Sem notificações</div>
                ) : (
                  notifs.slice(0, 5).map(n => (
                    <button
                      key={n.id}
                      onClick={() => { markRead(n.id); if (n.link) navigate(n.link); setOpen(false) }}
                      className="w-full text-left px-4 py-3 hover:bg-ink-50 border-b border-ink-50 last:border-0 cursor-pointer"
                    >
                      <div className="flex items-start gap-2">
                        <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${n.read ? 'bg-ink-200' : 'bg-teal-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ink-800 truncate">{n.title}</div>
                          <div className="text-xs text-ink-500 line-clamp-2">{n.body}</div>
                          <div className="text-[10px] text-ink-400 mt-1">{formatDateTime(n.createdAt)}</div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <button
        onClick={() => navigate(homeForRole(user.role))}
        className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-xl hover:bg-ink-50 cursor-pointer"
      >
        <Avatar name={user.name} size={32} />
        <div className="hidden md:block text-left leading-tight">
          <div className="text-sm font-semibold text-ink-900">{user.name}</div>
          <div className="text-[11px] text-ink-500">{roleLabel}</div>
        </div>
      </button>

      <Button variant="ghost" size="sm" onClick={handleLogout} leftIcon={<LogOut size={14} />}>
        <span className="hidden md:inline">Sair</span>
      </Button>
    </header>
  )
}

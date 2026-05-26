import { Card, PageHeader, Badge, EmptyState, Button } from '@/components/ui'
import { useNotifications } from '@/hooks/useCollection'
import { notificationsService } from '@/services/domain'
import { useAuthStore } from '@/store/authStore'
import { formatDateTime } from '@/lib/utils'
import { toast } from '@/store/toastStore'
import { Bell, CheckCheck } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const tones = {
  payment: 'warning',
  lesson: 'info',
  absence: 'danger',
  message: 'teal',
  system: 'sage'
} as const

export function NotificationsPage() {
  const user = useAuthStore(s => s.user)!
  const [all, reload] = useNotifications()
  const mine = all.filter(n => n.userId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  const navigate = useNavigate()

  const markAllRead = async () => {
    await Promise.all(mine.filter(n => !n.read).map(n => notificationsService.update(n.id, { read: true })))
    toast.success('Tudo marcado como lido')
    await reload()
  }

  return (
    <div>
      <PageHeader
        title="Notificações"
        subtitle={`${mine.filter(n => !n.read).length} por ler de ${mine.length}`}
        action={
          mine.some(n => !n.read) ? (
            <Button variant="outline" leftIcon={<CheckCheck size={14} />} onClick={markAllRead}>Marcar tudo lido</Button>
          ) : undefined
        }
      />

      {mine.length === 0 ? (
        <EmptyState icon={<Bell size={48} />} title="Sem notificações" description="Quando houver atividade aparecerá aqui" />
      ) : (
        <div className="space-y-2">
          {mine.map(n => (
            <Card
              key={n.id}
              hover={!!n.link}
              onClick={n.link ? async () => {
                await notificationsService.update(n.id, { read: true })
                navigate(n.link!)
              } : undefined}
              className={n.read ? '' : 'border-l-4 border-l-teal-500'}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge tone={tones[n.type]}>{n.type}</Badge>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500" />}
                  </div>
                  <h4 className="font-semibold text-ink-900 mb-0.5">{n.title}</h4>
                  <p className="text-sm text-ink-600">{n.body}</p>
                </div>
                <div className="text-xs text-ink-400 whitespace-nowrap">{formatDateTime(n.createdAt)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

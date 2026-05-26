import { useMemo, useState } from 'react'
import { Send, MessageCircle, Mail, Phone, Copy } from 'lucide-react'
import {
  Card, CardHeader, PageHeader, Button, Modal, Select, Textarea, Badge, Avatar, EmptyState
} from '@/components/ui'
import { useStudents, useCommLogs } from '@/hooks/useCollection'
import { commLogsService } from '@/services/domain'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { GRADES, SUBJECTS } from '@/lib/constants'
import { formatDateTime, uid } from '@/lib/utils'
import type { Student } from '@/types'

const TEMPLATES = [
  { id: 'reminder-class', label: 'Lembrete de aula', body: 'Olá {{NOME}}! 👋\nLembrete da aula de hoje às {{HORA}} de {{DISCIPLINA}}.\nAté já! — XelbMinds' },
  { id: 'exam-prep', label: 'Preparação para teste', body: 'Olá {{NOME}}!\nQueremos relembrar que se aproxima o teste de {{DISCIPLINA}}. Vamos focar na preparação nas próximas aulas. Boa sorte! 🍀\nXelbMinds' },
  { id: 'holiday', label: 'Aviso de pausa', body: 'Caros pais e alunos,\nO centro estará encerrado na próxima semana devido a {{MOTIVO}}. As aulas serão retomadas dia {{DATA}}.\nObrigado! — XelbMinds' },
  { id: 'general', label: 'Mensagem geral', body: 'Olá! 👋\n{{MENSAGEM}}\nObrigado! — XelbMinds' }
]

export function CommunicationsPage() {
  const user = useAuthStore(s => s.user)!
  const [students] = useStudents()
  const [logs, reload] = useCommLogs()
  const [open, setOpen] = useState(false)

  const [audience, setAudience] = useState<'all' | 'grade' | 'subject' | 'debtors'>('all')
  const [filter, setFilter] = useState('')
  const [channel, setChannel] = useState<'whatsapp' | 'email' | 'sms'>('whatsapp')
  const [body, setBody] = useState(TEMPLATES[0].body)
  const [templateId, setTemplateId] = useState(TEMPLATES[0].id)

  const recipients = useMemo(() => {
    const active = students.filter(s => s.status === 'ativo')
    if (audience === 'grade') return active.filter(s => s.grade === filter)
    if (audience === 'subject') return active.filter(s => s.subjects.includes(filter))
    return active
  }, [students, audience, filter])

  const setTemplate = (id: string) => {
    setTemplateId(id)
    const t = TEMPLATES.find(t => t.id === id)
    if (t) setBody(t.body)
  }

  const send = async () => {
    if (recipients.length === 0) { toast.error('Sem destinatários'); return }
    await commLogsService.create({
      id: uid('c-'),
      audience: `${audience}${filter ? ` (${filter})` : ''}`,
      channel,
      subject: TEMPLATES.find(t => t.id === templateId)?.label ?? 'Geral',
      body,
      recipientCount: recipients.length,
      sentAt: new Date().toISOString(),
      sentBy: user.name
    })
    toast.success(`Enviado para ${recipients.length} destinatários (demo)`)
    setOpen(false)
    await reload()
  }

  const openWhatsAppLink = (s: Student) => {
    const phone = s.parentPhone.replace(/\D/g, '')
    const personalizedBody = body.replace(/{{NOME}}/g, s.name.split(' ')[0])
    window.open(`https://wa.me/351${phone}?text=${encodeURIComponent(personalizedBody)}`, '_blank')
  }

  return (
    <div>
      <PageHeader
        title="Centro de Comunicações"
        subtitle="Envio em massa por WhatsApp, email ou SMS"
        action={<Button leftIcon={<Send size={16} />} onClick={() => setOpen(true)}>Nova Campanha</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Card><CardHeader title="Campanhas" /><div className="text-3xl font-display font-extrabold text-teal-700">{logs.length}</div><div className="text-xs text-ink-500">total enviadas</div></Card>
        <Card><CardHeader title="Destinatários" /><div className="text-3xl font-display font-extrabold text-sage-700">{logs.reduce((a, l) => a + l.recipientCount, 0)}</div><div className="text-xs text-ink-500">acumulado</div></Card>
        <Card><CardHeader title="Canal preferido" /><div className="text-3xl font-display font-extrabold text-purple-700">{channel}</div></Card>
      </div>

      <Card>
        <CardHeader title="Histórico de envios" />
        {logs.length === 0 ? (
          <EmptyState icon={<Send size={48} />} title="Sem campanhas" description="Crie a primeira campanha com o botão acima" />
        ) : (
          <div className="divide-y divide-ink-100">
            {logs.slice().reverse().map(l => (
              <div key={l.id} className="py-3">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge tone={l.channel === 'whatsapp' ? 'success' : l.channel === 'email' ? 'info' : 'purple'}>
                      {l.channel === 'whatsapp' ? <MessageCircle size={11} /> : l.channel === 'email' ? <Mail size={11} /> : <Phone size={11} />} {l.channel}
                    </Badge>
                    <span className="font-semibold text-sm">{l.subject}</span>
                  </div>
                  <span className="text-xs text-ink-400">{formatDateTime(l.sentAt)}</span>
                </div>
                <div className="text-xs text-ink-500">Audiência: {l.audience} · {l.recipientCount} destinatários · por {l.sentBy}</div>
                <div className="text-xs text-ink-700 mt-1.5 italic line-clamp-2">"{l.body}"</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova Campanha"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={send} leftIcon={<Send size={14} />}>Enviar para {recipients.length}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase text-ink-500 block mb-2">Canal</label>
            <div className="flex gap-2">
              {(['whatsapp', 'email', 'sms'] as const).map(c => (
                <button
                  key={c}
                  onClick={() => setChannel(c)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold border cursor-pointer transition ${channel === c ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-ink-700 border-ink-200 hover:border-teal-300'}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase text-ink-500 block mb-2">Audiência</label>
            <div className="grid grid-cols-2 gap-2">
              {([['all', 'Todos os alunos'], ['grade', 'Por ano escolar'], ['subject', 'Por disciplina'], ['debtors', 'Devedores']] as const).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => { setAudience(k); setFilter('') }}
                  className={`p-2.5 rounded-xl text-xs font-semibold border cursor-pointer transition text-left ${audience === k ? 'bg-sage-100 text-sage-800 border-sage-300' : 'bg-white text-ink-700 border-ink-200 hover:border-sage-300'}`}
                >
                  {l}
                </button>
              ))}
            </div>
            {audience === 'grade' && (
              <Select value={filter} onChange={e => setFilter(e.target.value)} className="mt-2">
                <option value="">— escolha ano —</option>
                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
              </Select>
            )}
            {audience === 'subject' && (
              <Select value={filter} onChange={e => setFilter(e.target.value)} className="mt-2">
                <option value="">— escolha disciplina —</option>
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            )}
            <div className="mt-2 text-xs text-ink-500">{recipients.length} destinatário(s) selecionado(s)</div>
          </div>

          <Select label="Template" value={templateId} onChange={e => setTemplate(e.target.value)}>
            {TEMPLATES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </Select>

          <Textarea label="Mensagem" rows={6} value={body} onChange={e => setBody(e.target.value)} />

          <div className="bg-ink-50 p-3 rounded-xl">
            <div className="text-[10px] font-bold uppercase text-ink-500 mb-2">Pré-visualização dos primeiros 5 destinatários</div>
            <div className="space-y-1">
              {recipients.slice(0, 5).map(s => (
                <div key={s.id} className="flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Avatar name={s.name} size={20} />
                    <span>{s.name}</span>
                  </div>
                  {channel === 'whatsapp' && (
                    <Button size="sm" variant="ghost" leftIcon={<Copy size={10} />} onClick={() => openWhatsAppLink(s)}>Testar WA</Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}

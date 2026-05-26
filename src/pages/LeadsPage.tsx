import { useMemo, useState } from 'react'
import { Plus, MessageCircle, ArrowRight, Trash2 } from 'lucide-react'
import {
  Card, CardHeader, PageHeader, Button, Modal, Input, Select, Textarea, Badge, Avatar
} from '@/components/ui'
import { useLeads } from '@/hooks/useCollection'
import { leadsService } from '@/services/domain'
import { toast } from '@/store/toastStore'
import { SUBJECTS, GRADES } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Lead, LeadStage } from '@/types'

const STAGES: LeadStage[] = ['Interessado', 'Aula experimental', 'Inscrito', 'Desistiu']

const STAGE_STYLES: Record<LeadStage, { bg: string; text: string; tone: 'info' | 'warning' | 'success' | 'neutral' }> = {
  'Interessado': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', tone: 'info' },
  'Aula experimental': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', tone: 'warning' },
  'Inscrito': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', tone: 'success' },
  'Desistiu': { bg: 'bg-ink-50 border-ink-200', text: 'text-ink-500', tone: 'neutral' }
}

export function LeadsPage() {
  const [leads, reload] = useLeads()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Omit<Lead, 'id' | 'createdAt'>>({
    name: '', phone: '', email: '', source: 'Recomendação', subject: SUBJECTS[0], grade: '5º Ano', stage: 'Interessado', notes: ''
  })

  const byStage = useMemo(() => {
    const m: Record<LeadStage, Lead[]> = { 'Interessado': [], 'Aula experimental': [], 'Inscrito': [], 'Desistiu': [] }
    leads.forEach(l => m[l.stage].push(l))
    return m
  }, [leads])

  const advanceStage = async (lead: Lead) => {
    const idx = STAGES.indexOf(lead.stage)
    if (idx < STAGES.length - 2) {
      const next = STAGES[idx + 1]
      await leadsService.update(lead.id, { stage: next })
      toast.success(`${lead.name} → ${next}`)
      await reload()
    }
  }

  const moveTo = async (lead: Lead, stage: LeadStage) => {
    await leadsService.update(lead.id, { stage })
    toast.success('Lead movido')
    await reload()
  }

  const save = async () => {
    if (!form.name || !form.phone) { toast.error('Nome e telefone obrigatórios'); return }
    await leadsService.create({ ...form, createdAt: new Date().toISOString().slice(0, 10) })
    toast.success('Lead adicionado!')
    setOpen(false)
    setForm({ name: '', phone: '', email: '', source: 'Recomendação', subject: SUBJECTS[0], grade: '5º Ano', stage: 'Interessado', notes: '' })
    await reload()
  }

  const remove = async (id: string) => {
    if (!confirm('Eliminar lead?')) return
    await leadsService.remove(id)
    await reload()
  }

  const conversionRate = leads.length ? Math.round(byStage['Inscrito'].length / leads.length * 100) : 0

  return (
    <div>
      <PageHeader
        title="Leads / CRM"
        subtitle={`${leads.length} leads · ${conversionRate}% conversão`}
        action={<Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Novo Lead</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
        {STAGES.map(stage => (
          <Card key={stage} className={`${STAGE_STYLES[stage].bg} border`}>
            <div className={`text-xs font-bold uppercase tracking-wider ${STAGE_STYLES[stage].text}`}>{stage}</div>
            <div className={`text-3xl font-display font-extrabold ${STAGE_STYLES[stage].text}`}>{byStage[stage].length}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {STAGES.map(stage => (
          <div key={stage} className="space-y-2">
            <div className={`flex items-center justify-between p-3 rounded-2xl ${STAGE_STYLES[stage].bg} border`}>
              <span className={`text-sm font-bold ${STAGE_STYLES[stage].text}`}>{stage}</span>
              <Badge tone={STAGE_STYLES[stage].tone}>{byStage[stage].length}</Badge>
            </div>
            {byStage[stage].map(lead => (
              <Card key={lead.id} padding="sm" className="hover:shadow-soft transition">
                <div className="flex items-start gap-2.5">
                  <Avatar name={lead.name} size={32} />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-ink-800 truncate">{lead.name}</div>
                    <div className="text-[11px] text-ink-500 truncate">{lead.subject} · {lead.grade}</div>
                    <div className="text-[10px] text-ink-400 mt-0.5">{lead.source} · {formatDate(lead.createdAt)}</div>
                    {lead.notes && <div className="text-[11px] text-ink-600 mt-1 italic line-clamp-2">"{lead.notes}"</div>}
                  </div>
                </div>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<MessageCircle size={12} />}
                    onClick={() => {
                      const phone = lead.phone.replace(/\D/g, '')
                      const msg = `Olá ${lead.name.split(' ')[0]}! Sou da XelbMinds — Centro de Explicações. Como podemos ajudar com ${lead.subject}?`
                      window.open(`https://wa.me/351${phone}?text=${encodeURIComponent(msg)}`, '_blank')
                    }}
                  />
                  {stage !== 'Inscrito' && stage !== 'Desistiu' && (
                    <Button variant="ghost" size="sm" leftIcon={<ArrowRight size={12} />} onClick={() => advanceStage(lead)} />
                  )}
                  <select
                    value={lead.stage}
                    onChange={e => moveTo(lead, e.target.value as LeadStage)}
                    className="flex-1 h-8 px-2 rounded-lg border border-ink-200 text-[11px] bg-white cursor-pointer"
                  >
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <Button variant="ghost" size="sm" leftIcon={<Trash2 size={12} />} onClick={() => remove(lead.id)} />
                </div>
              </Card>
            ))}
            {byStage[stage].length === 0 && (
              <div className="text-center text-xs text-ink-400 py-6 italic">Vazio</div>
            )}
          </div>
        ))}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo Lead"
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Adicionar</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Input label="Nome*" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Telefone*" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
          <Input label="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <Select label="Origem" value={form.source} onChange={e => setForm({ ...form, source: e.target.value as Lead['source'] })}>
            <option>Recomendação</option><option>Redes Sociais</option><option>Google</option><option>Cartaz</option><option>Outro</option>
          </Select>
          <Select label="Disciplina" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
            {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
          </Select>
          <Select label="Ano" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
        </div>
        <div className="mt-3">
          <Textarea label="Notas" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}

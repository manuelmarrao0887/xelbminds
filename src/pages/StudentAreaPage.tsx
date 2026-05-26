import { useMemo, useState } from 'react'
import { ArrowLeft, ChevronRight, Download, MessageCircle, Award, Flame, Sparkles, Upload, CheckCircle2 } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  Card, CardHeader, PageHeader, Button, SearchBar, Avatar, Badge, Modal, Tabs, EmptyState, Textarea, Input
} from '@/components/ui'
import { useStudents, useLessons, usePayments, useExtraClasses } from '@/hooks/useCollection'
import { extraClassService, lessonsService } from '@/services/domain'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { EVAL_COLOR } from '@/lib/constants'
import { formatDate, formatEUR } from '@/lib/utils'
import type { Student, Lesson } from '@/types'

type Tab = 'overview' | 'lessons' | 'tpc' | 'exams' | 'files' | 'grades' | 'payments'

export function StudentAreaPage() {
  const user = useAuthStore(s => s.user)!
  const [students] = useStudents()
  const [lessons, reloadLessons] = useLessons()
  const [payments] = usePayments()
  const [extras, reloadExtras] = useExtraClasses()
  const [selected, setSelected] = useState<Student | null>(null)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('overview')
  const [extraOpen, setExtraOpen] = useState(false)

  // For student role: only show their kids
  const allowedStudents = useMemo(() => {
    if (user.role === 'student' && user.studentIds) {
      return students.filter(s => user.studentIds!.includes(s.id))
    }
    return students.filter(s => s.status === 'ativo')
  }, [students, user])

  const filtered = useMemo(() =>
    allowedStudents.filter(s => s.name.toLowerCase().includes(search.toLowerCase())),
    [allowedStudents, search])

  // Auto-select first if parent has only 1 child
  if (!selected && allowedStudents.length === 1 && user.role === 'student') {
    setSelected(allowedStudents[0])
  }

  const sLessons = selected ? lessons.filter(l => l.studentId === selected.id).sort((a, b) => b.date.localeCompare(a.date)) : []
  const sPayments = selected ? payments.filter(p => p.studentId === selected.id) : []
  const debt = sPayments.filter(p => !p.paid).reduce((a, p) => a + p.amount, 0)

  // List view (admin browsing all OR parent picking child)
  if (!selected) {
    return (
      <div>
        <PageHeader
          title={user.role === 'student' ? 'Os Meus Filhos' : 'Área do Aluno'}
          subtitle={user.role === 'student' ? 'Selecione o seu filho para ver o detalhe' : 'Escolha um aluno'}
        />
        {user.role !== 'student' && <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Procurar aluno..." /></div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(s => {
            const d = payments.filter(p => p.studentId === s.id && !p.paid).reduce((a, p) => a + p.amount, 0)
            return (
              <Card key={s.id} hover onClick={() => { setSelected(s); setTab('overview') }} className="flex items-center gap-3">
                <Avatar name={s.name} size={48} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-ink-800 truncate">{s.name}</div>
                  <div className="text-xs text-ink-500 truncate">{s.subjects.join(', ')} · {s.grade}</div>
                  {(s.streak ?? 0) > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-600 font-semibold">
                      <Flame size={12} /> Streak {s.streak} aulas
                    </div>
                  )}
                </div>
                {d > 0 && <Badge tone="danger">{formatEUR(d)}</Badge>}
                <ChevronRight size={18} className="text-ink-300" />
              </Card>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {(user.role !== 'student' || allowedStudents.length > 1) && (
          <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => setSelected(null)}>Voltar</Button>
        )}
        <Avatar name={selected.name} size={44} />
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-lg truncate">{selected.name}</div>
          <div className="text-xs text-ink-500">{selected.subjects.join(', ')} · {selected.grade} · {selected.scheduleDay} {selected.scheduleHour}</div>
        </div>
        {debt > 0 && <Badge tone="danger">Em dívida: {formatEUR(debt)}</Badge>}
      </div>

      {/* Gamification banner */}
      <Card className="mb-4 bg-gradient-to-r from-sage-50 via-white to-teal-50 border-sage-200">
        <div className="flex items-center justify-around flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center"><Sparkles size={22} /></div>
            <div>
              <div className="text-2xl font-display font-extrabold text-purple-700">{selected.xp ?? 0}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-500">XP total</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center"><Flame size={22} /></div>
            <div>
              <div className="text-2xl font-display font-extrabold text-amber-700">{selected.streak ?? 0}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-500">Streak aulas</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center"><Award size={22} /></div>
            <div>
              <div className="text-2xl font-display font-extrabold text-teal-700">{selected.badges?.length ?? 0}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-500">Medalhas</div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'overview', label: 'Resumo' },
          { value: 'lessons', label: 'Aulas', count: sLessons.length },
          { value: 'tpc', label: 'TPC' },
          { value: 'exams', label: 'Exames' },
          { value: 'files', label: 'Ficheiros' },
          { value: 'grades', label: 'Notas Escola' },
          { value: 'payments', label: 'Pagamentos' }
        ]}
      />

      <div className="mt-5">
        {tab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Card>
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-400 mb-1">Última Aula</div>
              {sLessons[0] ? (
                <>
                  <div className="text-xs text-teal-600 mb-1">{formatDate(sLessons[0].date)}</div>
                  <div className="font-semibold text-ink-800">{sLessons[0].summary}</div>
                </>
              ) : <div className="text-ink-400">—</div>}
            </Card>
            <Card>
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-400 mb-1">Próxima Aula</div>
              {sLessons[0]?.nextLesson ? <div className="font-semibold text-sage-700">{sLessons[0].nextLesson}</div> : <div className="text-ink-400">—</div>}
            </Card>
            <Card>
              <div className="text-[10px] uppercase font-bold tracking-wider text-ink-400 mb-1">TPC</div>
              {sLessons[0]?.homework
                ? <div className="font-semibold text-purple-700">{sLessons[0].homework}</div>
                : <div className="text-ink-400">Sem TPC</div>
              }
            </Card>
            <Card className={debt > 0 ? 'bg-red-50' : 'bg-emerald-50'}>
              <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${debt > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {debt > 0 ? 'Pendente' : 'Em dia'}
              </div>
              <div className={`text-3xl font-display font-extrabold ${debt > 0 ? 'text-red-700' : 'text-emerald-700'}`}>
                {formatEUR(debt)}
              </div>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader title="Pedir reforço / aula extra" subtitle="Sessão extra antes de teste ou exame" action={
                <Button leftIcon={<Sparkles size={14} />} onClick={() => setExtraOpen(true)}>Pedir aula extra</Button>
              } />
              <div className="text-sm text-ink-600">
                Os pedidos são analisados pela coordenação. Receberá confirmação por WhatsApp.
              </div>
              {extras.filter(e => e.studentId === selected.id).length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {extras.filter(e => e.studentId === selected.id).map(e => (
                    <div key={e.id} className="flex justify-between items-center p-2.5 bg-ink-50 rounded-xl text-sm">
                      <span>{e.subject} — {formatDate(e.preferredDate)}</span>
                      <Badge tone={e.status === 'aprovado' ? 'success' : e.status === 'recusado' ? 'danger' : 'warning'}>
                        {e.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {tab === 'lessons' && (
          sLessons.length === 0 ? <EmptyState title="Sem aulas registadas" /> :
          <div className="space-y-3">
            {sLessons.map(l => (
              <Card key={l.id}>
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-ink-800">{formatDate(l.date)}</span>
                  <div className="flex gap-1.5">
                    <Badge tone={l.attendance ? 'success' : 'danger'}>{l.attendance ? 'Presente' : 'Falta'}</Badge>
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${EVAL_COLOR[l.evaluation]}`}>{l.evaluation}</span>
                  </div>
                </div>
                <div className="text-sm text-ink-800 mb-1">{l.summary}</div>
                {l.evalNotes && <div className="text-xs text-ink-500 italic">"{l.evalNotes}"</div>}
                {l.nextLesson && <div className="text-xs text-sage-700 mt-1"><strong>Próxima:</strong> {l.nextLesson}</div>}
                {l.homework && <div className="text-xs text-purple-700 mt-1"><strong>TPC:</strong> {l.homework}</div>}
              </Card>
            ))}
          </div>
        )}

        {tab === 'tpc' && <TPCTab lessons={sLessons} onSubmit={async (lessonId) => {
          await lessonsService.update(lessonId, { homeworkSubmitted: true, homeworkFile: 'tpc-submetido.pdf' })
          toast.success('TPC submetido! +10 XP')
          await reloadLessons()
        }} />}

        {tab === 'exams' && <ExamsTab subjects={selected.subjects} />}

        {tab === 'files' && (
          <Card>
            <CardHeader title="Os Meus Ficheiros" subtitle="Materiais das aulas" />
            <div className="space-y-2">
              {sLessons.flatMap(l => l.files.map(f => ({ file: f, date: l.date }))).map((it, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-ink-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-sage-50 text-sage-700 rounded-lg flex items-center justify-center"><Download size={14} /></div>
                    <div>
                      <div className="text-sm font-semibold">{it.file}</div>
                      <div className="text-xs text-ink-400">{formatDate(it.date)}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download size={14} />} onClick={() => toast.info(`Download: ${it.file}`)}>Descarregar</Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {tab === 'grades' && (
          <Card>
            <CardHeader title="Notas da Escola" subtitle="3 períodos do ano letivo" />
            {selected.schoolGrades.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={selected.schoolGrades.map(g => ({ p: g.period, n: g.grade }))} margin={{ top: 8, right: 16, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="p" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
                    <Line type="monotone" dataKey="n" stroke="#7DA13E" strokeWidth={3} dot={{ r: 5, fill: '#5F7E2F' }} />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-3 p-3 bg-ink-50 rounded-xl text-center">
                  <span className="text-ink-500 text-sm">Média final: </span>
                  <span className="text-xl font-display font-extrabold text-teal-700">{(selected.schoolGrades.reduce((a, g) => a + g.grade, 0) / selected.schoolGrades.length).toFixed(1)}</span>
                </div>
              </>
            ) : <EmptyState title="Sem notas registadas" />}
          </Card>
        )}

        {tab === 'payments' && (
          <PaymentsTab student={selected} payments={sPayments} debt={debt} />
        )}
      </div>

      {/* Extra class modal */}
      <ExtraClassModal
        open={extraOpen}
        onClose={() => setExtraOpen(false)}
        student={selected}
        onSaved={() => { setExtraOpen(false); reloadExtras() }}
      />
    </div>
  )
}

function TPCTab({ lessons, onSubmit }: { lessons: Lesson[]; onSubmit: (id: string) => Promise<void> }) {
  const pending = lessons.filter(l => l.homework && !l.homeworkSubmitted)
  const submitted = lessons.filter(l => l.homework && l.homeworkSubmitted)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="TPC pendentes" subtitle={`${pending.length} por entregar`} />
        {pending.length === 0 ? <EmptyState title="Tudo entregue!" description="🎯 Continue com o bom trabalho." /> : (
          <div className="space-y-2">
            {pending.map(l => (
              <div key={l.id} className="flex items-center justify-between p-3 bg-purple-50 rounded-xl">
                <div className="flex-1">
                  <div className="text-xs text-ink-500">{formatDate(l.date)} · {l.subject}</div>
                  <div className="font-semibold text-purple-900">{l.homework}</div>
                </div>
                <Button leftIcon={<Upload size={14} />} onClick={() => onSubmit(l.id)}>Submeter</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <CardHeader title="TPC entregues" subtitle={`${submitted.length} submetidos`} />
        <div className="space-y-2">
          {submitted.map(l => (
            <div key={l.id} className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
              <div className="flex-1">
                <div className="text-xs text-ink-500">{formatDate(l.date)} · {l.subject}</div>
                <div className="font-semibold text-emerald-900">{l.homework}</div>
                {l.homeworkFeedback && <div className="text-xs text-emerald-700 mt-1 italic">Feedback: {l.homeworkFeedback}</div>}
              </div>
              <Badge tone="success"><CheckCircle2 size={12} /> Entregue</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function ExamsTab({ subjects }: { subjects: string[] }) {
  // Mock upcoming exams
  const today = new Date()
  const exams = subjects.map((sub, i) => {
    const days = 7 + i * 5
    const date = new Date(today.getTime() + days * 86400000)
    return { subject: sub, date, days, type: i === 0 ? 'Teste' : 'Exame Nacional' }
  })

  return (
    <Card>
      <CardHeader title="Próximos testes e exames" subtitle="Datas-chave a preparar" />
      <div className="space-y-2.5">
        {exams.map((e, i) => (
          <div key={i} className="flex items-center justify-between p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl">
            <div>
              <Badge tone="warning">{e.type}</Badge>
              <div className="font-semibold mt-1.5">{e.subject}</div>
              <div className="text-xs text-ink-500">{formatDate(e.date.toISOString())}</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-display font-extrabold text-amber-700">{e.days}</div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-amber-600">dias</div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function PaymentsTab({ student, payments, debt }: { student: Student; payments: import('@/types').Payment[]; debt: number }) {
  const totalPaid = payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
  const annual = totalPaid

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="bg-emerald-50 text-center">
          <div className="text-xs text-emerald-700 font-semibold">Pago</div>
          <div className="text-2xl font-display font-extrabold text-emerald-700">{formatEUR(totalPaid)}</div>
        </Card>
        <Card className={debt > 0 ? 'bg-red-50 text-center' : 'bg-ink-50 text-center'}>
          <div className={`text-xs font-semibold ${debt > 0 ? 'text-red-700' : 'text-ink-500'}`}>Pendente</div>
          <div className={`text-2xl font-display font-extrabold ${debt > 0 ? 'text-red-700' : 'text-ink-500'}`}>{formatEUR(debt)}</div>
        </Card>
        <Card className="bg-teal-50 text-center">
          <div className="text-xs text-teal-700 font-semibold">Total anual</div>
          <div className="text-2xl font-display font-extrabold text-teal-700">{formatEUR(annual)}</div>
          <div className="text-[10px] text-teal-600">para IRS</div>
        </Card>
      </div>

      <div className="space-y-2 mb-4">
        {payments.map(p => (
          <div key={p.id} className="flex justify-between items-center p-3 bg-white border border-ink-200 rounded-xl">
            <div>
              <div className="font-semibold text-sm">{p.month}</div>
              {p.paidDate && <div className="text-xs text-ink-500">Pago em {formatDate(p.paidDate)}</div>}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatEUR(p.amount)}</span>
              <Badge tone={p.paid ? 'success' : 'danger'}>{p.paid ? 'Pago' : 'Pendente'}</Badge>
            </div>
          </div>
        ))}
      </div>

      {debt > 0 && (
        <div className="flex gap-2 justify-center">
          <Button variant="primary" leftIcon={<Sparkles size={14} />} onClick={() => toast.info('Pagamento online — disponível em V2 (MB WAY, Stripe)')}>Pagar online</Button>
          <Button
            variant="whatsapp"
            leftIcon={<MessageCircle size={14} />}
            onClick={() => {
              const msg = encodeURIComponent(`Olá! 👋\n*XelbMinds*\n${student.name} — dívida: *${formatEUR(debt)}*\nObrigado! 🙏`)
              window.open(`https://wa.me/?text=${msg}`, '_blank')
            }}
          >
            WhatsApp
          </Button>
        </div>
      )}
    </div>
  )
}

function ExtraClassModal({ open, onClose, student, onSaved }: { open: boolean; onClose: () => void; student: Student; onSaved: () => void }) {
  const [subject, setSubject] = useState(student.subjects[0])
  const [reason, setReason] = useState('')
  const [date, setDate] = useState('')

  const save = async () => {
    if (!reason || !date) { toast.error('Preencha motivo e data'); return }
    await extraClassService.create({
      studentId: student.id,
      studentName: student.name,
      subject,
      reason,
      preferredDate: date,
      status: 'pendente',
      createdAt: new Date().toISOString()
    } as Omit<import('@/types').ExtraClassRequest, 'id'>)
    toast.success('Pedido enviado! A coordenação irá responder.')
    onSaved()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pedir Aula Extra"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Enviar pedido</Button>
        </>
      }
    >
      <div className="space-y-3">
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="w-full h-10 px-3.5 rounded-xl border border-ink-200 bg-white text-sm"
        >
          {student.subjects.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input type="date" label="Data preferida" value={date} onChange={e => setDate(e.target.value)} />
        <Textarea label="Motivo" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Preparação para teste de Matemática..." />
      </div>
    </Modal>
  )
}

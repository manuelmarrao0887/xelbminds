import { useMemo, useState } from 'react'
import { ArrowLeft, Plus, ChevronRight, Calendar, Upload, FileText, CheckCircle2, XCircle, TrendingUp } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from 'recharts'
import {
  Card, CardHeader, PageHeader, Button, SearchBar, Avatar, Badge, Modal, Input, Select, Textarea, Tabs, EmptyState
} from '@/components/ui'
import { useStudents, useLessons } from '@/hooks/useCollection'
import { lessonsService } from '@/services/domain'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { EVALS, EVAL_COLOR } from '@/lib/constants'
import { formatDate } from '@/lib/utils'
import type { Lesson, Student, Evaluation } from '@/types'

type Tab = 'lessons' | 'attendance' | 'progress' | 'docs' | 'quick'

export function TeacherPage() {
  const user = useAuthStore(s => s.user)!
  const [students] = useStudents()
  const [lessons, reload] = useLessons()
  const [selected, setSelected] = useState<Student | null>(null)
  const [tab, setTab] = useState<Tab>('lessons')
  const [search, setSearch] = useState('')
  const [logOpen, setLogOpen] = useState(false)

  const mySubjects = user.role === 'teacher' ? (user.teacherSubjects ?? []) : null
  const myStudents = useMemo(() =>
    students.filter(s =>
      s.status === 'ativo' &&
      s.name.toLowerCase().includes(search.toLowerCase()) &&
      (mySubjects === null || s.subjects.some(sub => mySubjects.includes(sub)))
    ), [students, search, mySubjects])

  const studentLessons = useMemo(() => selected ? lessons.filter(l => l.studentId === selected.id).sort((a, b) => b.date.localeCompare(a.date)) : [], [lessons, selected])

  // List view
  if (!selected) {
    const todayLessons = lessons.filter(l => l.date === new Date().toISOString().slice(0, 10))
    return (
      <div>
        <PageHeader
          title="Área do Professor"
          subtitle={mySubjects ? `Disciplinas: ${mySubjects.join(', ')}` : 'Selecione um aluno'}
          action={<Button variant="outline" leftIcon={<CheckCircle2 size={16} />} onClick={() => setTab('quick')}>Marcação rápida</Button>}
        />

        {tab === 'quick' && (
          <QuickAttendance
            students={myStudents}
            lessons={lessons}
            onDone={() => { setTab('lessons'); reload() }}
            onCancel={() => setTab('lessons')}
          />
        )}

        {tab !== 'quick' && (
          <>
            {todayLessons.length > 0 && (
              <Card className="mb-4 bg-teal-50 border-teal-200">
                <div className="font-semibold text-teal-900 mb-1">Aulas de hoje</div>
                <div className="text-sm text-teal-800">{todayLessons.length} aula(s) marcada(s) para hoje</div>
              </Card>
            )}
            <div className="mb-4"><SearchBar value={search} onChange={setSearch} placeholder="Procurar aluno..." /></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {myStudents.map(s => {
                const sLessons = lessons.filter(l => l.studentId === s.id)
                const att = sLessons.length ? Math.round(sLessons.filter(l => l.attendance).length / sLessons.length * 100) : 0
                return (
                  <Card key={s.id} hover onClick={() => setSelected(s)} className="flex items-center gap-3">
                    <Avatar name={s.name} size={42} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-ink-800 truncate">{s.name}</div>
                      <div className="text-xs text-ink-500 truncate">{s.subjects.join(', ')} · {s.grade}</div>
                      <div className="flex gap-1.5 mt-1.5">
                        <Badge tone="info">{s.scheduleDay.slice(0, 3)} {s.scheduleHour}</Badge>
                        <Badge tone={att >= 80 ? 'success' : 'warning'}>{att}% assid.</Badge>
                      </div>
                    </div>
                    <ChevronRight size={18} className="text-ink-300" />
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-5">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={16} />} onClick={() => setSelected(null)}>Voltar</Button>
        <Avatar name={selected.name} size={40} />
        <div className="flex-1">
          <div className="font-display font-bold text-lg">{selected.name}</div>
          <div className="text-xs text-ink-500">{selected.subjects.join(', ')} · {selected.grade}</div>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setLogOpen(true)}>Registar Aula</Button>
      </div>

      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: 'lessons', label: 'Aulas', count: studentLessons.length },
          { value: 'attendance', label: 'Presenças' },
          { value: 'progress', label: 'Progresso' },
          { value: 'docs', label: 'Documentos' }
        ]}
      />

      <div className="mt-5">
        {tab === 'lessons' && (
          studentLessons.length === 0
            ? <EmptyState icon={<Calendar size={48} />} title="Sem aulas registadas" description="Use o botão 'Registar Aula' para criar a primeira" />
            : <div className="space-y-3">{studentLessons.map(l => <LessonCard key={l.id} lesson={l} />)}</div>
        )}

        {tab === 'attendance' && <AttendanceTab lessons={studentLessons} />}
        {tab === 'progress' && <ProgressTab student={selected} lessons={studentLessons} />}
        {tab === 'docs' && <DocsTab lessons={studentLessons} />}
      </div>

      <LessonModal
        open={logOpen}
        onClose={() => setLogOpen(false)}
        student={selected}
        onSaved={() => { setLogOpen(false); reload() }}
      />
    </div>
  )
}

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Card>
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink-800">
          <Calendar size={14} className="text-teal-600" /> {formatDate(lesson.date)}
        </div>
        <div className="flex gap-1.5">
          <Badge tone={lesson.attendance ? 'success' : 'danger'}>{lesson.attendance ? 'Presente' : 'Falta'}</Badge>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${EVAL_COLOR[lesson.evaluation]}`}>{lesson.evaluation}</span>
        </div>
      </div>
      <div className="text-[10px] font-bold uppercase text-ink-400 mb-0.5">Sumário</div>
      <div className="text-sm text-ink-800 mb-2">{lesson.summary}</div>
      {lesson.nextLesson && <div className="text-xs text-sage-700"><strong>Próxima:</strong> {lesson.nextLesson}</div>}
      {lesson.homework && (
        <div className="text-xs text-purple-700 mt-1 flex items-center gap-1">
          <strong>TPC:</strong> {lesson.homework}
          {lesson.homeworkSubmitted ? <Badge tone="success">Entregue</Badge> : <Badge tone="warning">Pendente</Badge>}
        </div>
      )}
      {lesson.files.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {lesson.files.map(f => <Badge key={f} tone="sage">{f}</Badge>)}
        </div>
      )}
    </Card>
  )
}

function AttendanceTab({ lessons }: { lessons: Lesson[] }) {
  const pres = lessons.filter(l => l.attendance).length
  const faltas = lessons.length - pres
  const pct = lessons.length ? Math.round(pres / lessons.length * 100) : 0
  return (
    <Card>
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-emerald-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-display font-extrabold text-emerald-700">{pres}</div>
          <div className="text-xs text-emerald-700 font-semibold">Presenças</div>
        </div>
        <div className="bg-red-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-display font-extrabold text-red-700">{faltas}</div>
          <div className="text-xs text-red-700 font-semibold">Faltas</div>
        </div>
        <div className="bg-teal-50 rounded-2xl p-4 text-center">
          <div className="text-3xl font-display font-extrabold text-teal-700">{pct}%</div>
          <div className="text-xs text-teal-700 font-semibold">Assiduidade</div>
        </div>
      </div>
      <div className="divide-y divide-ink-100">
        {lessons.map(l => (
          <div key={l.id} className="flex justify-between items-center py-2.5">
            <span className="text-sm">{formatDate(l.date)}</span>
            <Badge tone={l.attendance ? 'success' : 'danger'}>{l.attendance ? <CheckCircle2 size={12} /> : <XCircle size={12} />} {l.attendance ? 'Presente' : 'Falta'}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}

function ProgressTab({ student, lessons }: { student: Student; lessons: Lesson[] }) {
  const evalToNum: Record<string, number> = { 'Insuficiente': 8, 'Suficiente': 10, 'Bom': 14, 'Muito Bom': 17, 'Excelente': 19 }
  const data = lessons.slice().reverse().map(l => ({ date: formatDate(l.date).slice(0, 5), eval: evalToNum[l.evaluation] }))
  const schoolData = student.schoolGrades.map(g => ({ date: g.period, eval: g.grade }))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader title="Evolução nas explicações" subtitle="Avaliações convertidas em escala 0-20" />
        {data.length === 0 ? <EmptyState title="Sem dados" /> : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Line type="monotone" dataKey="eval" stroke="#5A8B9D" strokeWidth={3} dot={{ r: 4, fill: '#3E7088' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      <Card>
        <CardHeader title="Notas da Escola" subtitle="3 períodos" />
        {schoolData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={schoolData} margin={{ top: 8, right: 16, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 20]} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }} />
              <Line type="monotone" dataKey="eval" stroke="#7DA13E" strokeWidth={3} dot={{ r: 5, fill: '#5F7E2F' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        <div className="mt-3 p-3 bg-ink-50 rounded-xl text-center">
          <span className="text-ink-500 text-sm">Média escola: </span>
          <span className="text-lg font-display font-extrabold text-teal-700">
            {student.schoolGrades.length ? (student.schoolGrades.reduce((a, g) => a + g.grade, 0) / student.schoolGrades.length).toFixed(1) : '—'}
          </span>
        </div>
      </Card>
    </div>
  )
}

function DocsTab({ lessons }: { lessons: Lesson[] }) {
  const allFiles = [...new Set(lessons.flatMap(l => l.files))]
  return (
    <div className="space-y-4">
      <Card>
        <div
          className="border-2 border-dashed border-ink-300 rounded-2xl p-10 text-center cursor-pointer hover:border-teal-500 hover:bg-teal-50/30 transition"
          onDragOver={e => e.preventDefault()}
          onDrop={e => { e.preventDefault(); toast.success('Ficheiro recebido (mock)') }}
          onClick={() => toast.info('Upload em modo demo')}
        >
          <Upload size={32} className="mx-auto text-teal-600 mb-2" />
          <div className="font-semibold text-ink-700">Arraste ficheiros aqui ou clique para selecionar</div>
          <div className="text-xs text-ink-400 mt-1">PDF, DOCX, imagens — até 10MB</div>
        </div>
      </Card>
      {allFiles.length > 0 && (
        <Card padding="md">
          <CardHeader title="Ficheiros das aulas" />
          <div className="space-y-1.5">
            {allFiles.map(f => (
              <div key={f} className="flex items-center gap-2 p-2.5 bg-ink-50 rounded-xl text-sm">
                <FileText size={14} className="text-teal-600" /> {f}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}

function QuickAttendance({ students, lessons, onDone, onCancel }: { students: Student[]; lessons: Lesson[]; onDone: () => void; onCancel: () => void }) {
  const today = new Date().toISOString().slice(0, 10)
  const todayLessons = lessons.filter(l => l.date === today)
  const [state, setState] = useState<Record<string, 'P' | 'F' | null>>({})

  const setPresence = (sid: string, val: 'P' | 'F') => setState(s => ({ ...s, [sid]: val }))

  const save = async () => {
    let count = 0
    for (const [sid, val] of Object.entries(state)) {
      if (!val) continue
      const existing = todayLessons.find(l => l.studentId === sid)
      if (existing) {
        await lessonsService.update(existing.id, { attendance: val === 'P' })
      } else {
        const student = students.find(s => s.id === sid)
        if (student) {
          await lessonsService.create({
            studentId: sid,
            date: today,
            subject: student.subjects[0],
            summary: '(presença registada via marcação rápida)',
            nextLesson: '',
            evaluation: 'Bom',
            evalNotes: '',
            attendance: val === 'P',
            homework: '',
            files: []
          } as Omit<Lesson, 'id'>)
        }
      }
      count++
    }
    toast.success(`${count} presença(s) registada(s)`)
    onDone()
  }

  return (
    <Card>
      <CardHeader
        title={`Marcação Rápida — ${formatDate(today)}`}
        subtitle="Toque P (presente) ou F (falta) ao lado de cada aluno"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button onClick={save}>Guardar</Button>
          </div>
        }
      />
      <div className="divide-y divide-ink-100">
        {students.map(s => {
          const val = state[s.id]
          return (
            <div key={s.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar name={s.name} size={32} />
                <div className="min-w-0">
                  <div className="font-semibold text-sm truncate">{s.name}</div>
                  <div className="text-xs text-ink-500">{s.subjects[0]}</div>
                </div>
              </div>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPresence(s.id, 'P')}
                  className={`w-10 h-10 rounded-xl text-sm font-bold cursor-pointer transition ${val === 'P' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                >P</button>
                <button
                  onClick={() => setPresence(s.id, 'F')}
                  className={`w-10 h-10 rounded-xl text-sm font-bold cursor-pointer transition ${val === 'F' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >F</button>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

function LessonModal({ open, onClose, student, onSaved }: { open: boolean; onClose: () => void; student: Student; onSaved: () => void }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    summary: '',
    nextLesson: '',
    evaluation: 'Bom' as Evaluation,
    evalNotes: '',
    homework: '',
    files: '',
    attendance: true
  })

  const save = async () => {
    if (!form.summary) { toast.error('Sumário obrigatório'); return }
    await lessonsService.create({
      studentId: student.id,
      date: form.date,
      subject: student.subjects[0],
      summary: form.summary,
      nextLesson: form.nextLesson,
      evaluation: form.evaluation,
      evalNotes: form.evalNotes,
      attendance: form.attendance,
      homework: form.homework,
      files: form.files ? form.files.split(',').map(f => f.trim()).filter(Boolean) : []
    } as Omit<Lesson, 'id'>)
    toast.success('Aula registada')
    onSaved()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registar Aula"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={save}>Guardar</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Input label="Data" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
        <Select label="Avaliação" value={form.evaluation} onChange={e => setForm({ ...form, evaluation: e.target.value as Evaluation })}>
          {EVALS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
        </Select>
      </div>
      <div className="mt-3"><Textarea label="Sumário*" rows={3} value={form.summary} onChange={e => setForm({ ...form, summary: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <Input label="Próxima aula" value={form.nextLesson} onChange={e => setForm({ ...form, nextLesson: e.target.value })} />
        <Input label="TPC" value={form.homework} onChange={e => setForm({ ...form, homework: e.target.value })} />
      </div>
      <Input className="mt-3" label="Notas avaliação" value={form.evalNotes} onChange={e => setForm({ ...form, evalNotes: e.target.value })} />
      <Input className="mt-3" label="Ficheiros (separados por vírgula)" value={form.files} onChange={e => setForm({ ...form, files: e.target.value })} />
      <label className="flex items-center gap-2 text-sm mt-3 cursor-pointer">
        <input type="checkbox" checked={form.attendance} onChange={e => setForm({ ...form, attendance: e.target.checked })} className="rounded" />
        Aluno presente
      </label>
    </Modal>
  )
}

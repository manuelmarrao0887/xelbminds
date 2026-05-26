import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { z } from 'zod'
import {
  Card, PageHeader, Button, SearchBar, Avatar, Badge, Modal, Input, Select, Textarea, Field
} from '@/components/ui'
import { useStudents } from '@/hooks/useCollection'
import { studentsService } from '@/services/domain'
import { toast } from '@/store/toastStore'
import { GRADES, SUBJECTS, WEEKDAYS, HOURS } from '@/lib/constants'
import { sanitize } from '@/lib/utils'
import type { Student } from '@/types'

const studentSchema = z.object({
  name: z.string().min(2, 'Nome demasiado curto').max(80),
  email: z.string().email('Email inválido').or(z.literal('')),
  phone: z.string().regex(/^\d{9}$/, '9 dígitos').or(z.literal('')),
  parentName: z.string().max(80),
  parentPhone: z.string().regex(/^\d{9}$/, '9 dígitos').or(z.literal('')),
  subjects: z.array(z.string()).min(1, 'Pelo menos uma disciplina'),
  grade: z.string()
})

type FormState = Omit<Student, 'id' | 'schoolGrades' | 'xp' | 'badges' | 'streak' | 'goals'>

const emptyForm: FormState = {
  name: '', email: '', phone: '', parentName: '', parentPhone: '', parentEmail: '',
  subjects: [], grade: '', status: 'ativo', scheduleDay: 'Segunda', scheduleHour: '16:00', notes: ''
}

export function StudentsPage() {
  const [students, reload] = useStudents()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativo' | 'inativo'>('all')
  const [open, setOpen] = useState(false)
  const [edit, setEdit] = useState<Student | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const filtered = useMemo(() => students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter === 'all' || s.status === statusFilter)
  ), [students, search, statusFilter])

  const openCreate = () => { setEdit(null); setForm(emptyForm); setErrors({}); setOpen(true) }
  const openEdit = (s: Student) => {
    setEdit(s)
    setForm({
      name: s.name, email: s.email, phone: s.phone,
      parentName: s.parentName, parentPhone: s.parentPhone, parentEmail: s.parentEmail || '',
      subjects: s.subjects, grade: s.grade, status: s.status,
      scheduleDay: s.scheduleDay, scheduleHour: s.scheduleHour, notes: s.notes
    })
    setErrors({})
    setOpen(true)
  }

  const save = async () => {
    const parsed = studentSchema.safeParse(form)
    if (!parsed.success) {
      const fe: Record<string, string> = {}
      parsed.error.errors.forEach(e => { if (!fe[e.path[0] as string]) fe[e.path[0] as string] = e.message })
      setErrors(fe)
      return
    }
    const clean: Partial<Student> = {
      ...form,
      name: sanitize(form.name, 80),
      notes: sanitize(form.notes, 500),
      parentName: sanitize(form.parentName, 80)
    }
    if (edit) {
      await studentsService.update(edit.id, clean)
      toast.success('Aluno atualizado')
    } else {
      await studentsService.create({ ...clean, schoolGrades: [], xp: 0, badges: [], streak: 0, goals: [] } as Omit<Student, 'id'>)
      toast.success('Aluno adicionado')
    }
    setOpen(false)
    await reload()
  }

  const remove = async (id: string) => {
    if (!confirm('Eliminar este aluno?')) return
    await studentsService.remove(id)
    toast.success('Aluno eliminado')
    await reload()
  }

  return (
    <div>
      <PageHeader
        title="Gestão de Alunos"
        subtitle={`${filtered.length} de ${students.length}`}
        action={<Button leftIcon={<Plus size={16} />} onClick={openCreate}>Novo Aluno</Button>}
      />

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Pesquisar nome..." />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value as 'all' | 'ativo' | 'inativo')}
          className="h-10 px-3.5 rounded-xl border border-ink-200 bg-white text-sm font-semibold cursor-pointer"
        >
          <option value="all">Todos</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
        </select>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 text-left">
                {['Aluno', 'Disciplinas', 'Ano', 'Horário', 'Estado', 'Notas', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map(s => (
                <tr key={s.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={s.name} size={32} />
                      <div>
                        <div className="font-semibold text-ink-800">{s.name}</div>
                        <div className="text-[11px] text-ink-500">{s.parentName} · {s.parentPhone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap gap-1">
                      {s.subjects.map(sub => <Badge key={sub} tone="teal">{sub}</Badge>)}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{s.grade || '—'}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone="info">{s.scheduleDay.slice(0, 3)} · {s.scheduleHour}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={s.status === 'ativo' ? 'success' : 'neutral'}>{s.status === 'ativo' ? 'Ativo' : 'Inativo'}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-ink-500 max-w-[180px] truncate">{s.notes || '—'}</td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="sm" leftIcon={<Pencil size={14} />} onClick={() => openEdit(s)}>Editar</Button>
                      <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => remove(s.id)} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={edit ? 'Editar Aluno' : 'Novo Aluno'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>{edit ? 'Guardar' : 'Adicionar'}</Button>
          </>
        }
      >
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Nome*" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} error={errors.name} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} error={errors.email} />
          <Input label="Tel. aluno" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} error={errors.phone} placeholder="912345678" />
          <Input label="Tel. encarregado" value={form.parentPhone} onChange={e => setForm({ ...form, parentPhone: e.target.value })} error={errors.parentPhone} placeholder="961234567" />
          <Input label="Encarregado de Educação" value={form.parentName} onChange={e => setForm({ ...form, parentName: e.target.value })} />
          <Input label="Email encarregado" type="email" value={form.parentEmail || ''} onChange={e => setForm({ ...form, parentEmail: e.target.value })} />
        </div>

        <div className="mt-4">
          <Field label="Disciplinas*" error={errors.subjects}>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS.map(sub => {
                const active = form.subjects.includes(sub)
                return (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setForm(f => ({
                      ...f,
                      subjects: active ? f.subjects.filter(s => s !== sub) : [...f.subjects, sub]
                    }))}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition cursor-pointer ${active ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-ink-700 border-ink-200 hover:border-teal-400'}`}
                  >
                    {sub}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>

        <div className="grid md:grid-cols-4 gap-3 mt-4">
          <Select label="Ano" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value as Student['grade'] })}>
            <option value="">—</option>
            {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Select label="Estado" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as 'ativo' | 'inativo' })}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Select>
          <Select label="Dia" value={form.scheduleDay} onChange={e => setForm({ ...form, scheduleDay: e.target.value })}>
            {WEEKDAYS.map(d => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select label="Hora" value={form.scheduleHour} onChange={e => setForm({ ...form, scheduleHour: e.target.value })}>
            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
          </Select>
        </div>

        <div className="mt-4">
          <Textarea label="Notas internas" rows={3} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        </div>
      </Modal>
    </div>
  )
}

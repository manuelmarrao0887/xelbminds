import { useMemo, useState } from 'react'
import { Plus, Target, CheckCircle2, Trash2 } from 'lucide-react'
import { Card, CardHeader, PageHeader, Button, Modal, Input, Textarea, Select, ProgressBar, Badge, EmptyState } from '@/components/ui'
import { useGoals, useStudents } from '@/hooks/useCollection'
import { goalsService } from '@/services/domain'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { uid } from '@/lib/utils'
import type { Goal } from '@/types'

export function GoalsPage() {
  const user = useAuthStore(s => s.user)!
  const [students] = useStudents()
  const [goals, reload] = useGoals()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<Omit<Goal, 'id' | 'createdAt' | 'achieved'>>({
    studentId: user.studentIds?.[0] ?? '',
    subject: '',
    description: '',
    targetGrade: 16,
    currentGrade: 12
  })

  const myStudents = useMemo(() =>
    user.studentIds ? students.filter(s => user.studentIds!.includes(s.id)) : students,
    [students, user])

  const myGoals = useMemo(() =>
    user.studentIds
      ? goals.filter(g => user.studentIds!.includes(g.studentId))
      : goals,
    [goals, user])

  const save = async () => {
    if (!form.studentId || !form.subject || !form.description) {
      toast.error('Preencha todos os campos')
      return
    }
    await goalsService.create({
      ...form,
      id: uid('g-'),
      createdAt: new Date().toISOString(),
      achieved: false
    })
    toast.success('Objetivo criado! Boa sorte 🎯')
    setOpen(false)
    await reload()
  }

  const toggle = async (g: Goal) => {
    await goalsService.update(g.id, { achieved: !g.achieved })
    if (!g.achieved) toast.success('Objetivo concluído! 🎉')
    await reload()
  }

  const remove = async (id: string) => {
    if (!confirm('Eliminar este objetivo?')) return
    await goalsService.remove(id)
    await reload()
  }

  return (
    <div>
      <PageHeader
        title="Os Meus Objetivos"
        subtitle="Define metas e acompanha o progresso"
        action={<Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Novo objetivo</Button>}
      />

      {myGoals.length === 0 ? (
        <EmptyState
          icon={<Target size={48} />}
          title="Sem objetivos"
          description="Define o teu primeiro objetivo (ex: subir de 12 → 16 a Matemática)"
          action={<Button onClick={() => setOpen(true)} leftIcon={<Plus size={16} />}>Criar objetivo</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {myGoals.map(g => {
            const student = students.find(s => s.id === g.studentId)
            const progress = g.currentGrade != null ? Math.min((g.currentGrade / g.targetGrade) * 100, 100) : 0
            return (
              <Card key={g.id} className={g.achieved ? 'bg-emerald-50 border-emerald-200' : ''}>
                <div className="flex items-start justify-between mb-2">
                  <Badge tone={g.achieved ? 'success' : 'teal'}>{g.subject}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" leftIcon={<CheckCircle2 size={14} className={g.achieved ? 'text-emerald-600' : ''} />} onClick={() => toggle(g)} />
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => remove(g.id)} />
                  </div>
                </div>
                {student && <div className="text-xs text-ink-500 mb-1">{student.name}</div>}
                <h3 className={`font-display font-bold mb-3 ${g.achieved ? 'line-through text-ink-500' : 'text-ink-900'}`}>{g.description}</h3>
                <div className="flex items-end justify-between mb-1">
                  <div>
                    <div className="text-xs text-ink-500">Atual</div>
                    <div className="text-2xl font-display font-extrabold text-ink-800">{g.currentGrade ?? '—'}</div>
                  </div>
                  <div className="text-ink-300">→</div>
                  <div className="text-right">
                    <div className="text-xs text-ink-500">Meta</div>
                    <div className="text-2xl font-display font-extrabold text-teal-700">{g.targetGrade}</div>
                  </div>
                </div>
                <ProgressBar value={progress} max={100} tone={g.achieved ? 'success' : 'teal'} />
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo Objetivo"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Criar</Button>
          </>
        }
      >
        <div className="space-y-3">
          {myStudents.length > 1 && (
            <Select label="Aluno" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
              <option value="">—</option>
              {myStudents.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          )}
          <Input label="Disciplina" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="Matemática" />
          <Textarea label="Descrição" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Atingir 16 valores no 3º período" />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Nota atual" type="number" value={form.currentGrade ?? ''} onChange={e => setForm({ ...form, currentGrade: Number(e.target.value) })} />
            <Input label="Meta" type="number" value={form.targetGrade} onChange={e => setForm({ ...form, targetGrade: Number(e.target.value) })} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

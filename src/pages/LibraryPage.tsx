import { useMemo, useState } from 'react'
import { Plus, Search, FileText, Download, Trash2, BookOpen, Video, Presentation, ClipboardCheck } from 'lucide-react'
import {
  Card, CardHeader, PageHeader, Button, Modal, Input, Select, Badge, EmptyState
} from '@/components/ui'
import { useMaterials } from '@/hooks/useCollection'
import { materialsService } from '@/services/domain'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { SUBJECTS, GRADES } from '@/lib/constants'
import { formatDate, uid } from '@/lib/utils'
import type { Material } from '@/types'

const TYPE_ICONS = {
  'Ficha': FileText,
  'Resumo': BookOpen,
  'Teste': ClipboardCheck,
  'Apresentação': Presentation,
  'Vídeo': Video
}

export function LibraryPage() {
  const user = useAuthStore(s => s.user)!
  const [materials, reload] = useMaterials()
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('')
  const [gradeFilter, setGradeFilter] = useState('')
  const [form, setForm] = useState<Omit<Material, 'id' | 'uploadedAt' | 'uploadedBy'>>({
    title: '', subject: SUBJECTS[0], grade: '5º Ano', type: 'Ficha', fileName: ''
  })

  const filtered = useMemo(() => materials.filter(m =>
    m.title.toLowerCase().includes(search.toLowerCase()) &&
    (subjectFilter === '' || m.subject === subjectFilter) &&
    (gradeFilter === '' || m.grade === gradeFilter)
  ), [materials, search, subjectFilter, gradeFilter])

  const grouped = useMemo(() => {
    const m: Record<string, Material[]> = {}
    filtered.forEach(mat => {
      if (!m[mat.subject]) m[mat.subject] = []
      m[mat.subject].push(mat)
    })
    return m
  }, [filtered])

  const save = async () => {
    if (!form.title || !form.fileName) { toast.error('Título e ficheiro obrigatórios'); return }
    await materialsService.create({
      ...form,
      id: uid('m-'),
      uploadedAt: new Date().toISOString().slice(0, 10),
      uploadedBy: user.name
    })
    toast.success('Material adicionado')
    setOpen(false)
    setForm({ title: '', subject: SUBJECTS[0], grade: '5º Ano', type: 'Ficha', fileName: '' })
    await reload()
  }

  const remove = async (id: string) => {
    if (!confirm('Eliminar material?')) return
    await materialsService.remove(id)
    await reload()
  }

  return (
    <div>
      <PageHeader
        title="Biblioteca de Materiais"
        subtitle={`${materials.length} ficheiros · ${Object.keys(grouped).length} disciplinas`}
        action={<Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Adicionar</Button>}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <div className="md:col-span-1 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-ink-200 bg-white text-sm"
          />
        </div>
        <Select value={subjectFilter} onChange={e => setSubjectFilter(e.target.value)}>
          <option value="">Todas disciplinas</option>
          {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Select value={gradeFilter} onChange={e => setGradeFilter(e.target.value)}>
          <option value="">Todos os anos</option>
          {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
        </Select>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="Sem materiais" description="Adicione fichas, resumos, testes para reutilizar nas aulas" />
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([subject, items]) => (
            <Card key={subject}>
              <CardHeader title={subject} subtitle={`${items.length} ficheiros`} />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map(m => {
                  const Icon = TYPE_ICONS[m.type]
                  return (
                    <div key={m.id} className="flex items-start gap-3 p-3 bg-ink-50 rounded-xl hover:bg-ink-100 transition">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-teal-700 shrink-0">
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-ink-800 truncate">{m.title}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge tone="sage">{m.grade}</Badge>
                          <Badge tone="teal">{m.type}</Badge>
                        </div>
                        <div className="text-[10px] text-ink-400 mt-1">{m.uploadedBy} · {formatDate(m.uploadedAt)}</div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button variant="ghost" size="sm" leftIcon={<Download size={12} />} onClick={() => toast.info(`Download: ${m.fileName}`)} />
                        <Button variant="ghost" size="sm" leftIcon={<Trash2 size={12} />} onClick={() => remove(m.id)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Adicionar Material"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Adicionar</Button>
          </>
        }
      >
        <div className="space-y-3">
          <Input label="Título*" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ficha — Equações 2º grau" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Disciplina" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
            <Select label="Ano" value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}>
              {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
            </Select>
          </div>
          <Select label="Tipo" value={form.type} onChange={e => setForm({ ...form, type: e.target.value as Material['type'] })}>
            <option>Ficha</option><option>Resumo</option><option>Teste</option><option>Apresentação</option><option>Vídeo</option>
          </Select>
          <Input label="Nome do ficheiro*" value={form.fileName} onChange={e => setForm({ ...form, fileName: e.target.value })} placeholder="material.pdf" />
        </div>
      </Modal>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { CheckCircle2, AlertTriangle, TrendingUp, MessageCircle, FileText, Copy, Printer } from 'lucide-react'
import {
  Card, PageHeader, StatCard, Button, SearchBar, Avatar, Badge, Modal, Textarea
} from '@/components/ui'
import { useStudents, usePayments } from '@/hooks/useCollection'
import { paymentsService } from '@/services/domain'
import { toast } from '@/store/toastStore'
import { formatEUR, formatDate } from '@/lib/utils'
import type { Payment, Student } from '@/types'

export function FinancialPage() {
  const [students] = useStudents()
  const [payments, reload] = usePayments()
  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid'>('all')
  const [monthFilter, setMonthFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [waModal, setWaModal] = useState<{ payment: Payment; student: Student } | null>(null)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [receipt, setReceipt] = useState<Payment | null>(null)

  const months = useMemo(() => [...new Set(payments.map(p => p.month))], [payments])

  const filtered = payments.filter(p => {
    const fp = filter === 'all' || (filter === 'paid' ? p.paid : !p.paid)
    const fm = monthFilter === 'all' || p.month === monthFilter
    const fs = p.studentName.toLowerCase().includes(search.toLowerCase())
    return fp && fm && fs
  })

  const totalPaid = payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
  const totalPending = payments.filter(p => !p.paid).reduce((a, p) => a + p.amount, 0)
  const debtorsByStudent = useMemo(() => {
    const m: Record<string, { sn: string; sid: string; total: number; months: string[] }> = {}
    payments.filter(p => !p.paid).forEach(p => {
      if (!m[p.studentId]) m[p.studentId] = { sn: p.studentName, sid: p.studentId, total: 0, months: [] }
      m[p.studentId].total += p.amount
      m[p.studentId].months.push(p.month)
    })
    return Object.values(m).sort((a, b) => b.total - a.total)
  }, [payments])

  const togglePaid = async (p: Payment) => {
    const next = !p.paid
    await paymentsService.update(p.id, { paid: next, paidDate: next ? new Date().toISOString().slice(0, 10) : null })
    toast.success(next ? 'Marcado como pago' : 'Anulado')
    await reload()
  }

  const collectionRate = (totalPaid + totalPending) ? Math.round(totalPaid / (totalPaid + totalPending) * 100) : 0

  return (
    <div>
      <PageHeader title="Gestão Financeira" subtitle="Mensalidades, cobranças e estado" />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
        <StatCard label="Recebido" value={formatEUR(totalPaid)} icon={<CheckCircle2 size={20} />} tone="success" />
        <StatCard label="Pendente" value={formatEUR(totalPending)} hint={`${debtorsByStudent.length} alunos`} icon={<AlertTriangle size={20} />} tone="danger" />
        <StatCard label="Taxa de Cobrança" value={`${collectionRate}%`} icon={<TrendingUp size={20} />} tone="teal" />
      </div>

      {debtorsByStudent.length > 0 && (
        <Card className="mb-4 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="font-semibold text-amber-900">
              {debtorsByStudent.length} alunos com pagamentos pendentes — {formatEUR(totalPending)} no total
            </div>
            <Button variant="whatsapp" leftIcon={<MessageCircle size={14} />} onClick={() => setBulkOpen(true)}>
              Cobrar todos via WhatsApp
            </Button>
          </div>
        </Card>
      )}

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <SearchBar value={search} onChange={setSearch} placeholder="Procurar aluno..." />
        </div>
        <div className="flex gap-1.5">
          {([['all', 'Todos'], ['paid', 'Pagos'], ['unpaid', 'Pendentes']] as const).map(([k, l]) => (
            <Button
              key={k}
              variant={filter === k ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter(k)}
            >
              {l}
            </Button>
          ))}
        </div>
        <select
          value={monthFilter}
          onChange={e => setMonthFilter(e.target.value)}
          className="h-10 px-3.5 rounded-xl border border-ink-200 bg-white text-sm font-semibold cursor-pointer"
        >
          <option value="all">Todos os meses</option>
          {months.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 text-left">
                {['Aluno', 'Mês', 'Valor', 'Estado', 'Ações'].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 80).map(p => (
                <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50/50">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <Avatar name={p.studentName} size={30} />
                      <span className="font-semibold text-ink-800">{p.studentName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-ink-600">{p.month}</td>
                  <td className="px-4 py-2.5 font-bold">{formatEUR(p.amount)}</td>
                  <td className="px-4 py-2.5">
                    <Badge tone={p.paid ? 'success' : 'danger'}>{p.paid ? 'Pago' : 'Pendente'}</Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant={p.paid ? 'outline' : 'success'}
                        onClick={() => togglePaid(p)}
                      >
                        {p.paid ? 'Anular' : 'Marcar Pago'}
                      </Button>
                      {p.paid && (
                        <Button size="sm" variant="outline" leftIcon={<FileText size={14} />} onClick={() => setReceipt(p)}>
                          Recibo
                        </Button>
                      )}
                      {!p.paid && (
                        <Button
                          size="sm"
                          variant="whatsapp"
                          leftIcon={<MessageCircle size={14} />}
                          onClick={() => {
                            const st = students.find(s => s.id === p.studentId)
                            if (st) setWaModal({ payment: p, student: st })
                          }}
                        >
                          Cobrar
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* WA single message modal */}
      {waModal && (() => {
        const msg = `Olá! 👋\nLembrete da *XelbMinds* — Centro de Explicações.\n\nO pagamento de *${waModal.payment.month}* (*${formatEUR(waModal.payment.amount)}*) para o/a aluno/a *${waModal.student.name}* encontra-se pendente.\n\nAgradecemos a regularização logo que possível.\n\nObrigado! 🙏`
        const phone = waModal.student.parentPhone.replace(/\D/g, '')
        return (
          <Modal
            open
            onClose={() => setWaModal(null)}
            title="Cobrança via WhatsApp"
            size="md"
            footer={
              <>
                <Button variant="ghost" onClick={() => setWaModal(null)}>Cancelar</Button>
                <Button variant="outline" leftIcon={<Copy size={14} />} onClick={() => { navigator.clipboard.writeText(msg); toast.success('Mensagem copiada') }}>Copiar</Button>
                <Button variant="whatsapp" leftIcon={<MessageCircle size={14} />} onClick={() => { window.open(`https://wa.me/351${phone}?text=${encodeURIComponent(msg)}`, '_blank'); toast.success('WhatsApp aberto') }}>Abrir WhatsApp</Button>
              </>
            }
          >
            <div className="text-xs text-ink-500 mb-3">
              <strong>Encarregado:</strong> {waModal.student.parentName} ({waModal.student.parentPhone})
            </div>
            <Textarea rows={9} readOnly value={msg} className="bg-sage-50 font-mono text-[12px]" />
          </Modal>
        )
      })()}

      {/* Bulk WA modal */}
      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Cobrança em Massa"
        size="lg"
        footer={<Button variant="ghost" onClick={() => setBulkOpen(false)}>Fechar</Button>}
      >
        <div className="divide-y divide-ink-100">
          {debtorsByStudent.map(d => {
            const student = students.find(s => s.id === d.sid)
            const phone = student?.parentPhone.replace(/\D/g, '') ?? ''
            const msg = `Olá! 👋\n*XelbMinds*\n${d.sn} — dívida total: *${formatEUR(d.total)}*\nMeses: ${d.months.join(', ')}\nAgradecemos a regularização.\nObrigado! 🙏`
            return (
              <div key={d.sid} className="flex items-center justify-between py-3 gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar name={d.sn} size={32} />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-800 truncate">{d.sn}</div>
                    <div className="text-[11px] text-ink-500 truncate">{d.months.join(', ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone="danger">{formatEUR(d.total)}</Badge>
                  <Button size="sm" variant="outline" leftIcon={<Copy size={12} />} onClick={() => { navigator.clipboard.writeText(msg); toast.success('Copiado') }}>Copiar</Button>
                  <Button size="sm" variant="whatsapp" leftIcon={<MessageCircle size={12} />} onClick={() => window.open(`https://wa.me/351${phone}?text=${encodeURIComponent(msg)}`, '_blank')}>WA</Button>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>

      {/* Receipt modal */}
      <Modal
        open={!!receipt}
        onClose={() => setReceipt(null)}
        title="Recibo Demo"
        size="md"
        footer={
          <>
            <Button variant="outline" leftIcon={<Printer size={14} />} onClick={() => { window.print(); toast.success('A imprimir...') }}>Imprimir</Button>
            <Button variant="primary" onClick={() => setReceipt(null)}>Fechar</Button>
          </>
        }
      >
        {receipt && (
          <div className="border-2 border-dashed border-ink-200 rounded-2xl p-6">
            <div className="text-center mb-4">
              <div className="text-xl font-display font-extrabold text-teal-700">XelbMinds</div>
              <div className="text-xs text-ink-500">Aprender & Crescer</div>
            </div>
            <div className="border-t border-b border-ink-200 py-3 my-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Recibo Nº:</span><span className="font-bold">{receipt.invoiceNumber || 'XM-DEMO'}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Aluno:</span><span className="font-semibold">{receipt.studentName}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Mês:</span><span>{receipt.month}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Data pagamento:</span><span>{receipt.paidDate ? formatDate(receipt.paidDate) : '—'}</span></div>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="font-bold text-ink-800">TOTAL</span>
              <span className="text-2xl font-display font-extrabold text-emerald-600">{formatEUR(receipt.amount)}</span>
            </div>
            <p className="text-[10px] text-ink-400 text-center mt-4">Recibo emitido em modo demo · Sem valor fiscal</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

import { useMemo, useState } from 'react'
import { Plus, Trash2, TrendingUp, Receipt, Wallet, Percent } from 'lucide-react'
import {
  Card, CardHeader, PageHeader, StatCard, Button, Badge, Modal, Input, Select, ProgressBar
} from '@/components/ui'
import { useExpenses, usePayments } from '@/hooks/useCollection'
import { expensesService } from '@/services/domain'
import { toast } from '@/store/toastStore'
import { formatEUR } from '@/lib/utils'
import type { Expense } from '@/types'

const CATEGORIES: Expense['category'][] = ['Instalações', 'Material', 'Tecnologia', 'Seguros', 'Marketing', 'Serviços', 'Pessoal', 'Outros']

export function ExpensesPage() {
  const [expenses, reload] = useExpenses()
  const [payments] = usePayments()
  const [open, setOpen] = useState(false)
  const [monthFilter, setMonthFilter] = useState('Maio 2026')
  const [form, setForm] = useState<Omit<Expense, 'id'>>({ description: '', amount: 0, category: 'Instalações', month: 'Maio 2026', recurring: false })

  const months = useMemo(() => [...new Set(expenses.map(e => e.month))], [expenses])
  const filtered = monthFilter === 'all' ? expenses : expenses.filter(e => e.month === monthFilter)
  const byCategory: Record<string, number> = {}
  filtered.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount })
  const totalExp = filtered.reduce((a, e) => a + e.amount, 0)
  const monthRevenue = payments.filter(p => p.paid && (monthFilter === 'all' || p.month === monthFilter)).reduce((a, p) => a + p.amount, 0)
  const profit = monthRevenue - totalExp
  const margin = monthRevenue ? Math.round((profit / monthRevenue) * 100) : 0

  const remove = async (id: string) => {
    await expensesService.remove(id)
    toast.success('Despesa removida')
    await reload()
  }

  const save = async () => {
    if (!form.description.trim() || !form.amount) {
      toast.error('Descrição e valor obrigatórios')
      return
    }
    await expensesService.create(form)
    toast.success('Despesa adicionada')
    setOpen(false)
    setForm({ description: '', amount: 0, category: 'Instalações', month: monthFilter === 'all' ? 'Maio 2026' : monthFilter, recurring: false })
    await reload()
  }

  return (
    <div>
      <PageHeader
        title="Despesas & Lucro"
        subtitle="Acompanhamento mensal de custos e rentabilidade"
        action={<Button leftIcon={<Plus size={16} />} onClick={() => setOpen(true)}>Nova Despesa</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Receita" value={formatEUR(monthRevenue)} icon={<TrendingUp size={20} />} tone="success" />
        <StatCard label="Despesas" value={formatEUR(totalExp)} icon={<Receipt size={20} />} tone="warning" />
        <StatCard label={profit >= 0 ? 'Lucro' : 'Prejuízo'} value={`${profit > 0 ? '+' : ''}${formatEUR(profit)}`} icon={<Wallet size={20} />} tone={profit >= 0 ? 'success' : 'danger'} />
        <StatCard label="Margem" value={`${margin}%`} icon={<Percent size={20} />} tone={margin >= 30 ? 'success' : margin >= 10 ? 'warning' : 'danger'} />
      </div>

      <select
        value={monthFilter}
        onChange={e => setMonthFilter(e.target.value)}
        className="h-10 px-3.5 rounded-xl border border-ink-200 bg-white text-sm font-semibold cursor-pointer mb-4"
      >
        <option value="all">Todos os meses</option>
        {months.map(m => <option key={m} value={m}>{m}</option>)}
      </select>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card padding="none" className="lg:col-span-2 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 text-left">
                {['Descrição', 'Categoria', 'Valor', 'Tipo', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} className="border-t border-ink-100">
                  <td className="px-4 py-2.5 font-semibold text-ink-800">{e.description}</td>
                  <td className="px-4 py-2.5"><Badge tone="purple">{e.category}</Badge></td>
                  <td className="px-4 py-2.5 font-bold text-red-600">{formatEUR(e.amount)}</td>
                  <td className="px-4 py-2.5"><Badge tone={e.recurring ? 'info' : 'neutral'}>{e.recurring ? 'Mensal' : 'Pontual'}</Badge></td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" leftIcon={<Trash2 size={14} />} onClick={() => remove(e.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <Card>
          <CardHeader title="Por Categoria" />
          <div className="space-y-3">
            {Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-700">{cat}</span>
                  <span className="font-semibold">{formatEUR(val)}</span>
                </div>
                <ProgressBar value={val} max={Math.max(...Object.values(byCategory))} tone="purple" />
              </div>
            ))}
          </div>
          <div className={`mt-4 rounded-xl p-3 text-center ${profit >= 0 ? 'bg-emerald-50' : 'bg-red-50'}`}>
            <div className={`text-[10px] font-bold uppercase tracking-wider ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>Lucro líquido</div>
            <div className={`text-2xl font-display font-extrabold ${profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {profit > 0 ? '+' : ''}{formatEUR(profit)}
            </div>
          </div>
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nova Despesa"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Guardar</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Descrição" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="Valor (€)" type="number" value={form.amount || ''} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} />
            <Select label="Categoria" value={form.category} onChange={e => setForm({ ...form, category: e.target.value as Expense['category'] })}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <Select label="Mês" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })}>
            <option>Maio 2026</option>
            <option>Junho 2026</option>
            <option>Julho 2026</option>
          </Select>
          <label className="flex items-center gap-2 text-sm text-ink-700 cursor-pointer">
            <input type="checkbox" checked={form.recurring} onChange={e => setForm({ ...form, recurring: e.target.checked })} className="rounded" />
            Despesa recorrente
          </label>
        </div>
      </Modal>
    </div>
  )
}

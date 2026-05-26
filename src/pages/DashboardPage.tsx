import { useMemo } from 'react'
import {
  Users, Wallet, CheckCircle2, AlertTriangle, Receipt, TrendingUp, Percent, Calendar
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts'
import { Card, CardHeader, StatCard, Avatar, Badge, ProgressBar, PageHeader } from '@/components/ui'
import { useStudents, usePayments, useLessons, useExpenses } from '@/hooks/useCollection'
import { formatEUR } from '@/lib/utils'
import { EVALS, MONTHLY_FEE } from '@/lib/constants'

const CURRENT_MONTH = 'Maio 2026'

export function DashboardPage() {
  const [students] = useStudents()
  const [payments] = usePayments()
  const [lessons] = useLessons()
  const [expenses] = useExpenses()

  const data = useMemo(() => {
    const active = students.filter(s => s.status === 'ativo')
    const totalPaid = payments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
    const totalPending = payments.filter(p => !p.paid).reduce((a, p) => a + p.amount, 0)
    const monthPayments = payments.filter(p => p.month === CURRENT_MONTH)
    const collection = monthPayments.length ? Math.round(monthPayments.filter(p => p.paid).length / monthPayments.length * 100) : 0
    const attendance = lessons.length ? Math.round(lessons.filter(l => l.attendance).length / lessons.length * 100) : 0
    const monthExpenses = expenses.filter(e => e.month === CURRENT_MONTH).reduce((a, e) => a + e.amount, 0)
    const monthRevenue = monthPayments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
    const profit = monthRevenue - monthExpenses

    const topDebts = students.map(s => ({
      ...s,
      debt: payments.filter(p => p.studentId === s.id && !p.paid).reduce((a, p) => a + p.amount, 0)
    })).filter(s => s.debt > 0).sort((a, b) => b.debt - a.debt).slice(0, 6)

    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio']
    const chartData = months.map((m, i) => {
      const mp = payments.filter(p => p.month.startsWith(m))
      return {
        m: m.slice(0, 3),
        Recebido: mp.filter(p => p.paid).reduce((a, p) => a + p.amount, 0),
        Pendente: mp.filter(p => !p.paid).reduce((a, p) => a + p.amount, 0)
      }
    })

    const evalDist: Record<string, number> = {}
    lessons.forEach(l => { evalDist[l.evaluation] = (evalDist[l.evaluation] || 0) + 1 })

    const subjectCount: Record<string, number> = {}
    active.forEach(s => s.subjects.forEach(sub => { subjectCount[sub] = (subjectCount[sub] || 0) + 1 }))
    const subjectsSorted = Object.entries(subjectCount).sort((a, b) => b[1] - a[1])

    return { active, totalPaid, totalPending, collection, attendance, monthExpenses, profit, topDebts, chartData, evalDist, subjectsSorted, total: students.length }
  }, [students, payments, lessons, expenses])

  return (
    <div>
      <PageHeader title="Painel de Controlo" subtitle={`XelbMinds · ${CURRENT_MONTH}`} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Alunos Ativos" value={data.active.length} hint={`${data.total} total`} icon={<Users size={20} />} tone="teal" />
        <StatCard label="Receita Mensal" value={formatEUR(data.active.length * MONTHLY_FEE)} hint={`${MONTHLY_FEE}€/aluno`} icon={<Wallet size={20} />} tone="sage" />
        <StatCard label="Recebido" value={formatEUR(data.totalPaid)} icon={<CheckCircle2 size={20} />} tone="success" />
        <StatCard label="Em Dívida" value={formatEUR(data.totalPending)} hint={`${data.topDebts.length} alunos`} icon={<AlertTriangle size={20} />} tone="danger" />
        <StatCard label={`Despesas ${CURRENT_MONTH.split(' ')[0]}`} value={formatEUR(data.monthExpenses)} icon={<Receipt size={20} />} tone="warning" />
        <StatCard label="Lucro Mensal" value={`${data.profit > 0 ? '+' : ''}${formatEUR(data.profit)}`} icon={<TrendingUp size={20} />} tone={data.profit > 0 ? 'success' : 'danger'} />
        <StatCard label="Cobrança" value={`${data.collection}%`} icon={<Percent size={20} />} tone={data.collection > 70 ? 'success' : 'warning'} />
        <StatCard label="Assiduidade" value={`${data.attendance}%`} icon={<Calendar size={20} />} tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="lg:col-span-2">
          <CardHeader title="Receita 2026" subtitle="Recebido vs pendente por mês" />
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data.chartData} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #E5E7EB', fontSize: 12 }}
                formatter={(v: number) => `${v}€`}
              />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Recebido" stackId="a" fill="#7DA13E" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Pendente" stackId="a" fill="#FCA5A5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card>
          <CardHeader title="Avaliações" subtitle="Distribuição das aulas" />
          <div className="space-y-3">
            {EVALS.map(e => {
              const count = data.evalDist[e] || 0
              const max = Math.max(...Object.values(data.evalDist), 1)
              const tone = e === 'Excelente' ? 'success' : e === 'Muito Bom' ? 'sage' : e === 'Bom' ? 'teal' : e === 'Suficiente' ? 'warning' : 'danger'
              return (
                <div key={e}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-semibold text-ink-700">{e}</span>
                    <span className="text-ink-500">{count}</span>
                  </div>
                  <ProgressBar value={count} max={max} tone={tone as 'success'} />
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Maiores Dívidas" subtitle="Top alunos com pagamentos em atraso" />
          {data.topDebts.length === 0 ? (
            <p className="text-sm text-ink-400 py-4 text-center">Sem dívidas em atraso 🎉</p>
          ) : (
            <div className="divide-y divide-ink-100">
              {data.topDebts.map(s => (
                <div key={s.id} className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <Avatar name={s.name} size={32} />
                    <div>
                      <div className="font-semibold text-sm text-ink-800">{s.name}</div>
                      <div className="text-xs text-ink-500">{s.parentName} · {s.parentPhone}</div>
                    </div>
                  </div>
                  <Badge tone="danger">{formatEUR(s.debt)}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Por Disciplina" subtitle="Distribuição de alunos ativos" />
          <div className="space-y-3">
            {data.subjectsSorted.map(([sub, cnt]) => (
              <div key={sub}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-ink-700">{sub}</span>
                  <span className="font-semibold">{cnt}</span>
                </div>
                <ProgressBar value={cnt} max={data.subjectsSorted[0][1]} tone="teal" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

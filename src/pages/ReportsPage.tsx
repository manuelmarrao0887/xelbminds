import { useMemo, useState } from 'react'
import { FileDown, Receipt, Users, Wallet } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Card, CardHeader, PageHeader, Button, Select } from '@/components/ui'
import { useStudents, usePayments, useExpenses } from '@/hooks/useCollection'
import { toast } from '@/store/toastStore'

export function ReportsPage() {
  const [students] = useStudents()
  const [payments] = usePayments()
  const [expenses] = useExpenses()
  const [month, setMonth] = useState('Maio 2026')

  const months = useMemo(() => [...new Set(payments.map(p => p.month))], [payments])

  const data = useMemo(() => {
    const monthPayments = payments.filter(p => p.month === month)
    const monthExpenses = expenses.filter(e => e.month === month)
    const revenue = monthPayments.filter(p => p.paid).reduce((a, p) => a + p.amount, 0)
    const pending = monthPayments.filter(p => !p.paid).reduce((a, p) => a + p.amount, 0)
    const totalExp = monthExpenses.reduce((a, e) => a + e.amount, 0)
    const profit = revenue - totalExp
    const active = students.filter(s => s.status === 'ativo').length
    const debtors = monthPayments.filter(p => !p.paid)
    return { revenue, pending, totalExp, profit, active, debtors, monthPayments, monthExpenses }
  }, [payments, expenses, students, month])

  const generateMonthlyPDF = () => {
    const doc = new jsPDF()

    // Header
    doc.setFontSize(20)
    doc.setTextColor(62, 112, 136)
    doc.text('XelbMinds', 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text('Relatório Mensal — ' + month, 14, 25)
    doc.text(`Gerado em ${new Date().toLocaleDateString('pt-PT')}`, 14, 30)

    // KPIs
    doc.setFontSize(14)
    doc.setTextColor(31, 41, 55)
    doc.text('Resumo Executivo', 14, 42)

    autoTable(doc, {
      startY: 46,
      head: [['Métrica', 'Valor']],
      body: [
        ['Alunos Ativos', String(data.active)],
        ['Receita recebida', `${data.revenue}€`],
        ['Pendente', `${data.pending}€`],
        ['Despesas totais', `${data.totalExp}€`],
        ['Lucro líquido', `${data.profit > 0 ? '+' : ''}${data.profit}€`],
        ['Margem', `${data.revenue ? Math.round(data.profit / data.revenue * 100) : 0}%`]
      ],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [90, 139, 157] }
    })

    // Payments
    doc.setFontSize(14)
    doc.text('Pagamentos', 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10)

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14,
      head: [['Aluno', 'Valor', 'Estado']],
      body: data.monthPayments.map(p => [p.studentName, `${p.amount}€`, p.paid ? 'Pago' : 'Pendente']),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [124, 161, 62] }
    })

    // Expenses
    doc.setFontSize(14)
    doc.text('Despesas', 14, (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10)

    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 14,
      head: [['Descrição', 'Categoria', 'Valor']],
      body: data.monthExpenses.map(e => [e.description, e.category, `${e.amount}€`]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [220, 38, 38] }
    })

    // Footer
    const pageCount = doc.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`XelbMinds · Página ${i}/${pageCount}`, 14, 290)
    }

    doc.save(`relatorio-${month.replace(' ', '-').toLowerCase()}.pdf`)
    toast.success('Relatório gerado')
  }

  const generateStudentsPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(62, 112, 136)
    doc.text('XelbMinds — Lista de Alunos', 14, 18)
    doc.setFontSize(10)
    doc.setTextColor(120)
    doc.text(`${students.length} alunos · Gerado em ${new Date().toLocaleDateString('pt-PT')}`, 14, 24)

    autoTable(doc, {
      startY: 30,
      head: [['Nome', 'Ano', 'Disciplinas', 'Estado', 'Tel. enc.']],
      body: students.map(s => [s.name, s.grade, s.subjects.join(', '), s.status, s.parentPhone]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [90, 139, 157] }
    })

    doc.save(`alunos-${new Date().toISOString().slice(0, 10)}.pdf`)
    toast.success('Lista exportada')
  }

  const exportPaymentsCSV = () => {
    const csv = [
      ['Aluno', 'Mês', 'Valor', 'Estado', 'Data pagamento'].join(','),
      ...payments.map(p => [`"${p.studentName}"`, p.month, p.amount, p.paid ? 'Pago' : 'Pendente', p.paidDate || ''].join(','))
    ].join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pagamentos-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exportado')
  }

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Exportar PDFs e CSVs com os dados do centro" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="w-12 h-12 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center mb-3"><Receipt size={22} /></div>
          <h3 className="font-display font-bold mb-1">Relatório Mensal</h3>
          <p className="text-sm text-ink-500 mb-3">KPIs, pagamentos e despesas do mês escolhido</p>
          <Select label="Mês" value={month} onChange={e => setMonth(e.target.value)}>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </Select>
          <Button className="w-full mt-3" leftIcon={<FileDown size={14} />} onClick={generateMonthlyPDF}>Gerar PDF</Button>
        </Card>

        <Card>
          <div className="w-12 h-12 bg-sage-50 text-sage-700 rounded-2xl flex items-center justify-center mb-3"><Users size={22} /></div>
          <h3 className="font-display font-bold mb-1">Lista de Alunos</h3>
          <p className="text-sm text-ink-500 mb-3">Todos os alunos com contactos e dados</p>
          <div className="bg-ink-50 p-3 rounded-xl mb-3">
            <div className="text-xs text-ink-500">Total no centro</div>
            <div className="text-2xl font-display font-extrabold text-ink-800">{students.length}</div>
          </div>
          <Button className="w-full" variant="secondary" leftIcon={<FileDown size={14} />} onClick={generateStudentsPDF}>Gerar PDF</Button>
        </Card>

        <Card>
          <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mb-3"><Wallet size={22} /></div>
          <h3 className="font-display font-bold mb-1">Pagamentos CSV</h3>
          <p className="text-sm text-ink-500 mb-3">Histórico completo para contabilidade</p>
          <div className="bg-ink-50 p-3 rounded-xl mb-3">
            <div className="text-xs text-ink-500">Total de registos</div>
            <div className="text-2xl font-display font-extrabold text-ink-800">{payments.length}</div>
          </div>
          <Button className="w-full" variant="outline" leftIcon={<FileDown size={14} />} onClick={exportPaymentsCSV}>Exportar CSV</Button>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader title="Pré-visualização" subtitle={`Resumo de ${month}`} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-emerald-50 p-3 rounded-xl">
            <div className="text-xs text-emerald-700 font-semibold">Receita</div>
            <div className="text-xl font-display font-extrabold text-emerald-700">{data.revenue}€</div>
          </div>
          <div className="bg-red-50 p-3 rounded-xl">
            <div className="text-xs text-red-700 font-semibold">Pendente</div>
            <div className="text-xl font-display font-extrabold text-red-700">{data.pending}€</div>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl">
            <div className="text-xs text-amber-700 font-semibold">Despesas</div>
            <div className="text-xl font-display font-extrabold text-amber-700">{data.totalExp}€</div>
          </div>
          <div className={`p-3 rounded-xl ${data.profit >= 0 ? 'bg-teal-50' : 'bg-red-50'}`}>
            <div className={`text-xs font-semibold ${data.profit >= 0 ? 'text-teal-700' : 'text-red-700'}`}>Lucro</div>
            <div className={`text-xl font-display font-extrabold ${data.profit >= 0 ? 'text-teal-700' : 'text-red-700'}`}>{data.profit > 0 ? '+' : ''}{data.profit}€</div>
          </div>
        </div>
        <p className="text-xs text-ink-500">{data.debtors.length} aluno(s) com pagamentos pendentes em {month}.</p>
      </Card>
    </div>
  )
}

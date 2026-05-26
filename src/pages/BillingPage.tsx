import { useMemo, useState } from 'react'
import { CreditCard, FileText, Sparkles, CheckCircle2, ExternalLink } from 'lucide-react'
import { Card, CardHeader, PageHeader, Button, Badge, Input, Modal } from '@/components/ui'
import { usePayments, useSettings } from '@/hooks/useCollection'
import { formatEUR, formatDate } from '@/lib/utils'
import { toast } from '@/store/toastStore'

export function BillingPage() {
  const [payments] = usePayments()
  const [settings] = useSettings()
  const [open, setOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<typeof payments[number] | null>(null)

  const issued = useMemo(() => payments.filter(p => p.paid && p.invoiceNumber), [payments])
  const pendingInvoice = useMemo(() => payments.filter(p => p.paid && !p.invoiceNumber), [payments])
  const total = issued.reduce((a, p) => a + p.amount, 0)

  return (
    <div>
      <PageHeader
        title="Faturação & Pagamentos Online"
        subtitle="Pré-visualização V2 · Sem integração real ainda"
      />

      <Card className="mb-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-start gap-3">
          <Sparkles size={22} className="text-purple-600 mt-0.5 shrink-0" />
          <div>
            <div className="font-display font-bold text-purple-900 mb-1">Funcionalidade V2 — UI pré-visualização</div>
            <p className="text-sm text-purple-800">
              Esta área mostra como funcionará a faturação eletrónica (AT) e pagamentos online (MB WAY, Stripe).
              No demo, é tudo mock — não há transações reais. Após integração com backend, os fluxos abaixo ficam funcionais.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader title="Faturado YTD" />
            <FileText size={20} className="text-teal-600" />
          </div>
          <div className="text-3xl font-display font-extrabold text-teal-700">{formatEUR(total)}</div>
          <div className="text-xs text-ink-500 mt-1">{issued.length} faturas emitidas</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader title="A faturar" />
            <Badge tone="warning">{pendingInvoice.length}</Badge>
          </div>
          <div className="text-3xl font-display font-extrabold text-amber-700">{formatEUR(pendingInvoice.reduce((a, p) => a + p.amount, 0))}</div>
          <div className="text-xs text-ink-500 mt-1">Pagamentos sem fatura</div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <CardHeader title="NIF Centro" />
            <CreditCard size={20} className="text-sage-600" />
          </div>
          <div className="text-3xl font-display font-extrabold text-sage-700">{settings?.nif || '—'}</div>
          <div className="text-xs text-ink-500 mt-1">Para faturas oficiais</div>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader
          title="Pagamento Online (Mockup)"
          subtitle="MB WAY / Stripe / Multibanco"
          action={<Button leftIcon={<Sparkles size={14} />} onClick={() => setOpen(true)}>Ver fluxo</Button>}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
          <div className="p-4 bg-ink-50 rounded-2xl text-center">
            <div className="text-4xl mb-2">📱</div>
            <div className="font-semibold text-sm">MB WAY</div>
            <div className="text-xs text-ink-500 mt-1">Pagamento instantâneo via telemóvel</div>
          </div>
          <div className="p-4 bg-ink-50 rounded-2xl text-center">
            <div className="text-4xl mb-2">💳</div>
            <div className="font-semibold text-sm">Cartão (Stripe)</div>
            <div className="text-xs text-ink-500 mt-1">Visa, Mastercard, Apple Pay</div>
          </div>
          <div className="p-4 bg-ink-50 rounded-2xl text-center">
            <div className="text-4xl mb-2">🏦</div>
            <div className="font-semibold text-sm">Multibanco</div>
            <div className="text-xs text-ink-500 mt-1">Referência gerada automaticamente</div>
          </div>
        </div>
      </Card>

      <Card padding="none" className="overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-100">
          <h3 className="font-display font-bold text-ink-900">Faturas Emitidas</h3>
          <p className="text-xs text-ink-500 mt-0.5">Mock — sem comunicação real com Autoridade Tributária</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-ink-50 text-left">
                {['Nº Fatura', 'Aluno', 'Período', 'Data', 'Valor', ''].map(h => (
                  <th key={h} className="px-4 py-3 text-xs font-semibold text-ink-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {issued.slice(0, 20).map(p => (
                <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50/50 cursor-pointer" onClick={() => setSelectedInvoice(p)}>
                  <td className="px-4 py-2.5 font-mono text-xs font-bold text-teal-700">{p.invoiceNumber}</td>
                  <td className="px-4 py-2.5 font-semibold">{p.studentName}</td>
                  <td className="px-4 py-2.5 text-ink-600">{p.month}</td>
                  <td className="px-4 py-2.5 text-ink-600">{p.paidDate ? formatDate(p.paidDate) : '—'}</td>
                  <td className="px-4 py-2.5 font-bold">{formatEUR(p.amount)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <Button variant="ghost" size="sm" leftIcon={<ExternalLink size={12} />} />
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
        title="Demo — Pagamento MB WAY"
        size="md"
        footer={<Button onClick={() => setOpen(false)}>Fechar</Button>}
      >
        <div className="text-center py-4">
          <div className="text-5xl mb-3">📱</div>
          <div className="font-display font-bold text-lg mb-1">Pagamento MB WAY</div>
          <div className="text-sm text-ink-500 mb-4">Demo · sem cobrança real</div>

          <Input label="Número de telemóvel" defaultValue="912 345 678" />

          <div className="bg-ink-50 p-4 rounded-2xl my-4">
            <div className="text-xs text-ink-500 mb-1">Valor a pagar</div>
            <div className="text-4xl font-display font-extrabold text-teal-700">{formatEUR(100)}</div>
            <div className="text-xs text-ink-500 mt-1">XelbMinds · Mensalidade</div>
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              toast.success('Pagamento aprovado (demo)')
              setTimeout(() => setOpen(false), 800)
            }}
            leftIcon={<CheckCircle2 size={18} />}
          >
            Confirmar pagamento
          </Button>
          <p className="text-[10px] text-ink-400 mt-3">Na app MB WAY real, receberá pedido de aprovação no telemóvel</p>
        </div>
      </Modal>

      <Modal
        open={!!selectedInvoice}
        onClose={() => setSelectedInvoice(null)}
        title="Fatura Eletrónica"
        size="md"
      >
        {selectedInvoice && (
          <div className="border-2 border-dashed border-ink-200 rounded-2xl p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-xl font-display font-extrabold text-teal-700">XelbMinds</div>
                <div className="text-xs text-ink-500">{settings?.address}</div>
                <div className="text-xs text-ink-500">NIF: {settings?.nif}</div>
              </div>
              <Badge tone="success">PAGA</Badge>
            </div>
            <div className="border-t border-b border-ink-200 py-3 my-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-ink-500">Fatura:</span><span className="font-mono font-bold">{selectedInvoice.invoiceNumber}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Cliente:</span><span className="font-semibold">{selectedInvoice.studentName}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Período:</span><span>{selectedInvoice.month}</span></div>
              <div className="flex justify-between"><span className="text-ink-500">Data:</span><span>{selectedInvoice.paidDate && formatDate(selectedInvoice.paidDate)}</span></div>
            </div>
            <div className="space-y-1 text-sm mb-3">
              <div className="flex justify-between"><span>Mensalidade XelbMinds</span><span>{formatEUR(selectedInvoice.amount)}</span></div>
              <div className="flex justify-between text-ink-500"><span>IVA (isento — art. 9º CIVA)</span><span>0,00€</span></div>
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-ink-200">
              <span className="font-bold text-ink-800">TOTAL</span>
              <span className="text-2xl font-display font-extrabold text-emerald-600">{formatEUR(selectedInvoice.amount)}</span>
            </div>
            <p className="text-[9px] text-ink-400 text-center mt-4">Documento emitido em modo demo · Sem validade fiscal · Não comunicado à AT</p>
          </div>
        )}
      </Modal>
    </div>
  )
}

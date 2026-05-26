import { useRef, useState } from 'react'
import { Download, Upload, RefreshCw, Save } from 'lucide-react'
import { Card, CardHeader, PageHeader, Button, Input, Textarea } from '@/components/ui'
import { useSettings } from '@/hooks/useCollection'
import { exportBackup, importBackup, resetDemo } from '@/services/db'
import { downloadJSON, readJSON } from '@/lib/utils'
import { toast } from '@/store/toastStore'

export function SettingsPage() {
  const [settings, update] = useSettings()
  const [local, setLocal] = useState(settings)
  const fileRef = useRef<HTMLInputElement>(null)

  if (!settings) return null
  const current = local ?? settings

  const save = async () => {
    await update(current)
    toast.success('Definições guardadas')
  }

  const onExport = () => {
    downloadJSON(exportBackup(), `xelbminds-backup-${new Date().toISOString().slice(0, 10)}.json`)
    toast.success('Backup exportado')
  }

  const onImport = async (file: File) => {
    try {
      const data = await readJSON<Record<string, unknown>>(file)
      importBackup(data)
      toast.success('Backup importado. A recarregar...')
      setTimeout(() => window.location.reload(), 800)
    } catch {
      toast.error('Ficheiro inválido')
    }
  }

  const onReset = () => {
    if (!confirm('Repor todos os dados demo? Vai perder alterações.')) return
    resetDemo()
    toast.success('Demo reposto. A recarregar...')
    setTimeout(() => window.location.reload(), 800)
  }

  return (
    <div>
      <PageHeader title="Definições" subtitle="Configurações da plataforma" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader title="Informações do Centro" />
          <div className="space-y-3">
            <Input label="Nome" value={current.businessName} onChange={e => setLocal({ ...current, businessName: e.target.value })} />
            <Input label="Slogan" value={current.tagline} onChange={e => setLocal({ ...current, tagline: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Telefone" value={current.phone} onChange={e => setLocal({ ...current, phone: e.target.value })} />
              <Input label="NIF" value={current.nif} onChange={e => setLocal({ ...current, nif: e.target.value })} />
            </div>
            <Input label="Email" type="email" value={current.email} onChange={e => setLocal({ ...current, email: e.target.value })} />
            <Input label="Morada" value={current.address} onChange={e => setLocal({ ...current, address: e.target.value })} />
            <Input label="Mensalidade (€)" type="number" value={current.monthlyFee} onChange={e => setLocal({ ...current, monthlyFee: Number(e.target.value) })} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader title="Template WhatsApp" />
            <Textarea rows={6} value={current.waTemplate} onChange={e => setLocal({ ...current, waTemplate: e.target.value })} />
            <div className="text-xs text-ink-400 mt-2">Variáveis: <code>{'{MES}'}</code> <code>{'{VALOR}'}</code> <code>{'{ALUNO}'}</code></div>
          </Card>

          <Card>
            <CardHeader title="Backup e Reset" subtitle="Gerir os dados demo" />
            <div className="space-y-2">
              <Button className="w-full" variant="outline" leftIcon={<Download size={14} />} onClick={onExport}>Exportar Backup (JSON)</Button>
              <Button className="w-full" variant="outline" leftIcon={<Upload size={14} />} onClick={() => fileRef.current?.click()}>Importar Backup</Button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) void onImport(f) }}
              />
              <Button className="w-full" variant="danger" leftIcon={<RefreshCw size={14} />} onClick={onReset}>Repor Dados Demo</Button>
            </div>
          </Card>

          <Card>
            <CardHeader title="Integração futura" subtitle="Preparado para Firebase" />
            <div className="text-sm text-ink-600 space-y-2">
              <p>Os serviços de dados estão abstraídos. Para integrar Firebase:</p>
              <ol className="list-decimal list-inside text-xs space-y-1 text-ink-500">
                <li>Crie um projeto Firebase</li>
                <li>Preencha as variáveis em <code>.env</code></li>
                <li>Substitua <code>services/storage.ts</code> pela implementação Firestore</li>
                <li>Substitua <code>services/authService.ts</code> por Firebase Auth</li>
              </ol>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={save} leftIcon={<Save size={14} />}>Guardar Definições</Button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Mail, Lock, ShieldCheck, GraduationCap, Users } from 'lucide-react'
import { Logo, Button, Input } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { toast } from '@/store/toastStore'
import { homeForRole } from '@/routes/routes'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres')
})

export function LoginPage() {
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const loginAs = useAuthStore(s => s.loginAs)
  const loading = useAuthStore(s => s.loading)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const parsed = schema.safeParse({ email, password })
    if (!parsed.success) {
      const fieldErrors: typeof errors = {}
      parsed.error.errors.forEach(err => {
        const key = err.path[0] as keyof typeof errors
        if (!fieldErrors[key]) fieldErrors[key] = err.message
      })
      setErrors(fieldErrors)
      return
    }
    setErrors({})
    try {
      await login(parsed.data.email, parsed.data.password)
      const role = useAuthStore.getState().user?.role
      toast.success('Bem-vindo!')
      navigate(role ? homeForRole(role) : '/', { replace: true })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro no login')
    }
  }

  const quickLogin = async (role: 'admin' | 'teacher' | 'student') => {
    try {
      await loginAs(role)
      toast.success(`Entrou como ${role === 'admin' ? 'Administrador' : role === 'teacher' ? 'Professor' : 'Encarregado'}`)
      navigate(homeForRole(role), { replace: true })
    } catch (err) {
      toast.error('Falha no login demo')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-sage-50 via-white to-teal-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo size="lg" />
        </div>

        <div className="bg-white border border-ink-200 rounded-3xl shadow-soft p-8">
          <div className="mb-6">
            <h1 className="text-xl font-display font-bold text-ink-900">Bem-vindo de volta</h1>
            <p className="text-sm text-ink-500 mt-1">Entra na tua área para continuar</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              placeholder="admin@xelbminds.pt"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              placeholder="••••••••"
            />
            <Button type="submit" loading={loading} className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-ink-200" />
            <span className="text-xs text-ink-400 uppercase tracking-wider">Acesso rápido demo</span>
            <div className="flex-1 h-px bg-ink-200" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => quickLogin('admin')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-ink-200 hover:border-teal-400 hover:bg-teal-50 transition cursor-pointer">
              <ShieldCheck size={18} className="text-teal-600" />
              <span className="text-xs font-semibold text-ink-700">Admin</span>
            </button>
            <button onClick={() => quickLogin('teacher')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-ink-200 hover:border-sage-400 hover:bg-sage-50 transition cursor-pointer">
              <GraduationCap size={18} className="text-sage-600" />
              <span className="text-xs font-semibold text-ink-700">Professor</span>
            </button>
            <button onClick={() => quickLogin('student')} className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-ink-200 hover:border-purple-400 hover:bg-purple-50 transition cursor-pointer">
              <Users size={18} className="text-purple-600" />
              <span className="text-xs font-semibold text-ink-700">Aluno</span>
            </button>
          </div>

          <details className="mt-5 text-xs text-ink-500">
            <summary className="cursor-pointer font-semibold hover:text-ink-700">Credenciais demo</summary>
            <div className="mt-2 space-y-1 font-mono text-[11px] bg-ink-50 p-3 rounded-lg">
              <div>admin@xelbminds.pt / demo1234</div>
              <div>prof@xelbminds.pt / demo1234</div>
              <div>aluno@xelbminds.pt / demo1234</div>
            </div>
          </details>
        </div>

        <p className="text-center text-xs text-ink-400 mt-6">
          Versão demo · Sem ligação a Firebase · Dados em localStorage
        </p>
      </div>
    </div>
  )
}

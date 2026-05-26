import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Users, Wallet, Receipt, GraduationCap,
  User as UserIcon, Settings, ChevronLeft, ChevronRight,
  Megaphone, FileText, BookOpen, Target, Timer, Bell, UserPlus, Sparkles
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Logo } from '@/components/ui'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import type { Role } from '@/types'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  roles: Role[]
  group: 'main' | 'manage' | 'classroom' | 'personal' | 'advanced'
  badge?: number
}

const NAV: NavItem[] = [
  // MAIN
  { to: '/dashboard', label: 'Painel', icon: LayoutDashboard, roles: ['admin', 'teacher'], group: 'main' },
  { to: '/schedule', label: 'Horário', icon: Calendar, roles: ['admin', 'teacher'], group: 'main' },

  // MANAGE (admin)
  { to: '/students', label: 'Alunos', icon: Users, roles: ['admin'], group: 'manage' },
  { to: '/financial', label: 'Financeiro', icon: Wallet, roles: ['admin'], group: 'manage' },
  { to: '/expenses', label: 'Despesas', icon: Receipt, roles: ['admin'], group: 'manage' },
  { to: '/leads', label: 'Leads / CRM', icon: UserPlus, roles: ['admin'], group: 'manage' },
  { to: '/communications', label: 'Comunicações', icon: Megaphone, roles: ['admin'], group: 'manage' },
  { to: '/reports', label: 'Relatórios', icon: FileText, roles: ['admin'], group: 'manage' },

  // CLASSROOM (teacher)
  { to: '/teacher', label: 'Área Professor', icon: GraduationCap, roles: ['admin', 'teacher'], group: 'classroom' },
  { to: '/library', label: 'Biblioteca', icon: BookOpen, roles: ['admin', 'teacher'], group: 'classroom' },

  // PERSONAL (student)
  { to: '/student-area', label: 'A Minha Área', icon: UserIcon, roles: ['admin', 'student'], group: 'personal' },
  { to: '/goals', label: 'Objetivos', icon: Target, roles: ['student'], group: 'personal' },
  { to: '/pomodoro', label: 'Foco', icon: Timer, roles: ['student'], group: 'personal' },
  { to: '/notifications', label: 'Notificações', icon: Bell, roles: ['admin', 'teacher', 'student'], group: 'personal' },

  // ADVANCED / V2
  { to: '/billing', label: 'Faturação', icon: Sparkles, roles: ['admin'], group: 'advanced' },
  { to: '/settings', label: 'Definições', icon: Settings, roles: ['admin'], group: 'advanced' }
]

type Props = { collapsed: boolean; onToggle: () => void }

export function Sidebar({ collapsed, onToggle }: Props) {
  const user = useAuthStore(s => s.user)
  if (!user) return null

  const visible = NAV.filter(n => n.roles.includes(user.role))
  const groups: { id: string; label: string; items: NavItem[] }[] = [
    { id: 'main', label: '', items: visible.filter(n => n.group === 'main') },
    { id: 'manage', label: 'Gestão', items: visible.filter(n => n.group === 'manage') },
    { id: 'classroom', label: 'Sala de Aula', items: visible.filter(n => n.group === 'classroom') },
    { id: 'personal', label: 'Pessoal', items: visible.filter(n => n.group === 'personal') },
    { id: 'advanced', label: 'Avançado', items: visible.filter(n => n.group === 'advanced') }
  ].filter(g => g.items.length > 0)

  return (
    <aside
      className={cn(
        'shrink-0 bg-white border-r border-ink-200 flex flex-col h-screen sticky top-0 transition-[width] duration-200',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div className={cn('h-16 flex items-center border-b border-ink-100', collapsed ? 'justify-center' : 'px-5')}>
        {collapsed ? (
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="XelbMinds" width={32} height={32} />
        ) : (
          <Logo size="sm" />
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {groups.map(g => (
          <div key={g.id} className="mb-3">
            {!collapsed && g.label && (
              <div className="px-3 mb-1 text-[10px] font-bold uppercase tracking-wider text-ink-400">{g.label}</div>
            )}
            {g.items.map(item => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-xl text-sm font-semibold transition mb-0.5 cursor-pointer',
                      collapsed ? 'justify-center h-10 w-10 mx-auto' : 'h-10 px-3',
                      isActive
                        ? 'bg-teal-50 text-teal-700'
                        : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900'
                    )
                  }
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={18} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              )
            })}
          </div>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="m-2 h-9 rounded-xl bg-ink-50 hover:bg-ink-100 text-ink-500 flex items-center justify-center cursor-pointer transition"
        aria-label={collapsed ? 'Expandir' : 'Recolher'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}

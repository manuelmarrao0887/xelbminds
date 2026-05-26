import type { User, Role } from '@/types'

// TODO: replace with Firebase Auth when ready.
// Demo passwords are intentionally plain — DO NOT ship to production.
const DEMO_ACCOUNTS: Array<User & { password: string }> = [
  {
    id: 'u-admin',
    email: 'admin@xelbminds.pt',
    password: 'demo1234',
    name: 'Maria Direção',
    role: 'admin'
  },
  {
    id: 'u-teacher',
    email: 'prof@xelbminds.pt',
    password: 'demo1234',
    name: 'Prof. Ana Marques',
    role: 'teacher',
    teacherSubjects: ['Matemática', 'Física e Química']
  },
  {
    id: 'u-student',
    email: 'aluno@xelbminds.pt',
    password: 'demo1234',
    name: 'Sra. Silva (Enc. Educação)',
    role: 'student',
    // Acts as parent of these two students (multi-child demo)
    studentIds: ['s-1', 's-2']
  }
]

export const DEMO_HINTS = DEMO_ACCOUNTS.map(({ email, role }) => ({ email, role }))

export const authService = {
  async login(email: string, password: string): Promise<User> {
    await delay(400)
    const match = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase() && a.password === password)
    if (!match) {
      throw new Error('Email ou password incorretos')
    }
    const { password: _pw, ...user } = match
    return user
  },

  async logout(): Promise<void> {
    await delay(100)
  },

  /** Quick-login helper for the demo buttons. */
  async loginAs(role: Role): Promise<User> {
    const match = DEMO_ACCOUNTS.find(a => a.role === role)
    if (!match) throw new Error('Demo account not found')
    const { password: _pw, ...user } = match
    await delay(200)
    return user
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

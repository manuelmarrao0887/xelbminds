import type {
  Student, Payment, Lesson, Expense, Lead, Notification, Material,
  ExtraClassRequest, Goal, AppSettings
} from '@/types'
import { SUBJECTS, GRADES, WEEKDAYS, HOURS, EVALS, MONTHLY_FEE } from '@/lib/constants'

const FIRST_NAMES = [
  'Mariana','Pedro','Ana','Tiago','Beatriz','Miguel','Inês','Rafael','Sofia','Diogo',
  'Leonor','Tomás','Matilde','Gonçalo','Carolina','André','Francisca','João','Marta','Rodrigo',
  'Lara','Bernardo','Sara','Afonso','Catarina','Guilherme','Diana','Henrique','Eva','Duarte',
  'Maria','Gabriel','Joana','Alexandre','Rita','Daniel','Laura','David','Constança','Simão',
  'Alice','Vicente','Clara','Salvador','Bianca','Lourenço','Mafalda','Vasco','Íris','Manuel'
]

const LAST_NAMES = [
  'Silva','Santos','Costa','Oliveira','Ferreira','Pereira','Rodrigues','Martins','Sousa','Fernandes',
  'Almeida','Gomes','Ribeiro','Lopes','Carvalho','Mendes','Pinto','Correia','Nunes','Moreira',
  'Vieira','Marques','Monteiro','Teixeira','Araújo','Reis','Matos','Fonseca','Rocha','Coelho'
]

function seededRng(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function asciiSlug(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '')
}

export function genStudents(): Student[] {
  const r = seededRng(42)
  return FIRST_NAMES.map((fn, i) => {
    const ln = LAST_NAMES[i % LAST_NAMES.length]
    const subjectCount = r() > 0.7 ? 2 : 1
    const subs: string[] = []
    while (subs.length < subjectCount) {
      const s = SUBJECTS[Math.floor(r() * SUBJECTS.length)]
      if (!subs.includes(s)) subs.push(s)
    }
    const grade = GRADES[Math.floor(r() * GRADES.length)]
    const notes = r() > 0.6 ? '' : [
      'Aluno com TDAH', 'Pais divorciados — contactar mãe', 'Muito tímido',
      'Quer seguir engenharia', 'Exame nacional em Junho', 'Dificuldades de concentração',
      'Atleta federado', 'Precisa reforço extra'
    ][Math.floor(r() * 8)]

    return {
      id: `s-${i + 1}`,
      name: `${fn} ${ln}`,
      email: `${asciiSlug(fn)}.${asciiSlug(ln)}@email.pt`,
      phone: `91${Math.floor(r() * 9_000_000 + 1_000_000)}`,
      parentName: `${r() > 0.5 ? 'Sr.' : 'Sra.'} ${ln}`,
      parentPhone: `96${Math.floor(r() * 9_000_000 + 1_000_000)}`,
      parentEmail: `enc.${asciiSlug(ln)}@email.pt`,
      subjects: subs,
      grade,
      status: r() > 0.08 ? 'ativo' : 'inativo',
      scheduleDay: WEEKDAYS[Math.floor(r() * 5)],
      scheduleHour: HOURS[Math.floor(r() * HOURS.length)],
      notes,
      schoolGrades: Array.from({ length: 3 }, (_, t) => ({
        period: `${t + 1}º Período`,
        grade: Math.round((r() * 10 + 6) * 10) / 10
      })),
      xp: Math.floor(r() * 500),
      badges: r() > 0.5 ? ['streak-3', 'tpc-pro'] : ['streak-3'],
      streak: Math.floor(r() * 8),
      goals: []
    }
  })
}

export function genPayments(students: Student[]): Payment[] {
  const r = seededRng(123)
  const months = ['Janeiro 2026', 'Fevereiro 2026', 'Março 2026', 'Abril 2026', 'Maio 2026']
  const out: Payment[] = []
  let id = 1
  students.filter(s => s.status === 'ativo').forEach(s => {
    months.forEach((month, mi) => {
      const paid = mi < 3 ? r() > 0.12 : r() > 0.55
      out.push({
        id: `p-${id++}`,
        studentId: s.id,
        studentName: s.name,
        month,
        amount: MONTHLY_FEE,
        paid,
        paidDate: paid ? `2026-${String(mi + 1).padStart(2, '0')}-${String(Math.floor(r() * 10) + 1).padStart(2, '0')}` : null,
        invoiceNumber: paid ? `XM-${(2026 * 1000 + mi * 100 + parseInt(s.id.replace('s-', ''))).toString().slice(-6)}` : undefined
      })
    })
  })
  return out
}

export function genLessons(students: Student[]): Lesson[] {
  const r = seededRng(789)
  const summariesBySubject: Record<string, string[][]> = {
    'Matemática': [['Equações do 2º grau', 'Problemas de aplicação'], ['Funções quadráticas', 'Gráficos'], ['Probabilidades', 'Prob. condicionada']],
    'Português': [['Os Lusíadas — Canto I', 'Inês de Castro'], ['Fernando Pessoa', 'Heterónimos'], ['Orações subordinadas', 'Consolidação']],
    'Inglês': [['Past Simple vs Continuous', 'Present Perfect'], ['Reported Speech', 'Exercícios'], ['Reading Comprehension', 'Writing']],
    'Física e Química': [['Leis de Newton', '3ª Lei'], ['Energia cinética/potencial', 'Conservação'], ['Reações químicas', 'Estequiometria']]
  }
  const def: string[][] = [['Revisão', 'Teste'], ['Consolidação', 'Novos conteúdos']]
  const evalNotes = ['Precisa de mais empenho', 'Compreende o básico', 'Boa compreensão', 'Excelente desempenho', 'Aluno exemplar']
  const dates = ['2026-04-24', '2026-04-26', '2026-04-29', '2026-05-02', '2026-05-06', '2026-05-09', '2026-05-13', '2026-05-16', '2026-05-20', '2026-05-23']

  const out: Lesson[] = []
  let id = 1
  students.filter(s => s.status === 'ativo').forEach(s => {
    const n = 4 + Math.floor(r() * 5)
    for (let i = 0; i < n && i < dates.length; i++) {
      const subject = s.subjects[0]
      const pool = summariesBySubject[subject] || def
      const pair = pool[Math.floor(r() * pool.length)]
      const ei = Math.floor(r() * 5)
      const files: string[] = []
      if (r() > 0.3) files.push(`Ficha_${i + 1}.pdf`)
      if (r() > 0.5) files.push(`Resumo_${i + 1}.pdf`)
      out.push({
        id: `l-${id++}`,
        studentId: s.id,
        date: dates[i],
        subject,
        summary: pair[0],
        nextLesson: pair[1],
        evaluation: EVALS[ei],
        evalNotes: evalNotes[ei],
        attendance: r() > 0.1,
        homework: r() > 0.5 ? `Exercícios ${Math.floor(r() * 20) + 1} a ${Math.floor(r() * 10) + 20}` : '',
        files,
        homeworkSubmitted: r() > 0.6
      })
    }
  })
  return out
}

export function genExpenses(): Expense[] {
  return [
    { id: 'e-1', description: 'Renda do espaço', amount: 650, category: 'Instalações', month: 'Maio 2026', recurring: true },
    { id: 'e-2', description: 'Eletricidade', amount: 92, category: 'Instalações', month: 'Maio 2026', recurring: true },
    { id: 'e-3', description: 'Internet fibra', amount: 35, category: 'Instalações', month: 'Maio 2026', recurring: true },
    { id: 'e-4', description: 'Material escolar', amount: 80, category: 'Material', month: 'Maio 2026', recurring: false },
    { id: 'e-5', description: 'Software (Notion, Canva)', amount: 25, category: 'Tecnologia', month: 'Maio 2026', recurring: true },
    { id: 'e-6', description: 'Seguro responsabilidade', amount: 45, category: 'Seguros', month: 'Maio 2026', recurring: true },
    { id: 'e-7', description: 'Anúncios Facebook/Instagram', amount: 120, category: 'Marketing', month: 'Maio 2026', recurring: false },
    { id: 'e-8', description: 'Limpeza', amount: 100, category: 'Instalações', month: 'Maio 2026', recurring: true },
    { id: 'e-9', description: 'Renda do espaço', amount: 650, category: 'Instalações', month: 'Abril 2026', recurring: true },
    { id: 'e-10', description: 'Eletricidade', amount: 85, category: 'Instalações', month: 'Abril 2026', recurring: true },
    { id: 'e-11', description: 'Contabilidade', amount: 80, category: 'Serviços', month: 'Abril 2026', recurring: true },
    { id: 'e-12', description: 'Renda do espaço', amount: 650, category: 'Instalações', month: 'Março 2026', recurring: true }
  ]
}

export function genLeads(): Lead[] {
  return [
    { id: 'L-1', name: 'Filipa Antunes', phone: '912345678', email: 'filipa@email.pt', source: 'Recomendação', subject: 'Matemática', grade: '9º Ano', stage: 'Interessado', notes: 'Recomendada por Mariana Silva (mãe)', createdAt: '2026-05-18' },
    { id: 'L-2', name: 'Hugo Tavares', phone: '935555111', email: 'hugot@email.pt', source: 'Google', subject: 'Física e Química', grade: '11º Ano', stage: 'Aula experimental', notes: 'Marcada para sexta 17h', createdAt: '2026-05-15' },
    { id: 'L-3', name: 'Eduardo Pinto', phone: '914000222', email: 'edu.pinto@email.pt', source: 'Redes Sociais', subject: 'Português', grade: '12º Ano', stage: 'Inscrito', notes: 'Foco no exame nacional', createdAt: '2026-05-10' },
    { id: 'L-4', name: 'Beatriz Faria', phone: '961777888', email: 'beatriz.f@email.pt', source: 'Cartaz', subject: 'Inglês', grade: '8º Ano', stage: 'Interessado', notes: '', createdAt: '2026-05-22' },
    { id: 'L-5', name: 'Tomás Carvalho', phone: '966111222', email: 't.carvalho@email.pt', source: 'Recomendação', subject: 'Matemática', grade: '10º Ano', stage: 'Desistiu', notes: 'Disse que ficou caro', createdAt: '2026-04-30' }
  ]
}

export function genNotifications(userId: string, role: string): Notification[] {
  const base: Notification[] = []
  const now = new Date()
  const iso = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString()

  if (role === 'admin') {
    base.push(
      { id: 'n-a1', userId, type: 'payment', title: '4 pagamentos em atraso', body: 'Total de 400€ pendentes este mês', link: '/financial', read: false, createdAt: iso(2) },
      { id: 'n-a2', userId, type: 'system', title: 'Novo lead recebido', body: 'Beatriz Faria — Inglês 8º Ano', link: '/leads', read: false, createdAt: iso(6) },
      { id: 'n-a3', userId, type: 'message', title: 'Mensagem do professor', body: 'Pedido de substituição para sexta', read: true, createdAt: iso(24) }
    )
  } else if (role === 'teacher') {
    base.push(
      { id: 'n-t1', userId, type: 'lesson', title: 'Próxima aula em 1h', body: 'Tiago Costa — Matemática · 16:00', link: '/teacher', read: false, createdAt: iso(0.5) },
      { id: 'n-t2', userId, type: 'message', title: 'Encarregado enviou mensagem', body: 'Sra. Silva — sobre o TPC', read: false, createdAt: iso(3) }
    )
  } else {
    base.push(
      { id: 'n-s1', userId, type: 'lesson', title: 'TPC para amanhã', body: 'Matemática — Exercícios 12 a 24', link: '/student-area', read: false, createdAt: iso(1) },
      { id: 'n-s2', userId, type: 'payment', title: 'Pagamento de Maio pendente', body: '100€ — vence em 5 dias', link: '/student-area', read: false, createdAt: iso(12) }
    )
  }
  return base
}

export function genMaterials(): Material[] {
  return [
    { id: 'm-1', title: 'Ficha — Equações 2º grau', subject: 'Matemática', grade: '9º Ano', type: 'Ficha', uploadedBy: 'Prof. Ana', uploadedAt: '2026-05-10', fileName: 'eq2grau.pdf' },
    { id: 'm-2', title: 'Resumo — Os Lusíadas', subject: 'Português', grade: '9º Ano', type: 'Resumo', uploadedBy: 'Prof. Ana', uploadedAt: '2026-05-08', fileName: 'lusiadas.pdf' },
    { id: 'm-3', title: 'Teste modelo — Inglês', subject: 'Inglês', grade: '11º Ano', type: 'Teste', uploadedBy: 'Prof. Ana', uploadedAt: '2026-05-05', fileName: 'teste-ing-11.pdf' },
    { id: 'm-4', title: 'Apresentação — Leis de Newton', subject: 'Física e Química', grade: '10º Ano', type: 'Apresentação', uploadedBy: 'Prof. Ana', uploadedAt: '2026-04-28', fileName: 'newton.pdf' }
  ]
}

export function genExtraClassRequests(): ExtraClassRequest[] {
  return [
    { id: 'er-1', studentId: 's-1', studentName: 'Mariana Silva', subject: 'Matemática', reason: 'Preparação para teste de 30/05', preferredDate: '2026-05-28', status: 'pendente', createdAt: '2026-05-22' }
  ]
}

export function genGoals(): Goal[] {
  return [
    { id: 'g-1', studentId: 's-1', subject: 'Matemática', description: 'Atingir 16 valores no 3º período', targetGrade: 16, currentGrade: 13, createdAt: '2026-04-01', achieved: false }
  ]
}

export const DEFAULT_SETTINGS: AppSettings = {
  businessName: 'XelbMinds',
  tagline: 'Aprender & Crescer',
  phone: '912 345 678',
  email: 'info@xelbminds.pt',
  address: 'Rua das Explicações, 123 · Lisboa',
  nif: '500000000',
  monthlyFee: MONTHLY_FEE,
  waTemplate: 'Olá! 👋\nLembrete da *XelbMinds*.\nPagamento *{MES}*: *{VALOR}€* — *{ALUNO}*\nObrigado! 🙏'
}

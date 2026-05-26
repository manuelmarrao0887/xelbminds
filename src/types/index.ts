export type Role = 'admin' | 'teacher' | 'student'

export type User = {
  id: string
  email: string
  name: string
  role: Role
  /** For teacher: which subjects they teach. For student: the student id they map to. */
  teacherSubjects?: string[]
  /** For student role: id of the student record they correspond to (or array if parent has multiple children). */
  studentIds?: string[]
}

export type Grade = '5º Ano' | '6º Ano' | '7º Ano' | '8º Ano' | '9º Ano' | '10º Ano' | '11º Ano' | '12º Ano'

export type SchoolGrade = { period: string; grade: number }

export type Student = {
  id: string
  name: string
  email: string
  phone: string
  parentName: string
  parentPhone: string
  parentEmail?: string
  subjects: string[]
  grade: Grade | ''
  status: 'ativo' | 'inativo'
  scheduleDay: string
  scheduleHour: string
  notes: string
  schoolGrades: SchoolGrade[]
  /** Gamification */
  xp?: number
  badges?: string[]
  streak?: number
  /** Personal goals */
  goals?: Goal[]
  /** Parent user can have multiple students */
  parentUserId?: string
}

export type Goal = {
  id: string
  studentId: string
  subject: string
  description: string
  targetGrade: number
  currentGrade?: number
  createdAt: string
  achieved: boolean
}

export type Payment = {
  id: string
  studentId: string
  studentName: string
  month: string
  amount: number
  paid: boolean
  paidDate: string | null
  invoiceNumber?: string
}

export type Evaluation = 'Insuficiente' | 'Suficiente' | 'Bom' | 'Muito Bom' | 'Excelente'

export type Lesson = {
  id: string
  studentId: string
  date: string
  subject: string
  summary: string
  nextLesson: string
  evaluation: Evaluation
  evalNotes: string
  attendance: boolean
  homework: string
  files: string[]
  /** TPC submission by student */
  homeworkSubmitted?: boolean
  homeworkFile?: string
  homeworkFeedback?: string
}

export type Expense = {
  id: string
  description: string
  amount: number
  category: 'Instalações' | 'Material' | 'Tecnologia' | 'Seguros' | 'Marketing' | 'Serviços' | 'Pessoal' | 'Outros'
  month: string
  recurring: boolean
}

export type LeadStage = 'Interessado' | 'Aula experimental' | 'Inscrito' | 'Desistiu'

export type Lead = {
  id: string
  name: string
  phone: string
  email: string
  source: 'Recomendação' | 'Redes Sociais' | 'Google' | 'Cartaz' | 'Outro'
  subject: string
  grade: string
  stage: LeadStage
  notes: string
  createdAt: string
}

export type Notification = {
  id: string
  userId: string
  type: 'payment' | 'lesson' | 'absence' | 'message' | 'system'
  title: string
  body: string
  link?: string
  read: boolean
  createdAt: string
}

export type Material = {
  id: string
  title: string
  subject: string
  grade: string
  type: 'Ficha' | 'Resumo' | 'Teste' | 'Apresentação' | 'Vídeo'
  uploadedBy: string
  uploadedAt: string
  fileName: string
}

export type ExtraClassRequest = {
  id: string
  studentId: string
  studentName: string
  subject: string
  reason: string
  preferredDate: string
  status: 'pendente' | 'aprovado' | 'recusado'
  createdAt: string
}

export type CommunicationLog = {
  id: string
  audience: string
  channel: 'whatsapp' | 'email' | 'sms'
  subject: string
  body: string
  recipientCount: number
  sentAt: string
  sentBy: string
}

export type AppSettings = {
  businessName: string
  tagline: string
  phone: string
  email: string
  address: string
  nif: string
  monthlyFee: number
  waTemplate: string
}

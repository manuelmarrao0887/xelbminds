export const SUBJECTS = [
  'Matemática', 'Português', 'Inglês', 'Física e Química',
  'Biologia e Geologia', 'Geografia', 'História', 'Economia',
  'Filosofia', 'Geometria Descritiva'
]

export const GRADES = [
  '5º Ano', '6º Ano', '7º Ano', '8º Ano',
  '9º Ano', '10º Ano', '11º Ano', '12º Ano'
] as const

export const WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']

export const HOURS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00']

export const EVALS = ['Insuficiente', 'Suficiente', 'Bom', 'Muito Bom', 'Excelente'] as const

export const EVAL_COLOR: Record<string, string> = {
  'Insuficiente': 'text-red-600 bg-red-50',
  'Suficiente': 'text-amber-600 bg-amber-50',
  'Bom': 'text-teal-600 bg-teal-50',
  'Muito Bom': 'text-sage-600 bg-sage-50',
  'Excelente': 'text-emerald-600 bg-emerald-50'
}

export const MONTHLY_FEE = 100

export const STORAGE_KEY = 'xelbminds.v1'

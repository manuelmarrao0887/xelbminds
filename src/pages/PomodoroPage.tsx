import { useEffect, useState } from 'react'
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react'
import { Card, CardHeader, PageHeader, Button } from '@/components/ui'
import { toast } from '@/store/toastStore'

type Mode = 'focus' | 'break'

const FOCUS_MIN = 25
const BREAK_MIN = 5

export function PomodoroPage() {
  const [mode, setMode] = useState<Mode>('focus')
  const [seconds, setSeconds] = useState(FOCUS_MIN * 60)
  const [running, setRunning] = useState(false)
  const [cycles, setCycles] = useState(0)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => {
      setSeconds(s => {
        if (s <= 1) {
          clearInterval(t)
          if (mode === 'focus') {
            toast.success('🎯 Sessão de foco completa! +25 XP')
            setMode('break')
            setCycles(c => c + 1)
            return BREAK_MIN * 60
          } else {
            toast.info('☕ Pausa terminada. Vamos lá!')
            setMode('focus')
            return FOCUS_MIN * 60
          }
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running, mode])

  const reset = () => {
    setRunning(false)
    setSeconds(mode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60)
  }

  const switchMode = (m: Mode) => {
    setMode(m)
    setRunning(false)
    setSeconds(m === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60)
  }

  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  const total = mode === 'focus' ? FOCUS_MIN * 60 : BREAK_MIN * 60
  const progress = ((total - seconds) / total) * 100
  const circumference = 2 * Math.PI * 110

  return (
    <div>
      <PageHeader title="Foco · Pomodoro" subtitle="Técnica de estudo eficaz: 25 min foco / 5 min pausa" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2 flex flex-col items-center justify-center py-12">
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => switchMode('focus')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition ${mode === 'focus' ? 'bg-teal-600 text-white' : 'bg-ink-100 text-ink-600'}`}
            >
              <BookOpen size={14} className="inline mr-1.5" />
              Foco (25min)
            </button>
            <button
              onClick={() => switchMode('break')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold cursor-pointer transition ${mode === 'break' ? 'bg-sage-500 text-white' : 'bg-ink-100 text-ink-600'}`}
            >
              <Coffee size={14} className="inline mr-1.5" />
              Pausa (5min)
            </button>
          </div>

          <div className="relative w-64 h-64">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 240 240">
              <circle cx="120" cy="120" r="110" stroke="#E5E7EB" strokeWidth="10" fill="none" />
              <circle
                cx="120"
                cy="120"
                r="110"
                stroke={mode === 'focus' ? '#3E7088' : '#7DA13E'}
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={circumference - (progress / 100) * circumference}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl font-display font-extrabold text-ink-900 tabular-nums">
                {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
              </div>
              <div className="text-xs uppercase font-bold tracking-wider text-ink-500 mt-2">
                {mode === 'focus' ? 'A focar' : 'Pausa'}
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-8">
            <Button
              size="lg"
              variant={running ? 'outline' : 'primary'}
              leftIcon={running ? <Pause size={18} /> : <Play size={18} />}
              onClick={() => setRunning(r => !r)}
            >
              {running ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button size="lg" variant="ghost" leftIcon={<RotateCcw size={18} />} onClick={reset}>Reset</Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Estatísticas" subtitle="Hoje" />
          <div className="space-y-3">
            <div className="p-3 bg-teal-50 rounded-xl">
              <div className="text-3xl font-display font-extrabold text-teal-700">{cycles}</div>
              <div className="text-xs text-teal-700 font-semibold">Ciclos completos</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="text-3xl font-display font-extrabold text-purple-700">{cycles * 25} min</div>
              <div className="text-xs text-purple-700 font-semibold">Tempo focado</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl">
              <div className="text-3xl font-display font-extrabold text-amber-700">+{cycles * 25} XP</div>
              <div className="text-xs text-amber-700 font-semibold">Ganhos hoje</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-ink-500 space-y-1">
            <p><strong>Como funciona:</strong></p>
            <p>1. Escolhe uma tarefa</p>
            <p>2. 25 min de foco total — sem distrações</p>
            <p>3. 5 min de pausa</p>
            <p>4. A cada 4 ciclos, faz pausa longa de 15-30 min</p>
          </div>
        </Card>
      </div>
    </div>
  )
}

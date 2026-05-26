import { useMemo } from 'react'
import { Card, PageHeader } from '@/components/ui'
import { useStudents } from '@/hooks/useCollection'
import { WEEKDAYS, HOURS } from '@/lib/constants'
import { hueFromString } from '@/lib/utils'

export function SchedulePage() {
  const [students] = useStudents()
  const active = useMemo(() => students.filter(s => s.status === 'ativo'), [students])

  return (
    <div>
      <PageHeader title="Horário Semanal" subtitle="Visão geral de todas as aulas" />

      <Card padding="none" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-teal-600 text-white">
                <th className="px-3 py-2.5 text-[11px] font-semibold w-16">Hora</th>
                {WEEKDAYS.map(d => (
                  <th key={d} className="px-3 py-2.5 text-[11px] font-semibold text-center">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map(h => (
                <tr key={h} className="border-b border-ink-100 last:border-0">
                  <td className="px-2 py-2 font-bold text-teal-700 text-center bg-ink-50">{h}</td>
                  {WEEKDAYS.map(d => {
                    const cell = active.filter(s => s.scheduleDay === d && s.scheduleHour === h)
                    return (
                      <td key={d} className="p-1 align-top min-w-[110px]">
                        {cell.map(s => {
                          const hue = hueFromString(s.name)
                          return (
                            <div
                              key={s.id}
                              className="rounded-md py-1 px-1.5 mb-0.5 text-[11px]"
                              style={{ background: `hsl(${hue},36%,93%)`, borderLeft: `3px solid hsl(${hue},45%,55%)` }}
                            >
                              <div className="font-semibold text-ink-800 truncate">{s.name.split(' ')[0]}</div>
                              <div className="text-[10px] text-ink-500 truncate">{s.subjects[0]}</div>
                            </div>
                          )
                        })}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-3 md:grid-cols-6 gap-2">
        {WEEKDAYS.map(d => {
          const count = active.filter(s => s.scheduleDay === d).length
          return (
            <Card key={d} className="text-center" padding="sm">
              <div className="text-[11px] font-semibold text-ink-500 uppercase">{d}</div>
              <div className="text-2xl font-display font-extrabold text-teal-700">{count}</div>
              <div className="text-[10px] text-ink-400">aulas</div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

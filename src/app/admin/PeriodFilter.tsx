'use client'

import { useRouter } from 'next/navigation'

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface Props {
  availableYears: number[]
  selectedYear: number | null
  selectedMonth: number | null
  isAllTime: boolean
}

export default function PeriodFilter({ availableYears, selectedYear, selectedMonth, isAllTime }: Props) {
  const router = useRouter()

  function nav(year: number | null, month: number | null, all: boolean) {
    if (all) { router.push('/admin?period=all'); return }
    const p = new URLSearchParams()
    if (year) p.set('year', year.toString())
    if (month) p.set('month', month.toString())
    const qs = p.toString()
    router.push('/admin' + (qs ? `?${qs}` : ''))
  }

  const isCurrent = !isAllTime && !selectedYear && !selectedMonth

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => nav(null, null, false)}
        className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
          isCurrent
            ? 'bg-[#E86020] text-white'
            : 'bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/70'
        }`}
      >
        Mês atual
      </button>

      <div className="w-px h-4 bg-white/10" />

      <select
        value={selectedYear ?? ''}
        onChange={(e) => {
          const y = e.target.value ? parseInt(e.target.value) : null
          nav(y, null, false)
        }}
        className={`bg-[#1A1A1A] border rounded-[6px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-white/20 transition-colors cursor-pointer ${
          selectedYear && !isAllTime
            ? 'border-[#E86020]/50 text-white'
            : 'border-white/8 text-white/50'
        }`}
      >
        <option value="">Ano</option>
        {availableYears.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {selectedYear && !isAllTime && (
        <select
          value={selectedMonth ?? ''}
          onChange={(e) => {
            const m = e.target.value ? parseInt(e.target.value) : null
            nav(selectedYear, m, false)
          }}
          className={`bg-[#1A1A1A] border rounded-[6px] px-2.5 py-1.5 text-xs focus:outline-none focus:border-white/20 transition-colors cursor-pointer ${
            selectedMonth
              ? 'border-[#E86020]/50 text-white'
              : 'border-white/8 text-white/50'
          }`}
        >
          <option value="">Todos os meses</option>
          {MONTHS.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
      )}

      <div className="w-px h-4 bg-white/10" />

      <button
        onClick={() => nav(null, null, true)}
        className={`px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
          isAllTime
            ? 'bg-[#E86020] text-white'
            : 'bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/70'
        }`}
      >
        Todo o período
      </button>
    </div>
  )
}

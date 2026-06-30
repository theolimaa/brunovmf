'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Phone, Car } from 'lucide-react'
import { Lead } from '@/types'
import { formatCurrency } from '@/lib/utils'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export default function AgendaPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear]   = useState(now.getFullYear())
  const [selected, setSelected] = useState<number | null>(now.getDate())
  const [leads, setLeads]  = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch('/api/leads')
      .then(r => r.json())
      .then((data: Lead[]) => { setLeads(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelected(null)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelected(null)
  }

  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function visitsOnDay(day: number): Lead[] {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return leads.filter(l => l.visit_date?.startsWith(dateStr))
  }

  function callbacksOnDay(day: number): Lead[] {
    return leads.filter(l =>
      l.status === 'ligar_de_volta' &&
      l.visit_date?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)
    )
  }

  const selectedVisits   = selected ? visitsOnDay(selected) : []
  const selectedCallbacks = selected ? callbacksOnDay(selected) : []
  const selectedLeads = [...new Map([...selectedVisits, ...selectedCallbacks].map(l => [l.id, l])).values()]

  const todayDay = now.getDate()
  const isCurrentMonth = now.getMonth() === month && now.getFullYear() === year

  const selectedDateLabel = selected
    ? `${DAY_NAMES[new Date(year, month, selected).getDay()]}, ${selected} de ${MONTH_NAMES[month]}`
    : null

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Agenda</h1>
        <p className="text-sm text-white/40 mt-1">Toque num dia pra ver os agendamentos. Começa mostrando hoje.</p>
      </div>

      {/* Selected day detail */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4 mb-6">
        <p className="text-sm font-medium text-white mb-3">{selectedDateLabel ?? 'Selecione um dia'}</p>
        {loading ? (
          <p className="text-sm text-white/30">Carregando...</p>
        ) : selectedLeads.length === 0 ? (
          <p className="text-sm text-white/30">Nada agendado nesse dia.</p>
        ) : (
          <div className="space-y-3">
            {selectedLeads.map(lead => (
              <div key={lead.id} className="flex items-start justify-between bg-[#0D0D0D] border border-white/8 rounded-[10px] p-3">
                <div>
                  <p className="text-sm font-semibold text-white">{lead.name}</p>
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-white/50 hover:text-[#E86020] mt-0.5">
                    <Phone size={10} /> {lead.phone}
                  </a>
                  {lead.car && (
                    <div className="flex items-center gap-1 text-xs text-white/40 mt-1">
                      <Car size={10} className="text-[#E86020]" />
                      {lead.car.brand} {lead.car.model} {lead.car.year} — {formatCurrency(lead.car.price)}
                    </div>
                  )}
                  {lead.visit_time && (
                    <p className="text-xs text-[#F59E0B] mt-1">às {lead.visit_time.slice(0, 5)}</p>
                  )}
                </div>
                <div className="flex-shrink-0 ml-3">
                  {lead.status === 'ligar_de_volta' ? (
                    <span className="text-[10px] bg-[#E86020]/15 text-[#E86020] px-2 py-0.5 rounded-full">Retornar</span>
                  ) : (
                    <span className="text-[10px] bg-[#F59E0B]/15 text-[#F59E0B] px-2 py-0.5 rounded-full">Visita</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-[8px] text-white/40 hover:text-white hover:bg-white/6 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-base font-semibold text-white">{MONTH_NAMES[month]} {year}</p>
            <p className="text-xs text-white/40">Hoje</p>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-[8px] text-white/40 hover:text-white hover:bg-white/6 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 mb-2">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-xs text-white/30 py-1">{d}</div>
          ))}
        </div>

        {/* Days */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const isToday = isCurrentMonth && day === todayDay
            const isSelected = selected === day
            const hasVisit    = visitsOnDay(day).length > 0
            const hasCallback = callbacksOnDay(day).length > 0

            return (
              <button
                key={day}
                onClick={() => setSelected(day === selected ? null : day)}
                className={`relative flex flex-col items-center justify-center h-10 rounded-[8px] text-sm transition-colors ${
                  isSelected
                    ? 'bg-[#E86020] text-white'
                    : isToday
                    ? 'border border-[#E86020]/50 text-white'
                    : 'text-white/70 hover:bg-white/6'
                }`}
              >
                {day}
                {(hasVisit || hasCallback) && !isSelected && (
                  <div className="absolute bottom-1 flex gap-0.5">
                    {hasVisit    && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />}
                    {hasCallback && <span className="w-1.5 h-1.5 rounded-full bg-[#E86020]" />}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-5 pt-4 border-t border-white/8">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            Visita agendada
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E86020]" />
            Retornar
          </div>
        </div>
      </div>
    </div>
  )
}

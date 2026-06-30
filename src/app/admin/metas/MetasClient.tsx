'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Minus, Plus } from 'lucide-react'
import toast from 'react-hot-toast'

interface MetasClientProps {
  month: number
  year: number
  initialTarget: number
  salesCount: number
  suggestions: string[]
}

export default function MetasClient({ month, year, initialTarget, salesCount, suggestions }: MetasClientProps) {
  const [target, setTarget]   = useState(initialTarget)
  const [inputTarget, setInputTarget] = useState(initialTarget.toString())
  const [savingTarget, setSavingTarget] = useState(false)

  const pct = target > 0 ? Math.min((salesCount / target) * 100, 100) : 0

  async function saveTarget() {
    const t = parseInt(inputTarget)
    if (!t || t < 1) { toast.error('Meta inválida'); return }
    setSavingTarget(true)
    try {
      const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year, target: t }),
      })
      if (!res.ok) throw new Error()
      setTarget(t)
      toast.success('Meta salva!')
    } catch {
      toast.error('Erro ao salvar meta')
    } finally {
      setSavingTarget(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Counter card */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[14px] p-6">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-white">VMF Auto Store</p>
        </div>

        <div className="flex items-center gap-6 mt-4">
          <span className="text-5xl font-bold text-white">{salesCount}</span>
          <div className="flex-1">
            <p className="text-xs text-white/40 mb-2">
              {target > 0 ? `Meta: ${target} vendas` : 'Defina a meta abaixo.'}
            </p>
            {target > 0 && (
              <div className="w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: pct >= 100 ? '#10B981' : pct >= 60 ? '#F59E0B' : '#E86020',
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-red-500/80 flex items-center justify-center text-white cursor-default">
              <Minus size={14} />
            </span>
            <span className="w-8 h-8 rounded-full bg-[#10B981]/80 flex items-center justify-center text-white cursor-default">
              <Plus size={14} />
            </span>
          </div>
          <Link
            href="/admin/relatorios"
            className="text-xs text-white/40 hover:text-[#E86020] transition-colors"
          >
            registrar venda
          </Link>
        </div>
      </div>

      {/* Set target */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[14px] p-5">
        <h3 className="text-sm font-semibold text-white mb-1">Meta de vendas do mês</h3>
        <p className="text-xs text-white/40 mb-4">Quantidade de carros</p>
        <input
          type="number"
          min="1"
          value={inputTarget}
          onChange={e => setInputTarget(e.target.value)}
          className="w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E86020]/60 mb-3"
        />
        <button
          onClick={saveTarget}
          disabled={savingTarget}
          className="w-full bg-[#0D0D0D] hover:bg-[#E86020] border border-white/10 hover:border-[#E86020] text-white text-sm font-semibold py-2.5 rounded-[8px] transition-colors disabled:opacity-50"
        >
          {savingTarget ? 'Salvando...' : 'Salvar meta'}
        </button>
      </div>

      {/* O que fazer agora */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[14px] p-5">
        <h3 className="text-sm font-semibold text-white mb-4">O que fazer agora</h3>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-white/60">
              <ChevronRight size={16} className="text-[#E86020] flex-shrink-0 mt-0.5" />
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

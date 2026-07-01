'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { calcMargin, formatCurrency } from '@/lib/utils'

interface Props {
  carId: string
  carName: string
  currentStatus: string
  price: string
  costPrice: string | null
}

const today = () => new Date().toISOString().split('T')[0]

export default function MarkAsSoldButton({ carId, carName, currentStatus, price, costPrice }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [salePrice, setSalePrice] = useState(price)
  const [saleCost, setSaleCost] = useState(costPrice ?? '')
  const [saleDate, setSaleDate] = useState(today)
  const [notes, setNotes] = useState('')

  if (currentStatus === 'sold') {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-white/5 text-white/30 text-sm py-3 rounded-[10px] cursor-not-allowed">
        <CheckCircle size={14} />
        Já marcado como vendido
      </div>
    )
  }

  function handleOpen() {
    setSalePrice(price)
    setSaleCost(costPrice ?? '')
    setSaleDate(today())
    setNotes('')
    setOpen(true)
  }

  const { margin, marginPct } = (salePrice && saleCost)
    ? calcMargin(salePrice, saleCost)
    : { margin: 0, marginPct: 0 }

  const hasMargin = !!(salePrice && saleCost)

  async function handleConfirm() {
    if (!salePrice) { toast.error('Informe o preço de venda'); return }
    if (!saleCost)  { toast.error('Informe o custo do veículo'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          car_id: carId,
          sale_price: salePrice,
          cost_price: saleCost,
          sale_date: saleDate,
          notes: notes || null,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Venda registrada com sucesso!')
      router.push('/admin/estoque')
      router.refresh()
    } catch {
      toast.error('Erro ao registrar venda')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-[#10B981]/10 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] text-sm font-medium py-3 rounded-[10px] transition-colors"
      >
        <CheckCircle size={14} />
        Marcar como vendido
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/75 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => !loading && setOpen(false)}
        >
          <div
            className="bg-[#1A1A1A] border border-white/10 rounded-[16px] p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-base font-semibold text-white">Confirmar venda</h3>
                <p className="text-sm text-white/40 mt-0.5">{carName}</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="text-white/40 hover:text-white transition-colors mt-0.5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Preço de venda */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                  Preço de venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10B981]/60"
                  placeholder="Ex: 85000"
                  autoFocus
                />
                <p className="text-xs text-white/25 mt-1">Tabela: {formatCurrency(price)}</p>
              </div>

              {/* Custo */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                  Custo do veículo (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={saleCost}
                  onChange={e => setSaleCost(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10B981]/60"
                  placeholder="Ex: 72000"
                />
              </div>

              {/* Margem preview */}
              {hasMargin && (
                <div className={`rounded-[8px] px-3 py-2.5 ${margin >= 0 ? 'bg-[#10B981]/10 border border-[#10B981]/20' : 'bg-red-500/10 border border-red-500/20'}`}>
                  <p className="text-xs text-white/40 mb-0.5">Margem de lucro</p>
                  <p className={`text-lg font-bold ${margin >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
                    {formatCurrency(margin)}{' '}
                    <span className="text-sm font-medium">({marginPct.toFixed(1)}%)</span>
                  </p>
                </div>
              )}

              {/* Data */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                  Data da venda
                </label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={e => setSaleDate(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10B981]/60"
                />
              </div>

              {/* Observação */}
              <div>
                <label className="block text-xs text-white/40 uppercase tracking-wider mb-1.5">
                  Observação (opcional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Ex: cliente financiou pela Caixa"
                  className="w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#10B981]/60 placeholder:text-white/20"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="flex-1 bg-white/6 hover:bg-white/10 text-white text-sm font-medium py-3 rounded-[10px] transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading || !salePrice || !saleCost}
                className="flex-1 bg-[#10B981] hover:bg-[#0ea271] text-white text-sm font-semibold py-3 rounded-[10px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Salvando...' : 'Confirmar venda'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

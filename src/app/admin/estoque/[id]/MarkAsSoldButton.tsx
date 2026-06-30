'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  carId: string
  currentStatus: string
}

export default function MarkAsSoldButton({ carId, currentStatus }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  if (currentStatus === 'sold') {
    return (
      <div className="flex items-center justify-center gap-2 w-full bg-white/5 text-white/30 text-sm py-3 rounded-[10px] cursor-not-allowed">
        <CheckCircle size={14} />
        Já marcado como vendido
      </div>
    )
  }

  async function handleMarkSold() {
    if (!confirm('Marcar esse carro como vendido?')) return
    setLoading(true)
    try {
      const res = await fetch(`/api/cars/${carId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'sold' }),
      })
      if (!res.ok) throw new Error()
      toast.success('Carro marcado como vendido!')
      router.push('/admin/estoque')
      router.refresh()
    } catch {
      toast.error('Erro ao marcar como vendido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleMarkSold}
      disabled={loading}
      className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-[#10B981]/10 border border-[#10B981]/30 hover:border-[#10B981]/60 text-[#10B981] text-sm font-medium py-3 rounded-[10px] transition-colors disabled:opacity-50"
    >
      <CheckCircle size={14} />
      {loading ? 'Salvando...' : 'Marcar como vendido'}
    </button>
  )
}

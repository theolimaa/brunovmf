'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DeleteCarButton({ carId, carName, variant = 'inline' }: {
  carId: string
  carName: string
  variant?: 'inline' | 'block'
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Mover "${carName}" para a lixeira? Você pode restaurar em até 30 dias, em Lixeira.`)) return

    try {
      const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Carro movido para a lixeira')
      window.location.href = '/admin/estoque'
    } catch {
      toast.error('Erro ao remover carro')
    }
  }

  if (variant === 'block') {
    return (
      <button
        onClick={handleDelete}
        className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-red-500/10 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:text-red-300 text-sm py-3 rounded-[10px] transition-colors"
      >
        Remover carro
      </button>
    )
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-400 hover:text-red-300 transition-colors"
    >
      Excluir
    </button>
  )
}

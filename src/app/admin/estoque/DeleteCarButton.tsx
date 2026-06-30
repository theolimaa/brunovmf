'use client'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function DeleteCarButton({ carId, carName }: { carId: string; carName: string }) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Remover "${carName}" do estoque? Esta ação não pode ser desfeita.`)) return

    try {
      const res = await fetch(`/api/cars/${carId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Carro removido')
      router.refresh()
    } catch {
      toast.error('Erro ao remover carro')
    }
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

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RotateCcw, Trash2, Sparkles } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { RETENTION_DAYS } from '@/lib/trashConfig'

export interface TrashedCar {
  id: string
  brand: string
  model: string
  year: number
  price: string
  deleted_at: string
}

export interface TrashedLead {
  id: string
  name: string
  phone: string | null
  deleted_at: string
}

export interface TrashedSale {
  id: string
  sale_price: string
  sale_date: string
  deleted_at: string
}

type TrashType = 'car' | 'lead' | 'sale'

function daysLeft(deletedAt: string): number {
  const purgeDate = new Date(deletedAt).getTime() + RETENTION_DAYS * 86400000
  return Math.max(0, Math.ceil((purgeDate - Date.now()) / 86400000))
}

export default function LixeiraClient({ cars, leads, sales }: {
  cars: TrashedCar[]
  leads: TrashedLead[]
  sales: TrashedSale[]
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [cleaning, setCleaning] = useState(false)

  async function cleanupOrphanPhotos() {
    if (!confirm('Procurar e apagar pastas de fotos no Cloudinary de carros que não existem mais no banco? Só afeta carros já excluídos há muito tempo (antes da lixeira existir).')) return
    setCleaning(true)
    try {
      const res = await fetch('/api/admin/cleanup-orphan-photos', { method: 'POST' })
      if (!res.ok) throw new Error()
      const data = await res.json()
      toast.success(`${data.orphansDeleted} pasta(s) órfã(s) apagada(s) de ${data.foldersFound} no total`)
    } catch {
      toast.error('Erro ao limpar fotos órfãs')
    } finally {
      setCleaning(false)
    }
  }

  async function restore(type: TrashType, id: string) {
    setBusyId(id)
    try {
      const res = await fetch('/api/trash', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id }),
      })
      if (!res.ok) throw new Error()
      toast.success('Restaurado')
      router.refresh()
    } catch {
      toast.error('Erro ao restaurar')
    } finally {
      setBusyId(null)
    }
  }

  async function purgeNow(type: TrashType, id: string) {
    if (!confirm('Apagar em definitivo? Não tem mais como desfazer (inclusive fotos, se for carro).')) return
    setBusyId(id)
    try {
      const res = await fetch(`/api/trash?type=${type}&id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Apagado em definitivo')
      router.refresh()
    } catch {
      toast.error('Erro ao apagar')
    } finally {
      setBusyId(null)
    }
  }

  const sections: { title: string; type: TrashType; items: { id: string; label: string; sublabel: string; deleted_at: string }[] }[] = [
    {
      title: 'Carros',
      type: 'car',
      items: cars.map(c => ({
        id: c.id,
        label: `${c.brand} ${c.model} ${c.year}`,
        sublabel: formatCurrency(c.price),
        deleted_at: c.deleted_at,
      })),
    },
    {
      title: 'Clientes',
      type: 'lead',
      items: leads.map(l => ({
        id: l.id,
        label: l.name,
        sublabel: l.phone ?? '—',
        deleted_at: l.deleted_at,
      })),
    },
    {
      title: 'Vendas',
      type: 'sale',
      items: sales.map(s => ({
        id: s.id,
        label: formatCurrency(s.sale_price),
        sublabel: new Date(s.sale_date).toLocaleDateString('pt-BR'),
        deleted_at: s.deleted_at,
      })),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          disabled={cleaning}
          onClick={cleanupOrphanPhotos}
          className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-medium text-white/50 hover:text-white hover:bg-white/6 border border-white/8 transition-colors disabled:opacity-50"
        >
          <Sparkles size={13} />
          {cleaning ? 'Limpando...' : 'Limpar fotos órfãs no Cloudinary'}
        </button>
      </div>

      {sections.map(section => (
        <div key={section.type} className="bg-[#1A1A1A] border border-white/8 rounded-[12px] overflow-hidden">
          <div className="px-4 py-3 border-b border-white/8">
            <h2 className="text-sm font-semibold text-white">{section.title}</h2>
          </div>
          {section.items.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">Nada aqui.</p>
          ) : (
            <div className="divide-y divide-white/4">
              {section.items.map(item => {
                const left = daysLeft(item.deleted_at)
                const busy = busyId === item.id
                return (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3">
                    <div>
                      <p className="text-sm text-white">{item.label}</p>
                      <p className="text-xs text-white/40">{item.sublabel} · apaga em {left} {left === 1 ? 'dia' : 'dias'}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        disabled={busy}
                        onClick={() => restore(section.type, item.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-medium text-[#10B981] hover:bg-[#10B981]/10 transition-colors disabled:opacity-50"
                      >
                        <RotateCcw size={13} />
                        Restaurar
                      </button>
                      <button
                        disabled={busy}
                        onClick={() => purgeNow(section.type, item.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-[8px] text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} />
                        Apagar agora
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

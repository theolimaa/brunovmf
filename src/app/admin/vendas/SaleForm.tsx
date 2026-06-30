'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Select } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { calcMargin, formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface SaleFormProps {
  cars: { id: string; brand: string; model: string; year: number; price: string; cost_price: string | null }[]
  leads: { id: string; name: string; phone: string; car_id: string | null }[]
}

export default function SaleForm({ cars, leads }: SaleFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    car_id: '',
    lead_id: '',
    sale_price: '',
    cost_price: '',
    sale_date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  function update(field: string, value: string) {
    setForm(f => {
      const next = { ...f, [field]: value }
      if (field === 'car_id') {
        const car = cars.find(c => c.id === value)
        if (car) {
          next.sale_price = car.price
          next.cost_price = car.cost_price ?? ''
        }
      }
      return next
    })
  }

  const { margin, marginPct } = (form.sale_price && form.cost_price)
    ? calcMargin(form.sale_price, form.cost_price)
    : { margin: 0, marginPct: 0 }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sale_price || !form.cost_price) {
      toast.error('Preço de venda e custo são obrigatórios')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          car_id: form.car_id || null,
          lead_id: form.lead_id || null,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Venda registrada!')
      setForm({
        car_id: '',
        lead_id: '',
        sale_price: '',
        cost_price: '',
        sale_date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      router.refresh()
    } catch {
      toast.error('Erro ao registrar venda')
    } finally {
      setLoading(false)
    }
  }

  const filteredLeads = form.car_id
    ? leads.filter(l => !l.car_id || l.car_id === form.car_id)
    : leads

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select label="Veículo" id="car_id" value={form.car_id} onChange={e => update('car_id', e.target.value)}>
        <option value="">Selecione (opcional)</option>
        {cars.map(c => <option key={c.id} value={c.id}>{c.brand} {c.model} {c.year}</option>)}
      </Select>

      <Select label="Lead (cliente)" id="lead_id" value={form.lead_id} onChange={e => update('lead_id', e.target.value)}>
        <option value="">Selecione (opcional)</option>
        {filteredLeads.map(l => <option key={l.id} value={l.id}>{l.name} — {l.phone}</option>)}
      </Select>

      <Input label="Preço de venda (R$) *" id="sale_price" type="number" step="0.01" placeholder="85000" value={form.sale_price} onChange={e => update('sale_price', e.target.value)} required />
      <Input label="Custo (R$) *" id="cost_price" type="number" step="0.01" placeholder="72000" value={form.cost_price} onChange={e => update('cost_price', e.target.value)} required />

      {form.sale_price && form.cost_price && (
        <div className="bg-[#0D0D0D] rounded-[8px] px-3 py-2 text-sm">
          <span className="text-white/50">Margem: </span>
          <span className={`font-semibold ${margin >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
            {formatCurrency(margin)} ({marginPct.toFixed(1)}%)
          </span>
        </div>
      )}

      <Input label="Data da venda" id="sale_date" type="date" value={form.sale_date} onChange={e => update('sale_date', e.target.value)} required />

      <Button type="submit" loading={loading} className="w-full">
        Registrar venda
      </Button>
    </form>
  )
}

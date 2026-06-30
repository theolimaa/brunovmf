'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, CarStatus, FuelType, TransmissionType } from '@/types'
import { Input, Select, Textarea } from './ui/Input'
import Button from './ui/Button'
import PhotoUpload from './PhotoUpload'
import toast from 'react-hot-toast'

interface CarFormProps {
  car?: Car
}

const FUELS: FuelType[] = ['Gasolina', 'Flex', 'Diesel', 'Elétrico', 'Híbrido']
const TRANSMISSIONS: TransmissionType[] = ['Manual', 'Automático', 'CVT', 'Automatizado']
const STATUSES: { value: CarStatus; label: string }[] = [
  { value: 'available', label: 'Disponível' },
  { value: 'reserved', label: 'Reservado' },
  { value: 'sold', label: 'Vendido' },
]

const COLORS = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Laranja', 'Marrom', 'Bege', 'Outra']

export default function CarForm({ car }: CarFormProps) {
  const router = useRouter()
  const isEdit = !!car

  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState(car?.photos ?? [])
  const [form, setForm] = useState({
    brand: car?.brand ?? '',
    model: car?.model ?? '',
    year: car?.year?.toString() ?? new Date().getFullYear().toString(),
    price: car?.price ?? '',
    cost_price: car?.cost_price ?? '',
    mileage: car?.mileage?.toString() ?? '',
    color: car?.color ?? '',
    fuel: car?.fuel ?? '',
    transmission: car?.transmission ?? '',
    description: car?.description ?? '',
    status: car?.status ?? 'available',
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.brand || !form.model || !form.year || !form.price) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    setLoading(true)
    try {
      const body = {
        ...form,
        year: parseInt(form.year),
        price: parseFloat(form.price.replace(/[^\d.]/g, '')),
        cost_price: form.cost_price ? parseFloat(form.cost_price.replace(/[^\d.]/g, '')) : null,
        mileage: form.mileage ? parseInt(form.mileage) : null,
      }

      const res = await fetch(
        isEdit ? `/api/cars/${car.id}` : '/api/cars',
        {
          method: isEdit ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )

      if (!res.ok) throw new Error()
      const saved = await res.json()

      toast.success(isEdit ? 'Carro atualizado!' : 'Carro adicionado!')

      if (!isEdit) {
        router.push(`/admin/estoque/${saved.id}/editar`)
      } else {
        router.refresh()
      }
    } catch {
      toast.error('Erro ao salvar carro')
    } finally {
      setLoading(false)
    }
  }

  async function refreshPhotos() {
    if (!car) return
    const res = await fetch(`/api/cars/${car.id}`)
    const data = await res.json()
    setPhotos(data.photos ?? [])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Identificação */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Identificação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Marca *" id="brand" placeholder="Toyota" value={form.brand} onChange={e => update('brand', e.target.value)} required />
          <Input label="Modelo *" id="model" placeholder="Corolla XEI" value={form.model} onChange={e => update('model', e.target.value)} required />
          <Input label="Ano *" id="year" type="number" placeholder="2021" value={form.year} onChange={e => update('year', e.target.value)} required min="1950" max="2030" />
          <Select label="Status" id="status" value={form.status} onChange={e => update('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
      </div>

      {/* Preços */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Preços</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Preço de venda (R$) *" id="price" type="number" placeholder="85000" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} required />
          <Input label="Custo (R$)" id="cost_price" type="number" placeholder="72000" step="0.01" value={form.cost_price ?? ''} onChange={e => update('cost_price', e.target.value)} />
        </div>
        {form.price && form.cost_price && (
          <div className="mt-3 text-xs text-white/50">
            Margem: <span className="text-[#E86020] font-semibold">
              {((parseFloat(form.price) - parseFloat(form.cost_price)) / parseFloat(form.cost_price) * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Características */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Características</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Quilometragem" id="mileage" type="number" placeholder="45000" value={form.mileage} onChange={e => update('mileage', e.target.value)} />
          <Select label="Cor" id="color" value={form.color} onChange={e => update('color', e.target.value)}>
            <option value="">Selecione</option>
            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Combustível" id="fuel" value={form.fuel} onChange={e => update('fuel', e.target.value)}>
            <option value="">Selecione</option>
            {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
          </Select>
          <Select label="Câmbio" id="transmission" value={form.transmission} onChange={e => update('transmission', e.target.value)}>
            <option value="">Selecione</option>
            {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
        </div>
        <div className="mt-4">
          <Textarea label="Descrição" id="description" placeholder="Descreva o carro: opcionais, estado de conservação, diferenciais..." value={form.description ?? ''} onChange={e => update('description', e.target.value)} />
        </div>
      </div>

      {/* Fotos */}
      {isEdit && car && (
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <PhotoUpload carId={car.id} photos={photos} onUpdate={refreshPhotos} />
        </div>
      )}
      {!isEdit && (
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <p className="text-sm text-white/40 text-center">Salve o carro primeiro para adicionar fotos</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={loading} size="lg">
          {isEdit ? 'Salvar alterações' : 'Adicionar carro'}
        </Button>
      </div>
    </form>
  )
}

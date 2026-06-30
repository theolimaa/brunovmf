'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Car, CarStatus, FuelType, TransmissionType, CarCategory, CAR_CATEGORIES, CAR_OPTIONALS } from '@/types'
import { Input, Select, Textarea } from './ui/Input'
import Button from './ui/Button'
import PhotoUpload from './PhotoUpload'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

interface CarFormProps {
  car?: Car
}

const FUELS: FuelType[] = ['Gasolina', 'Flex', 'Diesel', 'Elétrico', 'Híbrido']
const TRANSMISSIONS: TransmissionType[] = ['Manual', 'Automático', 'CVT', 'Automatizado']
const STATUSES: { value: CarStatus; label: string }[] = [
  { value: 'available', label: 'Disponível' },
  { value: 'reserved',  label: 'Reservado' },
  { value: 'sold',      label: 'Vendido' },
]
const COLORS = ['Branco', 'Preto', 'Prata', 'Cinza', 'Vermelho', 'Azul', 'Verde', 'Amarelo', 'Laranja', 'Marrom', 'Bege', 'Outra']

export default function CarForm({ car }: CarFormProps) {
  const router = useRouter()
  const isEdit = !!car

  const [loading, setLoading] = useState(false)
  const [photos, setPhotos] = useState(car?.photos ?? [])
  const [form, setForm] = useState({
    brand:            car?.brand ?? '',
    model:            car?.model ?? '',
    year:             car?.year?.toString() ?? new Date().getFullYear().toString(),
    price:            car?.price ?? '',
    cost_price:       car?.cost_price ?? '',
    discount_max:     car?.discount_max ?? '',
    mileage:          car?.mileage?.toString() ?? '',
    color:            car?.color ?? '',
    fuel:             car?.fuel ?? '',
    transmission:     car?.transmission ?? '',
    category:         car?.category ?? '',
    doors:            car?.doors?.toString() ?? '',
    is_premium:       car?.is_premium ?? false,
    acquisition_date: car?.acquisition_date?.split('T')[0] ?? '',
    description:      car?.description ?? '',
    status:           car?.status ?? 'available',
  })
  const [selectedOptionals, setSelectedOptionals] = useState<string[]>(car?.optionals ?? [])

  function update(field: string, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleOptional(opt: string) {
    setSelectedOptionals(prev =>
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    )
  }

  const price = parseFloat(form.price) || 0
  const costPrice = parseFloat(form.cost_price) || 0
  const discountMax = parseFloat(form.discount_max) || 0
  const minSalePrice = price - discountMax
  const margin = price - costPrice

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
        year:             parseInt(form.year),
        price:            parseFloat(form.price.toString().replace(/[^\d.]/g, '')),
        cost_price:       form.cost_price ? parseFloat(form.cost_price.toString().replace(/[^\d.]/g, '')) : null,
        discount_max:     form.discount_max ? parseFloat(form.discount_max.toString().replace(/[^\d.]/g, '')) : null,
        mileage:          form.mileage ? parseInt(form.mileage) : null,
        doors:            form.doors ? parseInt(form.doors) : null,
        acquisition_date: form.acquisition_date || null,
        optionals:        selectedOptionals.length > 0 ? selectedOptionals : null,
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
      {/* Fotos */}
      {isEdit && car ? (
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Fotos do carro</h3>
          <p className="text-xs text-white/40 mb-3">Primeira foto vira a capa. Pode adicionar quantas quiser.</p>
          <PhotoUpload carId={car.id} photos={photos} onUpdate={refreshPhotos} />
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-2">Fotos do carro</h3>
          <p className="text-sm text-white/30 text-center py-4">Salve o carro primeiro para adicionar fotos</p>
        </div>
      )}

      {/* Identificação */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Nome completo *</h3>
        <Input
          label=""
          id="model_full"
          placeholder="Ex: Toyota Corolla 2.0 XEi Flex Aut. 4p 2023"
          value={`${form.brand} ${form.model}`.trim()}
          onChange={() => {}}
          className="mb-4"
          disabled
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Marca *" id="brand" placeholder="Toyota" value={form.brand} onChange={e => update('brand', e.target.value)} required />
          <Select label="Categoria" id="category" value={form.category} onChange={e => update('category', e.target.value as CarCategory)}>
            <option value="">Selecionar</option>
            {CAR_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Input label="Ano *" id="year" type="number" placeholder="2023" value={form.year} onChange={e => update('year', e.target.value)} required min="1950" max="2030" />
          <Input label="Quilometragem" id="mileage" type="number" placeholder="45.000" value={form.mileage} onChange={e => update('mileage', e.target.value)} />
          <Select label="Portas" id="doors" value={form.doors} onChange={e => update('doors', e.target.value)}>
            <option value="">—</option>
            <option value="2">2 portas</option>
            <option value="4">4 portas</option>
          </Select>
          <Select label="Cor" id="color" value={form.color} onChange={e => update('color', e.target.value)}>
            <option value="">—</option>
            {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Câmbio" id="transmission" value={form.transmission} onChange={e => update('transmission', e.target.value)}>
            <option value="">—</option>
            {TRANSMISSIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </Select>
          <Select label="Combustível" id="fuel" value={form.fuel} onChange={e => update('fuel', e.target.value)}>
            <option value="">—</option>
            {FUELS.map(f => <option key={f} value={f}>{f}</option>)}
          </Select>
        </div>
        <div className="mt-4">
          <Input
            label="Modelo completo *"
            id="model"
            placeholder="Corolla 2.0 XEI Flex Aut. 4p"
            value={form.model}
            onChange={e => update('model', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Opcionais */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-1">Opcionais</h3>
        <p className="text-xs text-white/30 mb-4">Clique para marcar. Pode marcar quantos quiser.</p>
        <div className="flex flex-wrap gap-2">
          {CAR_OPTIONALS.map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => toggleOptional(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedOptionals.includes(opt)
                  ? 'bg-[#E86020] border-[#E86020] text-white'
                  : 'bg-transparent border-white/15 text-white/60 hover:border-white/30 hover:text-white'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Premium toggle */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-white">Carro premium</p>
            <p className="text-xs text-white/40 mt-0.5">Aparece na coleção &ldquo;Premium&rdquo; no site</p>
          </div>
          <button
            type="button"
            onClick={() => update('is_premium', !form.is_premium)}
            className={`relative w-11 h-6 rounded-full transition-colors ${form.is_premium ? 'bg-[#E86020]' : 'bg-white/15'}`}
          >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${form.is_premium ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      {/* Valores */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Valores (só você vê)</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Preço de tabela (R$) *" id="price" type="number" placeholder="180.000" step="0.01" value={form.price} onChange={e => update('price', e.target.value)} required />
          <Input label="Custo (R$)" id="cost_price" type="number" placeholder="O vendedor nunca vê." step="0.01" value={form.cost_price ?? ''} onChange={e => update('cost_price', e.target.value)} />
          <Input label="Desconto máximo (R$)" id="discount_max" type="number" placeholder="Desconto máximo liberado" step="0.01" value={form.discount_max ?? ''} onChange={e => update('discount_max', e.target.value)} />
          <Input label="Data de aquisição" id="acquisition_date" type="date" value={form.acquisition_date} onChange={e => update('acquisition_date', e.target.value)} />
        </div>

        {/* Preview de margem e desconto */}
        {(price > 0 || costPrice > 0 || discountMax > 0) && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {discountMax > 0 && (
              <div className="bg-[#0D0D0D] rounded-[8px] p-3">
                <p className="text-xs text-white/40 mb-1">Preço mínimo venda</p>
                <p className="text-sm font-semibold text-[#E86020]">{formatCurrency(minSalePrice)}</p>
              </div>
            )}
            {costPrice > 0 && (
              <div className="bg-[#0D0D0D] rounded-[8px] p-3">
                <p className="text-xs text-white/40 mb-1">Margem bruta</p>
                <p className={`text-sm font-semibold ${margin >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
                  {formatCurrency(margin)}
                </p>
              </div>
            )}
            {price > 0 && costPrice > 0 && (
              <div className="bg-[#0D0D0D] rounded-[8px] p-3">
                <p className="text-xs text-white/40 mb-1">Margem %</p>
                <p className={`text-sm font-semibold ${margin >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
                  {costPrice > 0 ? ((margin / costPrice) * 100).toFixed(1) : '0'}%
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status + Descrição */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
        <h3 className="text-sm font-semibold text-white/70 uppercase tracking-wider mb-4">Detalhes</h3>
        <div className="mb-4">
          <Select label="Status" id="status" value={form.status} onChange={e => update('status', e.target.value)}>
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </div>
        <Textarea label="Descrição" id="description" placeholder="Estado de conservação, diferenciais, observações..." value={form.description ?? ''} onChange={e => update('description', e.target.value)} />
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" loading={loading} size="lg">
          {isEdit ? 'Salvar alterações' : 'Adicionar ao estoque'}
        </Button>
      </div>
    </form>
  )
}

import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { Car } from '@/types'
import CarGallery from '@/components/CarGallery'
import { CarStatusBadge } from '@/components/ui/Badge'
import WhatsAppCtaButton from '@/components/WhatsAppCtaButton'
import { formatCurrency, formatMileage } from '@/lib/utils'
import { Calendar, Fuel, Gauge, Settings2, Palette } from 'lucide-react'

async function getCar(id: string): Promise<Car | null> {
  await connection()
  const rows = await sql`
    SELECT c.*,
      COALESCE(
        json_agg(p ORDER BY p.is_primary DESC, p.order_index ASC) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) AS photos
    FROM cars c
    LEFT JOIN car_photos p ON p.car_id = c.id
    WHERE c.id = ${id}
    GROUP BY c.id
  `
  return (rows[0] as Car) ?? null
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function CarDetailPage({ params }: PageProps) {
  const { id } = await params
  const car = await getCar(id)

  if (!car) notFound()

  const specs = [
    { icon: Calendar, label: 'Ano', value: car.year.toString() },
    { icon: Gauge, label: 'Quilometragem', value: formatMileage(car.mileage) },
    { icon: Fuel, label: 'Combustível', value: car.fuel },
    { icon: Settings2, label: 'Câmbio', value: car.transmission },
    { icon: Palette, label: 'Cor', value: car.color },
  ].filter(s => s.value && s.value !== '—')

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Gallery — left */}
        <div className="lg:col-span-3">
          <CarGallery photos={car.photos ?? []} brand={car.brand} model={car.model} />
        </div>

        {/* Info — right */}
        <div className="lg:col-span-2">
          <div className="sticky top-24">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm text-white/50 uppercase tracking-widest">{car.brand}</p>
              <CarStatusBadge status={car.status} />
            </div>

            <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-black text-white leading-tight mb-1">
              {car.model}
            </h1>
            <p className="text-3xl font-black text-[#E86020] font-[family-name:var(--font-montserrat)] mb-6">
              {formatCurrency(car.price)}
            </p>

            {/* Specs grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {specs.map(spec => (
                <div key={spec.label} className="bg-[#1A1A1A] border border-white/8 rounded-[10px] px-3 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    <spec.icon size={13} className="text-[#E86020]" />
                    <span className="text-[10px] text-white/40 uppercase tracking-wider">{spec.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-white">{spec.value}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            {car.description && (
              <div className="mb-6">
                <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Descrição</p>
                <p className="text-sm text-white/70 leading-relaxed">{car.description}</p>
              </div>
            )}

            {/* WhatsApp CTA */}
            {car.status !== 'sold' && (
              <WhatsAppCtaButton carId={car.id} brand={car.brand} model={car.model} year={car.year} />
            )}

            <p className="text-center text-xs text-white/30 mt-3">
              Resposta rápida pelo WhatsApp
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const car = await getCar(id)
  if (!car) return {}
  return {
    title: `${car.brand} ${car.model} ${car.year} — VMF Auto Store`,
    description: `${car.brand} ${car.model} ${car.year}, ${formatMileage(car.mileage)}. ${formatCurrency(car.price)}. Fale com Bruno Freitas.`,
  }
}

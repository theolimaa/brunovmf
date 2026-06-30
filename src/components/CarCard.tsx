import Image from 'next/image'
import Link from 'next/link'
import { Car } from '@/types'
import { formatCurrency, formatMileage } from '@/lib/utils'
import { CarStatusBadge } from '@/components/ui/Badge'
import { Gauge, Calendar, Fuel, Settings2 } from 'lucide-react'

interface CarCardProps {
  car: Car
}

export default function CarCard({ car }: CarCardProps) {
  const primaryPhoto = car.photos?.find(p => p.is_primary) ?? car.photos?.[0]

  return (
    <Link href={`/carros/${car.id}`} className="group block">
      <div className="bg-[#1A1A1A] border border-white/12 rounded-[12px] overflow-hidden hover:border-[#E86020]/40 transition-all duration-200 hover:shadow-[0_2px_24px_rgba(232,96,32,0.12)]">
        {/* Photo */}
        <div className="relative aspect-[16/10] overflow-hidden bg-[#111]">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-white/20">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="1" y="3" width="22" height="16" rx="2" />
                <circle cx="8.5" cy="17.5" r="2.5" />
                <circle cx="15.5" cy="17.5" r="2.5" />
              </svg>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <CarStatusBadge status={car.status} />
          </div>
          {car.photos && car.photos.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white/80 text-xs px-2 py-0.5 rounded-full">
              +{car.photos.length - 1} fotos
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="mb-2">
            <p className="text-xs text-white/50 uppercase tracking-wider">{car.brand}</p>
            <h3 className="font-bold text-lg leading-tight text-white">{car.model}</h3>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center gap-1.5 text-xs text-white/60">
              <Calendar size={13} className="text-[#E86020]" />
              {car.year}
            </div>
            {car.mileage && (
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Gauge size={13} className="text-[#E86020]" />
                {formatMileage(car.mileage)}
              </div>
            )}
            {car.fuel && (
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Fuel size={13} className="text-[#E86020]" />
                {car.fuel}
              </div>
            )}
            {car.transmission && (
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Settings2 size={13} className="text-[#E86020]" />
                {car.transmission}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-white/8">
            <div>
              <p className="text-xs text-white/40">Preço</p>
              <p className="text-xl font-bold text-[#E86020] font-display">{formatCurrency(car.price)}</p>
            </div>
            <div className="text-xs text-[#E86020] font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
              Ver detalhes →
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

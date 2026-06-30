import Image from 'next/image'
import Link from 'next/link'
import { Car } from '@/types'
import { formatCurrency, formatMileage } from '@/lib/utils'
import { MapPin } from 'lucide-react'

interface CarCardProps {
  car: Car
}

export default function CarCard({ car }: CarCardProps) {
  const primaryPhoto = car.photos?.find(p => p.is_primary) ?? car.photos?.[0]
  const photoCount = car.photos?.length ?? 0

  return (
    <Link href={`/carros/${car.id}`} className="group block">
      <div className="bg-white border border-[#E5E4E2] rounded-[12px] overflow-hidden hover:shadow-[0_4px_28px_rgba(0,0,0,0.10)] hover:border-[#E86020]/30 transition-all duration-200">

        {/* Photo */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#F0EFED]">
          {primaryPhoto ? (
            <Image
              src={primaryPhoto.url}
              alt={`${car.brand} ${car.model}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#0D0D0D]/15">
                <rect x="1" y="3" width="22" height="16" rx="2" />
                <circle cx="8.5" cy="17.5" r="2.5" />
                <circle cx="15.5" cy="17.5" r="2.5" />
              </svg>
            </div>
          )}

          {photoCount > 1 && (
            <div className="absolute bottom-2 left-2 bg-black/55 backdrop-blur-sm text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
              1 / {photoCount}
            </div>
          )}

          {car.status === 'reserved' && (
            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
              Reservado
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">

          {/* Brand + Model */}
          <h3 className="font-[family-name:var(--font-montserrat)] font-black text-[#0D0D0D] text-[15px] uppercase leading-tight tracking-wide mb-1">
            {car.brand} {car.model}
          </h3>
          {car.description && (
            <p className="text-xs text-[#0D0D0D]/45 mb-2 line-clamp-1">{car.description}</p>
          )}

          {/* Specs row */}
          <div className="flex items-center gap-2 text-xs text-[#0D0D0D]/50 mb-2 flex-wrap">
            <span>{car.year}</span>
            {car.mileage != null && (
              <>
                <span className="text-[#0D0D0D]/20">·</span>
                <span>{formatMileage(car.mileage)}</span>
              </>
            )}
            {car.fuel && (
              <>
                <span className="text-[#0D0D0D]/20">·</span>
                <span>{car.fuel}</span>
              </>
            )}
            {car.transmission && (
              <>
                <span className="text-[#0D0D0D]/20">·</span>
                <span>{car.transmission}</span>
              </>
            )}
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 text-[11px] text-[#0D0D0D]/35 mb-4">
            <MapPin size={11} className="text-[#E86020]" />
            Fortaleza, CE
          </div>

          {/* Price + Button */}
          <div className="border-t border-[#F0EFED] pt-3">
            <p className="font-[family-name:var(--font-montserrat)] font-black text-[#0D0D0D] text-xl mb-3">
              {formatCurrency(car.price)}
            </p>
            <div className="w-full bg-[#0D0D0D] group-hover:bg-[#E86020] text-white text-xs font-semibold uppercase tracking-wider py-2.5 rounded-[8px] text-center transition-colors duration-200">
              Ver oferta
            </div>
          </div>

        </div>
      </div>
    </Link>
  )
}

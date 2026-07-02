import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, Edit2, ExternalLink, Tag, Pencil } from 'lucide-react'
import { formatCurrency, formatMileage, calcMargin } from '@/lib/utils'
import DeleteCarButton from '../DeleteCarButton'
import MarkAsSoldButton from './MarkAsSoldButton'
import CopyAdLinkButton from '@/components/CopyAdLinkButton'

async function getLeads() {
  await connection()
  return sql`SELECT id, name, phone FROM leads WHERE deleted_at IS NULL ORDER BY name` as unknown as Promise<{ id: string; name: string; phone: string }[]>
}

async function getCar(id: string) {
  await connection()
  const [car] = await sql`
    SELECT c.*,
      COALESCE(json_agg(p ORDER BY p.is_primary DESC, p.order_index ASC)
        FILTER (WHERE p.id IS NOT NULL), '[]') AS photos
    FROM cars c
    LEFT JOIN car_photos p ON p.car_id = c.id
    WHERE c.id = ${id} AND c.deleted_at IS NULL
    GROUP BY c.id
  `
  return car ?? null
}

export default async function CarAdminDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [car, leads] = await Promise.all([getCar(id), getLeads()])
  if (!car) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const photos: any[] = Array.isArray(car.photos) ? car.photos : []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cover = photos.find((p: any) => p.is_primary) ?? photos[0]

  const price      = parseFloat(car.price ?? '0')
  const costPrice  = parseFloat(car.cost_price ?? '0')
  const discountMax = parseFloat(car.discount_max ?? '0')
  const minSalePrice = price - discountMax

  const hasDiscount = discountMax > 0
  const hasCost     = costPrice > 0

  const { margin } = hasCost ? calcMargin(price, costPrice) : { margin: 0 }

  const daysInStock = car.acquisition_date
    ? Math.floor((Date.now() - new Date(car.acquisition_date).getTime()) / 86400000)
    : Math.floor((Date.now() - new Date(car.created_at).getTime()) / 86400000)

  return (
    <div className="max-w-xl">
      <div className="mb-5">
        <Link href="/admin/estoque" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors">
          <ChevronLeft size={14} />
          Voltar ao estoque
        </Link>
      </div>

      {/* Photo */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[14px] overflow-hidden mb-5">
        {cover ? (
          <Image src={cover.url} alt={`${car.brand} ${car.model}`} width={600} height={400} className="w-full object-cover h-64" />
        ) : (
          <div className="h-48 flex items-center justify-center text-white/20">Sem foto</div>
        )}
      </div>

      {/* Title + price */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-white mb-1">{car.brand} {car.model} {car.year}</h1>
        {car.color && <p className="text-sm text-white/40 mb-2">{car.color}{car.mileage ? ` · ${formatMileage(car.mileage)}` : ''}</p>}
        <p className="text-2xl font-bold text-white">{formatCurrency(price)}</p>
        <p className="text-xs text-white/40 mt-0.5">{daysInStock} {daysInStock === 1 ? 'dia' : 'dias'} no estoque</p>
      </div>

      {/* Desconto liberado */}
      {hasDiscount && (
        <div className="bg-[#10B981]/10 border border-[#10B981]/30 rounded-[12px] p-4 mb-4">
          <p className="text-xs font-semibold text-[#10B981] uppercase tracking-wider mb-2">Desconto liberado</p>
          <p className="text-xs text-white/50 mb-1">Preço mínimo de venda</p>
          <p className="text-2xl font-bold text-[#10B981]">{formatCurrency(minSalePrice)}</p>
          <p className="text-xs text-white/40 mt-2">
            Tabela {formatCurrency(price)} — até {formatCurrency(discountMax)} de desconto.
            Não feche abaixo desse valor sem aprovação.
          </p>
        </div>
      )}

      {/* Visão do administrador */}
      {hasCost && (
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4 mb-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Visão do administrador</p>
          <div className="grid grid-cols-3 gap-3">
            {hasDiscount && (
              <div>
                <p className="text-xs text-white/40">Desconto liberado</p>
                <p className="text-sm font-semibold text-white">{formatCurrency(discountMax)}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-white/40">Custo</p>
              <p className="text-sm font-semibold text-white">{formatCurrency(costPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-white/40">Lucro</p>
              <p className={`text-sm font-semibold ${margin >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
                {formatCurrency(margin)}
              </p>
            </div>
          </div>
          {hasDiscount && (
            <p className="text-xs text-white/30 mt-3">
              Lucro se der o desconto máximo: {formatCurrency(minSalePrice - costPrice)}
            </p>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <Link
          href={`/admin/estoque/${car.id}/editar`}
          className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-white/10 hover:border-white/20 text-white text-sm py-2.5 rounded-[10px] transition-colors"
        >
          <Pencil size={14} />
          Editar margem
        </Link>
        <Link
          href={`/admin/estoque/${car.id}/editar`}
          className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-white/10 hover:border-white/20 text-white text-sm py-2.5 rounded-[10px] transition-colors"
        >
          <Edit2 size={14} />
          Editar carro / foto
        </Link>
      </div>

      <Link
        href={`/admin/clientes?car=${car.id}`}
        className="flex items-center justify-center gap-2 w-full bg-[#0D0D0D] hover:bg-[#E86020] border border-white/10 hover:border-[#E86020] text-white text-sm font-semibold py-3 rounded-[10px] transition-colors mb-2"
      >
        <Tag size={14} />
        Registrar cliente / negociação
      </Link>

      <MarkAsSoldButton
        carId={car.id}
        carName={`${car.brand} ${car.model} ${car.year}`}
        currentStatus={car.status}
        price={car.price}
        costPrice={car.cost_price ?? null}
        leads={leads}
      />

      <div className="mt-2">
        <CopyAdLinkButton carId={car.id} brand={car.brand} model={car.model} variant="block" />
      </div>

      <div className="mt-2">
        <DeleteCarButton carId={car.id} carName={`${car.brand} ${car.model}`} variant="block" />
      </div>

      {/* Public link */}
      <div className="mt-4 pt-4 border-t border-white/8">
        <Link
          href={`/carros/${car.id}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
        >
          <ExternalLink size={12} />
          Ver no site público
        </Link>
      </div>

      {/* Opcionais */}
      {car.optionals && car.optionals.length > 0 && (
        <div className="mt-6 bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Opcionais</p>
          <div className="flex flex-wrap gap-2">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {car.optionals.map((opt: any) => (
              <span key={opt} className="px-2.5 py-1 bg-white/6 border border-white/10 rounded-full text-xs text-white/70">{opt}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

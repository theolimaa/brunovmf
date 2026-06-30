import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { Car } from '@/types'
import { CarStatusBadge } from '@/components/ui/Badge'
import { formatCurrency, formatMileage, calcMargin } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import DeleteCarButton from './DeleteCarButton'
import { Plus } from 'lucide-react'

async function getCars(): Promise<Car[]> {
  await connection()
  return sql`
    SELECT c.*,
      COALESCE(
        json_agg(p ORDER BY p.is_primary DESC, p.order_index ASC) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) AS photos
    FROM cars c
    LEFT JOIN car_photos p ON p.car_id = c.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  ` as unknown as Promise<Car[]>
}

export default async function EstoquePage() {
  const cars = await getCars()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Estoque</h1>
          <p className="text-sm text-white/40 mt-1">{cars.length} veículos cadastrados</p>
        </div>
        <Link
          href="/admin/estoque/novo"
          className="flex items-center gap-2 bg-[#E86020] hover:bg-[#d4551a] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px] transition-colors"
        >
          <Plus size={14} />
          Novo carro
        </Link>
      </div>

      {cars.length === 0 ? (
        <div className="text-center py-20 bg-[#1A1A1A] border border-white/8 rounded-[12px]">
          <p className="text-white/30 text-lg mb-2">Estoque vazio</p>
          <Link href="/admin/estoque/novo" className="text-[#E86020] text-sm hover:underline">
            Adicionar primeiro carro
          </Link>
        </div>
      ) : (
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/8">
                <th className="text-left text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Veículo</th>
                <th className="text-left text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3 hidden md:table-cell">Ano / KM</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Preço</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Margem</th>
                <th className="text-left text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {cars.map((car, i) => {
                const photo = car.photos?.find(p => p.is_primary) ?? car.photos?.[0]
                const { marginPct } = car.cost_price
                  ? calcMargin(car.price, car.cost_price)
                  : { marginPct: null }

                return (
                  <tr key={car.id} className={`border-b border-white/4 hover:bg-white/3 transition-colors ${i % 2 === 0 ? '' : 'bg-white/1'}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-9 rounded-[6px] overflow-hidden bg-[#0D0D0D] flex-shrink-0">
                          {photo ? (
                            <Image src={photo.url} alt="" width={48} height={36} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{car.brand} {car.model}</p>
                          {car.color && <p className="text-xs text-white/40">{car.color}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-white/70">{car.year}</p>
                      <p className="text-xs text-white/40">{formatMileage(car.mileage)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm font-semibold text-white">{formatCurrency(car.price)}</p>
                      {car.cost_price && (
                        <p className="text-xs text-white/40">custo: {formatCurrency(car.cost_price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right hidden lg:table-cell">
                      {marginPct !== null ? (
                        <span className={`text-sm font-semibold ${marginPct >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
                          {marginPct.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-white/30 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <CarStatusBadge status={car.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <Link
                          href={`/admin/estoque/${car.id}`}
                          className="text-xs text-white/40 hover:text-white transition-colors"
                        >
                          Detalhe
                        </Link>
                        <Link
                          href={`/admin/estoque/${car.id}/editar`}
                          className="text-xs text-[#E86020] hover:text-[#d4551a] transition-colors font-medium"
                        >
                          Editar
                        </Link>
                        <DeleteCarButton carId={car.id} carName={`${car.brand} ${car.model}`} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

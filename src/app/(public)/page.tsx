import { connection } from 'next/server'
import { sql, query } from '@/lib/db'
import { Car } from '@/types'
import CarCard from '@/components/CarCard'
import { Search, SlidersHorizontal } from 'lucide-react'

async function getCars(searchParams: Record<string, string | undefined>): Promise<Car[]> {
  await connection()
  const conditions: string[] = ["c.status != 'sold'"]
  const params: (string | number)[] = []
  let idx = 1

  if (searchParams.brand) {
    conditions.push(`LOWER(c.brand) = LOWER($${idx++})`)
    params.push(searchParams.brand)
  }
  if (searchParams.minPrice) {
    conditions.push(`c.price >= $${idx++}`)
    params.push(parseFloat(searchParams.minPrice))
  }
  if (searchParams.maxPrice) {
    conditions.push(`c.price <= $${idx++}`)
    params.push(parseFloat(searchParams.maxPrice))
  }
  if (searchParams.fuel) {
    conditions.push(`c.fuel = $${idx++}`)
    params.push(searchParams.fuel)
  }
  if (searchParams.q) {
    conditions.push(`(LOWER(c.brand) LIKE LOWER($${idx}) OR LOWER(c.model) LIKE LOWER($${idx}))`)
    params.push(`%${searchParams.q}%`)
    idx++
  }

  const where = `WHERE ${conditions.join(' AND ')}`

  return query<Car>(
    `SELECT c.*,
      COALESCE(
        json_agg(p ORDER BY p.is_primary DESC, p.order_index ASC) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) AS photos
     FROM cars c
     LEFT JOIN car_photos p ON p.car_id = c.id
     ${where}
     GROUP BY c.id
     ORDER BY c.created_at DESC`,
    params
  )
}

async function getBrands(): Promise<string[]> {
  await connection()
  const rows = await sql`SELECT DISTINCT brand FROM cars WHERE status != 'sold' ORDER BY brand`
  return rows.map((r) => (r as { brand: string }).brand)
}

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams
  const [cars, brands] = await Promise.all([getCars(params), getBrands()])
  const availableCount = cars.filter(c => c.status === 'available').length

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-12">
        <p className="text-[#E86020] text-xs font-semibold uppercase tracking-[0.2em] mb-3">VMF Auto Store — Fortaleza</p>
        <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
          Mercado tem carro.<br />
          <span className="text-[#E86020]">Aqui tem padrão.</span>
        </h1>
        <p className="mt-4 text-white/50 text-sm max-w-md mx-auto">
          {availableCount} {availableCount === 1 ? 'veículo disponível' : 'veículos disponíveis'} para você. Todos selecionados com critério.
        </p>
      </div>

      {/* Filters */}
      <form method="GET" className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4 mb-8 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Busca</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              name="q"
              defaultValue={params.q}
              placeholder="Marca ou modelo..."
              className="w-full bg-[#0D0D0D] border border-white/12 rounded-[8px] pl-8 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E86020]/60"
            />
          </div>
        </div>

        {brands.length > 0 && (
          <div className="min-w-[140px]">
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Marca</label>
            <select
              name="brand"
              defaultValue={params.brand}
              className="w-full bg-[#0D0D0D] border border-white/12 rounded-[8px] px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#E86020]/60 appearance-none"
            >
              <option value="">Todas</option>
              {brands.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
        )}

        <div className="min-w-[120px]">
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Preço máx.</label>
          <input
            name="maxPrice"
            type="number"
            defaultValue={params.maxPrice}
            placeholder="R$ máximo"
            className="w-full bg-[#0D0D0D] border border-white/12 rounded-[8px] px-3 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#E86020]/60"
          />
        </div>

        <button
          type="submit"
          className="bg-[#E86020] hover:bg-[#d4551a] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px] flex items-center gap-2 transition-colors"
        >
          <SlidersHorizontal size={13} />
          Filtrar
        </button>

        {(params.q || params.brand || params.maxPrice || params.minPrice) && (
          <a href="/" className="text-xs text-white/40 hover:text-white transition-colors self-center">
            Limpar
          </a>
        )}
      </form>

      {/* Grid */}
      {cars.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {cars.map(car => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-white/30">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-lg font-medium">Nenhum veículo encontrado</p>
          <p className="text-sm mt-1">Tente outros filtros ou entre em contato com o Bruno.</p>
          <a
            href="https://wa.me/5585989000364"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 bg-[#E86020] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px]"
          >
            Falar com Bruno
          </a>
        </div>
      )}
    </div>
  )
}

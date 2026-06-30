import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import { sql } from '@/lib/db'
import { Car } from '@/types'
import CarForm from '@/components/CarForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

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

export default async function EditarCarro({ params }: PageProps) {
  const { id } = await params
  const car = await getCar(id)
  if (!car) notFound()

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/estoque" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-3">
          <ChevronLeft size={14} />
          Voltar ao estoque
        </Link>
        <h1 className="text-2xl font-bold text-white">{car.brand} {car.model} {car.year}</h1>
        <p className="text-sm text-white/40 mt-1">Editar dados e fotos do veículo</p>
      </div>

      <div className="max-w-2xl">
        <CarForm car={car} />
      </div>
    </div>
  )
}

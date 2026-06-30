import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [car] = await sql`
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

  if (!car) return NextResponse.json({ error: 'Carro não encontrado' }, { status: 404 })

  return NextResponse.json(car)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const body = await request.json()
  const { brand, model, year, price, cost_price, discount_max, mileage, color, fuel, transmission,
          category, doors, is_premium, acquisition_date, optionals, description, status } = body

  const [car] = await sql`
    UPDATE cars SET
      brand = ${brand},
      model = ${model},
      year = ${year},
      price = ${price},
      cost_price = ${cost_price ?? null},
      discount_max = ${discount_max ?? null},
      mileage = ${mileage ?? null},
      color = ${color ?? null},
      fuel = ${fuel ?? null},
      transmission = ${transmission ?? null},
      category = ${category ?? null},
      doors = ${doors ?? null},
      is_premium = ${is_premium ?? false},
      acquisition_date = ${acquisition_date ?? null},
      optionals = ${optionals ?? null},
      description = ${description ?? null},
      status = ${status ?? 'available'}
    WHERE id = ${id}
    RETURNING *
  `

  if (!car) return NextResponse.json({ error: 'Carro não encontrado' }, { status: 404 })
  return NextResponse.json(car)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const { status } = await request.json()

  const [car] = await sql`
    UPDATE cars SET status = ${status} WHERE id = ${id} RETURNING *
  `
  if (!car) return NextResponse.json({ error: 'Carro não encontrado' }, { status: 404 })
  return NextResponse.json(car)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params

  await sql`DELETE FROM cars WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}

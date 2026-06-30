import { NextRequest, NextResponse } from 'next/server'
import { sql, query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const status = searchParams.get('status')
  const brand = searchParams.get('brand')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')

  const conditions: string[] = []
  const params: (string | number)[] = []
  let idx = 1

  if (status) {
    conditions.push(`c.status = $${idx++}`)
    params.push(status)
  }
  if (brand) {
    conditions.push(`LOWER(c.brand) = LOWER($${idx++})`)
    params.push(brand)
  }
  if (minPrice) {
    conditions.push(`c.price >= $${idx++}`)
    params.push(parseFloat(minPrice))
  }
  if (maxPrice) {
    conditions.push(`c.price <= $${idx++}`)
    params.push(parseFloat(maxPrice))
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const cars = await query(
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

  return NextResponse.json(cars)
}

export async function POST(request: NextRequest) {
  await requireAdmin()

  const body = await request.json()
  const { brand, model, year, price, cost_price, discount_max, mileage, color, fuel, transmission,
          category, doors, is_premium, acquisition_date, optionals, description, status } = body

  if (!brand || !model || !year || !price) {
    return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
  }

  const [car] = await sql`
    INSERT INTO cars (brand, model, year, price, cost_price, discount_max, mileage, color, fuel,
                      transmission, category, doors, is_premium, acquisition_date, optionals, description, status)
    VALUES (${brand}, ${model}, ${year}, ${price}, ${cost_price ?? null}, ${discount_max ?? null},
            ${mileage ?? null}, ${color ?? null}, ${fuel ?? null}, ${transmission ?? null},
            ${category ?? null}, ${doors ?? null}, ${is_premium ?? false},
            ${acquisition_date ?? null}, ${optionals ?? null}, ${description ?? null},
            ${status ?? 'available'})
    RETURNING *
  `

  return NextResponse.json(car, { status: 201 })
}

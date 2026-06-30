import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
  const sales = await sql`
    SELECT s.*,
      row_to_json(c) AS car,
      row_to_json(l) AS lead
    FROM sales s
    LEFT JOIN cars c ON c.id = s.car_id
    LEFT JOIN leads l ON l.id = s.lead_id
    ORDER BY s.sale_date DESC, s.created_at DESC
  `
  return NextResponse.json(sales)
}

export async function POST(request: NextRequest) {
  await requireAdmin()

  const body = await request.json()
  const { car_id, lead_id, sale_price, cost_price, sale_date, notes } = body

  if (!sale_price || !cost_price) {
    return NextResponse.json({ error: 'Preço de venda e custo são obrigatórios' }, { status: 400 })
  }

  const [sale] = await sql`
    INSERT INTO sales (car_id, lead_id, sale_price, cost_price, sale_date, notes)
    VALUES (${car_id ?? null}, ${lead_id ?? null}, ${sale_price}, ${cost_price},
            ${sale_date ?? new Date().toISOString().split('T')[0]}, ${notes ?? null})
    RETURNING *
  `

  if (car_id) {
    await sql`UPDATE cars SET status = 'sold' WHERE id = ${car_id}`
  }
  if (lead_id) {
    await sql`UPDATE leads SET status = 'ganho' WHERE id = ${lead_id}`
  }

  return NextResponse.json(sale, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  await requireAdmin()

  const { searchParams } = request.nextUrl
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })

  await sql`DELETE FROM sales WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}

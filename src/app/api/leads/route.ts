import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

export async function GET() {
  const leads = await sql`
    SELECT l.*,
      row_to_json(c) AS car
    FROM leads l
    LEFT JOIN cars c ON c.id = l.car_id
    WHERE l.deleted_at IS NULL
    ORDER BY l.created_at DESC
  `
  return NextResponse.json(leads)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { car_id, name, phone, message, status, notes, contacted_at, visit_date, visit_time, came_to_store_at } = body

  if (!name || !phone) {
    return NextResponse.json({ error: 'Nome e telefone são obrigatórios' }, { status: 400 })
  }

  const [lead] = await sql`
    INSERT INTO leads (car_id, name, phone, message, status, notes, contacted_at, visit_date, visit_time, came_to_store_at)
    VALUES (
      ${car_id ?? null}, ${name}, ${phone}, ${message ?? null},
      ${status ?? 'lead_novo'}, ${notes ?? null},
      ${contacted_at ?? null}, ${visit_date ?? null}, ${visit_time ?? null}, ${came_to_store_at ?? null}
    )
    RETURNING *
  `

  return NextResponse.json(lead, { status: 201 })
}

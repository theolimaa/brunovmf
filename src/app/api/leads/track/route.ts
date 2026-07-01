import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'

/**
 * Registra automaticamente um lead quando alguém clica em "Falar no WhatsApp"
 * na página de um carro. Sem autenticação de admin — é chamado pelo público,
 * geralmente via navigator.sendBeacon no instante em que a pessoa sai pro WhatsApp.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const car_id = body?.car_id

  if (!car_id) {
    return NextResponse.json({ error: 'car_id é obrigatório' }, { status: 400 })
  }

  const utm_source = body?.utm_source || null
  const utm_medium = body?.utm_medium || null
  const utm_campaign = body?.utm_campaign || null
  const source = utm_source ? 'trafego_pago' : 'site'

  const [car] = await sql`SELECT brand, model FROM cars WHERE id = ${car_id}`
  const name = car ? `Lead do site — ${car.brand} ${car.model}` : 'Lead do site'

  const [lead] = await sql`
    INSERT INTO leads (car_id, name, phone, status, source, utm_source, utm_medium, utm_campaign)
    VALUES (${car_id}, ${name}, NULL, 'lead_novo', ${source}, ${utm_source}, ${utm_medium}, ${utm_campaign})
    RETURNING *
  `

  return NextResponse.json(lead, { status: 201 })
}

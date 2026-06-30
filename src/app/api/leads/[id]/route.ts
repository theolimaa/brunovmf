import { NextRequest, NextResponse } from 'next/server'
import { sql, query } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  const body = await request.json()

  const updates: string[] = []
  const values: (string | null)[] = []
  let idx = 1

  const { status, notes, contacted_at, visit_date, visit_time, came_to_store_at } = body

  if (status !== undefined) {
    updates.push(`status = $${idx++}`)
    values.push(status)
  }
  if (notes !== undefined) {
    updates.push(`notes = $${idx++}`)
    values.push(notes)
  }
  if (contacted_at !== undefined) {
    updates.push(`contacted_at = $${idx++}`)
    values.push(contacted_at)
  }
  if (visit_date !== undefined) {
    updates.push(`visit_date = $${idx++}`)
    values.push(visit_date)
  }
  if (visit_time !== undefined) {
    updates.push(`visit_time = $${idx++}`)
    values.push(visit_time)
  }
  if (came_to_store_at !== undefined) {
    updates.push(`came_to_store_at = $${idx++}`)
    values.push(came_to_store_at)
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nenhum campo para atualizar' }, { status: 400 })
  }

  values.push(id)
  const rows = await query(
    `UPDATE leads SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
    values
  )
  const lead = rows[0]

  if (!lead) return NextResponse.json({ error: 'Lead não encontrado' }, { status: 404 })
  return NextResponse.json(lead)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireAdmin()
  const { id } = await params
  await sql`DELETE FROM leads WHERE id = ${id}`
  return NextResponse.json({ ok: true })
}

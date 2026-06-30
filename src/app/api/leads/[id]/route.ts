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
  const { status, notes } = body

  const updates: string[] = []
  const values: (string | null)[] = []
  let idx = 1

  if (status !== undefined) {
    updates.push(`status = $${idx++}`)
    values.push(status)
  }
  if (notes !== undefined) {
    updates.push(`notes = $${idx++}`)
    values.push(notes)
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

import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { deleteCarPhotosFolder } from '@/lib/cloudinaryCleanup'
import { RETENTION_DAYS } from '@/lib/trashConfig'

type TrashType = 'car' | 'lead' | 'sale'

function isTrashType(value: unknown): value is TrashType {
  return value === 'car' || value === 'lead' || value === 'sale'
}

export async function GET() {
  await requireAdmin()

  const [cars, leads, sales] = await Promise.all([
    sql`
      SELECT id, brand, model, year, price, deleted_at
      FROM cars
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `,
    sql`
      SELECT id, name, phone, deleted_at
      FROM leads
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `,
    sql`
      SELECT id, sale_price, sale_date, deleted_at
      FROM sales
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    `,
  ])

  return NextResponse.json({ cars, leads, sales, retentionDays: RETENTION_DAYS })
}

export async function PATCH(request: NextRequest) {
  await requireAdmin()
  const { type, id } = await request.json()

  if (!isTrashType(type) || !id) {
    return NextResponse.json({ error: 'type e id são obrigatórios' }, { status: 400 })
  }

  if (type === 'car') {
    await sql`UPDATE cars SET deleted_at = NULL WHERE id = ${id}`
  } else if (type === 'lead') {
    await sql`UPDATE leads SET deleted_at = NULL WHERE id = ${id}`
  } else {
    await sql`UPDATE sales SET deleted_at = NULL WHERE id = ${id}`
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  await requireAdmin()
  const { searchParams } = request.nextUrl
  const type = searchParams.get('type')
  const id = searchParams.get('id')

  if (!isTrashType(type) || !id) {
    return NextResponse.json({ error: 'type e id são obrigatórios' }, { status: 400 })
  }

  if (type === 'car') {
    await deleteCarPhotosFolder(id)
    await sql`DELETE FROM cars WHERE id = ${id} AND deleted_at IS NOT NULL`
  } else if (type === 'lead') {
    await sql`DELETE FROM leads WHERE id = ${id} AND deleted_at IS NOT NULL`
  } else {
    await sql`DELETE FROM sales WHERE id = ${id} AND deleted_at IS NOT NULL`
  }

  return NextResponse.json({ ok: true })
}

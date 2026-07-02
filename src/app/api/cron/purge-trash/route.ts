import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { deleteCarPhotosFolder } from '@/lib/cloudinaryCleanup'
import { RETENTION_DAYS } from '@/lib/trashConfig'

/**
 * Disparado pelo Vercel Cron (ver vercel.json) uma vez por dia. Apaga definitivamente
 * tudo que está na lixeira há mais de RETENTION_DAYS — incluindo as fotos no Cloudinary
 * dos carros purgados, pra não acumular armazenamento indefinidamente.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const cutoff = `${RETENTION_DAYS} days`

  const expiredCars = await sql`
    SELECT id FROM cars
    WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - ${cutoff}::interval
  ` as { id: string }[]

  for (const car of expiredCars) {
    await deleteCarPhotosFolder(car.id)
  }

  const [purgedCars, purgedLeads, purgedSales] = await Promise.all([
    sql`
      DELETE FROM cars
      WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - ${cutoff}::interval
      RETURNING id
    `,
    sql`
      DELETE FROM leads
      WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - ${cutoff}::interval
      RETURNING id
    `,
    sql`
      DELETE FROM sales
      WHERE deleted_at IS NOT NULL AND deleted_at < NOW() - ${cutoff}::interval
      RETURNING id
    `,
  ])

  return NextResponse.json({
    ok: true,
    purged: { cars: purgedCars.length, leads: purgedLeads.length, sales: purgedSales.length },
  })
}

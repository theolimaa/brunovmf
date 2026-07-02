import { NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { cloudinary, deleteCarPhotosFolder } from '@/lib/cloudinaryCleanup'

/**
 * Apaga pastas de fotos no Cloudinary que sobraram de carros já excluídos
 * definitivamente do banco (de antes de existir a lixeira, quando excluir um carro
 * não limpava o Cloudinary). Compara as pastas `vmf-autostore/<carId>` com os carros
 * que ainda existem no banco (incluindo os que estão na lixeira, cujas fotos são
 * legítimas) e apaga só as pastas órfãs. Idempotente — rodar de novo não faz nada
 * se não sobrar órfã nenhuma.
 */
export async function POST() {
  await requireAdmin()

  const cars = await sql`SELECT id FROM cars` as { id: string }[]
  const carIds = new Set(cars.map(c => c.id))

  const { folders } = await cloudinary.api.sub_folders('vmf-autostore', { max_results: 500 })
  const orphanFolders = (folders as { name: string }[]).filter(f => !carIds.has(f.name))

  for (const folder of orphanFolders) {
    await deleteCarPhotosFolder(folder.name)
  }

  return NextResponse.json({
    ok: true,
    carsInDb: carIds.size,
    foldersFound: folders.length,
    orphansDeleted: orphanFolders.length,
  })
}

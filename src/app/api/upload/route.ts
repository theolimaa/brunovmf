import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  await requireAdmin()

  const formData = await request.formData()
  const carId = formData.get('car_id') as string
  const isPrimary = formData.get('is_primary') === 'true'
  const files = formData.getAll('files') as File[]

  if (!carId || files.length === 0) {
    return NextResponse.json({ error: 'car_id e files são obrigatórios' }, { status: 400 })
  }

  const uploaded: { url: string; is_primary: boolean }[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `vmf-autostore/${carId}`,
          resource_type: 'image',
          transformation: [{ quality: 'auto', fetch_format: 'auto' }],
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result as { secure_url: string })
        }
      ).end(buffer)
    })

    const primary = isPrimary && i === 0

    const [photo] = await sql`
      INSERT INTO car_photos (car_id, url, is_primary, order_index)
      VALUES (${carId}, ${result.secure_url}, ${primary}, ${i})
      RETURNING *
    `

    if (primary) {
      await sql`
        UPDATE car_photos SET is_primary = false
        WHERE car_id = ${carId} AND id != ${photo.id}
      `
    }

    uploaded.push({ url: result.secure_url, is_primary: primary })
  }

  return NextResponse.json({ uploaded })
}

export async function PATCH(request: NextRequest) {
  await requireAdmin()
  const { photo_id, car_id } = await request.json()
  if (!photo_id || !car_id) return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })

  await sql`UPDATE car_photos SET is_primary = false WHERE car_id = ${car_id}`
  await sql`UPDATE car_photos SET is_primary = true WHERE id = ${photo_id}`

  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  await requireAdmin()

  const { searchParams } = request.nextUrl
  const photoId = searchParams.get('photo_id')
  if (!photoId) return NextResponse.json({ error: 'photo_id obrigatório' }, { status: 400 })

  const [photo] = await sql`SELECT url FROM car_photos WHERE id = ${photoId}`
  if (!photo) return NextResponse.json({ error: 'Foto não encontrada' }, { status: 404 })

  const publicId = photo.url.split('/').slice(-2).join('/').replace(/\.[^.]+$/, '')
  await cloudinary.uploader.destroy(`vmf-autostore/${publicId.split('/').pop()}`)

  await sql`DELETE FROM car_photos WHERE id = ${photoId}`

  return NextResponse.json({ ok: true })
}

import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
const SKIP_PREFIXES = ['logo', 'fachada', 'foto-bruno', 'file', 'next', 'vercel', 'globe', 'window']

function normalize(str: string) {
  return str.toLowerCase().replace(/[-_ .]/g, '')
}

export async function POST() {
  await requireAdmin()

  const publicDir = path.join(process.cwd(), 'public')
  const files = fs.readdirSync(publicDir)

  const carImages = files.filter(f => {
    const lower = f.toLowerCase()
    return IMAGE_EXTENSIONS.some(ext => lower.endsWith(ext)) &&
           !SKIP_PREFIXES.some(skip => lower.startsWith(skip))
  })

  const cars = await sql`SELECT id, brand, model FROM cars ORDER BY created_at DESC` as { id: string; brand: string; model: string }[]

  const results: Array<{ file: string; car: string | null; status: string }> = []

  for (const imageFile of carImages) {
    const ext = path.extname(imageFile)
    const baseName = normalize(imageFile.slice(0, -ext.length))

    const matched = cars.find(car => {
      const model = normalize(car.model)
      const brand = normalize(car.brand)
      return model.includes(baseName) || baseName.includes(model) || brand === baseName
    })

    if (!matched) {
      results.push({ file: imageFile, car: null, status: 'no_match' })
      continue
    }

    const filePath = path.join(publicDir, imageFile)
    const buffer = fs.readFileSync(filePath)

    try {
      const uploaded = await new Promise<{ secure_url: string }>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: `vmf-autostore/${matched.id}`,
            resource_type: 'image',
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error)
            else resolve(result as { secure_url: string })
          }
        ).end(buffer)
      })

      const [existing] = await sql`SELECT COUNT(*)::int AS count FROM car_photos WHERE car_id = ${matched.id}`
      const isPrimary = (existing as { count: number }).count === 0

      await sql`
        INSERT INTO car_photos (car_id, url, is_primary, order_index)
        VALUES (${matched.id}, ${uploaded.secure_url}, ${isPrimary}, 0)
      `

      results.push({ file: imageFile, car: `${matched.brand} ${matched.model}`, status: 'imported' })
    } catch {
      results.push({ file: imageFile, car: `${matched.brand} ${matched.model}`, status: 'error' })
    }
  }

  return NextResponse.json({ results })
}

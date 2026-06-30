import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getAdminSession } from '@/lib/auth'
import { sql } from '@/lib/db'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export async function POST(request: NextRequest) {
  const isAdmin = await getAdminSession()
  if (!isAdmin) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })

  const { currentPassword, newPassword } = await request.json()

  if (!currentPassword || !newPassword) {
    return NextResponse.json({ error: 'Preencha todos os campos' }, { status: 400 })
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'A nova senha deve ter pelo menos 6 caracteres' }, { status: 400 })
  }

  await sql`
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  const rows = await sql`SELECT value FROM admin_settings WHERE key = 'password_hash'`
  const storedHash = (rows[0] as { value: string } | undefined)?.value ?? null

  const valid = storedHash
    ? hashPassword(currentPassword) === storedHash
    : currentPassword === process.env.ADMIN_PASSWORD

  if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 401 })

  const newHash = hashPassword(newPassword)
  await sql`
    INSERT INTO admin_settings (key, value, updated_at)
    VALUES ('password_hash', ${newHash}, NOW())
    ON CONFLICT (key) DO UPDATE SET value = ${newHash}, updated_at = NOW()
  `

  return NextResponse.json({ ok: true })
}

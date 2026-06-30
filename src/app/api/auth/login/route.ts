import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { sql } from '@/lib/db'

function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

async function getStoredPasswordHash(): Promise<string | null> {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS admin_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `
    const rows = await sql`SELECT value FROM admin_settings WHERE key = 'password_hash'`
    return (rows[0] as { value: string } | undefined)?.value ?? null
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const { password } = await request.json()
  if (!password) return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })

  const storedHash = await getStoredPasswordHash()
  const valid = storedHash
    ? hashPassword(password) === storedHash
    : password === process.env.ADMIN_PASSWORD

  if (!valid) return NextResponse.json({ error: 'Senha incorreta' }, { status: 401 })

  const token = process.env.ADMIN_TOKEN
  if (!token) return NextResponse.json({ error: 'Servidor mal configurado' }, { status: 500 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return response
}

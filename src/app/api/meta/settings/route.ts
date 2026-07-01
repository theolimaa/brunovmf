import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS admin_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
}

export async function GET() {
  await requireAdmin()
  await ensureTable()

  const rows = await sql`
    SELECT key, value FROM admin_settings WHERE key IN ('meta_access_token', 'meta_ad_account_id')
  `
  const map = Object.fromEntries(rows.map((r) => [(r as { key: string }).key, (r as { value: string }).value]))

  return NextResponse.json({
    hasToken: !!map.meta_access_token,
    adAccountId: map.meta_ad_account_id ?? '',
  })
}

export async function POST(request: NextRequest) {
  await requireAdmin()
  await ensureTable()

  const { accessToken, adAccountId } = await request.json()

  if (accessToken) {
    await sql`
      INSERT INTO admin_settings (key, value, updated_at) VALUES ('meta_access_token', ${accessToken}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${accessToken}, updated_at = NOW()
    `
  }
  if (adAccountId !== undefined) {
    await sql`
      INSERT INTO admin_settings (key, value, updated_at) VALUES ('meta_ad_account_id', ${adAccountId}, NOW())
      ON CONFLICT (key) DO UPDATE SET value = ${adAccountId}, updated_at = NOW()
    `
  }

  return NextResponse.json({ ok: true })
}

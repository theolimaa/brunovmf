import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'
import { getMonthWeeks } from '@/lib/metaReport'

export async function POST(request: NextRequest) {
  await requireAdmin()

  const { year, month } = await request.json()
  if (!year || !month) {
    return NextResponse.json({ error: 'year e month são obrigatórios' }, { status: 400 })
  }

  const settingsRows = await sql`
    SELECT key, value FROM admin_settings WHERE key IN ('meta_access_token', 'meta_ad_account_id')
  `
  const settings = Object.fromEntries(
    settingsRows.map((r) => [(r as { key: string }).key, (r as { value: string }).value])
  )
  const token = settings.meta_access_token
  const adAccountId = settings.meta_ad_account_id

  if (!token || !adAccountId) {
    return NextResponse.json(
      { error: 'Conecte a conta de anúncios da Meta antes de sincronizar' },
      { status: 400 }
    )
  }

  const weeks = getMonthWeeks(year, month)

  for (const week of weeks) {
    const timeRange = encodeURIComponent(JSON.stringify({ since: week.start, until: week.end }))
    const url = `https://graph.facebook.com/v21.0/act_${adAccountId}/insights?fields=spend&time_range=${timeRange}&access_token=${token}`

    const res = await fetch(url)
    const data = await res.json()

    if (data.error) {
      return NextResponse.json(
        { error: `Erro da Meta: ${data.error.message}` },
        { status: 400 }
      )
    }

    const spend = data.data?.[0]?.spend ? parseFloat(data.data[0].spend) : 0

    await sql`
      INSERT INTO ad_spend_weekly (week_start, week_end, amount, synced_at)
      VALUES (${week.start}, ${week.end}, ${spend}, NOW())
      ON CONFLICT (week_start) DO UPDATE SET amount = ${spend}, week_end = ${week.end}, synced_at = NOW()
    `
  }

  return NextResponse.json({ ok: true })
}

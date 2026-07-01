import { sql } from '@/lib/db'

export interface MonthWeek {
  start: string
  end: string
  label: string
}

/** Divide o mês em semanas de calendário (segunda a domingo), recortadas nas bordas do mês. */
export function getMonthWeeks(year: number, month: number): MonthWeek[] {
  const firstDay = new Date(Date.UTC(year, month - 1, 1))
  const lastDay = new Date(Date.UTC(year, month, 0))
  const weeks: MonthWeek[] = []

  let cursor = firstDay
  while (cursor <= lastDay) {
    const dayOfWeek = cursor.getUTCDay() // 0=domingo..6=sábado
    const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek
    let weekEnd = new Date(cursor)
    weekEnd.setUTCDate(cursor.getUTCDate() + daysUntilSunday)
    if (weekEnd > lastDay) weekEnd = lastDay

    const fmt = (d: Date) => d.toISOString().slice(0, 10)
    const fmtLabel = (d: Date) => `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`

    weeks.push({
      start: fmt(cursor),
      end: fmt(weekEnd),
      label: `${fmtLabel(cursor)} - ${fmtLabel(weekEnd)}`,
    })

    const next = new Date(weekEnd)
    next.setUTCDate(weekEnd.getUTCDate() + 1)
    cursor = next
  }

  return weeks
}

export interface TrafficWeekRow extends MonthWeek {
  spend: number
  leads: number
  sales: number
  revenue: number
  cost: number
  profit: number
}

/** Monta o relatório semanal de tráfego pago: gasto sincronizado da Meta + leads/vendas atribuídos. */
export async function getTrafficReport(year: number, month: number): Promise<TrafficWeekRow[]> {
  const weeks = getMonthWeeks(year, month)
  const rows: TrafficWeekRow[] = []

  for (const week of weeks) {
    const [spendRow] = await sql`
      SELECT amount FROM ad_spend_weekly WHERE week_start = ${week.start}
    `
    const [leadsRow] = await sql`
      SELECT COUNT(*) AS count FROM leads
      WHERE source = 'trafego_pago'
        AND created_at::date BETWEEN ${week.start} AND ${week.end}
    `
    const salesRows = await sql`
      SELECT s.sale_price, s.cost_price FROM sales s
      JOIN leads l ON l.id = s.lead_id
      WHERE l.source = 'trafego_pago'
        AND s.sale_date BETWEEN ${week.start} AND ${week.end}
    ` as unknown as { sale_price: string; cost_price: string }[]

    const revenue = salesRows.reduce((sum, s) => sum + parseFloat(s.sale_price), 0)
    const cost = salesRows.reduce((sum, s) => sum + parseFloat(s.cost_price), 0)
    const spend = spendRow ? parseFloat((spendRow as { amount: string }).amount) : 0
    const grossMargin = revenue - cost

    rows.push({
      ...week,
      spend,
      leads: parseInt((leadsRow as { count: string }).count, 10),
      sales: salesRows.length,
      revenue,
      cost,
      profit: grossMargin - spend,
    })
  }

  return rows
}

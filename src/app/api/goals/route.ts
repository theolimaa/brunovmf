import { NextRequest, NextResponse } from 'next/server'
import { sql } from '@/lib/db'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const month = searchParams.get('month')
  const year  = searchParams.get('year')

  if (month && year) {
    const [goal] = await sql`
      SELECT * FROM goals WHERE month = ${parseInt(month)} AND year = ${parseInt(year)}
    `
    return NextResponse.json(goal ?? null)
  }

  const goals = await sql`SELECT * FROM goals ORDER BY year DESC, month DESC`
  return NextResponse.json(goals)
}

export async function POST(request: NextRequest) {
  await requireAdmin()
  const { month, year, target } = await request.json()

  if (!month || !year || !target) {
    return NextResponse.json({ error: 'month, year e target são obrigatórios' }, { status: 400 })
  }

  const [goal] = await sql`
    INSERT INTO goals (month, year, target)
    VALUES (${month}, ${year}, ${target})
    ON CONFLICT (month, year) DO UPDATE SET target = ${target}
    RETURNING *
  `
  return NextResponse.json(goal)
}

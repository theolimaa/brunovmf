import { connection } from 'next/server'
import { sql } from '@/lib/db'
import MetasClient from './MetasClient'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

async function getData() {
  await connection()
  const now = new Date()
  const month = now.getMonth() + 1
  const year  = now.getFullYear()

  const [[goal], salesData, leadsData] = await Promise.all([
    sql`SELECT * FROM goals WHERE month = ${month} AND year = ${year}`,
    sql`
      SELECT COUNT(*) as count
      FROM sales
      WHERE EXTRACT(MONTH FROM sale_date) = ${month}
        AND EXTRACT(YEAR  FROM sale_date) = ${year}
    `,
    sql`
      SELECT status, COUNT(*) as count FROM leads
      WHERE EXTRACT(MONTH FROM created_at) = ${month}
        AND EXTRACT(YEAR  FROM created_at) = ${year}
      GROUP BY status
    `,
  ])

  return {
    month,
    year,
    monthName: MONTH_NAMES[month - 1],
    target:    goal?.target ?? 20,
    salesCount: parseInt(salesData[0]?.count ?? '0'),
    leads: leadsData,
  }
}

export default async function MetasPage() {
  const data = await getData()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leadsByStatus = Object.fromEntries((data.leads as any[]).map((r: any) => [r.status, parseInt(r.count)]))
  const activeLeads  = (leadsByStatus.lead_novo ?? 0) + (leadsByStatus.visita_marcada ?? 0) + (leadsByStatus.negociando ?? 0)
  const visitasMarcadas = leadsByStatus.visita_marcada ?? 0

  const suggestions = []
  if (activeLeads === 0) suggestions.push('Cadastre novos clientes e agende visitas pra encher o funil.')
  if (visitasMarcadas > 0) suggestions.push(`Você tem ${visitasMarcadas} visita${visitasMarcadas > 1 ? 's' : ''} marcada${visitasMarcadas > 1 ? 's' : ''} — confirme com os clientes.`)
  if ((leadsByStatus.ligar_de_volta ?? 0) > 0) suggestions.push(`Ligue pra ${leadsByStatus.ligar_de_volta} cliente${leadsByStatus.ligar_de_volta > 1 ? 's' : ''} que pediu retorno.`)
  if (data.salesCount < data.target) {
    const remaining = data.target - data.salesCount
    suggestions.push(`Faltam ${remaining} venda${remaining > 1 ? 's' : ''} pra bater a meta do mês.`)
  }
  if (suggestions.length === 0) suggestions.push('Ótimo ritmo! Continue assim.')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Metas</h1>
          <p className="text-sm text-white/40 mt-1">Registre cada venda no +. Zera sozinho quando vira o mês.</p>
        </div>
        <span className="text-sm text-white/40">{data.monthName}</span>
      </div>

      <MetasClient
        month={data.month}
        year={data.year}
        initialTarget={data.target}
        salesCount={data.salesCount}
        suggestions={suggestions}
      />
    </div>
  )
}

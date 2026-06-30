import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { Lead } from '@/types'
import KanbanBoard from '@/components/KanbanBoard'

async function getLeads(): Promise<Lead[]> {
  await connection()
  return sql`
    SELECT l.*,
      CASE WHEN c.id IS NOT NULL
        THEN row_to_json(c)
        ELSE NULL
      END AS car
    FROM leads l
    LEFT JOIN cars c ON c.id = l.car_id
    ORDER BY l.created_at DESC
  ` as unknown as Promise<Lead[]>
}

export default async function LeadsPage() {
  const leads = await getLeads()

  const total = leads.length
  const active = leads.filter(l => !['ganho', 'perdido'].includes(l.status)).length

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Leads</h1>
        <p className="text-sm text-white/40 mt-1">
          {total} leads no total — {active} ativos
        </p>
      </div>

      <KanbanBoard initialLeads={leads} />
    </div>
  )
}

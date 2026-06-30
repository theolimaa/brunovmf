import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { Lead, Car } from '@/types'
import KanbanBoard from '@/components/KanbanBoard'

async function getLeads(): Promise<Lead[]> {
  await connection()
  return sql`
    SELECT l.*,
      CASE WHEN c.id IS NOT NULL THEN row_to_json(c) ELSE NULL END AS car
    FROM leads l
    LEFT JOIN cars c ON c.id = l.car_id
    ORDER BY l.created_at DESC
  ` as unknown as Promise<Lead[]>
}

async function getAvailableCars(): Promise<Car[]> {
  await connection()
  return sql`
    SELECT id, brand, model, year, price, status
    FROM cars
    WHERE status != 'sold'
    ORDER BY brand, model
  ` as unknown as Promise<Car[]>
}

export default async function ClientesPage() {
  const [leads, cars] = await Promise.all([getLeads(), getAvailableCars()])

  const total  = leads.length
  const active = leads.filter(l => !['vendeu', 'nao_comprou'].includes(l.status)).length

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <p className="text-sm text-white/40 mt-1">
          {total} clientes no total — {active} ativos no funil
        </p>
      </div>

      <KanbanBoard initialLeads={leads} cars={cars} />
    </div>
  )
}

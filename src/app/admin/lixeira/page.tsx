import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { RETENTION_DAYS } from '@/lib/trashConfig'
import LixeiraClient, { TrashedCar, TrashedLead, TrashedSale } from './LixeiraClient'

async function getTrash() {
  await connection()
  const [cars, leads, sales] = await Promise.all([
    sql`
      SELECT id, brand, model, year, price, deleted_at
      FROM cars
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    ` as unknown as Promise<TrashedCar[]>,
    sql`
      SELECT id, name, phone, deleted_at
      FROM leads
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    ` as unknown as Promise<TrashedLead[]>,
    sql`
      SELECT id, sale_price, sale_date, deleted_at
      FROM sales
      WHERE deleted_at IS NOT NULL
      ORDER BY deleted_at DESC
    ` as unknown as Promise<TrashedSale[]>,
  ])
  return { cars, leads, sales }
}

export default async function LixeiraPage() {
  const { cars, leads, sales } = await getTrash()
  const total = cars.length + leads.length + sales.length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Lixeira</h1>
        <p className="text-sm text-white/40 mt-1">
          {total === 0
            ? 'Vazia — nada excluído no momento.'
            : `${total} item${total !== 1 ? 's' : ''} excluído${total !== 1 ? 's' : ''}. Restaura ou apaga em definitivo.`}
        </p>
        <p className="text-xs text-white/25 mt-1">
          Itens excluídos ficam aqui por {RETENTION_DAYS} dias e depois são apagados automaticamente
          (fotos incluídas, no caso de carros).
        </p>
      </div>

      <LixeiraClient cars={cars} leads={leads} sales={sales} />
    </div>
  )
}

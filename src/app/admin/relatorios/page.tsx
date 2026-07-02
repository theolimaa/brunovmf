import Link from 'next/link'
import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { Sale } from '@/types'
import { formatCurrency, calcMargin } from '@/lib/utils'
import SaleForm from '../vendas/SaleForm'
import TrafficReportSection from './TrafficReportSection'
import { TrendingUp, DollarSign, Percent } from 'lucide-react'

async function getSales(): Promise<Sale[]> {
  await connection()
  return sql`
    SELECT s.*,
      CASE WHEN c.id IS NOT NULL THEN row_to_json(c) ELSE NULL END AS car,
      CASE WHEN l.id IS NOT NULL THEN row_to_json(l) ELSE NULL END AS lead
    FROM sales s
    LEFT JOIN cars c ON c.id = s.car_id
    LEFT JOIN leads l ON l.id = s.lead_id
    WHERE s.deleted_at IS NULL
    ORDER BY s.sale_date DESC, s.created_at DESC
  ` as unknown as Promise<Sale[]>
}

async function getAvailableCars() {
  await connection()
  return sql`SELECT id, brand, model, year, price, cost_price FROM cars WHERE status != 'sold' AND deleted_at IS NULL ORDER BY brand, model`
}

async function getActiveLeads() {
  await connection()
  return sql`SELECT id, name, phone, car_id FROM leads WHERE status NOT IN ('vendeu', 'nao_comprou') AND deleted_at IS NULL ORDER BY name`
}

async function getSummary() {
  await connection()
  const [thisMonth, allTime] = await Promise.all([
    sql`
      SELECT COUNT(*) as count,
        COALESCE(SUM(sale_price), 0) as revenue,
        COALESCE(SUM(sale_price - cost_price), 0) as margin
      FROM sales
      WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR  FROM sale_date) = EXTRACT(YEAR  FROM NOW())
        AND deleted_at IS NULL
    `,
    sql`
      SELECT COUNT(*) as count,
        COALESCE(SUM(sale_price), 0) as revenue,
        COALESCE(SUM(sale_price - cost_price), 0) as margin
      FROM sales
      WHERE deleted_at IS NULL
    `,
  ])
  return { thisMonth: thisMonth[0], allTime: allTime[0] }
}

interface PageProps {
  searchParams: Promise<{ tab?: string; year?: string; month?: string }>
}

export default async function RelatoriosPage({ searchParams }: PageProps) {
  const params = await searchParams
  const tab = params.tab === 'trafego' ? 'trafego' : 'vendas'
  const now = new Date()
  const year = params.year ? parseInt(params.year) : now.getFullYear()
  const month = params.month ? parseInt(params.month) : now.getMonth() + 1

  const [sales, cars, leads, { thisMonth, allTime }] = await Promise.all([
    getSales(),
    getAvailableCars(),
    getActiveLeads(),
    getSummary(),
  ])

  const thisMonthMarginPct = parseFloat(thisMonth.revenue) > 0
    ? (parseFloat(thisMonth.margin) / parseFloat(thisMonth.revenue)) * 100
    : 0

  const tabClass = (active: boolean) =>
    `px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors ${
      active ? 'bg-[#E86020] text-white' : 'bg-white/6 text-white/50 hover:bg-white/10 hover:text-white/70'
    }`

  return (
    <div>
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Relatórios</h1>
          <p className="text-sm text-white/40 mt-1">Histórico, margem e tráfego pago</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/relatorios?tab=vendas" className={tabClass(tab === 'vendas')}>Vendas</Link>
          <Link href="/admin/relatorios?tab=trafego" className={tabClass(tab === 'trafego')}>Tráfego pago</Link>
        </div>
      </div>

      {tab === 'trafego' ? (
        <TrafficReportSection year={year} month={month} />
      ) : (
        <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-[#E86020]" />
            <span className="text-xs text-white/50 uppercase tracking-wider">Vendas este mês</span>
          </div>
          <p className="text-2xl font-bold text-white">{thisMonth.count}</p>
          <p className="text-xs text-white/40 mt-1">faturamento: {formatCurrency(thisMonth.revenue)}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[#10B981]" />
            <span className="text-xs text-white/50 uppercase tracking-wider">Margem este mês</span>
          </div>
          <p className="text-2xl font-bold text-[#10B981]">{formatCurrency(thisMonth.margin)}</p>
          <p className="text-xs text-white/40 mt-1">{thisMonthMarginPct.toFixed(1)}% sobre faturamento</p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={16} className="text-[#8B5CF6]" />
            <span className="text-xs text-white/50 uppercase tracking-wider">Total histórico</span>
          </div>
          <p className="text-2xl font-bold text-white">{allTime.count} vendas</p>
          <p className="text-xs text-white/40 mt-1">margem: {formatCurrency(allTime.margin)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
            <h2 className="text-sm font-semibold text-white mb-4">Registrar venda</h2>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <SaleForm cars={cars as any} leads={leads as any} />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] overflow-hidden">
            <div className="px-4 py-3 border-b border-white/8">
              <h2 className="text-sm font-semibold text-white">Histórico de vendas</h2>
            </div>
            {sales.length === 0 ? (
              <div className="text-center py-12 text-white/30">
                <p>Nenhuma venda registrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/6">
                      <th className="text-left text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Veículo</th>
                      <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Venda</th>
                      <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Margem</th>
                      <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map(sale => {
                      const { margin, marginPct } = calcMargin(sale.sale_price, sale.cost_price)
                      return (
                        <tr key={sale.id} className="border-b border-white/4 hover:bg-white/2">
                          <td className="px-4 py-3">
                            <p className="text-sm text-white">
                              {sale.car ? `${sale.car.brand} ${sale.car.model} ${sale.car.year}` : 'Sem carro'}
                            </p>
                            {sale.lead && <p className="text-xs text-white/40">{sale.lead.name}</p>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className="text-sm font-semibold text-white">{formatCurrency(sale.sale_price)}</p>
                            <p className="text-xs text-white/40">custo: {formatCurrency(sale.cost_price)}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <p className={`text-sm font-semibold ${margin >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>
                              {formatCurrency(margin)}
                            </p>
                            <p className="text-xs text-white/40">{marginPct.toFixed(1)}%</p>
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-white/60">
                            {new Date(sale.sale_date).toLocaleDateString('pt-BR')}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  )
}

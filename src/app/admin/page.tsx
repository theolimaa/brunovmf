import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { formatCurrency, formatMileage } from '@/lib/utils'
import { Car, TrendingUp, Users, DollarSign, Package, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

async function getDashboardData() {
  await connection()

  const [stockRows, leadsRows, salesRows, oldestCars, mktValue] = await Promise.all([
    // Estoque por status
    sql`SELECT status, COUNT(*) as count FROM cars WHERE status != 'sold' GROUP BY status`,
    // Leads por status
    sql`SELECT status, COUNT(*) as count FROM leads GROUP BY status`,
    // Vendas do mês
    sql`
      SELECT COUNT(*) as count,
        COALESCE(SUM(sale_price), 0)            as revenue,
        COALESCE(SUM(sale_price - cost_price), 0) as margin,
        COALESCE(SUM(cost_price), 0)            as invested
      FROM sales
      WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR  FROM sale_date) = EXTRACT(YEAR  FROM NOW())
    `,
    // Carros parados há mais tempo
    sql`
      SELECT c.*,
        COALESCE(json_agg(p ORDER BY p.is_primary DESC, p.order_index ASC)
          FILTER (WHERE p.id IS NOT NULL), '[]') AS photos,
        CURRENT_DATE - CAST(COALESCE(c.acquisition_date, c.created_at::date) AS date) as days_in_stock
      FROM cars c
      LEFT JOIN car_photos p ON p.car_id = c.id
      WHERE c.status = 'available'
      GROUP BY c.id
      ORDER BY days_in_stock DESC NULLS LAST, c.created_at ASC
      LIMIT 6
    `,
    // Valor de mercado e patrimônio
    sql`
      SELECT
        COALESCE(SUM(price), 0)      as market_value,
        COALESCE(SUM(cost_price), 0) as patrimony,
        COUNT(*) FILTER (WHERE cost_price IS NULL OR cost_price = 0) as no_margin,
        COUNT(*) as total
      FROM cars
      WHERE status = 'available'
    `,
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stock = Object.fromEntries(stockRows.map((r: any) => [r.status, parseInt(r.count)]))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads = Object.fromEntries(leadsRows.map((r: any) => [r.status, parseInt(r.count)]))
  const sales = salesRows[0]
  const mkt   = mktValue[0]

  return { stock, leads, sales, oldestCars, mkt }
}

const FUNNEL_STAGES = [
  { key: 'lead_novo',      label: 'Lead novo',      color: '#3B82F6' },
  { key: 'visita_marcada', label: 'Visita marcada', color: '#F59E0B' },
  { key: 'negociando',     label: 'Negociando',     color: '#8B5CF6' },
  { key: 'ligar_de_volta', label: 'Ligar de volta', color: '#E86020' },
]

export default async function AdminDashboard() {
  const { stock, leads, sales, oldestCars, mkt } = await getDashboardData()

  const available  = stock.available || 0
  const reserved   = stock.reserved  || 0
  const totalStock = available + reserved

  const activeLeads = FUNNEL_STAGES.reduce((acc, s) => acc + (leads[s.key] || 0), 0)
  const funnelMax   = Math.max(...FUNNEL_STAGES.map(s => leads[s.key] || 0), 1)

  const withMargin   = totalStock - parseInt(mkt.no_margin ?? '0')
  const noMargin     = parseInt(mkt.no_margin ?? '0')
  const marketValue  = parseFloat(mkt.market_value ?? '0')
  const patrimony    = parseFloat(mkt.patrimony ?? '0')

  const topCards = [
    { label: 'Carros disponíveis', value: available.toString(),     sub: `${totalStock} no total`,      icon: Car,         color: '#10B981', href: '/admin/estoque' },
    { label: 'Valor de mercado',   value: formatCurrency(marketValue), sub: 'se vender tudo na tabela', icon: TrendingUp,  color: '#E86020', href: '/admin/estoque' },
    { label: 'Patrimônio',         value: formatCurrency(patrimony),   sub: `custo de ${totalStock} carro${totalStock !== 1 ? 's' : ''}`, icon: Package, color: '#8B5CF6', href: '/admin/estoque' },
    { label: 'Sem margem',         value: noMargin.toString(),         sub: 'precisam definir',          icon: AlertCircle, color: '#EF4444', href: '/admin/estoque' },
    { label: 'Em negociação',      value: activeLeads.toString(),      sub: 'clientes ativos',           icon: Users,       color: '#F59E0B', href: '/admin/clientes' },
    { label: 'Vendas no mês',      value: sales.count.toString(),      sub: 'registradas nos Relatórios',icon: TrendingUp,  color: '#10B981', href: '/admin/relatorios' },
    { label: 'Investido no mês',   value: formatCurrency(sales.invested), sub: 'custo das vendas',       icon: DollarSign,  color: '#E86020', href: '/admin/relatorios' },
    { label: 'Lucro do mês',       value: formatCurrency(sales.margin),  sub: 'lançado nos Relatórios',  icon: DollarSign,  color: parseFloat(sales.margin) >= 0 ? '#10B981' : '#EF4444', href: '/admin/relatorios' },
  ]

  const composicaoTotal = withMargin + noMargin
  const withMarginPct = composicaoTotal > 0 ? Math.round((withMargin / composicaoTotal) * 100) : 0

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Painel</h1>
        <p className="text-sm text-white/40 mt-1">Visão geral do estoque e das vendas.</p>
      </div>

      {/* 8 stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {topCards.map(card => (
          <Link key={card.label} href={card.href} className="block group">
            <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4 hover:border-white/16 transition-colors h-full">
              <div className="flex items-center justify-between mb-3">
                <div className="p-1.5 rounded-[6px]" style={{ backgroundColor: `${card.color}15` }}>
                  <card.icon size={14} style={{ color: card.color }} />
                </div>
              </div>
              <p className="text-xl font-bold text-white leading-none">{card.value}</p>
              <p className="text-xs text-white/50 mt-1">{card.label}</p>
              <p className="text-xs text-white/25 mt-0.5">{card.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Funil + Composição */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Funil de clientes */}
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Funil de clientes</h2>
            <Link href="/admin/clientes" className="text-xs text-[#E86020] hover:text-[#d4551a]">Ver Kanban</Link>
          </div>
          {activeLeads === 0 ? (
            <p className="text-sm text-white/30 text-center py-4">Sem dados ainda.</p>
          ) : (
            <div className="space-y-3">
              {FUNNEL_STAGES.map(stage => {
                const count = leads[stage.key] || 0
                const barPct = count > 0 ? (count / funnelMax) * 100 : 0
                return (
                  <div key={stage.key}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-white/60">{stage.label}</span>
                      <span className="text-xs font-semibold text-white">{count}</span>
                    </div>
                    <div className="w-full bg-white/6 rounded-full h-1.5">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${barPct}%`, backgroundColor: stage.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Composição do estoque */}
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Composição do estoque</h2>
            <Link href="/admin/estoque" className="text-xs text-[#E86020] hover:text-[#d4551a]">Ver tudo</Link>
          </div>
          <div className="flex items-center gap-6">
            {/* Simple donut */}
            <div className="relative flex-shrink-0">
              <svg width="80" height="80" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#1F2937" strokeWidth="12" />
                {withMargin > 0 && (
                  <circle
                    cx="40" cy="40" r="30"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="12"
                    strokeDasharray={`${withMarginPct * 1.885} 188.5`}
                    strokeLinecap="round"
                    transform="rotate(-90 40 40)"
                  />
                )}
                {noMargin > 0 && (
                  <circle
                    cx="40" cy="40" r="30"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="12"
                    strokeDasharray={`${(100 - withMarginPct) * 1.885} 188.5`}
                    strokeLinecap="round"
                    transform={`rotate(${-90 + withMarginPct * 3.6} 40 40)`}
                  />
                )}
              </svg>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] flex-shrink-0" />
                <span className="text-xs text-white/60">Com margem</span>
                <span className="text-xs font-semibold text-white ml-auto">{withMargin}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] flex-shrink-0" />
                <span className="text-xs text-white/60">Sem margem</span>
                <span className="text-xs font-semibold text-white ml-auto">{noMargin}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-white/20 flex-shrink-0" />
                <span className="text-xs text-white/60">Em preparação</span>
                <span className="text-xs font-semibold text-white ml-auto">{reserved}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Carros parados há mais tempo */}
      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Carros parados há mais tempo</h2>
          <Link href="/admin/estoque" className="text-xs text-[#E86020] hover:text-[#d4551a]">Ver estoque</Link>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(oldestCars as any[]).length === 0 ? (
          <p className="text-sm text-white/30 text-center py-8">Estoque vazio.</p>
        ) : (
          <div className="divide-y divide-white/4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {(oldestCars as any[]).map((car: any) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const photos: any[] = Array.isArray(car.photos) ? car.photos : []
              const thumb = photos.find((p: any) => p.is_primary) ?? photos[0]
              const days = car.days_in_stock ?? 0

              return (
                <Link key={car.id} href={`/admin/estoque/${car.id}`} className="flex items-center justify-between px-4 py-3 hover:bg-white/2 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-8 rounded-[6px] overflow-hidden bg-[#0D0D0D] flex-shrink-0">
                      {thumb ? (
                        <Image src={thumb.url} alt="" width={40} height={32} className="object-cover w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">?</div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-white">{car.brand} {car.model}</p>
                      <p className="text-xs text-white/40">{car.year}{car.mileage ? ` · ${formatMileage(car.mileage)}` : ''}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white">{formatCurrency(car.price)}</p>
                    <p className={`text-xs ${days > 90 ? 'text-red-400' : days > 30 ? 'text-[#F59E0B]' : 'text-white/40'}`}>
                      {days} {days === 1 ? 'dia' : 'dias'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

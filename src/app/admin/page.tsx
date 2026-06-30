import { connection } from 'next/server'
import { sql } from '@/lib/db'
import { formatCurrency } from '@/lib/utils'
import { Car, TrendingUp, Users, DollarSign } from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  await connection()
  const [stockData, leadsData, salesData] = await Promise.all([
    sql`SELECT status, COUNT(*) as count FROM cars GROUP BY status`,
    sql`SELECT status, COUNT(*) as count FROM leads GROUP BY status`,
    sql`
      SELECT
        COUNT(*) as total_sales,
        COALESCE(SUM(sale_price), 0) as total_revenue,
        COALESCE(SUM(sale_price - cost_price), 0) as total_margin
      FROM sales
      WHERE EXTRACT(MONTH FROM sale_date) = EXTRACT(MONTH FROM NOW())
        AND EXTRACT(YEAR FROM sale_date) = EXTRACT(YEAR FROM NOW())
    `,
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stock = Object.fromEntries(stockData.map((r: any) => [r.status, parseInt(r.count)]))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const leads = Object.fromEntries(leadsData.map((r: any) => [r.status, parseInt(r.count)]))
  const sales = salesData[0]

  return { stock, leads, sales }
}

async function getRecentLeads() {
  return sql`
    SELECT l.*, row_to_json(c) AS car
    FROM leads l
    LEFT JOIN cars c ON c.id = l.car_id
    WHERE l.status NOT IN ('ganho', 'perdido')
    ORDER BY l.created_at DESC
    LIMIT 5
  `
}

const STATUS_COLORS: Record<string, string> = {
  available: '#10B981',
  reserved: '#F59E0B',
  sold: '#EF4444',
  novo: '#3B82F6',
  contatado: '#F59E0B',
  negociando: '#8B5CF6',
}

export default async function AdminDashboard() {
  const [{ stock, leads, sales }, recentLeads] = await Promise.all([
    getDashboardStats(),
    getRecentLeads(),
  ])

  const totalStock = (stock.available || 0) + (stock.reserved || 0)
  const activeLeads = (leads.novo || 0) + (leads.contatado || 0) + (leads.negociando || 0)

  const stats = [
    {
      label: 'Em estoque',
      value: totalStock.toString(),
      sub: `${stock.available || 0} disponíveis`,
      icon: Car,
      color: '#E86020',
      href: '/admin/estoque',
    },
    {
      label: 'Leads ativos',
      value: activeLeads.toString(),
      sub: `${leads.negociando || 0} negociando`,
      icon: Users,
      color: '#8B5CF6',
      href: '/admin/leads',
    },
    {
      label: 'Vendas (mês)',
      value: sales.total_sales.toString(),
      sub: formatCurrency(sales.total_revenue),
      icon: TrendingUp,
      color: '#10B981',
      href: '/admin/vendas',
    },
    {
      label: 'Margem (mês)',
      value: formatCurrency(sales.total_margin),
      sub: sales.total_sales > 0 ? `${((parseFloat(sales.total_margin) / parseFloat(sales.total_revenue)) * 100).toFixed(1)}% de margem` : 'sem vendas',
      icon: DollarSign,
      color: '#E86020',
      href: '/admin/vendas',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">Visão geral do negócio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <Link key={stat.label} href={stat.href} className="block group">
            <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4 hover:border-white/16 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-[8px]" style={{ backgroundColor: `${stat.color}15` }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-white/50 mt-0.5">{stat.label}</p>
              <p className="text-xs text-white/30 mt-0.5">{stat.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Stock summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Estoque por status</h2>
            <Link href="/admin/estoque" className="text-xs text-[#E86020] hover:text-[#d4551a]">Ver tudo</Link>
          </div>
          <div className="space-y-2">
            {[
              { key: 'available', label: 'Disponível' },
              { key: 'reserved', label: 'Reservado' },
              { key: 'sold', label: 'Vendido' },
            ].map(s => (
              <div key={s.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.key] || '#888' }} />
                  <span className="text-sm text-white/70">{s.label}</span>
                </div>
                <span className="text-sm font-semibold text-white">{stock[s.key] || 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Leads recentes</h2>
            <Link href="/admin/leads" className="text-xs text-[#E86020] hover:text-[#d4551a]">Ver Kanban</Link>
          </div>
          {recentLeads.length === 0 ? (
            <p className="text-sm text-white/30">Nenhum lead ativo</p>
          ) : (
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(recentLeads as any[]).map((lead: { id: string; name: string; status: string; car?: { brand?: string; model?: string } | null }) => (
                <div key={lead.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white">{lead.name}</p>
                    {lead.car && (
                      <p className="text-xs text-white/40">{lead.car.brand} {lead.car.model}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[lead.status] || '#888' }} />
                    <span className="text-xs text-white/50 capitalize">{lead.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

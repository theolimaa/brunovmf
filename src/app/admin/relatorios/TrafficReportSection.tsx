import Link from 'next/link'
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Percent, Megaphone } from 'lucide-react'
import { getTrafficReport } from '@/lib/metaReport'
import { formatCurrency } from '@/lib/utils'
import MetaSyncPanel from './MetaSyncPanel'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

interface Props {
  year: number
  month: number
}

function prevMonth(year: number, month: number) {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}
function nextMonth(year: number, month: number) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

export default async function TrafficReportSection({ year, month }: Props) {
  const weeks = await getTrafficReport(year, month)

  const totals = weeks.reduce(
    (acc, w) => ({
      spend: acc.spend + w.spend,
      leads: acc.leads + w.leads,
      sales: acc.sales + w.sales,
      profit: acc.profit + w.profit,
    }),
    { spend: 0, leads: 0, sales: 0, profit: 0 }
  )
  const roi = totals.spend > 0 ? (totals.profit / totals.spend) * 100 : 0

  const prev = prevMonth(year, month)
  const next = nextMonth(year, month)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Link href={`/admin/relatorios?tab=trafego&year=${prev.year}&month=${prev.month}`} className="p-1.5 rounded-[6px] text-white/40 hover:text-white hover:bg-white/6 transition-colors">
            <ChevronLeft size={16} />
          </Link>
          <span className="text-sm font-medium text-white min-w-[130px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <Link href={`/admin/relatorios?tab=trafego&year=${next.year}&month=${next.month}`} className="p-1.5 rounded-[6px] text-white/40 hover:text-white hover:bg-white/6 transition-colors">
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>

      <MetaSyncPanel year={year} month={month} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Megaphone size={16} className="text-[#1877F2]" />
            <span className="text-xs text-white/50 uppercase tracking-wider">Investido</span>
          </div>
          <p className="text-xl font-bold text-white">{formatCurrency(totals.spend)}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-[#E86020]" />
            <span className="text-xs text-white/50 uppercase tracking-wider">Vendas</span>
          </div>
          <p className="text-xl font-bold text-white">{totals.sales}</p>
          <p className="text-xs text-white/40 mt-1">{totals.leads} leads</p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={16} className="text-[#10B981]" />
            <span className="text-xs text-white/50 uppercase tracking-wider">Lucro</span>
          </div>
          <p className={`text-xl font-bold ${totals.profit >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>{formatCurrency(totals.profit)}</p>
        </div>
        <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Percent size={16} className="text-[#8B5CF6]" />
            <span className="text-xs text-white/50 uppercase tracking-wider">ROI</span>
          </div>
          <p className={`text-xl font-bold ${roi >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>{roi.toFixed(0)}%</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-white/8 rounded-[12px] overflow-hidden">
        <div className="px-4 py-3 border-b border-white/8">
          <h2 className="text-sm font-semibold text-white">Por semana</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/6">
                <th className="text-left text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Período</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Investido</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Leads</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Custo/lead</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Vendas</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Conversão</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">Lucro</th>
                <th className="text-right text-xs text-white/40 font-medium uppercase tracking-wider px-4 py-3">ROI</th>
              </tr>
            </thead>
            <tbody>
              {weeks.map(w => {
                const custoLead = w.leads > 0 ? w.spend / w.leads : null
                const conversao = w.leads > 0 ? (w.sales / w.leads) * 100 : null
                const weekRoi = w.spend > 0 ? (w.profit / w.spend) * 100 : null
                return (
                  <tr key={w.start} className="border-b border-white/4 hover:bg-white/2">
                    <td className="px-4 py-3 text-sm text-white">{w.label}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{formatCurrency(w.spend)}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{w.leads}</td>
                    <td className="px-4 py-3 text-right text-sm text-white/60">{custoLead !== null ? formatCurrency(custoLead) : '—'}</td>
                    <td className="px-4 py-3 text-right text-sm text-white">{w.sales}</td>
                    <td className="px-4 py-3 text-right text-sm text-white/60">{conversao !== null ? `${conversao.toFixed(0)}%` : '—'}</td>
                    <td className={`px-4 py-3 text-right text-sm font-semibold ${w.profit >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>{formatCurrency(w.profit)}</td>
                    <td className="px-4 py-3 text-right text-sm text-white/60">{weekRoi !== null ? `${weekRoi.toFixed(0)}%` : '—'}</td>
                  </tr>
                )
              })}
              <tr className="bg-white/4 font-semibold">
                <td className="px-4 py-3 text-sm text-white">Total do mês</td>
                <td className="px-4 py-3 text-right text-sm text-white">{formatCurrency(totals.spend)}</td>
                <td className="px-4 py-3 text-right text-sm text-white">{totals.leads}</td>
                <td className="px-4 py-3 text-right text-sm text-white/60">—</td>
                <td className="px-4 py-3 text-right text-sm text-white">{totals.sales}</td>
                <td className="px-4 py-3 text-right text-sm text-white/60">—</td>
                <td className={`px-4 py-3 text-right text-sm ${totals.profit >= 0 ? 'text-[#10B981]' : 'text-red-400'}`}>{formatCurrency(totals.profit)}</td>
                <td className="px-4 py-3 text-right text-sm text-white/60">{roi.toFixed(0)}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-white/30 mt-3">
        Leads e vendas contados só quando vêm de um clique com origem de tráfego pago identificada (anúncio com UTM). Vendas manuais sem cliente vinculado a um lead de tráfego pago não entram aqui.
      </p>
    </div>
  )
}

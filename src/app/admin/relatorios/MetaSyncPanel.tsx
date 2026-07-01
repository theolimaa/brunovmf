'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { RefreshCw, Link2 } from 'lucide-react'

interface Props {
  year: number
  month: number
}

export default function MetaSyncPanel({ year, month }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasToken, setHasToken] = useState(false)
  const [adAccountId, setAdAccountId] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetch('/api/meta/settings')
      .then(res => res.json())
      .then(data => {
        setHasToken(data.hasToken)
        setAdAccountId(data.adAccountId ?? '')
      })
      .finally(() => setLoading(false))
  }, [])

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    if (!accessToken || !adAccountId) {
      toast.error('Preencha o token e o ID da conta de anúncios')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/meta/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken, adAccountId }),
      })
      if (!res.ok) throw new Error()
      setHasToken(true)
      setAccessToken('')
      toast.success('Conta da Meta conectada!')
    } catch {
      toast.error('Erro ao conectar conta')
    } finally {
      setSaving(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/meta/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao sincronizar')
      toast.success('Gasto sincronizado com a Meta!')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao sincronizar')
    } finally {
      setSyncing(false)
    }
  }

  if (loading) return null

  if (!hasToken) {
    return (
      <form onSubmit={handleConnect} className="bg-[#1A1A1A] border border-white/8 rounded-[12px] p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={15} className="text-[#E86020]" />
          <h2 className="text-sm font-semibold text-white">Conectar conta de anúncios da Meta</h2>
        </div>
        <p className="text-xs text-white/40 mb-4">
          Cole o token de acesso e o ID da conta de anúncios (sem o prefixo &quot;act_&quot;) pra puxar o gasto automaticamente.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="ID da conta de anúncios"
            value={adAccountId}
            onChange={e => setAdAccountId(e.target.value)}
            className="bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E86020]/60"
          />
          <input
            type="password"
            placeholder="Token de acesso"
            value={accessToken}
            onChange={e => setAccessToken(e.target.value)}
            className="bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E86020]/60"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="bg-[#E86020] hover:bg-[#d4551a] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px] transition-colors disabled:opacity-50"
        >
          {saving ? 'Conectando...' : 'Conectar'}
        </button>
      </form>
    )
  }

  return (
    <div className="flex justify-end mb-4">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 bg-[#1877F2] hover:bg-[#1461cc] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px] transition-colors disabled:opacity-50"
      >
        <RefreshCw size={14} className={syncing ? 'animate-spin' : ''} />
        {syncing ? 'Sincronizando...' : 'Sincronizar Meta'}
      </button>
    </div>
  )
}

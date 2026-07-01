'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import toast from 'react-hot-toast'

type ImportResult = { file: string; car: string | null; status: string }

export default function ImportPhotosButton() {
  const [loading, setLoading] = useState(false)

  async function handleImport() {
    if (!confirm('Importar fotos da pasta /public para os carros do estoque?')) return
    setLoading(true)
    try {
      const res = await fetch('/api/import-photos', { method: 'POST' })
      const data: { results: ImportResult[] } = await res.json()

      const imported = data.results.filter(r => r.status === 'imported').length
      const noMatch = data.results.filter(r => r.status === 'no_match').length
      const errors = data.results.filter(r => r.status === 'error').length

      if (imported > 0) toast.success(`${imported} foto(s) importada(s) com sucesso!`)
      if (noMatch > 0) toast(`${noMatch} foto(s) sem correspondência no estoque`, { icon: '⚠️' })
      if (errors > 0) toast.error(`${errors} erro(s) no upload`)
      if (imported > 0) setTimeout(() => window.location.reload(), 1200)
    } catch {
      toast.error('Erro ao importar fotos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleImport}
      disabled={loading}
      className="flex items-center gap-2 bg-white/8 hover:bg-white/12 text-white/70 hover:text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px] transition-colors disabled:opacity-50"
    >
      <Upload size={14} />
      {loading ? 'Importando...' : 'Importar fotos'}
    </button>
  )
}

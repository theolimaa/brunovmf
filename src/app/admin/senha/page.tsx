'use client'

import { useState } from 'react'
import { KeyRound, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SenhaPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Erro ao alterar senha')
        return
      }

      toast.success('Senha alterada com sucesso!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-md">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-[10px] bg-[#E86020]/10 flex items-center justify-center">
          <KeyRound size={18} className="text-[#E86020]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Alterar Senha</h1>
          <p className="text-xs text-white/40 mt-0.5">Acesso ao painel admin</p>
        </div>
      </div>

      <div className="bg-[#1A1A1A] border border-white/8 rounded-[16px] p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Senha Atual</label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#0D0D0D] border border-white/12 rounded-[8px] px-3 pr-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#E86020]/60 focus:ring-1 focus:ring-[#E86020]/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Nova Senha</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
                className="w-full bg-[#0D0D0D] border border-white/12 rounded-[8px] px-3 pr-10 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#E86020]/60 focus:ring-1 focus:ring-[#E86020]/20 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowNew(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Confirmar Nova Senha</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-[#0D0D0D] border border-white/12 rounded-[8px] px-3 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#E86020]/60 focus:ring-1 focus:ring-[#E86020]/20 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="w-full bg-[#E86020] hover:bg-[#d4551a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-[0.1em] py-3 rounded-[8px] transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Salvar nova senha
          </button>
        </form>
      </div>
    </div>
  )
}

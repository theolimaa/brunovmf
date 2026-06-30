'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (!res.ok) {
        toast.error('Senha incorreta')
        return
      }

      router.push('/admin')
    } catch {
      toast.error('Erro ao conectar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0D0D0D]">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="VMF Auto Store" width={140} height={46} className="object-contain mx-auto" />
          <p className="text-xs text-white/40 mt-3 uppercase tracking-widest">Painel Admin</p>
        </div>

        <div className="bg-[#1A1A1A] border border-white/8 rounded-[16px] p-6">
          <h1 className="text-lg font-bold text-white mb-6 text-center">Acesso restrito</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">Senha</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoFocus
                  className="w-full bg-[#0D0D0D] border border-white/12 rounded-[8px] pl-9 pr-3 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-[#E86020]/60 focus:ring-1 focus:ring-[#E86020]/20 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full bg-[#E86020] hover:bg-[#d4551a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-[0.1em] py-3 rounded-[8px] transition-colors flex items-center justify-center gap-2"
            >
              {loading && (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              Entrar
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-white/20 mt-6">
          <a href="/" className="hover:text-white/40 transition-colors">Voltar ao site público</a>
        </p>
      </div>
    </div>
  )
}

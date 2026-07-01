'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { getStoredUtm } from '@/lib/utils'
import { WHATSAPP_NUMBER } from '@/lib/whatsappConfig'

interface WhatsAppCtaButtonProps {
  carId: string
  brand: string
  model: string
  year: number
}

export default function WhatsAppCtaButton({ carId, brand, model, year }: WhatsAppCtaButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmedName = name.trim()
    const trimmedPhone = phone.trim()
    if (!trimmedName || !trimmedPhone || sending) return
    setSending(true)

    const urlParams = new URLSearchParams(window.location.search)
    const stored = getStoredUtm()

    const payload = {
      car_id: carId,
      name: trimmedName,
      phone: trimmedPhone,
      utm_source: urlParams.get('utm_source') ?? stored.utm_source ?? null,
      utm_medium: urlParams.get('utm_medium') ?? stored.utm_medium ?? null,
      utm_campaign: urlParams.get('utm_campaign') ?? stored.utm_campaign ?? null,
    }

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    navigator.sendBeacon('/api/leads/track', blob)

    const message = `Olá Bruno! Me chamo ${trimmedName}, vi o ${brand} ${model} ${year} no seu site e tenho interesse. Podemos conversar?`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setOpen(false)
    setSending(false)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-3 bg-[#E86020] hover:bg-[#d4551a] text-white font-semibold text-sm uppercase tracking-wider py-4 px-6 rounded-[10px] transition-colors shadow-[0_2px_24px_rgba(232,96,32,0.25)]"
      >
        <MessageCircle size={18} />
        Tenho interesse — falar com Bruno
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-[#1A1A1A] border border-white/10 rounded-[16px] w-full max-w-sm p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-semibold text-white">Quase lá!</h3>
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-white/40 mb-4">
              Deixa seu nome e WhatsApp que já te direcionamos pro Bruno com a mensagem certa sobre esse carro.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Seu primeiro nome"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                autoFocus
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E86020]/60"
              />
              <input
                type="tel"
                placeholder="Seu WhatsApp"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E86020]/60"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-[#E86020] hover:bg-[#d4551a] text-white font-semibold text-sm uppercase tracking-wider py-3 rounded-[10px] transition-colors disabled:opacity-50"
              >
                <MessageCircle size={16} />
                Falar com Bruno
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

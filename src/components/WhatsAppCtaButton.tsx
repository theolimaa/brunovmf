'use client'

import { MessageCircle } from 'lucide-react'
import { getStoredUtm } from '@/lib/utils'

interface WhatsAppCtaButtonProps {
  carId: string
  whatsAppUrl: string
}

export default function WhatsAppCtaButton({ carId, whatsAppUrl }: WhatsAppCtaButtonProps) {
  function handleClick() {
    const sessionKey = `wa_tracked_${carId}`
    if (sessionStorage.getItem(sessionKey)) return
    sessionStorage.setItem(sessionKey, '1')

    const urlParams = new URLSearchParams(window.location.search)
    const stored = getStoredUtm()

    const payload = {
      car_id: carId,
      utm_source: urlParams.get('utm_source') ?? stored.utm_source ?? null,
      utm_medium: urlParams.get('utm_medium') ?? stored.utm_medium ?? null,
      utm_campaign: urlParams.get('utm_campaign') ?? stored.utm_campaign ?? null,
    }

    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    navigator.sendBeacon('/api/leads/track', blob)
  }

  return (
    <a
      href={whatsAppUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="w-full flex items-center justify-center gap-3 bg-[#E86020] hover:bg-[#d4551a] text-white font-semibold text-sm uppercase tracking-wider py-4 px-6 rounded-[10px] transition-colors shadow-[0_2px_24px_rgba(232,96,32,0.25)]"
    >
      <MessageCircle size={18} />
      Tenho interesse — falar com Bruno
    </a>
  )
}

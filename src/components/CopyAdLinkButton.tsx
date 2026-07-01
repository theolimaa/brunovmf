'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import { Link2, Check } from 'lucide-react'
import { slugify } from '@/lib/utils'

interface CopyAdLinkButtonProps {
  carId: string
  brand: string
  model: string
  variant?: 'inline' | 'block'
}

/**
 * Gera o link padronizado da página do carro, já com os parâmetros de rastreio
 * (utm_source/utm_medium/utm_campaign) que o sistema usa pra identificar lead de
 * tráfego pago. É esse link que o Bruno cola como destino do anúncio na Meta.
 */
export default function CopyAdLinkButton({ carId, brand, model, variant = 'inline' }: CopyAdLinkButtonProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    const campaign = slugify(`${brand} ${model}`)
    const url = `${window.location.origin}/carros/${carId}?utm_source=facebook&utm_medium=trafego-pago&utm_campaign=${campaign}`

    navigator.clipboard.writeText(url)
    toast.success('Link copiado! Cola no campo de destino do anúncio.')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (variant === 'block') {
    return (
      <button
        onClick={handleCopy}
        className="flex items-center justify-center gap-2 w-full bg-[#1A1A1A] border border-white/10 hover:border-white/20 text-white text-sm py-2.5 rounded-[10px] transition-colors"
      >
        {copied ? <Check size={14} className="text-[#10B981]" /> : <Link2 size={14} />}
        {copied ? 'Link copiado!' : 'Copiar link do anúncio'}
      </button>
    )
  }

  return (
    <button
      onClick={handleCopy}
      className="text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1"
    >
      {copied ? <Check size={12} className="text-[#10B981]" /> : <Link2 size={12} />}
      {copied ? 'Copiado' : 'Link anúncio'}
    </button>
  )
}

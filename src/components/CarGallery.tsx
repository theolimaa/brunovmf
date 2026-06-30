'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CarPhoto } from '@/types'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface CarGalleryProps {
  photos: CarPhoto[]
  brand: string
  model: string
}

export default function CarGallery({ photos, brand, model }: CarGalleryProps) {
  const sorted = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.order_index - b.order_index
  })

  const [current, setCurrent] = useState(0)
  const [lightbox, setLightbox] = useState<number | null>(null)

  const prev = () => setCurrent(i => (i > 0 ? i - 1 : sorted.length - 1))
  const next = () => setCurrent(i => (i < sorted.length - 1 ? i + 1 : 0))

  if (sorted.length === 0) {
    return (
      <div className="aspect-[16/9] bg-[#1A1A1A] rounded-[12px] flex items-center justify-center text-white/20">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
          <rect x="1" y="3" width="22" height="16" rx="2" />
          <circle cx="8.5" cy="17.5" r="2.5" />
          <circle cx="15.5" cy="17.5" r="2.5" />
        </svg>
      </div>
    )
  }

  return (
    <>
      {/* Main photo */}
      <div className="relative aspect-[16/9] rounded-[12px] overflow-hidden bg-[#111] cursor-zoom-in" onClick={() => setLightbox(current)}>
        <Image
          src={sorted[current].url}
          alt={`${brand} ${model}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 60vw"
          priority
        />
        {sorted.length > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev() }} className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={e => { e.stopPropagation(); next() }} className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/60 text-white/80 text-xs px-2 py-1 rounded-full">
              {current + 1} / {sorted.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {sorted.map((photo, i) => (
            <button
              key={photo.id}
              onClick={() => setCurrent(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-[6px] overflow-hidden border-2 transition-all ${
                i === current ? 'border-[#E86020]' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <Image src={photo.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white/70 hover:text-white" onClick={() => setLightbox(null)}>
            <X size={28} />
          </button>
          <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white" onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i > 0 ? i - 1 : sorted.length - 1) : 0) }}>
            <ChevronLeft size={36} />
          </button>
          <div className="relative w-[90vw] h-[80vh]" onClick={e => e.stopPropagation()}>
            <Image
              src={sorted[lightbox].url}
              alt={`${brand} ${model}`}
              fill
              className="object-contain"
              sizes="90vw"
            />
          </div>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white" onClick={e => { e.stopPropagation(); setLightbox(i => i !== null ? (i < sorted.length - 1 ? i + 1 : 0) : 0) }}>
            <ChevronRight size={36} />
          </button>
        </div>
      )}
    </>
  )
}

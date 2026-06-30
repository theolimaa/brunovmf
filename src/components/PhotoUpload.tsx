'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { Trash2, ImagePlus, Star } from 'lucide-react'
import { CarPhoto } from '@/types'
import Button from './ui/Button'
import toast from 'react-hot-toast'

interface PhotoUploadProps {
  carId: string
  photos: CarPhoto[]
  onUpdate: () => void
}

export default function PhotoUpload({ carId, photos, onUpdate }: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    const formData = new FormData()
    formData.append('car_id', carId)
    formData.append('is_primary', photos.length === 0 ? 'true' : 'false')
    files.forEach(f => formData.append('files', f))

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!res.ok) throw new Error()
      toast.success('Fotos enviadas!')
      onUpdate()
    } catch {
      toast.error('Erro ao enviar fotos')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function handleDelete(photoId: string) {
    if (!confirm('Remover esta foto?')) return
    try {
      await fetch(`/api/upload?photo_id=${photoId}`, { method: 'DELETE' })
      toast.success('Foto removida')
      onUpdate()
    } catch {
      toast.error('Erro ao remover foto')
    }
  }

  async function setAsPrimary(photoId: string) {
    try {
      await fetch('/api/upload', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photo_id: photoId, car_id: carId }),
      })
      onUpdate()
    } catch {
      toast.error('Erro ao atualizar capa')
    }
  }

  const sorted = [...photos].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return a.order_index - b.order_index
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-white/70 uppercase tracking-wide">Fotos ({photos.length})</p>
        <Button
          size="sm"
          onClick={() => inputRef.current?.click()}
          loading={uploading}
        >
          <ImagePlus size={14} className="mr-1.5" />
          Adicionar
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      {sorted.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {sorted.map(photo => (
            <div key={photo.id} className="relative group aspect-[4/3] rounded-[8px] overflow-hidden bg-[#0D0D0D]">
              <Image src={photo.url} alt="" fill className="object-cover" sizes="160px" />
              {photo.is_primary && (
                <div className="absolute top-1 left-1 bg-[#E86020] rounded-full p-0.5">
                  <Star size={10} fill="white" className="text-white" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!photo.is_primary && (
                  <button
                    onClick={() => setAsPrimary(photo.id)}
                    title="Definir como capa"
                    className="bg-white/20 hover:bg-[#E86020] rounded-full p-1.5 transition-colors"
                  >
                    <Star size={14} />
                  </button>
                )}
                <button
                  onClick={() => handleDelete(photo.id)}
                  className="bg-white/20 hover:bg-red-600 rounded-full p-1.5 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-white/12 rounded-[12px] p-8 text-center cursor-pointer hover:border-[#E86020]/40 transition-colors"
        >
          <ImagePlus size={32} className="mx-auto mb-2 text-white/30" />
          <p className="text-sm text-white/40">Clique para adicionar fotos</p>
        </div>
      )}
    </div>
  )
}

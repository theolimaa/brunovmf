'use client'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

const LINKS = [
  { label: 'Página Inicial', href: '/' },
  { label: 'Nossos Carros', href: '/carros' },
  { label: 'Diferenciais', href: '/#diferenciais' },
  { label: 'Quem é o Bruno', href: '/#sobre' },
  { label: 'Contato', href: '/#contato' },
]

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(v => !v)}
        className="md:hidden p-2 -mr-1 text-white/80 hover:text-white transition-colors"
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {open && (
        <div
          className="md:hidden fixed inset-0 top-16 z-40 bg-[#0D0D0D]"
          onClick={() => setOpen(false)}
        >
          <nav className="px-4 py-2">
            {LINKS.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="flex justify-center py-4 text-[15px] font-semibold text-white/70 hover:text-white border-b border-white/10 transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#0D0D0D]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <Image src="/logo.png" alt="Bruno Freitas" width={110} height={36} className="object-contain" />
          </Link>
          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/brunocfreitas_"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
              title="@brunocfreitas_"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </a>
            <a
              href="https://wa.me/5585989000364?text=Olá Bruno! Gostaria de saber mais sobre os veículos."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#E86020] hover:bg-[#d4551a] text-white text-xs font-semibold uppercase tracking-wider px-3 py-2 rounded-[8px] transition-colors"
            >
              <MessageCircle size={14} />
              Falar com Bruno
            </a>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-white/8 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Image src="/logo.png" alt="Bruno Freitas" width={90} height={30} className="object-contain opacity-60" />
          </div>
          <p className="text-xs text-white/30 text-center">
            Mercado tem carro. Aqui tem padrão.
          </p>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <a href="https://instagram.com/brunocfreitas_" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              @brunocfreitas_
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

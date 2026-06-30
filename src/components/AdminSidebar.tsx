'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Car, Users, CalendarDays, Target, BarChart2, LogOut, ExternalLink, KeyRound } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const NAV = [
  { href: '/admin',            icon: LayoutDashboard, label: 'Painel',     exact: true },
  { href: '/admin/estoque',    icon: Car,             label: 'Estoque' },
  { href: '/admin/clientes',   icon: Users,           label: 'Clientes' },
  { href: '/admin/agenda',     icon: CalendarDays,    label: 'Agenda' },
  { href: '/admin/metas',      icon: Target,          label: 'Metas' },
  { href: '/admin/relatorios', icon: BarChart2,       label: 'Relatórios' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Saiu com sucesso')
    router.push('/login')
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col bg-[#111] border-r border-white/8 h-screen sticky top-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/8">
        <Image src="/logo.png" alt="VMF Auto Store" width={120} height={40} className="object-contain" />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {NAV.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm font-medium transition-colors',
              isActive(item.href, item.exact)
                ? 'bg-[#E86020] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/6'
            )}
          >
            <item.icon size={16} />
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/8 space-y-1">
        <Link
          href="/admin/senha"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm transition-colors',
            isActive('/admin/senha')
              ? 'bg-[#E86020] text-white'
              : 'text-white/50 hover:text-white hover:bg-white/6'
          )}
        >
          <KeyRound size={16} />
          Alterar Senha
        </Link>
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm text-white/50 hover:text-white hover:bg-white/6 transition-colors"
        >
          <ExternalLink size={16} />
          Ver site
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-sm text-white/50 hover:text-red-400 hover:bg-red-400/6 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}

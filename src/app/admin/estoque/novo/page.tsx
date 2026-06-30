import CarForm from '@/components/CarForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NovoCarro() {
  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/estoque" className="flex items-center gap-1.5 text-sm text-white/50 hover:text-white transition-colors mb-3">
          <ChevronLeft size={14} />
          Voltar ao estoque
        </Link>
        <h1 className="text-2xl font-bold text-white">Novo carro</h1>
        <p className="text-sm text-white/40 mt-1">Preencha os dados do veículo</p>
      </div>

      <div className="max-w-2xl">
        <CarForm />
      </div>
    </div>
  )
}

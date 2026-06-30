import { connection } from 'next/server'
import { query, sql } from '@/lib/db'
import { Car } from '@/types'
import CarCard from '@/components/CarCard'
import Link from 'next/link'
import { Star, Eye, Shield, MapPin, Phone, ChevronRight } from 'lucide-react'

const WA_URL = 'https://wa.me/5585989000364?text=Olá Bruno! Gostaria de saber mais sobre os veículos.'

async function getFeaturedCars(): Promise<Car[]> {
  await connection()
  return query<Car>(
    `SELECT c.*,
      COALESCE(
        json_agg(p ORDER BY p.is_primary DESC, p.order_index ASC) FILTER (WHERE p.id IS NOT NULL),
        '[]'
      ) AS photos
     FROM cars c
     LEFT JOIN car_photos p ON p.car_id = c.id
     WHERE c.status != 'sold'
     GROUP BY c.id
     ORDER BY c.created_at DESC
     LIMIT 8`,
    []
  )
}

async function getTotalCount(): Promise<number> {
  await connection()
  const rows = await sql`SELECT COUNT(*)::int AS count FROM cars WHERE status != 'sold'`
  return (rows[0] as { count: number }).count
}

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default async function HomePage() {
  const [cars, total] = await Promise.all([getFeaturedCars(), getTotalCount()])

  return (
    <>
      {/* ── HERO ── */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 bg-[#0D0D0D]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_60%_-10%,rgba(232,96,32,0.12),transparent)]" />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-transparent" />
          <div className="absolute top-1/3 right-8 w-[500px] h-[500px] bg-[#E86020]/4 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 w-full pb-24 pt-40">
          <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-[#E86020]" />
            VMF Auto Store · Seminovos Premium
          </p>
          <h1 className="font-[family-name:var(--font-montserrat)] text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.92] tracking-tight mb-6">
            Seu próximo carro,<br />
            com a <span className="text-[#E86020]">procedência</span><br />
            que você merece.
          </h1>
          <p className="text-white/50 text-base max-w-lg mb-10 leading-relaxed">
            Seminovos selecionados com critério. Avaliação justa do seu usado e financiamento nos principais bancos. Tudo num só lugar, do jeito certo.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/carros"
              className="bg-[#E86020] hover:bg-[#d4551a] text-white font-semibold text-sm uppercase tracking-wider px-7 py-4 rounded-[10px] transition-colors shadow-[0_2px_32px_rgba(232,96,32,0.3)]"
            >
              Ver veículos
            </Link>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1fb85a] text-white font-semibold text-sm px-7 py-4 rounded-[10px] transition-colors"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>

        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-6 text-white/10 text-[10px] font-semibold uppercase tracking-[0.4em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          Role para descobrir
        </div>
      </section>

      {/* ── FEATURED CARS ── */}
      <section className="py-20 bg-[#F6F5F3]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                <span className="w-6 h-px bg-[#E86020]" />
                Estoque Atual
              </p>
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-black text-[#111]">
                Destaques do estoque
              </h2>
            </div>
            {total > 8 && (
              <Link
                href="/carros"
                className="hidden sm:flex items-center gap-1 text-sm font-semibold text-[#E86020] hover:gap-2 transition-all"
              >
                Ver todos <ChevronRight size={16} />
              </Link>
            )}
          </div>

          {cars.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {cars.map(car => <CarCard key={car.id} car={car} />)}
              </div>
              <div className="text-center mt-12">
                <Link
                  href="/carros"
                  className="inline-block bg-[#E86020] hover:bg-[#d4551a] text-white font-semibold text-sm uppercase tracking-wider px-8 py-4 rounded-[10px] transition-colors"
                >
                  Ver todos os carros ({total} {total === 1 ? 'veículo' : 'veículos'})
                </Link>
              </div>
            </>
          ) : (
            <p className="text-[#111]/40 text-sm text-center py-16">Nenhum veículo disponível no momento. Volte em breve!</p>
          )}
        </div>
      </section>

      {/* ── DIFFERENTIALS ── */}
      <section id="diferenciais" className="py-20 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-[#E86020]" />
            Por que a VMF
          </p>
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-black text-white max-w-lg mb-3">
            Comprar carro não precisa ser uma aposta.
          </h2>
          <p className="text-white/50 max-w-md mb-14 text-sm leading-relaxed">
            A gente vende carro do jeito que gostaria de comprar: transparente, sem letra miúda e olhando no olho.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                Icon: Star,
                title: 'Curadoria de verdade',
                desc: 'Não enchemos o pátio por encher. Selecionamos carros que nós mesmos compraríamos.',
              },
              {
                Icon: Eye,
                title: 'Transparência total',
                desc: 'Você sabe exatamente o que está levando. Histórico, estado e documentação na mesa.',
              },
              {
                Icon: Shield,
                title: 'Pós-venda que existe',
                desc: 'Nosso relacionamento não acaba na entrega da chave. A gente continua por perto.',
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-[#1A1A1A] border border-white/8 rounded-[16px] p-6 hover:border-[#E86020]/30 transition-colors">
                <div className="w-10 h-10 rounded-[10px] bg-[#E86020]/10 flex items-center justify-center mb-5">
                  <Icon size={18} className="text-[#E86020]" />
                </div>
                <h3 className="font-semibold text-white text-base mb-2">{title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contato" className="py-20 bg-[#111]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="max-w-xl">
            <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
              <span className="w-6 h-px bg-[#E86020]" />
              Vamos conversar
            </p>
            <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-black text-white mb-4">
              Vamos achar o <span className="text-[#E86020]">seu carro?</span>
            </h2>
            <p className="text-white/50 text-sm mb-8 leading-relaxed">
              Chama no WhatsApp e fala com o Bruno. A gente mostra o estoque atualizado, avalia seu usado e tira todas as suas dúvidas na hora.
            </p>

            <div className="flex flex-wrap gap-3 mb-10">
              <a
                href={WA_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1fb85a] text-white font-semibold px-5 py-3 rounded-[10px] transition-colors text-sm"
              >
                <WhatsAppIcon />
                Falar no WhatsApp
              </a>
              <a
                href="https://instagram.com/brunocfreitas_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 border border-white/20 hover:border-white/50 text-white font-semibold px-5 py-3 rounded-[10px] transition-colors text-sm"
              >
                <InstagramIcon />
                Instagram
              </a>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <MapPin size={15} className="text-[#E86020] shrink-0" />
                Fortaleza, CE
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Phone size={15} className="text-[#E86020] shrink-0" />
                (85) 9 8900-0364
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

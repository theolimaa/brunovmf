import { connection } from 'next/server'
import { query, sql } from '@/lib/db'
import { Car } from '@/types'
import CarCard from '@/components/CarCard'
import Link from 'next/link'
import { Wrench, Shield, Globe, MapPin, Phone, ChevronRight, Clock } from 'lucide-react'

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
    <div className="bg-[#F5F4F2]">
      {/* ── HERO ── */}
      <section className="relative min-h-[100svh] flex flex-col justify-end overflow-hidden bg-[#0D0D0D]">
        {/* Fachada VMF como background */}
        <div className="absolute inset-0">
          <img
            src="/fachada-vmf.webp"
            alt="VMF Auto Store"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/60 to-[#0D0D0D]/20" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 w-full pb-16 sm:pb-24 pt-20 sm:pt-40">
          <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-[#E86020]" />
            VMF Auto Store · Seminovos Premium · Fortaleza, CE
          </p>
          <h1 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-6xl lg:text-7xl font-black text-white leading-[0.92] tracking-tight mb-6 max-w-3xl">
            Seu próximo carro,<br />
            com a <span className="text-[#E86020]">procedência</span><br />
            que você merece.
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-lg mb-8 sm:mb-10 leading-relaxed">
            A única loja em Fortaleza com Auto Center própria. Laudo cautelar 100% aprovado, avaliação justa do seu usado e financiamento nos principais bancos. Tudo num só lugar, do jeito certo.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
            <Link
              href="/carros"
              className="bg-[#E86020] hover:bg-[#d4551a] text-white font-semibold text-sm uppercase tracking-wider px-7 py-4 rounded-[10px] transition-colors shadow-[0_4px_24px_rgba(232,96,32,0.25)] text-center"
            >
              Ver veículos
            </Link>
            <a
              href={WA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fb85a] text-white font-semibold text-sm px-7 py-4 rounded-[10px] transition-colors"
            >
              <WhatsAppIcon />
              WhatsApp
            </a>
          </div>
        </div>

        <div
          className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 -translate-x-6 text-[#0D0D0D]/20 text-[10px] font-semibold uppercase tracking-[0.4em]"
          style={{ writingMode: 'vertical-rl' }}
        >
          <span className="text-white/30">Role para descobrir</span>
        </div>
      </section>

      {/* ── FEATURED CARS ── */}
      <section className="py-14 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.25em] mb-2 flex items-center gap-2">
                <span className="w-6 h-px bg-[#E86020]" />
                Estoque Atual
              </p>
              <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-black text-[#0D0D0D]">
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
            <p className="text-[#0D0D0D]/30 text-sm text-center py-16">Nenhum veículo disponível no momento. Volte em breve!</p>
          )}
        </div>
      </section>

      {/* ── DIFFERENTIALS ── */}
      <section id="diferenciais" className="py-14 sm:py-20 bg-[#F0EFED]">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
            <span className="w-6 h-px bg-[#E86020]" />
            Por que a VMF
          </p>
          <h2 className="font-[family-name:var(--font-montserrat)] text-3xl sm:text-4xl font-black text-[#0D0D0D] max-w-lg mb-3">
            A loja que transforma a compra do seu carro.
          </h2>
          <p className="text-[#0D0D0D]/50 max-w-md mb-14 text-sm leading-relaxed">
            A VMF não é mais uma loja de carros. É a única em Fortaleza com estrutura completa pra garantir o que vende.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                Icon: Wrench,
                title: 'Auto Center própria',
                desc: 'Somos a única loja em Fortaleza com oficina própria. Isso significa garantia real em todos os itens do carro, sem terceiros no meio.',
              },
              {
                Icon: Shield,
                title: 'Laudo cautelar 100%',
                desc: 'Todo carro do nosso pátio passa por um checklist completo. Laudo cautelar 100% aprovado antes de qualquer venda.',
              },
              {
                Icon: Globe,
                title: 'Enviamos pra qualquer lugar',
                desc: 'Não é de Fortaleza? Sem problema. A VMF envia veículos para qualquer estado do Brasil e até para o exterior.',
              },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="bg-white border border-[#E5E4E2] rounded-[16px] p-6 hover:border-[#E86020]/40 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-[10px] bg-[#E86020]/10 flex items-center justify-center mb-5">
                  <Icon size={18} className="text-[#E86020]" />
                </div>
                <h3 className="font-semibold text-[#0D0D0D] text-base mb-2">{title}</h3>
                <p className="text-sm text-[#0D0D0D]/50 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUEM É O BRUNO ── */}
      <section id="sobre" className="py-14 sm:py-24 bg-[#0D0D0D] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Left: text */}
            <div>
              <p className="text-[#E86020] text-[11px] font-semibold uppercase tracking-[0.25em] mb-6 flex items-center gap-2">
                <span className="w-6 h-px bg-[#E86020]" />
                Quem sou eu
              </p>
              <h2 className="font-[family-name:var(--font-montserrat)] text-4xl sm:text-5xl font-black text-white leading-[0.95] tracking-tight mb-6">
                Bruno<br /><span className="text-[#E86020]">Cavalcante</span>
              </h2>
              <p className="text-white/40 text-sm uppercase tracking-widest mb-8 font-medium">Gerente · VMF Auto Store · Fortaleza</p>

              <div className="space-y-5 text-white/60 text-base leading-relaxed">
                <p>
                  Trabalho com carro todo dia, então sei bem o que pesa na hora de comprar.
                  Por isso aqui ninguém empurra nada: <span className="text-[#E86020] font-semibold">mostro o carro do jeito que ele é</span>, com laudo, checklist e Auto Center pra provar que tô falando a verdade.
                </p>
                <p>
                  Se servir pra você, simbora. Se não servir, sou eu mesmo que vou falar.
                </p>
              </div>

              <div className="flex items-center gap-4 mt-10">
                <a
                  href="https://instagram.com/brunocfreitas_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-[#E86020] transition-colors text-sm font-semibold flex items-center gap-2"
                >
                  <span className="text-[#E86020]">@</span>brunocfreitas_
                </a>
                <span className="w-px h-4 bg-white/10" />
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/40 hover:text-[#E86020] transition-colors text-sm font-semibold"
                >
                  Falar no WhatsApp
                </a>
              </div>
            </div>

            {/* Right: photo */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-[300px] sm:w-[360px]">
                {/* Glow behind photo */}
                <div className="absolute inset-0 rounded-[24px] bg-[#E86020]/20 blur-3xl scale-110 pointer-events-none" />
                <img
                  src="/foto-bruno.jpg"
                  alt="Bruno Cavalcante Freitas"
                  className="relative w-full aspect-[3/4] object-cover object-top rounded-[24px] border border-white/10"
                />
                {/* Badge */}
                <div className="absolute -bottom-4 -left-4 bg-[#E86020] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-[10px] shadow-lg">
                  VMF Auto Store
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section id="contato" className="py-14 sm:py-20 bg-[#0D0D0D]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: info */}
            <div>
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

              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 mb-10">
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fb85a] text-white font-semibold px-5 py-3 rounded-[10px] transition-colors text-sm"
                >
                  <WhatsAppIcon />
                  Falar no WhatsApp
                </a>
                <a
                  href="https://instagram.com/brunocfreitas_"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2.5 border border-white/20 hover:border-white/50 text-white font-semibold px-5 py-3 rounded-[10px] transition-colors text-sm"
                >
                  <InstagramIcon />
                  Instagram
                </a>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-3 text-sm text-white/50">
                  <MapPin size={15} className="text-[#E86020] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Endereço</p>
                    Av. Coronel Miguel Dias, 555 — Lojas 05 e 07<br />
                    Guararapes, Fortaleza – CE
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/50">
                  <Phone size={15} className="text-[#E86020] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Telefone / WhatsApp</p>
                    (85) 9 8900-0364
                  </div>
                </div>
                <div className="flex items-start gap-3 text-sm text-white/50">
                  <Clock size={15} className="text-[#E86020] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white/30 text-[10px] uppercase tracking-wider mb-1">Horário</p>
                    Segunda a Sexta, 9h às 18h<br />
                    Sábado, 9h às 13h
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Google Maps */}
            <div className="rounded-[16px] overflow-hidden h-[360px] lg:h-full min-h-[400px]">
              <iframe
                src="https://maps.google.com/maps?q=Av.+Coronel+Miguel+Dias,+555,+Guararapes,+Fortaleza,+CE&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}

import type { Metadata } from 'next'
import { Inter, Montserrat } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bruno Freitas — VMF Auto Store',
  description: 'Mercado tem carro. Aqui tem padrão. Veículos seminovos selecionados em Fortaleza-CE.',
  keywords: 'carros seminovos, Fortaleza, VMF Auto Store, Bruno Freitas',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${montserrat.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#E86020', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}

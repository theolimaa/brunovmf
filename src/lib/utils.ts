import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: string | number): string {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(num)
}

export function formatMileage(value: number | null | undefined): string {
  if (!value) return '—'
  return new Intl.NumberFormat('pt-BR').format(value) + ' km'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calcMargin(salePrice: string | number, costPrice: string | number) {
  const sale = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice
  const cost = typeof costPrice === 'string' ? parseFloat(costPrice) : costPrice
  const margin = sale - cost
  const marginPct = cost > 0 ? (margin / cost) * 100 : 0
  return { margin, marginPct }
}

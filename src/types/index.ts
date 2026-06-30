export type CarStatus = 'available' | 'reserved' | 'sold'
export type LeadStatus = 'novo' | 'contatado' | 'negociando' | 'ganho' | 'perdido'
export type FuelType = 'Gasolina' | 'Flex' | 'Diesel' | 'Elétrico' | 'Híbrido'
export type TransmissionType = 'Manual' | 'Automático' | 'CVT' | 'Automatizado'

export interface CarPhoto {
  id: string
  car_id: string
  url: string
  is_primary: boolean
  order_index: number
  created_at: string
}

export interface Car {
  id: string
  brand: string
  model: string
  year: number
  price: string
  cost_price?: string | null
  mileage?: number | null
  color?: string | null
  fuel?: FuelType | null
  transmission?: TransmissionType | null
  description?: string | null
  status: CarStatus
  created_at: string
  updated_at: string
  photos?: CarPhoto[]
}

export interface Lead {
  id: string
  car_id?: string | null
  name: string
  phone: string
  message?: string | null
  status: LeadStatus
  notes?: string | null
  created_at: string
  updated_at: string
  car?: Car | null
}

export interface Sale {
  id: string
  car_id?: string | null
  lead_id?: string | null
  sale_price: string
  cost_price: string
  sale_date: string
  notes?: string | null
  created_at: string
  car?: Car | null
  lead?: Lead | null
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  novo: 'Novo Lead',
  contatado: 'Contatado',
  negociando: 'Negociando',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  novo: '#3B82F6',
  contatado: '#F59E0B',
  negociando: '#8B5CF6',
  ganho: '#10B981',
  perdido: '#EF4444',
}

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
  available: 'Disponível',
  reserved: 'Reservado',
  sold: 'Vendido',
}

export const CAR_STATUS_COLORS: Record<CarStatus, string> = {
  available: '#10B981',
  reserved: '#F59E0B',
  sold: '#EF4444',
}

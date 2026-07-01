export type CarStatus = 'available' | 'reserved' | 'sold'
export type LeadStatus = 'lead_novo' | 'visita_marcada' | 'negociando' | 'ligar_de_volta' | 'vendeu' | 'nao_comprou'
export type LeadSource = 'manual' | 'site' | 'trafego_pago'
export type FuelType = 'Gasolina' | 'Flex' | 'Diesel' | 'Elétrico' | 'Híbrido'
export type TransmissionType = 'Manual' | 'Automático' | 'CVT' | 'Automatizado'
export type CarCategory = 'Sedan' | 'SUV' | 'Hatch' | 'Pickup' | 'Minivan' | 'Conversível' | 'Coupé' | 'Utilitário' | 'Van'

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
  discount_max?: string | null
  mileage?: number | null
  color?: string | null
  fuel?: FuelType | null
  transmission?: TransmissionType | null
  category?: CarCategory | null
  doors?: number | null
  is_premium?: boolean
  acquisition_date?: string | null
  optionals?: string[] | null
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
  phone: string | null
  message?: string | null
  status: LeadStatus
  notes?: string | null
  source: LeadSource
  utm_source?: string | null
  utm_medium?: string | null
  utm_campaign?: string | null
  contacted_at?: string | null
  visit_date?: string | null
  visit_time?: string | null
  came_to_store_at?: string | null
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

export interface Goal {
  id: string
  month: number
  year: number
  target: number
  created_at: string
  updated_at: string
}

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  lead_novo:      'Lead novo',
  visita_marcada: 'Visita marcada',
  negociando:     'Negociando',
  ligar_de_volta: 'Ligar de volta',
  vendeu:         'Vendeu',
  nao_comprou:    'Não comprou',
}

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  manual:       'Cadastro manual',
  site:         'Site',
  trafego_pago: 'Tráfego pago',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  lead_novo:      '#3B82F6',
  visita_marcada: '#F59E0B',
  negociando:     '#8B5CF6',
  ligar_de_volta: '#E86020',
  vendeu:         '#10B981',
  nao_comprou:    '#EF4444',
}

export const CAR_STATUS_LABELS: Record<CarStatus, string> = {
  available: 'Disponível',
  reserved:  'Reservado',
  sold:      'Vendido',
}

export const CAR_STATUS_COLORS: Record<CarStatus, string> = {
  available: '#10B981',
  reserved:  '#F59E0B',
  sold:      '#EF4444',
}

export const CAR_CATEGORIES: CarCategory[] = [
  'Sedan', 'SUV', 'Hatch', 'Pickup', 'Minivan', 'Conversível', 'Coupé', 'Utilitário', 'Van',
]

export const CAR_OPTIONALS = [
  'Ar condicionado',
  'Ar digital',
  'Direção elétrica',
  'Direção hidráulica',
  'Vidros elétricos',
  'Travas elétricas',
  'Retrovisores elétricos',
  'Câmera de ré',
  'Sensor de estacionamento',
  'Sensor de chuva',
  'Central multimídia',
  'Bluetooth',
  'GPS / Navegador',
  'Banco de couro',
  'Bancos aquecidos',
  'Teto solar',
  'Teto panorâmico',
  'Rodas de liga leve',
  'Airbag duplo',
  'Airbag lateral',
  'ABS',
  'Controle de tração',
  'Controle de estabilidade',
  'Piloto automático',
  'Freio a disco nas 4 rodas',
  'Volante multifuncional',
  'Keyless Entry / Start',
  'Computador de bordo',
  'Start/Stop automático',
  'Carregador wireless',
  'Apple CarPlay / Android Auto',
  'Kit multimídia original',
  '4x4 / AWD / Tração integral',
  'Blindagem',
  'GNV instalado',
]

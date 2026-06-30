import { cn } from '@/lib/utils'
import { CAR_STATUS_COLORS, CAR_STATUS_LABELS, CarStatus, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, LeadStatus } from '@/types'

interface BadgeProps {
  label: string
  color?: string
  className?: string
}

export function Badge({ label, color, className }: BadgeProps) {
  return (
    <span
      className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', className)}
      style={color ? { backgroundColor: `${color}20`, color } : undefined}
    >
      {label}
    </span>
  )
}

export function CarStatusBadge({ status }: { status: CarStatus }) {
  return (
    <Badge
      label={CAR_STATUS_LABELS[status]}
      color={CAR_STATUS_COLORS[status]}
    />
  )
}

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  return (
    <Badge
      label={LEAD_STATUS_LABELS[status]}
      color={LEAD_STATUS_COLORS[status]}
    />
  )
}

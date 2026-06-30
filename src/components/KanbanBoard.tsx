'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lead, LeadStatus, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { LeadStatusBadge } from './ui/Badge'
import { Phone, Car, MessageSquare, GripVertical, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const COLUMNS: LeadStatus[] = ['novo', 'contatado', 'negociando', 'ganho', 'perdido']

function LeadCardInner({ lead, isDragging }: { lead: Lead; isDragging?: boolean }) {
  return (
    <div className={`bg-[#0D0D0D] border border-white/10 rounded-[10px] p-3 select-none ${isDragging ? 'opacity-50 rotate-2' : 'hover:border-white/20'} transition-all`}>
      <div className="flex items-start gap-2 mb-2">
        <GripVertical size={14} className="text-white/20 mt-0.5 flex-shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-sm text-white truncate">{lead.name}</p>
          <a
            href={`tel:${lead.phone}`}
            className="text-xs text-white/50 hover:text-[#E86020] flex items-center gap-1 mt-0.5"
            onClick={e => e.stopPropagation()}
          >
            <Phone size={10} />
            {lead.phone}
          </a>
        </div>
      </div>

      {lead.car && (
        <div className="flex items-center gap-1.5 text-xs text-white/50 mb-2 bg-white/4 rounded-[6px] px-2 py-1">
          <Car size={11} className="text-[#E86020]" />
          <span className="truncate">{lead.car.brand} {lead.car.model} {lead.car.year}</span>
          <span className="ml-auto text-[#E86020] font-medium whitespace-nowrap">{formatCurrency(lead.car.price)}</span>
        </div>
      )}

      {lead.message && (
        <p className="text-xs text-white/40 flex items-start gap-1.5 line-clamp-2">
          <MessageSquare size={11} className="mt-0.5 flex-shrink-0" />
          {lead.message}
        </p>
      )}

      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/6">
        <span className="text-[10px] text-white/30">
          {new Date(lead.created_at).toLocaleDateString('pt-BR')}
        </span>
        <a
          href={`https://wa.me/55${lead.phone.replace(/\D/g, '')}?text=Olá ${lead.name}!`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={e => e.stopPropagation()}
          className="text-[10px] text-green-400 hover:text-green-300 flex items-center gap-1"
        >
          <ExternalLink size={10} />
          WhatsApp
        </a>
      </div>
    </div>
  )
}

function SortableLeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <LeadCardInner lead={lead} isDragging={isDragging} />
    </div>
  )
}

function KanbanColumn({
  status,
  leads,
}: {
  status: LeadStatus
  leads: Lead[]
}) {
  const color = LEAD_STATUS_COLORS[status]

  return (
    <div className="flex flex-col bg-[#1A1A1A] rounded-[12px] border border-white/8 min-w-[260px] w-[260px] flex-shrink-0">
      <div className="px-3 py-3 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-semibold text-white">{LEAD_STATUS_LABELS[status]}</span>
        </div>
        <span className="text-xs text-white/40 bg-white/8 rounded-full px-2 py-0.5">{leads.length}</span>
      </div>

      <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 min-h-[100px] flex-1">
          {leads.map(lead => (
            <SortableLeadCard key={lead.id} lead={lead} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const leadsByStatus = useCallback(
    (status: LeadStatus) => leads.filter(l => l.status === status),
    [leads]
  )

  const activeLead = leads.find(l => l.id === activeId)

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeLeadId = active.id as string
    const overId = over.id as string

    const targetColumn = COLUMNS.includes(overId as LeadStatus)
      ? (overId as LeadStatus)
      : leads.find(l => l.id === overId)?.status

    if (!targetColumn) return

    const lead = leads.find(l => l.id === activeLeadId)
    if (!lead || lead.status === targetColumn) return

    setLeads(prev => prev.map(l => l.id === activeLeadId ? { ...l, status: targetColumn } : l))

    try {
      await fetch(`/api/leads/${activeLeadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetColumn }),
      })
    } catch {
      setLeads(prev => prev.map(l => l.id === activeLeadId ? { ...l, status: lead.status } : l))
      toast.error('Erro ao atualizar lead')
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over) return

    const activeLeadId = active.id as string
    const overId = over.id as string

    const targetColumn = COLUMNS.includes(overId as LeadStatus)
      ? (overId as LeadStatus)
      : leads.find(l => l.id === overId)?.status

    if (!targetColumn) return

    setLeads(prev => prev.map(l => l.id === activeLeadId ? { ...l, status: targetColumn } : l))
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(status => (
          <KanbanColumn key={status} status={status} leads={leadsByStatus(status)} />
        ))}
      </div>
      <DragOverlay>
        {activeLead && <LeadCardInner lead={activeLead} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}

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
  useDroppable,
} from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Lead, LeadStatus, LEAD_STATUS_COLORS, LEAD_STATUS_LABELS, Car } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Phone, Car as CarIcon, GripVertical, ExternalLink, Plus, X, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const COLUMNS: LeadStatus[] = ['lead_novo', 'visita_marcada', 'negociando', 'ligar_de_volta', 'vendeu', 'nao_comprou']

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const inputClass = 'w-full bg-[#0D0D0D] border border-white/10 rounded-[8px] px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#E86020]/60'
const labelClass = 'block text-xs text-white/50 mb-1'

// ─── Modal de Novo Cliente ───────────────────────────────────────────────────

interface NovoClienteModalProps {
  cars: Car[]
  onClose: () => void
  onSave: (lead: Lead) => void
}

function NovoClienteModal({ cars, onClose, onSave }: NovoClienteModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    status: 'lead_novo' as LeadStatus,
    car_id: '',
    notes: '',
    contacted_at: '',
    visit_date: '',
    visit_time: '',
    came_to_store_at: '',
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          status: form.status,
          car_id: form.car_id || null,
          notes: form.notes || null,
          contacted_at: form.contacted_at || null,
          visit_date: form.visit_date || null,
          visit_time: form.visit_time || null,
          came_to_store_at: form.came_to_store_at || null,
        }),
      })
      if (!res.ok) throw new Error()
      const lead = await res.json()
      const car = cars.find(c => c.id === form.car_id) ?? null
      onSave({ ...lead, car })
      toast.success('Cliente cadastrado!')
      onClose()
    } catch {
      toast.error('Erro ao salvar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-[16px] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Novo cliente</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Nome do cliente *</label>
            <input className={inputClass} placeholder="Nome do cliente" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Telefone *</label>
              <input className={inputClass} placeholder="(85) 99999-0000" value={form.phone} onChange={e => update('phone', e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => update('status', e.target.value as LeadStatus)}>
                {COLUMNS.map(s => (
                  <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Carro de interesse</label>
            <select className={inputClass} value={form.car_id} onChange={e => update('car_id', e.target.value)}>
              <option value="">Selecionar carro...</option>
              {cars.filter(c => c.status !== 'sold').map(c => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.model} {c.year} — {formatCurrency(c.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Observações da negociação</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Observações da negociação..."
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
            />
          </div>

          <div className="border-t border-white/8 pt-4">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Datas (opcional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Conversamos em</label>
                <input type="date" className={inputClass} value={form.contacted_at} onChange={e => update('contacted_at', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Visita agendada para</label>
                <input type="date" className={inputClass} value={form.visit_date} onChange={e => update('visit_date', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Horário da visita</label>
                <input type="time" className={inputClass} value={form.visit_time} onChange={e => update('visit_time', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Veio à loja em</label>
                <input type="date" className={inputClass} value={form.came_to_store_at} onChange={e => update('came_to_store_at', e.target.value)} />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0D0D0D] hover:bg-[#E86020] text-white text-sm font-semibold py-3 rounded-[10px] transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'Salvando...' : 'Salvar cliente'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Modal de Editar Cliente ─────────────────────────────────────────────────

interface EditarClienteModalProps {
  lead: Lead
  cars: Car[]
  onClose: () => void
  onSave: (lead: Lead) => void
  onDelete: (id: string) => void
}

function EditarClienteModal({ lead, cars, onClose, onSave, onDelete }: EditarClienteModalProps) {
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    name: lead.name,
    phone: lead.phone,
    status: lead.status,
    car_id: lead.car?.id ?? '',
    notes: lead.notes ?? '',
    contacted_at: lead.contacted_at ? lead.contacted_at.slice(0, 10) : '',
    visit_date: lead.visit_date ? lead.visit_date.slice(0, 10) : '',
    visit_time: lead.visit_time ? lead.visit_time.slice(0, 5) : '',
    came_to_store_at: lead.came_to_store_at ? lead.came_to_store_at.slice(0, 10) : '',
  })

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.phone) {
      toast.error('Nome e telefone são obrigatórios')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          status: form.status,
          car_id: form.car_id || '',
          notes: form.notes || null,
          contacted_at: form.contacted_at || null,
          visit_date: form.visit_date || null,
          visit_time: form.visit_time || null,
          came_to_store_at: form.came_to_store_at || null,
        }),
      })
      if (!res.ok) throw new Error()
      const updated = await res.json()
      const car = form.car_id ? (cars.find(c => c.id === form.car_id) ?? null) : null
      onSave({ ...updated, car })
      toast.success('Cliente atualizado!')
      onClose()
    } catch {
      toast.error('Erro ao atualizar cliente')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!confirm(`Remover ${lead.name} do Kanban?`)) return
    setDeleting(true)
    try {
      await fetch(`/api/leads/${lead.id}`, { method: 'DELETE' })
      onDelete(lead.id)
      toast.success('Cliente removido')
      onClose()
    } catch {
      toast.error('Erro ao remover cliente')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A1A] border border-white/10 rounded-[16px] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-white/8">
          <h2 className="text-base font-semibold text-white">Editar cliente</h2>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className={labelClass}>Nome do cliente *</label>
            <input className={inputClass} placeholder="Nome do cliente" value={form.name} onChange={e => update('name', e.target.value)} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Telefone *</label>
              <input className={inputClass} placeholder="(85) 99999-0000" value={form.phone} onChange={e => update('phone', e.target.value)} required />
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={e => update('status', e.target.value as LeadStatus)}>
                {COLUMNS.map(s => (
                  <option key={s} value={s}>{LEAD_STATUS_LABELS[s]}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className={labelClass}>Carro de interesse</label>
            <select className={inputClass} value={form.car_id} onChange={e => update('car_id', e.target.value)}>
              <option value="">Sem carro vinculado</option>
              {cars.filter(c => c.status !== 'sold').map(c => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.model} {c.year} — {formatCurrency(c.price)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Observações da negociação</label>
            <textarea
              className={`${inputClass} resize-none`}
              rows={3}
              placeholder="Observações da negociação..."
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
            />
          </div>

          <div className="border-t border-white/8 pt-4">
            <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Datas (opcional)</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Conversamos em</label>
                <input type="date" className={inputClass} value={form.contacted_at} onChange={e => update('contacted_at', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Visita agendada para</label>
                <input type="date" className={inputClass} value={form.visit_date} onChange={e => update('visit_date', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Horário da visita</label>
                <input type="time" className={inputClass} value={form.visit_time} onChange={e => update('visit_time', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Veio à loja em</label>
                <input type="date" className={inputClass} value={form.came_to_store_at} onChange={e => update('came_to_store_at', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-1.5 px-3 py-3 rounded-[10px] text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
            >
              <Trash2 size={15} />
              {deleting ? 'Removendo...' : 'Remover'}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#0D0D0D] hover:bg-[#E86020] text-white text-sm font-semibold py-3 rounded-[10px] transition-colors disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Lead Card ───────────────────────────────────────────────────────────────

interface LeadCardInnerProps {
  lead: Lead
  isDragging?: boolean
  dragListeners?: Record<string, unknown>
  onEdit?: (lead: Lead) => void
}

function LeadCardInner({ lead, isDragging, dragListeners, onEdit }: LeadCardInnerProps) {
  return (
    <div
      className={`bg-[#0D0D0D] border border-white/10 rounded-[10px] p-3 select-none ${isDragging ? 'opacity-50 rotate-2' : 'hover:border-white/20'} transition-all`}
    >
      <div className="flex items-start gap-2 mb-2">
        <div
          {...dragListeners}
          className="cursor-grab active:cursor-grabbing flex-shrink-0 mt-0.5"
        >
          <GripVertical size={14} className="text-white/20" />
        </div>
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
        {onEdit && (
          <button
            onClick={e => { e.stopPropagation(); onEdit(lead) }}
            className="flex-shrink-0 text-white/20 hover:text-white/60 transition-colors"
          >
            <Pencil size={13} />
          </button>
        )}
      </div>

      {lead.car && (
        <div className="flex items-center gap-1.5 text-xs text-white/50 mb-2 bg-white/4 rounded-[6px] px-2 py-1">
          <CarIcon size={11} className="text-[#E86020]" />
          <span className="truncate">{lead.car.brand} {lead.car.model} {lead.car.year}</span>
          <span className="ml-auto text-[#E86020] font-medium whitespace-nowrap">{formatCurrency(lead.car.price)}</span>
        </div>
      )}

      {lead.visit_date && (
        <p className="text-xs text-[#F59E0B] mb-1.5">
          Visita: {new Date(lead.visit_date + 'T12:00').toLocaleDateString('pt-BR')}
          {lead.visit_time && ` às ${lead.visit_time.slice(0, 5)}`}
        </p>
      )}

      {lead.notes && (
        <p className="text-xs text-white/40 line-clamp-2 mb-2">{lead.notes}</p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-white/6">
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

function SortableLeadCard({ lead, onEdit }: { lead: Lead; onEdit: (lead: Lead) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { lead },
  })

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} {...attributes}>
      <LeadCardInner lead={lead} isDragging={isDragging} dragListeners={listeners} onEdit={onEdit} />
    </div>
  )
}

function KanbanColumn({ status, leads, onEdit }: { status: LeadStatus; leads: Lead[]; onEdit: (lead: Lead) => void }) {
  const color = LEAD_STATUS_COLORS[status]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-[#1A1A1A] rounded-[12px] border ${isOver ? 'border-white/25' : 'border-white/8'} min-w-[240px] w-[240px] flex-shrink-0 transition-colors`}
    >
      <div className="px-3 py-3 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xs font-semibold text-white">{LEAD_STATUS_LABELS[status]}</span>
        </div>
        <span className="text-xs text-white/40 bg-white/8 rounded-full px-2 py-0.5">{leads.length}</span>
      </div>
      <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-2 p-2 min-h-[80px] flex-1">
          {leads.map(lead => (
            <SortableLeadCard key={lead.id} lead={lead} onEdit={onEdit} />
          ))}
          {leads.length === 0 && (
            <p className="text-[11px] text-white/20 text-center py-4">arraste aqui</p>
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ─── KanbanBoard ─────────────────────────────────────────────────────────────

interface KanbanBoardProps {
  initialLeads: Lead[]
  cars: Car[]
}

export default function KanbanBoard({ initialLeads, cars }: KanbanBoardProps) {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth())
  const [year, setYear]   = useState(now.getFullYear())
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dragOriginStatus, setDragOriginStatus] = useState<LeadStatus | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const leadsByStatus = useCallback(
    (status: LeadStatus) => leads.filter(l => l.status === status),
    [leads]
  )

  const activeLead = leads.find(l => l.id === activeId)

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  function handleDragStart(event: DragStartEvent) {
    const id = event.active.id as string
    setActiveId(id)
    const lead = leads.find(l => l.id === id)
    setDragOriginStatus(lead?.status ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const originStatus = dragOriginStatus
    setActiveId(null)
    setDragOriginStatus(null)

    if (!over || !originStatus) return

    const activeLeadId = active.id as string
    const overId = over.id as string
    const targetColumn = COLUMNS.includes(overId as LeadStatus)
      ? (overId as LeadStatus)
      : leads.find(l => l.id === overId)?.status

    if (!targetColumn || originStatus === targetColumn) return

    try {
      await fetch(`/api/leads/${activeLeadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: targetColumn }),
      })
    } catch {
      setLeads(prev => prev.map(l => l.id === activeLeadId ? { ...l, status: originStatus } : l))
      toast.error('Erro ao atualizar cliente')
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

  function handleNewLead(lead: Lead) {
    setLeads(prev => [lead, ...prev])
  }

  function handleEditedLead(updated: Lead) {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l))
  }

  function handleDeletedLead(id: string) {
    setLeads(prev => prev.filter(l => l.id !== id))
  }

  return (
    <>
      {showModal && (
        <NovoClienteModal
          cars={cars}
          onClose={() => setShowModal(false)}
          onSave={handleNewLead}
        />
      )}

      {editingLead && (
        <EditarClienteModal
          lead={editingLead}
          cars={cars}
          onClose={() => setEditingLead(null)}
          onSave={handleEditedLead}
          onDelete={handleDeletedLead}
        />
      )}

      {/* Header: month selector + new button */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-1.5 rounded-[6px] text-white/40 hover:text-white hover:bg-white/6 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-white min-w-[130px] text-center">
            {MONTH_NAMES[month]} {year}
          </span>
          <button onClick={nextMonth} className="p-1.5 rounded-[6px] text-white/40 hover:text-white hover:bg-white/6 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#E86020] hover:bg-[#d4551a] text-white text-xs font-semibold uppercase tracking-wider px-4 py-2.5 rounded-[8px] transition-colors"
        >
          <Plus size={14} />
          Cliente
        </button>
      </div>

      <p className="text-xs text-white/40 mb-4">Arraste pelo <span className="text-white/60">⠿</span> para mover de etapa ou clique no <span className="text-white/60">✏</span> para editar.</p>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {COLUMNS.map(status => (
            <KanbanColumn key={status} status={status} leads={leadsByStatus(status)} onEdit={setEditingLead} />
          ))}
        </div>
        <DragOverlay>
          {activeLead && <LeadCardInner lead={activeLead} isDragging />}
        </DragOverlay>
      </DndContext>
    </>
  )
}

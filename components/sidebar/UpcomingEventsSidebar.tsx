import React from 'react'
import SidebarCard from './SidebarCard'

interface EventItem {
  id: string
  titulo: string
  data?: string | null
  local?: string | null
}

export default function UpcomingEventsSidebar({ items = [] }: { items: EventItem[] }) {
  return (
    <SidebarCard title="Próximos Eventos">
      <ul className="space-y-3 text-sm">
        {items.map((ev) => (
          <li key={ev.id} className="flex justify-between">
            <div className="font-medium line-clamp-2 mr-2">{ev.titulo}</div>
            <div className="text-gray-500 text-right">
              {ev.data ? new Date(ev.data).toLocaleDateString('pt-BR') : ''}
              {ev.local ? <div className="text-xs">{ev.local}</div> : null}
            </div>
          </li>
        ))}
      </ul>
    </SidebarCard>
  )
}

import React from 'react'
import SidebarCard from './SidebarCard'

interface Item {
  name: string
  count: number
}

export default function CategoriesSidebar({ items = [], onSelect }: { items: Item[]; onSelect?: (name: string) => void }) {
  return (
    <SidebarCard title="Categorias">
      <ul className="space-y-2">
        {items.map((cat) => (
          <li key={cat.name}>
            <button
              className="w-full flex justify-between items-center py-2 border-b border-gray-100 hover:text-indigo-600 text-left transition"
              onClick={() => onSelect?.(cat.name)}
            >
              <span>{cat.name}</span>
              <span className="bg-gray-200 text-gray-800 px-2 rounded-full text-xs">{cat.count}</span>
            </button>
          </li>
        ))}
      </ul>
    </SidebarCard>
  )
}

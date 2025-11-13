import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SidebarCard from './SidebarCard'

interface Item {
  id: string
  titulo: string
  preco?: number | null
  categoria?: string | null
  imagem?: string | null
}

export default function RecentClassifiedsSidebar({ items = [] }: { items: Item[] }) {
  return (
    <SidebarCard title="Classificados Recentes">
      <ul className="space-y-4">
        {items.map((it) => (
          <li key={it.id}>
            <Link href={`/classificados/${it.id}`} className="flex items-start space-x-3 group">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {it.imagem ? (
                  <Image src={it.imagem} alt={it.titulo} fill className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-600">{it.titulo}</h4>
                <div className="text-xs text-gray-500 mt-1">
                  {it.categoria || ''}
                  {typeof it.preco === 'number' ? ` • R$ ${it.preco.toFixed(2)}` : ''}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SidebarCard>
  )
}

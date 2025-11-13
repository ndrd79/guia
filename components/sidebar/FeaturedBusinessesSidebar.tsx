import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SidebarCard from './SidebarCard'

interface Item {
  id: string
  nome: string
  categoria?: string | null
  logo?: string | null
}

export default function FeaturedBusinessesSidebar({ items = [] }: { items: Item[] }) {
  return (
    <SidebarCard title="Empresas em Destaque">
      <ul className="space-y-4">
        {items.map((biz) => (
          <li key={biz.id}>
            <Link href={`/guia-comercial/${biz.id}`} className="flex items-start space-x-3 group">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {biz.logo ? (
                  <Image src={biz.logo} alt={biz.nome} fill className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-600">{biz.nome}</h4>
                {biz.categoria ? (
                  <div className="text-xs text-gray-500 mt-1">{biz.categoria}</div>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SidebarCard>
  )
}

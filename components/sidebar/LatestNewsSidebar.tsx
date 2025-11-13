import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import SidebarCard from './SidebarCard'

interface Item {
  id: string
  titulo: string
  imagem?: string | null
  created_at?: string | null
}

export default function LatestNewsSidebar({ items = [] }: { items: Item[] }) {
  return (
    <SidebarCard title="Últimas Notícias">
      <ul className="space-y-4">
        {items.map((news) => (
          <li key={news.id}>
            <Link href={`/noticias/${news.id}`} className="flex items-start space-x-3 group">
              <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                {news.imagem ? (
                  <Image src={news.imagem} alt={news.titulo} fill className="object-cover" sizes="64px" />
                ) : null}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm line-clamp-2 group-hover:text-indigo-600">{news.titulo}</h4>
                {news.created_at ? (
                  <div className="text-xs text-gray-500 mt-1">{new Date(news.created_at).toLocaleDateString('pt-BR')}</div>
                ) : null}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </SidebarCard>
  )
}

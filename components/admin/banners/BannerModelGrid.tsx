import React, { useMemo, useState } from 'react'
import BannerModelCard from './BannerModelCard'

export interface BannerModelOption {
  nome: string
  descricao?: string
  larguraRecomendada?: number
  alturaRecomendada?: number
  paginas?: string[]
}

interface BannerModelGridProps {
  options: BannerModelOption[]
  value?: string
  onSelect: (nome: string) => void
}

const deriveCategory = (nome: string) => {
  const n = nome.toLowerCase()
  if (n.includes('header')) return 'Header'
  if (n.includes('hero')) return 'Hero'
  if (n.includes('sidebar')) return 'Sidebar'
  if (n.includes('footer')) return 'Footer'
  if (n.includes('conteúdo') || n.includes('conteudo')) return 'Conteúdo'
  if (n.includes('popup')) return 'Popup'
  return 'Outros'
}

export default function BannerModelGrid({ options, value, onSelect }: BannerModelGridProps) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Todos')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return options.filter(o => (
      (!q || o.nome.toLowerCase().includes(q)) &&
      (category === 'Todos' || deriveCategory(o.nome) === category)
    ))
  }, [options, search, category])

  const categories = ['Todos', ...Array.from(new Set(options.map(o => deriveCategory(o.nome))))]

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar modelo"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md">
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(opt => (
          <BannerModelCard
            key={opt.nome}
            nome={opt.nome}
            largura={opt.larguraRecomendada}
            altura={opt.alturaRecomendada}
            selected={value === opt.nome}
            onSelect={() => onSelect(opt.nome)}
          />
        ))}
      </div>
    </div>
  )
}
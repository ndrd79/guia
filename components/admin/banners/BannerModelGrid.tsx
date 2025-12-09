import React, { useMemo, useState } from 'react'
import BannerModelCard from './BannerModelCard'
import { BannerModelOption } from './BannerModelSelect'

interface BannerModelGridProps {
  options: BannerModelOption[]
  value?: string
  onSelect: (id: string) => void
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
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>([])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const fav = JSON.parse(localStorage.getItem('bannerModelFavorites') || '[]')
      const rec = JSON.parse(localStorage.getItem('bannerModelRecent') || '[]')
      setFavorites(Array.isArray(fav) ? fav : [])
      setRecents(Array.isArray(rec) ? rec : [])
    } catch { }
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let base = options.filter(o => (!q || o.nome.toLowerCase().includes(q) || (o.label && o.label.toLowerCase().includes(q))))
    if (category === 'Favoritos') base = base.filter(o => favorites.includes(o.id))
    else if (category === 'Recentes') base = base.filter(o => recents.includes(o.id))
    else if (category !== 'Todos') base = base.filter(o => deriveCategory(o.nome) === category)
    return base
  }, [options, search, category, favorites, recents])

  const categories = ['Todos', 'Favoritos', 'Recentes', ...Array.from(new Set(options.map(o => deriveCategory(o.nome))))]

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
            key={opt.id}
            nome={opt.label || opt.nome}
            largura={opt.larguraRecomendada}
            altura={opt.alturaRecomendada}
            selected={value === opt.id}
            onSelect={() => {
              onSelect(opt.id)
              if (typeof window !== 'undefined') {
                const rec = JSON.parse(localStorage.getItem('bannerModelRecent') || '[]')
                const list = Array.isArray(rec) ? [opt.id, ...rec.filter((n: string) => n !== opt.id)].slice(0, 8) : [opt.id]
                localStorage.setItem('bannerModelRecent', JSON.stringify(list))
                localStorage.setItem('lastBannerModel', opt.id)
              }
            }}
          />
        ))}
      </div>
    </div>
  )
}

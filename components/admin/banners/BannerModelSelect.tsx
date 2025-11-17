import React, { useMemo, useState, useEffect, useRef } from 'react'

export interface BannerModelOption {
  nome: string
  descricao?: string
  larguraRecomendada?: number
  alturaRecomendada?: number
  paginas?: string[]
}

interface BannerModelSelectProps {
  options: BannerModelOption[]
  value?: string
  onChange: (nome: string) => void
  placeholder?: string
}

// Deriva categoria textual a partir do nome
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

export default function BannerModelSelect({ options, value, onChange, placeholder }: BannerModelSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const [favorites, setFavorites] = useState<string[]>([])
  const [recents, setRecents] = useState<string[]>([])

  const grouped = useMemo(() => {
    const filtro = query.trim().toLowerCase()
    const result: Record<string, BannerModelOption[]> = {}
    options
      .filter(opt => opt.nome.toLowerCase().includes(filtro))
      .forEach(opt => {
        const cat = deriveCategory(opt.nome)
        result[cat] = result[cat] ? [...result[cat], opt] : [opt]
      })
    return result
  }, [options, query])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!open) return
      const target = e.target as HTMLElement
      if (target && inputRef.current && !inputRef.current.parentElement?.contains(target)) {
        setOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open])

  // load favorites and recents
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const fav = JSON.parse(localStorage.getItem('bannerModelFavorites') || '[]')
      const rec = JSON.parse(localStorage.getItem('bannerModelRecent') || '[]')
      setFavorites(Array.isArray(fav) ? fav : [])
      setRecents(Array.isArray(rec) ? rec : [])
    } catch {}
  }, [])

  const saveFavorites = (list: string[]) => {
    setFavorites(list)
    if (typeof window !== 'undefined') localStorage.setItem('bannerModelFavorites', JSON.stringify(list))
  }
  const saveRecents = (list: string[]) => {
    setRecents(list)
    if (typeof window !== 'undefined') localStorage.setItem('bannerModelRecent', JSON.stringify(list))
  }

  const toggleFavorite = (nome: string) => {
    const exists = favorites.includes(nome)
    const next = exists ? favorites.filter(n => n !== nome) : [...favorites, nome]
    saveFavorites(next)
  }

  const registerRecent = (nome: string) => {
    const without = recents.filter(n => n !== nome)
    const next = [nome, ...without].slice(0, 8)
    saveRecents(next)
    if (typeof window !== 'undefined') localStorage.setItem('lastBannerModel', nome)
  }

  const selected = options.find(o => o.nome === value)

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={selected?.nome || placeholder || 'Digite para buscar posição...'}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      />
      {open && (
        <div className="absolute z-10 mt-1 w-full max-h-56 overflow-auto rounded-md border border-gray-200 bg-white shadow">
          {(() => {
            const keys = Object.keys(grouped)
            if (keys.length === 0) {
              return <div className="px-3 py-2 text-sm text-gray-500">Nenhuma posição encontrada</div>
            }
            return (
              <div>
                {/* Favoritos */}
                {favorites.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">Favoritos</div>
                    {favorites.map(nome => {
                      const item = options.find(o => o.nome === nome)
                      if (!item) return null
                      return (
                        <button
                          key={`fav-${nome}`}
                          type="button"
                          onClick={() => { onChange(item.nome); registerRecent(item.nome); setQuery(''); setOpen(false) }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${value === item.nome ? 'bg-orange-100' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-gray-900">{item.nome}</span>
                            <span className="text-xs text-gray-500">★</span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
                {/* Recentes */}
                {recents.length > 0 && (
                  <div>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">Recentes</div>
                    {recents.map(nome => {
                      const item = options.find(o => o.nome === nome)
                      if (!item) return null
                      return (
                        <button
                          key={`rec-${nome}`}
                          type="button"
                          onClick={() => { onChange(item.nome); registerRecent(item.nome); setQuery(''); setOpen(false) }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${value === item.nome ? 'bg-orange-100' : ''}`}
                        >
                          <span className="font-medium text-gray-900">{item.nome}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
                {keys.map(k => (
                  <div key={k}>
                    <div className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-50">{k}</div>
                    {grouped[k].map(item => (
                      <button
                        key={item.nome}
                        type="button"
                        onClick={() => {
                          onChange(item.nome)
                          registerRecent(item.nome)
                          setQuery('')
                          setOpen(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-orange-50 ${value === item.nome ? 'bg-orange-100' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{item.nome}</span>
                          {item.larguraRecomendada && item.alturaRecomendada && (
                            <span className="text-xs text-gray-500">{item.larguraRecomendada}×{item.alturaRecomendada}</span>
                          )}
                          <button type="button" onClick={(e) => { e.stopPropagation(); toggleFavorite(item.nome) }} className="ml-2 text-xs text-gray-500 hover:text-orange-600">
                            {favorites.includes(item.nome) ? '★' : '☆'}
                          </button>
                        </div>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

import React from 'react'

export interface BannerModelCardProps {
  nome: string
  largura?: number
  altura?: number
  selected?: boolean
  onSelect: () => void
}

export default function BannerModelCard({ nome, largura, altura, selected, onSelect }: BannerModelCardProps) {
  const ratio = largura && altura ? altura / largura : 0.3
  const boxW = 220
  const boxH = Math.max(60, Math.round(boxW * ratio))

  const deriveCategory = (n: string) => {
    const s = n.toLowerCase()
    if (s.includes('header')) return 'Header'
    if (s.includes('hero')) return 'Hero'
    if (s.includes('sidebar')) return 'Sidebar'
    if (s.includes('footer')) return 'Footer'
    if (s.includes('conteúdo') || s.includes('conteudo')) return 'Conteúdo'
    if (s.includes('popup')) return 'Popup'
    return 'Outros'
  }
  const category = deriveCategory(nome)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left rounded-lg border ${selected ? 'border-orange-500' : 'border-gray-200'} bg-white shadow-sm hover:shadow-md transition`}
      aria-label={`Selecionar modelo ${nome}${largura && altura ? ` ${largura}x${altura}` : ''}`}
    > 
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-gray-900 text-sm truncate">{nome}</div>
          {largura && altura && (
            <div className="text-xs text-gray-600">{largura}×{altura}</div>
          )}
        </div>
        <div className="flex justify-center">
          <div style={{ width: boxW, height: boxH }} className="relative overflow-hidden rounded border border-gray-200 bg-gray-50">
            {/* preview por categoria */}
            {category === 'Header' && (
              <div className="absolute top-0 left-0 right-0 h-3 bg-blue-300/60" />
            )}
            {category === 'Footer' && (
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-blue-300/60" />
            )}
            {category === 'Hero' && (
              <div className="absolute top-2 left-2 right-2 h-1/2 bg-indigo-300/60 rounded" />
            )}
            {category === 'Sidebar' && (
              <div className="absolute top-2 bottom-2 right-2 w-6 bg-emerald-300/60 rounded" />
            )}
            {category === 'Conteúdo' && (
              <div className="absolute top-1/3 left-6 right-6 h-6 bg-orange-300/60 rounded" />
            )}
            {category === 'Popup' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-24 h-14 bg-pink-300/60 rounded shadow" />
              </div>
            )}
            <div className="absolute inset-0 flex items-start justify-start">
              <span className="m-1 px-1.5 py-0.5 text-[10px] rounded bg-white/70 text-gray-600 border border-gray-200">{category}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

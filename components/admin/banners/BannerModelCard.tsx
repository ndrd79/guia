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

  return (
    <button type="button" onClick={onSelect} className={`w-full text-left rounded-lg border ${selected ? 'border-orange-500' : 'border-gray-200'} bg-white shadow-sm hover:shadow-md transition`}> 
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="font-medium text-gray-900 text-sm truncate">{nome}</div>
          {largura && altura && (
            <div className="text-xs text-gray-600">{largura}×{altura}</div>
          )}
        </div>
        <div className="flex justify-center">
          <div style={{ width: boxW, height: boxH }} className="relative overflow-hidden rounded border border-gray-200 bg-gray-50">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] text-gray-500">Preview</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}
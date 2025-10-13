import React from 'react'
import { useBanner } from '../hooks/useBanners'

interface BannerDebugProps {
  position: string
}

const BannerDebug: React.FC<BannerDebugProps> = ({ position }) => {
  const { banner, loading, error } = useBanner(position)

  return (
    <div className="p-4 border-2 border-blue-500 bg-blue-50 rounded-lg mb-4">
      <h3 className="font-bold text-blue-800 mb-2">🔍 Debug Banner: {position}</h3>
      
      <div className="text-sm space-y-1">
        <p><strong>Loading:</strong> {loading ? '✅ Sim' : '❌ Não'}</p>
        <p><strong>Error:</strong> {error || '❌ Nenhum'}</p>
        <p><strong>Banner encontrado:</strong> {banner ? '✅ Sim' : '❌ Não'}</p>
        
        {banner && (
          <div className="mt-2 p-2 bg-white rounded border">
            <p><strong>ID:</strong> {banner.id}</p>
            <p><strong>Nome:</strong> {banner.nome}</p>
            <p><strong>Posição:</strong> {banner.posicao}</p>
            <p><strong>Dimensões:</strong> {banner.largura}x{banner.altura}</p>
            <p><strong>Ativo:</strong> {banner.ativo ? '✅' : '❌'}</p>
            <p><strong>Imagem:</strong> {banner.imagem ? '✅ Definida' : '❌ Não definida'}</p>
            {banner.imagem && (
              <p className="break-all"><strong>URL:</strong> {banner.imagem}</p>
            )}
            <p><strong>Link:</strong> {banner.link || 'Não definido'}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BannerDebug
import React, { useState } from 'react'
import Image from 'next/image'
import { Monitor, Smartphone, Tablet, Eye, EyeOff, ExternalLink } from 'lucide-react'

interface BannerPreviewProps {
  imageUrl: string
  width: number
  height: number
  position: string
  link?: string
  title: string
  isActive: boolean
}

type DeviceType = 'desktop' | 'tablet' | 'mobile'

export default function BannerPreview({
  imageUrl,
  width,
  height,
  position,
  link,
  title,
  isActive
}: BannerPreviewProps) {
  const [device, setDevice] = useState<DeviceType>('desktop')
  const [showPreview, setShowPreview] = useState(true)
  const [imageError, setImageError] = useState(false)

  // Calcular dimensões responsivas
  const getResponsiveDimensions = () => {
    const maxWidth = device === 'mobile' ? 320 : device === 'tablet' ? 768 : 1200
    const aspectRatio = width / height
    
    let displayWidth = width
    let displayHeight = height
    
    if (width > maxWidth) {
      displayWidth = maxWidth
      displayHeight = maxWidth / aspectRatio
    }
    
    return { displayWidth, displayHeight }
  }

  const { displayWidth, displayHeight } = getResponsiveDimensions()

  // Determinar se é um banner pequeno
  const isSmallBanner = width <= 320 || height <= 100

  // Obter informações da posição
  const getPositionInfo = () => {
    const positions: Record<string, { description: string; color: string }> = {
      'header': { description: 'Cabeçalho do site', color: 'bg-blue-100 text-blue-800' },
      'content-top': { description: 'Topo do conteúdo', color: 'bg-green-100 text-green-800' },
      'content-middle': { description: 'Meio do conteúdo', color: 'bg-yellow-100 text-yellow-800' },
      'content-bottom': { description: 'Final do conteúdo', color: 'bg-orange-100 text-orange-800' },
      'sidebar': { description: 'Barra lateral', color: 'bg-purple-100 text-purple-800' },
      'footer': { description: 'Rodapé do site', color: 'bg-gray-100 text-gray-800' },
      'mobile': { description: 'Banner móvel', color: 'bg-pink-100 text-pink-800' }
    }
    
    return positions[position] || { description: position, color: 'bg-gray-100 text-gray-800' }
  }

  const positionInfo = getPositionInfo()

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      {/* Header do Preview */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${positionInfo.color}`}>
            {positionInfo.description}
          </span>
          {!isActive && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              Inativo
            </span>
          )}
        </div>
        
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title={showPreview ? 'Ocultar preview' : 'Mostrar preview'}
        >
          {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>

      {showPreview && (
        <>
          {/* Controles de Dispositivo */}
          <div className="flex items-center space-x-2 border-b border-gray-200 pb-3">
            <span className="text-sm font-medium text-gray-700">Visualizar em:</span>
            <div className="flex space-x-1">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-2 rounded-md transition-colors ${
                  device === 'desktop'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-2 rounded-md transition-colors ${
                  device === 'tablet'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-2 rounded-md transition-colors ${
                  device === 'mobile'
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Informações do Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Dimensões:</span>
              <div className="font-medium">{width} × {height}px</div>
            </div>
            <div>
              <span className="text-gray-500">Exibindo:</span>
              <div className="font-medium">{Math.round(displayWidth)} × {Math.round(displayHeight)}px</div>
            </div>
            <div>
              <span className="text-gray-500">Tipo:</span>
              <div className="font-medium">{isSmallBanner ? 'Banner Pequeno' : 'Banner Padrão'}</div>
            </div>
            <div>
              <span className="text-gray-500">Link:</span>
              <div className="font-medium">
                {link ? (
                  <a 
                    href={link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Sim
                  </a>
                ) : (
                  'Não'
                )}
              </div>
            </div>
          </div>

          {/* Preview do Banner */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex justify-center">
              {imageUrl && !imageError ? (
                <div 
                  className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white"
                  style={{ 
                    width: displayWidth,
                    height: displayHeight,
                    maxWidth: '100%'
                  }}
                >
                  <Image
                    src={imageUrl}
                    alt={title}
                    width={width}
                    height={height}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                    priority
                  />
                  
                  {/* Overlay para banners inativos */}
                  {!isActive && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full">
                        Banner Inativo
                      </span>
                    </div>
                  )}
                  
                  {/* Indicador de link */}
                  {link && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-blue-600 text-white p-1 rounded-full">
                        <ExternalLink className="w-3 h-3" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div 
                  className="flex items-center justify-center bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg"
                  style={{ 
                    width: displayWidth,
                    height: displayHeight,
                    maxWidth: '100%'
                  }}
                >
                  <div className="text-center text-gray-500">
                    <div className="text-2xl mb-2">🖼️</div>
                    <div className="text-sm">
                      {imageError ? 'Erro ao carregar imagem' : 'Nenhuma imagem selecionada'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dicas de Otimização */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas de Otimização</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Use imagens com boa qualidade e resolução adequada</li>
              <li>• Mantenha o tamanho do arquivo abaixo de 500KB para melhor performance</li>
              <li>• Teste a legibilidade em diferentes dispositivos</li>
              {isSmallBanner && <li>• Para banners pequenos, use texto grande e poucas palavras</li>}
              {link && <li>• Certifique-se de que o link está funcionando corretamente</li>}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
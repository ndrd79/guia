import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, FolderOpen } from 'lucide-react'
import MediaPicker from './MediaPicker'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string | null) => void
  bucket: string
  folder?: string
  maxSize?: number // em MB
  accept?: string
  showLibraryButton?: boolean
  useNewMediaAPI?: boolean
}

export default function ImageUploader({
  value,
  onChange,
  bucket,
  folder = '',
  maxSize = 5,
  accept = 'image/*',
  showLibraryButton = false,
  useNewMediaAPI = false
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setUploadProgress(0)

    // Validar tamanho do arquivo
    if (file.size > maxSize * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${maxSize}MB.`)
      return
    }

    // Validar tipo do arquivo
    if (!file.type.startsWith('image/')) {
      setError('Apenas imagens são permitidas.')
      return
    }

    setUploading(true)

    try {
      console.log('📤 Iniciando upload via API:', file.name)
      
      if (useNewMediaAPI) {
        // Usar a nova API de mídia
        const formData = new FormData()
        formData.append('files', file)
        formData.append('folder', folder)
        
        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro no upload')
        }

        console.log('✅ Upload concluído via nova API:', result.files[0].url)
        onChange(result.files[0].url)
      } else {
        // Usar a API original
        const formData = new FormData()
        formData.append('file', file)
        formData.append('bucket', bucket)
        formData.append('folder', folder)
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Erro no upload')
        }

        console.log('✅ Upload concluído via API original:', result.url)
        onChange(result.url)
      }
      
    } catch (err: any) {
      console.error('❌ Erro no upload:', err)
      setError(err.message || 'Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleRemove = () => {
    onChange(null)
  }

  const handleMediaSelect = (files: any[]) => {
    if (files.length > 0) {
      onChange(files[0].url)
    }
    setShowMediaPicker(false)
  }

  return (
    <div className="space-y-4">
      {/* Preview da imagem atual */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200 shadow-sm"
            onError={(e) => {
              console.error('❌ Erro ao carregar imagem:', value)
              e.currentTarget.src = '/placeholder-image.png'
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Área de upload */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        
        {uploading ? (
          <div className="space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            
            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                {value ? 'Alterar Imagem' : 'Fazer Upload'}
              </button>
              
              {showLibraryButton && (
                <button
                  type="button"
                  onClick={() => setShowMediaPicker(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Escolher da Biblioteca
                </button>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF até {maxSize}MB
            </p>
          </div>
        )}
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
        </div>
      )}
      
      {/* Informações de debug */}
      {value && (
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <strong>URL:</strong> {value.length > 50 ? value.substring(0, 50) + '...' : value}
        </div>
      )}

      {/* Modal do Media Picker */}
      {showMediaPicker && (
        <MediaPicker
          isOpen={showMediaPicker}
          onClose={() => setShowMediaPicker(false)}
          onSelect={handleMediaSelect}
          maxSelection={1}
          allowedTypes={['image']}
        />
      )}
    </div>
  )
}
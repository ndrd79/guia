import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string | null) => void
  bucket: string
  folder?: string
  maxSize?: number // em MB
  accept?: string
}

export default function ImageUploader({
  value,
  onChange,
  bucket,
  folder = '',
  maxSize = 5,
  accept = 'image/*'
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [isClient, setIsClient] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const generateFileName = (originalName: string): string => {
    const fileExt = originalName.split('.').pop()
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2)
    return `${timestamp}-${randomStr}.${fileExt}`
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

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
      // Gerar nome único para o arquivo apenas no cliente
      if (!isClient) {
        setError('Aguarde a inicialização do componente')
        return
      }
      
      // Converter arquivo para base64 como solução temporária
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        onChange(result)
        setUploading(false)
      }
      reader.onerror = () => {
        setError('Erro ao processar a imagem')
        setUploading(false)
      }
      reader.readAsDataURL(file)
      
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer upload da imagem')
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (value) {
      try {
        // Extrair o caminho do arquivo da URL
        const url = new URL(value)
        const pathParts = url.pathname.split('/')
        const filePath = pathParts.slice(-2).join('/') // bucket/filename
        
        // Verificar se o supabase está disponível
        if (supabase) {
          // Remover do storage
          await supabase.storage
            .from(bucket)
            .remove([filePath.split('/').slice(1).join('/')])
        }
      } catch (err) {
        console.error('Erro ao remover imagem:', err)
      }
    }
    onChange(null)
  }

  return (
    <div className="space-y-4">
      {/* Preview da imagem atual */}
      {value && (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
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
          <div className="space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600">Fazendo upload...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Upload className="h-4 w-4 mr-2" />
                {value ? 'Alterar Imagem' : 'Selecionar Imagem'}
              </button>
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
          {error}
        </div>
      )}
    </div>
  )
}
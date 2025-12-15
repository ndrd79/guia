import { useState, useRef, useEffect } from 'react'
import { Upload, X, Image as ImageIcon, FolderOpen, Crop as CropIcon, Check } from 'lucide-react'
import Cropper from 'react-easy-crop'
import MediaPicker from './MediaPicker'
import getCroppedImg from '../../lib/images/cropImage'

interface ImageUploaderProps {
  value?: string
  onChange: (url: string | null) => void
  bucket: string
  folder?: string
  maxSize?: number // em MB
  accept?: string
  showLibraryButton?: boolean
  useNewMediaAPI?: boolean
  aspectRatio?: number // Proporção desejada (largura / altura)
}

export default function ImageUploader({
  value,
  onChange,
  bucket,
  folder = '',
  maxSize = 5,
  accept = 'image/*',
  showLibraryButton = false,
  useNewMediaAPI = false,
  aspectRatio
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Crop state
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
  const [isCropping, setIsCropping] = useState(false)

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }

  const readFile = (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.addEventListener('load', () => resolve(reader.result as string), false)
      reader.readAsDataURL(file)
    })
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0]

      // Validar tamanho
      if (file.size > maxSize * 1024 * 1024) {
        setError(`Arquivo muito grande. Máximo ${maxSize}MB.`)
        return
      }

      // Validar tipo
      if (!file.type.startsWith('image/')) {
        setError('Apenas imagens são permitidas.')
        return
      }

      const imageDataUrl = await readFile(file)
      setImageSrc(imageDataUrl)
      setIsCropping(true)
      setError('')

      // Reset input value so same file can be selected again if cancelled
      event.target.value = ''
    }
  }

  const handleUploadCroppedImage = async () => {
    if (!imageSrc || !croppedAreaPixels) return

    try {
      setUploading(true)
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)

      if (!croppedImageBlob) {
        throw new Error('Falha ao cortar imagem')
      }

      // Criar um arquivo a partir do blob
      const file = new File([croppedImageBlob], 'cropped-image.jpg', { type: 'image/jpeg' })

      await uploadFile(file)

      setIsCropping(false)
      setImageSrc(null)
    } catch (e: any) {
      console.error('Erro ao cortar/enviar imagem:', e)
      setError(e.message)
      setUploading(false)
    }
  }

  const uploadFile = async (file: File) => {
    try {
      if (useNewMediaAPI) {
        const formData = new FormData()
        formData.append('files', file)
        formData.append('folder_path', folder || '/')
        if (bucket) formData.append('bucket', bucket)

        const response = await fetch('/api/admin/media', {
          method: 'POST',
          body: formData
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || `Erro no upload (${response.status})`)
        }

        const uploaded = Array.isArray(result.data) ? result.data[0] : null
        const url = uploaded?.file_url || (Array.isArray(result.files) ? result.files[0]?.url : null)

        if (!url) throw new Error('Resposta de upload inválida')

        onChange(url)
      } else {
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

        onChange(result.url)
      }
    } catch (err: any) {
      console.error('❌ Erro no upload:', err)
      setError(err.message || 'Erro ao fazer upload da imagem')
    } finally {
      setUploading(false)
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

  // Se estiver cortando, mostrar modal de crop
  if (isCropping && imageSrc) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CropIcon className="w-5 h-5 mr-2 text-orange-600" />
              Ajustar Imagem
            </h3>
            <button
              onClick={() => { setIsCropping(false); setImageSrc(null); }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 min-h-[400px] bg-gray-900">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio || 16 / 9}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Zoom:</span>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-32"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setIsCropping(false); setImageSrc(null); }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleUploadCroppedImage}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
              >
                {uploading ? 'Processando...' : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar e Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Preview da imagem atual */}
      {value && (
        <div className="relative inline-block group">
          <img
            src={value}
            alt="Preview"
            className="w-full max-w-sm h-auto object-contain rounded-lg border border-gray-200 shadow-sm bg-gray-50"
            style={{ maxHeight: '200px' }}
            onError={(e) => {
              console.error('❌ Erro ao carregar imagem:', value)
              e.currentTarget.src = '/placeholder-image.png'
            }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg opacity-0 group-hover:opacity-100 focus:opacity-100"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Área de upload */}
      {!value && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 hover:bg-orange-50 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />

          {uploading ? (
            <div className="space-y-3 py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="text-sm text-gray-600">Fazendo upload...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="mx-auto h-12 w-12 text-gray-400 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="h-6 w-6" />
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">
                  Clique para fazer upload
                </p>
                <p className="text-xs text-gray-500">
                  ou arraste e solte aqui
                </p>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Selecionar Arquivo
                </button>

                {showLibraryButton && (
                  <button
                    type="button"
                    onClick={() => setShowMediaPicker(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
                  >
                    <FolderOpen className="h-4 w-4 mr-2" />
                    Biblioteca
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 pt-2">
                PNG, JPG, GIF até {maxSize}MB
                {aspectRatio && ` • Proporção recomendada: ${aspectRatio < 1 ? 'Vertical' : aspectRatio === 1 ? 'Quadrada' : 'Horizontal'}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Mensagem de erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm animate-fade-in">
          <div className="flex items-center">
            <span className="mr-2">❌</span>
            {error}
          </div>
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
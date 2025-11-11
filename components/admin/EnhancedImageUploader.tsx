import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  FileText, 
  Music, 
  File,
  FolderPlus,
  CheckCircle,
  AlertCircle,
  Folder,
  Check
} from 'lucide-react';

interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string | null;
  result?: any;
}

interface EnhancedImageUploaderProps {
  onUploadComplete?: (files: any[]) => void;
  onUploadProgress?: (progress: number) => void;
  maxFiles?: number;
  maxFileSize?: number; // em MB
  acceptedTypes?: string[];
  currentFolder?: string;
  showFolderSelector?: boolean;
  className?: string;
}

export default function EnhancedImageUploader({
  onUploadComplete,
  onUploadProgress,
  maxFiles = 10,
  maxFileSize = 50,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', '.pdf', '.doc', '.docx'],
  currentFolder = '/',
  showFolderSelector = true,
  className = ''
}: EnhancedImageUploaderProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState(currentFolder);
  const [folders, setFolders] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar pastas disponíveis
  React.useEffect(() => {
    if (showFolderSelector) {
      loadFolders();
    }
  }, [showFolderSelector]);

  const loadFolders = async () => {
    try {
      const response = await fetch('/api/admin/media/folders');
      const data = await response.json();
      if (response.ok) {
        setFolders(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pastas:', error);
    }
  };

  // Validar arquivo
  const validateFile = (file: File): string | null => {
    // Verificar tamanho
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Arquivo muito grande. Máximo: ${maxFileSize}MB`;
    }

    // Verificar tipo
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.replace('*', ''));
      }
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    });

    if (!isValidType) {
      return 'Tipo de arquivo não suportado';
    }

    return null;
  };

  // Gerar preview do arquivo
  const generatePreview = (file: File): Promise<string | undefined> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        resolve(undefined);
      }
    });
  };

  // Processar arquivos selecionados
  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    if (uploadFiles.length + fileArray.length > maxFiles) {
      alert(`Máximo de ${maxFiles} arquivos permitidos`);
      return;
    }

    const newUploadFiles: UploadFile[] = [];

    for (const file of fileArray) {
      const error = validateFile(file);
      const preview = await generatePreview(file);
      
      newUploadFiles.push({
        id: Math.random().toString(36).substring(2),
        file,
        preview,
        progress: 0,
        status: error ? 'error' : 'pending',
        error
      });
    }

    setUploadFiles(prev => [...prev, ...newUploadFiles]);
  };

  // Upload de um arquivo
  const uploadSingleFile = async (uploadFile: UploadFile): Promise<any> => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append('files', uploadFile.file);
      formData.append('folder_path', selectedFolder);
      // Se houver contexto de auth, passe o UUID do usuário
      // formData.append('uploaded_by', currentUserId);

      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress, status: 'uploading' }
                : f
            )
          );
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, progress: 100, status: 'completed', result: response.data?.[0] }
                : f
            )
          );
          resolve(response.data?.[0]);
        } else {
          const error = 'Erro no upload';
          setUploadFiles(prev => 
            prev.map(f => 
              f.id === uploadFile.id 
                ? { ...f, status: 'error', error }
                : f
            )
          );
          reject(error);
        }
      };

      xhr.onerror = () => {
        const error = 'Erro de conexão';
        setUploadFiles(prev => 
          prev.map(f => 
            f.id === uploadFile.id 
              ? { ...f, status: 'error', error }
              : f
          )
        );
        reject(error);
      };

      xhr.open('POST', '/api/admin/media');
      xhr.send(formData);
    });
  };

  // Upload de todos os arquivos
  const handleUpload = async () => {
    const pendingFiles = uploadFiles.filter(f => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    const results: any[] = [];

    try {
      for (const uploadFile of pendingFiles) {
        try {
          const result = await uploadSingleFile(uploadFile);
          results.push(result);
        } catch (error) {
          console.error('Erro no upload:', error);
        }
      }

      if (onUploadComplete) {
        onUploadComplete(results);
      }

      // Limpar arquivos completados após 2 segundos
      setTimeout(() => {
        setUploadFiles(prev => prev.filter(f => f.status !== 'completed'));
      }, 2000);

    } finally {
      setIsUploading(false);
    }
  };

  // Remover arquivo da lista
  const removeFile = (id: string) => {
    setUploadFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handlers de drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFiles(files);
    }
  }, []);

  // Handler de seleção de arquivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Limpar input para permitir selecionar o mesmo arquivo novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Ícone do tipo de arquivo
  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (file.type.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (file.type.startsWith('audio/')) return <Music className="w-6 h-6" />;
    return <FileText className="w-6 h-6" />;
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const hasValidFiles = uploadFiles.some(f => f.status === 'pending');
  const totalProgress = uploadFiles.length > 0 
    ? uploadFiles.reduce((sum, f) => sum + f.progress, 0) / uploadFiles.length 
    : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Seletor de pasta */}
      {showFolderSelector && (
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-gray-500" />
          <select
            value={selectedFolder}
            onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="/">Pasta raiz</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.path}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Área de upload */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Arraste arquivos aqui ou clique para selecionar
        </h3>
        <p className="text-sm text-gray-500">
          Máximo {maxFiles} arquivos, {maxFileSize}MB cada
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Tipos suportados: {acceptedTypes.join(', ')}
        </p>
      </div>

      {/* Lista de arquivos */}
      {uploadFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Arquivos selecionados ({uploadFiles.length})</h4>
            {hasValidFiles && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Enviar arquivos
                  </>
                )}
              </button>
            )}
          </div>

          {/* Progresso geral */}
          {isUploading && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalProgress}%` }}
              ></div>
            </div>
          )}

          {/* Lista de arquivos */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadFiles.map((uploadFile) => (
              <div
                key={uploadFile.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg"
              >
                {/* Preview/Ícone */}
                <div className="w-12 h-12 flex-shrink-0">
                  {uploadFile.preview ? (
                    <img
                      src={uploadFile.preview}
                      alt={uploadFile.file.name}
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                      {getFileIcon(uploadFile.file)}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{uploadFile.file.name}</p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(uploadFile.file.size)}
                  </p>
                  
                  {/* Progresso */}
                  {uploadFile.status === 'uploading' && (
                    <div className="mt-1">
                      <div className="w-full bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                          style={{ width: `${uploadFile.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{uploadFile.progress}%</p>
                    </div>
                  )}

                  {/* Erro */}
                  {uploadFile.status === 'error' && uploadFile.error && (
                    <p className="text-sm text-red-600 mt-1">{uploadFile.error}</p>
                  )}
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  {uploadFile.status === 'completed' && (
                    <Check className="w-5 h-5 text-green-600" />
                  )}
                  {uploadFile.status === 'error' && (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                  {uploadFile.status === 'uploading' && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  )}
                  {uploadFile.status === 'pending' && (
                    <button
                      onClick={() => removeFile(uploadFile.id)}
                      className="p-1 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
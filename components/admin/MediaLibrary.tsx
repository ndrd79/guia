import React, { useState, useEffect, useCallback } from 'react';
import { 
  Grid, 
  List, 
  Search, 
  Filter, 
  Upload, 
  Trash2, 
  Move, 
  Edit3, 
  Eye, 
  Download,
  FolderPlus,
  Folder,
  Image,
  Video,
  FileText,
  Music,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';

interface MediaFile {
  id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  file_type: 'image' | 'video' | 'audio' | 'document';
  width?: number;
  height?: number;
  alt_text?: string;
  caption?: string;
  description?: string;
  folder_path: string;
  tags: string[];
  metadata: any;
  thumbnail_url?: string;
  optimized_url?: string;
  usage_count: number;
  uploaded_by: string;
  created_at: string;
  updated_at: string;
}

interface MediaFolder {
  id: string;
  name: string;
  path: string;
  parent_path?: string;
  description?: string;
  file_count?: number;
  created_at: string;
  updated_at: string;
}

interface MediaLibraryProps {
  onSelect?: (files: MediaFile[]) => void;
  multiSelect?: boolean;
  allowedTypes?: string[];
  maxSelection?: number;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'created_at' | 'filename' | 'file_size' | 'file_type';
type SortOrder = 'asc' | 'desc';

export default function MediaLibrary({ 
  onSelect, 
  multiSelect = false, 
  allowedTypes = [],
  maxSelection = 10 
}: MediaLibraryProps) {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [currentFolder, setCurrentFolder] = useState('/');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [loading, setLoading] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [showFileDetails, setShowFileDetails] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Carregar arquivos
  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        type: filterType,
        folder: currentFolder,
        sortBy,
        sortOrder
      });

      const response = await fetch(`/api/admin/media?${params}`);
      const data = await response.json();

      if (response.ok) {
        setFiles(data.data);
        setPagination(data.pagination);
      } else {
        console.error('Erro ao carregar arquivos:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar arquivos:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, filterType, currentFolder, sortBy, sortOrder]);

  // Carregar pastas
  const loadFolders = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/media/folders');
      const data = await response.json();

      if (response.ok) {
        setFolders(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar pastas:', error);
    }
  }, []);

  useEffect(() => {
    loadFiles();
    loadFolders();
  }, [loadFiles, loadFolders]);

  // Selecionar arquivo
  const handleFileSelect = (file: MediaFile) => {
    if (multiSelect) {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.id)) {
        newSelected.delete(file.id);
      } else if (newSelected.size < maxSelection) {
        newSelected.add(file.id);
      }
      setSelectedFiles(newSelected);
      
      if (onSelect) {
        const selectedFileObjects = files.filter(f => newSelected.has(f.id));
        onSelect(selectedFileObjects);
      }
    } else {
      setSelectedFiles(new Set([file.id]));
      if (onSelect) {
        onSelect([file]);
      }
    }
  };

  // Deletar arquivos selecionados
  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;

    if (!confirm(`Deletar ${selectedFiles.size} arquivo(s) selecionado(s)?`)) return;

    try {
      const response = await fetch('/api/admin/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          ids: Array.from(selectedFiles)
        })
      });

      if (response.ok) {
        setSelectedFiles(new Set());
        loadFiles();
      }
    } catch (error) {
      console.error('Erro ao deletar arquivos:', error);
    }
  };

  // Mover arquivos selecionados
  const handleBulkMove = async (targetFolder: string) => {
    if (selectedFiles.size === 0) return;

    try {
      const response = await fetch('/api/admin/media/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'move',
          ids: Array.from(selectedFiles),
          data: { folder_path: targetFolder }
        })
      });

      if (response.ok) {
        setSelectedFiles(new Set());
        loadFiles();
      }
    } catch (error) {
      console.error('Erro ao mover arquivos:', error);
    }
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Ícone do tipo de arquivo
  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'image': return <Image className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'audio': return <Music className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Biblioteca de Mídia</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setShowUploader(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
          </div>
        </div>

        {/* Filtros e busca */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar arquivos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="image">Imagens</option>
            <option value="video">Vídeos</option>
            <option value="audio">Áudios</option>
            <option value="document">Documentos</option>
          </select>

          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              setSortBy(field as SortBy);
              setSortOrder(order as SortOrder);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="created_at-desc">Mais recentes</option>
            <option value="created_at-asc">Mais antigos</option>
            <option value="filename-asc">Nome A-Z</option>
            <option value="filename-desc">Nome Z-A</option>
            <option value="file_size-desc">Maior tamanho</option>
            <option value="file_size-asc">Menor tamanho</option>
          </select>
        </div>

        {/* Ações em massa */}
        {selectedFiles.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-700">
              {selectedFiles.size} arquivo(s) selecionado(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-red-600 hover:bg-red-100 rounded flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Deletar
              </button>
              <button
                onClick={() => setShowBulkActions(true)}
                className="px-3 py-1 text-blue-600 hover:bg-blue-100 rounded flex items-center gap-1"
              >
                <Move className="w-4 h-4" />
                Mover
              </button>
              <button
                onClick={() => setSelectedFiles(new Set())}
                className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`relative group cursor-pointer rounded-lg border-2 transition-all ${
                      selectedFiles.has(file.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {/* Checkbox */}
                    {multiSelect && (
                      <div className="absolute top-2 left-2 z-10">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          selectedFiles.has(file.id)
                            ? 'bg-blue-600 border-blue-600'
                            : 'bg-white border-gray-300'
                        }`}>
                          {selectedFiles.has(file.id) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                      </div>
                    )}

                    {/* Preview */}
                    <div className="aspect-square p-2">
                      {file.file_type === 'image' ? (
                        <img
                          src={file.thumbnail_url || file.file_url}
                          alt={file.alt_text || file.original_filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                          {getFileIcon(file.file_type)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-2 border-t">
                      <p className="text-xs font-medium truncate" title={file.original_filename}>
                        {file.original_filename}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                          setShowFileDetails(true);
                        }}
                        className="p-1 bg-white rounded shadow hover:bg-gray-50"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2">
                {files.map((file) => (
                  <div
                    key={file.id}
                    className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedFiles.has(file.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleFileSelect(file)}
                  >
                    {/* Checkbox */}
                    {multiSelect && (
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedFiles.has(file.id)
                          ? 'bg-blue-600 border-blue-600'
                          : 'bg-white border-gray-300'
                      }`}>
                        {selectedFiles.has(file.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                    )}

                    {/* Preview */}
                    <div className="w-12 h-12 flex-shrink-0">
                      {file.file_type === 'image' ? (
                        <img
                          src={file.thumbnail_url || file.file_url}
                          alt={file.alt_text || file.original_filename}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded">
                          {getFileIcon(file.file_type)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{file.original_filename}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.file_size)} • {file.file_type} • {new Date(file.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(file);
                          setShowFileDetails(true);
                        }}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(file.file_url, '_blank');
                        }}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Mostrando {((pagination.page - 1) * pagination.limit) + 1} a {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} arquivos
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="px-3 py-1">
                    {pagination.page} de {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Próximo
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
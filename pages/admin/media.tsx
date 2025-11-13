import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/admin/AdminLayout';
import MediaLibrary from '../../components/admin/MediaLibrary';
import EnhancedImageUploader from '../../components/admin/EnhancedImageUploader';
import { 
  Upload, 
  FolderPlus, 
  Settings, 
  BarChart3, 
  HardDrive,
  Image,
  Video,
  FileText,
  Music,
  X,
  Edit3,
  Trash2,
  Save
} from 'lucide-react';

interface MediaStats {
  totalFiles: number;
  totalSize: number;
  imageCount: number;
  videoCount: number;
  documentCount: number;
  audioCount: number;
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

export default function MediaPage() {
  const router = useRouter();
  const [showUploader, setShowUploader] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<MediaStats | null>(null);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('/');
  const [refreshKey, setRefreshKey] = useState(0);

  // Carregar estatísticas
  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/media?limit=1000');
      const data = await response.json();
      
      if (response.ok) {
        const files = data.data;
        const stats: MediaStats = {
          totalFiles: files.length,
          totalSize: files.reduce((sum: number, file: any) => sum + file.file_size, 0),
          imageCount: files.filter((f: any) => f.file_type === 'image').length,
          videoCount: files.filter((f: any) => f.file_type === 'video').length,
          documentCount: files.filter((f: any) => f.file_type === 'document').length,
          audioCount: files.filter((f: any) => f.file_type === 'audio').length,
        };
        setStats(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  // Carregar pastas
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

  // Criar nova pasta
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const folderPath = selectedFolder === '/' 
        ? `/${newFolderName.toLowerCase().replace(/\s+/g, '-')}`
        : `${selectedFolder}/${newFolderName.toLowerCase().replace(/\s+/g, '-')}`;

      const response = await fetch('/api/admin/media/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newFolderName,
          path: folderPath,
          parent_path: selectedFolder === '/' ? null : selectedFolder,
          description: newFolderDescription || null
        })
      });

      if (response.ok) {
        setNewFolderName('');
        setNewFolderDescription('');
        setShowFolderModal(false);
        loadFolders();
      } else {
        const error = await response.json();
        alert(error.error || 'Erro ao criar pasta');
      }
    } catch (error) {
      console.error('Erro ao criar pasta:', error);
      alert('Erro ao criar pasta');
    }
  };

  // Formatar tamanho
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  useEffect(() => {
    loadStats();
    loadFolders();
  }, [refreshKey]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Mídia</h1>
            <p className="text-gray-600">Gerencie todos os seus arquivos de mídia</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowStats(!showStats)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Estatísticas
            </button>
            
            <button
              onClick={() => setShowFolderModal(true)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              Nova Pasta
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

        {/* Estatísticas */}
        {showStats && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Arquivos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFiles}</p>
                </div>
                <HardDrive className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Espaço Usado</p>
                  <p className="text-2xl font-bold text-gray-900">{formatFileSize(stats.totalSize)}</p>
                </div>
                <Settings className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Imagens</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.imageCount}</p>
                </div>
                <Image className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Outros</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.videoCount + stats.documentCount + stats.audioCount}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
            </div>
          </div>
        )}

        {/* Biblioteca de Mídia */}
        <MediaLibrary 
          key={refreshKey}
          multiSelect={true}
          onSelect={(files: any[]) => {
            console.log('Arquivos selecionados:', files);
          }}
        />

        {/* Modal de Upload */}
        {showUploader && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Upload de Arquivos</h2>
                <button
                  onClick={() => setShowUploader(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6">
                <EnhancedImageUploader
                  onUploadComplete={(files: any[]) => {
                    console.log('Upload concluído:', files);
                    setRefreshKey(prev => prev + 1);
                    setTimeout(() => setShowUploader(false), 1000);
                  }}
                  maxFiles={20}
                  maxFileSize={50}
                  showFolderSelector={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Modal de Nova Pasta */}
        {showFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Nova Pasta</h2>
                <button
                  onClick={() => setShowFolderModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Pasta
                  </label>
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Digite o nome da pasta"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pasta Pai
                  </label>
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="/">Pasta raiz</option>
                    {folders.map(folder => (
                      <option key={folder.id} value={folder.path}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newFolderDescription}
                    onChange={(e) => setNewFolderDescription(e.target.value)}
                    placeholder="Descrição da pasta"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleCreateFolder}
                    disabled={!newFolderName.trim()}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Criar Pasta
                  </button>
                  <button
                    onClick={() => setShowFolderModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

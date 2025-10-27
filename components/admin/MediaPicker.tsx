import React, { useState } from 'react';
import MediaLibrary from './MediaLibrary';
import EnhancedImageUploader from './EnhancedImageUploader';
import { X, Upload, FolderOpen } from 'lucide-react';

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

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (files: MediaFile[]) => void;
  multiSelect?: boolean;
  allowedTypes?: string[];
  maxSelection?: number;
  title?: string;
}

export default function MediaPicker({
  isOpen,
  onClose,
  onSelect,
  multiSelect = false,
  allowedTypes = [],
  maxSelection = 1,
  title = 'Selecionar Mídia'
}: MediaPickerProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library');
  const [selectedFiles, setSelectedFiles] = useState<MediaFile[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const handleFileSelect = (files: MediaFile[]) => {
    setSelectedFiles(files);
  };

  const handleConfirmSelection = () => {
    onSelect(selectedFiles);
    onClose();
    setSelectedFiles([]);
  };

  const handleUploadComplete = (uploadedFiles: any[]) => {
    // Converter para o formato MediaFile se necessário
    const mediaFiles: MediaFile[] = uploadedFiles.map(file => ({
      id: file.id,
      filename: file.filename,
      original_filename: file.original_filename,
      file_path: file.file_path,
      file_url: file.file_url,
      file_size: file.file_size,
      mime_type: file.mime_type,
      file_type: file.file_type,
      width: file.width,
      height: file.height,
      alt_text: file.alt_text,
      caption: file.caption,
      description: file.description,
      folder_path: file.folder_path,
      tags: file.tags || [],
      metadata: file.metadata || {},
      thumbnail_url: file.thumbnail_url,
      optimized_url: file.optimized_url,
      usage_count: file.usage_count || 0,
      uploaded_by: file.uploaded_by,
      created_at: file.created_at,
      updated_at: file.updated_at
    }));

    // Auto-selecionar arquivos recém-enviados
    if (multiSelect) {
      setSelectedFiles(prev => [...prev, ...mediaFiles].slice(0, maxSelection));
    } else {
      setSelectedFiles(mediaFiles.slice(0, 1));
    }

    // Atualizar a biblioteca
    setRefreshKey(prev => prev + 1);
    
    // Voltar para a aba da biblioteca
    setActiveTab('library');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            
            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('library')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'library'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <FolderOpen className="w-4 h-4 inline mr-2" />
                Biblioteca
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'upload'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload
              </button>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'library' ? (
            <div className="h-full">
              <MediaLibrary
                key={refreshKey}
                onSelect={handleFileSelect}
                multiSelect={multiSelect}
                allowedTypes={allowedTypes}
                maxSelection={maxSelection}
              />
            </div>
          ) : (
            <div className="p-6 h-full overflow-y-auto">
              <EnhancedImageUploader
                onUploadComplete={handleUploadComplete}
                maxFiles={maxSelection}
                acceptedTypes={allowedTypes.length > 0 ? allowedTypes : undefined}
                showFolderSelector={true}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedFiles.length > 0 && (
              <span>
                {selectedFiles.length} arquivo(s) selecionado(s)
                {multiSelect && maxSelection > 1 && ` (máx. ${maxSelection})`}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirmSelection}
              disabled={selectedFiles.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Selecionar {selectedFiles.length > 0 && `(${selectedFiles.length})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
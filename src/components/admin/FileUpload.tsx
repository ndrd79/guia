import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Download } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isUploading: boolean;
  acceptedFormats?: string[];
  maxSize?: number;
  onDownloadTemplate?: (format: 'xlsx' | 'csv') => void;
}

interface UploadError {
  type: 'size' | 'format' | 'general';
  message: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUpload,
  isUploading,
  acceptedFormats = ['.xlsx', '.xls', '.csv'],
  maxSize = 10 * 1024 * 1024, // 10MB
  onDownloadTemplate
}) => {
  const [uploadError, setUploadError] = useState<UploadError | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setUploadError(null);

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setUploadError({
          type: 'size',
          message: `Arquivo muito grande. Tamanho máximo: ${(maxSize / 1024 / 1024).toFixed(1)}MB`
        });
      } else if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        setUploadError({
          type: 'format',
          message: `Formato não suportado. Use: ${acceptedFormats.join(', ')}`
        });
      } else {
        setUploadError({
          type: 'general',
          message: 'Erro ao processar arquivo'
        });
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileUpload(file);
    }
  }, [onFileUpload, maxSize, acceptedFormats]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    },
    maxSize,
    multiple: false,
    disabled: isUploading
  });

  const handleDownloadTemplate = (format: 'xlsx' | 'csv') => {
    if (onDownloadTemplate) {
      onDownloadTemplate(format);
    }
  };

  return (
    <div className="w-full">
      {/* Template Download Section */}
      {onDownloadTemplate && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Baixar Template
          </h3>
          <p className="text-sm text-blue-700 mb-3">
            Baixe o template com exemplos e instruções para facilitar a importação:
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => handleDownloadTemplate('xlsx')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel (.xlsx)
            </button>
            <button
              onClick={() => handleDownloadTemplate('csv')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Download className="w-4 h-4 mr-2" />
              CSV (.csv)
            </button>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
          ${uploadError ? 'border-red-300 bg-red-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center">
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-lg font-medium text-gray-700">
                Processando arquivo...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Aguarde enquanto validamos os dados
              </p>
            </>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium text-gray-700 mb-2">
                {isDragActive 
                  ? 'Solte o arquivo aqui...' 
                  : 'Arraste um arquivo ou clique para selecionar'
                }
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Formatos aceitos: {acceptedFormats.join(', ')}
              </p>
              <p className="text-xs text-gray-400">
                Tamanho máximo: {(maxSize / 1024 / 1024).toFixed(1)}MB
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Display */}
      {uploadError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">
                Erro no upload
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {uploadError.message}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          <FileText className="inline w-4 h-4 mr-2" />
          Instruções para importação
        </h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Certifique-se de que todas as colunas obrigatórias estão preenchidas</li>
          <li>• Use o template fornecido para garantir o formato correto</li>
          <li>• Verifique se não há dados duplicados no arquivo</li>
          <li>• Telefones devem estar no formato (11) 99999-9999</li>
          <li>• URLs devem começar com http:// ou https://</li>
        </ul>
      </div>
    </div>
  );
};
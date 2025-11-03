import React, { useState } from 'react';
import { Eye, EyeOff, ChevronLeft, ChevronRight, FileText, Users } from 'lucide-react';

interface ParsedEmpresa {
  nome: string;
  categoria: string;
  telefone: string;
  endereco: string;
  descricao: string;
  email?: string;
  website?: string;
  whatsapp?: string;
  horario_funcionamento?: string;
  imagem?: string;
}

interface DataPreviewProps {
  data: ParsedEmpresa[];
  fileName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

export const DataPreview: React.FC<DataPreviewProps> = ({
  data,
  fileName,
  onConfirm,
  onCancel,
  isProcessing
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllColumns, setShowAllColumns] = useState(false);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(data.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  // Colunas principais (sempre visíveis)
  const mainColumns = ['nome', 'categoria', 'telefone', 'endereco'];
  
  // Colunas opcionais (podem ser ocultadas)
  const optionalColumns = ['descricao', 'email', 'website', 'whatsapp', 'horario_funcionamento', 'imagem'];

  const visibleColumns = showAllColumns 
    ? [...mainColumns, ...optionalColumns]
    : mainColumns;

  const getColumnLabel = (column: string) => {
    const labels: Record<string, string> = {
      nome: 'Nome',
      categoria: 'Categoria',
      telefone: 'Telefone',
      endereco: 'Endereço',
      descricao: 'Descrição',
      email: 'Email',
      website: 'Website',
      whatsapp: 'WhatsApp',
      horario_funcionamento: 'Horário',
      imagem: 'Imagem'
    };
    return labels[column] || column;
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-400 mr-2" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Prévia dos Dados
              </h3>
              <p className="text-sm text-gray-500">
                Arquivo: {fileName} • {data.length} empresas encontradas
              </p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAllColumns(!showAllColumns)}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAllColumns ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Ocultar colunas opcionais
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Mostrar todas as colunas
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center text-sm text-gray-600">
          <Users className="h-4 w-4 mr-2" />
          <span className="font-medium">{data.length}</span>
          <span className="ml-1">empresas serão importadas</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {visibleColumns.map((column) => (
                <th
                  key={column}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {getColumnLabel(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentData.map((empresa, index) => (
              <tr key={startIndex + index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {startIndex + index + 1}
                </td>
                {visibleColumns.map((column) => (
                  <td
                    key={column}
                    className="px-4 py-3 text-sm text-gray-900"
                    title={empresa[column as keyof ParsedEmpresa] || ''}
                  >
                    <div className="max-w-xs">
                      {column === 'website' || column === 'imagem' ? (
                        empresa[column as keyof ParsedEmpresa] ? (
                          <a
                            href={empresa[column as keyof ParsedEmpresa]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                          >
                            {truncateText(empresa[column as keyof ParsedEmpresa] || '', 30)}
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )
                      ) : (
                        <span className={column === 'descricao' ? 'text-xs' : ''}>
                          {truncateText(empresa[column as keyof ParsedEmpresa] || '')}
                        </span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Mostrando {startIndex + 1} a {Math.min(endIndex, data.length)} de {data.length} empresas
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center px-2 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Importando...
              </>
            ) : (
              'Confirmar Importação'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
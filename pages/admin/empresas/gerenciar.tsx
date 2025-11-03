import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useToastActions } from '../../../components/admin/ToastProvider';
import { supabase } from '../../../lib/supabase';
import { 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  Plus,
  Calendar,
  Tag,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';

interface Empresa {
  id: string;
  name: string;
  category: string;
  phone: string;
  address: string;
  description: string;
  email?: string;
  website?: string;
  location?: string;
  image?: string;
  imported_at?: string;
  import_batch_id?: string;
  plano?: string;
  created_at: string;
  updated_at: string;
  ativo?: boolean;
  featured?: boolean;
  plan_type?: string;
}

interface ImportBatch {
  id: string;
  filename: string;
  created_at: string;
}

export default function GerenciarEmpresas() {
  const router = useRouter();
  const { showToast } = useToastActions();
  
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [importBatches, setImportBatches] = useState<ImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmpresa, setSelectedEmpresa] = useState<Empresa | null>(null);
  
  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [importedOnlyFilter, setImportedOnlyFilter] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Get auth token from Supabase session
  const getAuthToken = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  };

  // Load empresas
  const loadEmpresas = async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString()
      });

      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('categoria', categoryFilter);
      if (batchFilter) params.append('batch_id', batchFilter);
      if (importedOnlyFilter) params.append('imported_only', 'true');

      const token = await getAuthToken();
      const response = await fetch(`/api/admin/empresas?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao carregar empresas');
      }

      setEmpresas(result.empresas);
      setCurrentPage(result.pagination.page);
      setTotalPages(result.pagination.totalPages);
      setTotalItems(result.pagination.totalItems);

    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      showToast('Erro ao carregar empresas', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Load import batches for filter
  const loadImportBatches = async () => {
    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/empresas/import-history?limit=100', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        setImportBatches(result.imports);
      }
    } catch (error) {
      console.error('Erro ao carregar lotes:', error);
    }
  };

  // Delete empresa
  const handleDeleteEmpresa = async (empresaId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) {
      return;
    }

    try {
      const token = await getAuthToken();
      const response = await fetch(`/api/admin/empresas/${empresaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Erro ao excluir empresa');
      }

      showToast('Empresa excluída com sucesso', 'success');
      loadEmpresas(currentPage);

    } catch (error) {
      console.error('Erro ao excluir empresa:', error);
      showToast(error instanceof Error ? error.message : 'Erro ao excluir empresa', 'error');
    }
  };

  // Export empresas
  const handleExportEmpresas = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('categoria', categoryFilter);
      if (batchFilter) params.append('batch_id', batchFilter);
      if (importedOnlyFilter) params.append('imported_only', 'true');

      const token = await getAuthToken();
      const response = await fetch(`/api/admin/empresas/export?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Erro ao exportar empresas');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `empresas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast('Empresas exportadas com sucesso', 'success');

    } catch (error) {
      console.error('Erro ao exportar:', error);
      showToast('Erro ao exportar empresas', 'error');
    }
  };

  // Effects
  useEffect(() => {
    loadEmpresas();
    loadImportBatches();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmpresas(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter, batchFilter, importedOnlyFilter]);

  // Get unique categories
  const categories = Array.from(new Set(empresas.map(e => e.category))).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const truncateText = (text: string | null | undefined, maxLength: number = 50) => {
    if (!text || typeof text !== 'string') {
      return '';
    }
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/empresas')}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar para Empresas
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Gerenciar Empresas
                </h1>
                <p className="mt-2 text-gray-600">
                  Visualize e gerencie todas as empresas cadastradas no sistema
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportEmpresas}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </button>
              
              <button
                onClick={() => router.push('/admin/empresas/importar')}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Importar Empresas
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Empresas</p>
                <p className="text-2xl font-bold text-gray-900">{totalItems}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <Download className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Importadas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {empresas.filter(e => e.imported_at).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center">
              <Tag className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Categorias</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, categoria, telefone..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lote de Importação
              </label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos os lotes</option>
                {importBatches.map(batch => (
                  <option key={batch.id} value={batch.id}>
                    {batch.filename} ({formatDate(batch.created_at)})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={importedOnlyFilter}
                  onChange={(e) => setImportedOnlyFilter(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Apenas importadas
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {totalItems} empresas encontradas
            </p>
            
            <button
              onClick={() => loadEmpresas(currentPage)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Empresas Table */}
        <div className="bg-white border border-gray-200 rounded-lg">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando empresas...</p>
            </div>
          ) : empresas.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Nenhuma empresa encontrada</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Empresa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Categoria
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contato
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Data
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {empresas.map((empresa) => (
                      <tr key={empresa.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {empresa.name || 'Nome não informado'}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {truncateText(empresa.address, 40) || 'Endereço não informado'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            {empresa.category || 'Sem categoria'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Phone className="h-3 w-3 mr-1 text-gray-400" />
                              {empresa.phone || 'Telefone não informado'}
                            </div>
                            {empresa.email && (
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1 text-gray-400" />
                                {truncateText(empresa.email, 25)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {empresa.imported_at ? (
                            <div className="flex items-center">
                              <Download className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-xs text-green-600">Importada</span>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Plus className="h-4 w-4 text-blue-500 mr-2" />
                              <span className="text-xs text-blue-600">Manual</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>
                            <div>{formatDate(empresa.created_at)}</div>
                            {empresa.imported_at && (
                              <div className="text-xs text-gray-400">
                                Imp: {formatDate(empresa.imported_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedEmpresa(empresa)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => router.push(`/admin/empresas/editar/${empresa.id}`)}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmpresa(empresa.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
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
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} empresas
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => loadEmpresas(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      <span className="text-sm text-gray-700">
                        Página {currentPage} de {totalPages}
                      </span>
                      
                      <button
                        onClick={() => loadEmpresas(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Empresa Details Modal */}
        {selectedEmpresa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalhes da Empresa
                  </h3>
                  <button
                    onClick={() => setSelectedEmpresa(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedEmpresa.name || 'Nome não informado'}</h4>
                  <p className="text-sm text-gray-600">{selectedEmpresa.category || 'Sem categoria'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone</label>
                    <p className="text-sm text-gray-900">{selectedEmpresa.phone || 'Telefone não informado'}</p>
                  </div>
                  
                  {selectedEmpresa.email && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.email}</p>
                    </div>
                  )}
                  
                  {selectedEmpresa.website && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <a href={selectedEmpresa.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:text-blue-800">
                        {selectedEmpresa.website}
                      </a>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Endereço</label>
                  <p className="text-sm text-gray-900">{selectedEmpresa.address || 'Endereço não informado'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <p className="text-sm text-gray-900">{selectedEmpresa.description || 'Descrição não informada'}</p>
                </div>

                {selectedEmpresa.imported_at && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Download className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-green-800">Empresa Importada</p>
                        <p className="text-sm text-green-600">
                          Importada em {formatDate(selectedEmpresa.imported_at)}
                          {selectedEmpresa.import_batch_id && ` • Lote: ${selectedEmpresa.import_batch_id}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setSelectedEmpresa(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Fechar
                  </button>
                  <button
                    onClick={() => {
                      router.push(`/admin/empresas/editar/${selectedEmpresa.id}`);
                      setSelectedEmpresa(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
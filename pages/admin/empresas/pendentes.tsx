import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Phone, 
  Mail, 
  MapPin, 
  Globe, 
  MessageCircle,
  Calendar,
  User,
  Building2,
  AlertCircle,
  Filter,
  Search
} from 'lucide-react'
import AdminLayout from '../../../components/admin/AdminLayout'
import { createServerSupabaseClient } from '../../../lib/supabase'
import { supabase } from '../../../lib/supabase'
import { useToastActions } from '../../../components/admin/ToastProvider'

interface EmpresaPendente {
  id: string
  name: string
  description: string
  category: string
  phone: string
  email?: string
  website?: string
  address: string
  whatsapp?: string
  horario_funcionamento_dias?: string
  horario_funcionamento_horario?: string
  facebook?: string
  instagram?: string
  maps?: string
  user_source?: string
  cidade?: string
  form_submission_id?: string
  submitted_at: string
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

interface EmpresasPendentesPageProps {
  empresasPendentes: EmpresaPendente[]
}

export default function EmpresasPendentesPage({ empresasPendentes: initialEmpresas }: EmpresasPendentesPageProps) {
  const [empresas, setEmpresas] = useState<EmpresaPendente[]>(initialEmpresas)
  const [loading, setLoading] = useState(false)
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaPendente | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToastActions()
  const router = useRouter()

  // Filtrar empresas
  const filteredEmpresas = empresas.filter(empresa => {
    const matchesFilter = filter === 'all' || empresa.status === filter
    const matchesSearch = empresa.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         empresa.cidade?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  // Função para aprovar empresa
  const handleApprove = async (empresaId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ 
          status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', empresaId)

      if (error) throw error

      setEmpresas(prev => 
        prev.map(emp => 
          emp.id === empresaId 
            ? { ...emp, status: 'approved' as const }
            : emp
        )
      )

      showToast('Empresa aprovada com sucesso!', 'success')
      setSelectedEmpresa(null)
    } catch (error) {
      console.error('Erro ao aprovar empresa:', error)
      showToast('Erro ao aprovar empresa', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para rejeitar empresa
  const handleReject = async (empresaId: string) => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('empresas')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', empresaId)

      if (error) throw error

      setEmpresas(prev => 
        prev.map(emp => 
          emp.id === empresaId 
            ? { ...emp, status: 'rejected' as const }
            : emp
        )
      )

      showToast('Empresa rejeitada', 'success')
      setSelectedEmpresa(null)
    } catch (error) {
      console.error('Erro ao rejeitar empresa:', error)
      showToast('Erro ao rejeitar empresa', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Função para recarregar dados
  const refreshData = () => {
    router.replace(router.asPath)
  }

  // Função para formatar data
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  // Função para obter cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'approved': return 'text-green-600 bg-green-100'
      case 'rejected': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Função para obter ícone do status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const pendingCount = empresas.filter(e => e.status === 'pending').length
  const approvedCount = empresas.filter(e => e.status === 'approved').length
  const rejectedCount = empresas.filter(e => e.status === 'rejected').length

  return (
    <AdminLayout title="Moderação de Empresas">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Moderação de Empresas</h1>
            <p className="text-gray-600">Gerencie empresas cadastradas via Google Forms</p>
          </div>
          <button
            onClick={refreshData}
            className="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Atualizar
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendentes</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejeitadas</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{empresas.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="pending">Pendentes</option>
                <option value="approved">Aprovadas</option>
                <option value="rejected">Rejeitadas</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 flex-1">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, categoria ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredEmpresas.length === 0 ? (
            <div className="p-8 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma empresa encontrada</h3>
              <p className="text-gray-600">
                {filter === 'pending' 
                  ? 'Não há empresas pendentes de aprovação no momento.'
                  : 'Tente ajustar os filtros ou termos de busca.'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredEmpresas.map((empresa) => (
                <div key={empresa.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{empresa.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(empresa.status)}`}>
                          {getStatusIcon(empresa.status)}
                          <span className="ml-1 capitalize">{empresa.status === 'pending' ? 'Pendente' : empresa.status === 'approved' ? 'Aprovada' : 'Rejeitada'}</span>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-600">
                            <Building2 className="w-4 h-4 mr-2" />
                            <span className="font-medium">Categoria:</span>
                            <span className="ml-1">{empresa.category}</span>
                          </div>
                          
                          {empresa.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="w-4 h-4 mr-2" />
                              <span className="font-medium">Telefone:</span>
                              <span className="ml-1">{empresa.phone}</span>
                            </div>
                          )}

                          {empresa.email && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              <span className="font-medium">Email:</span>
                              <span className="ml-1">{empresa.email}</span>
                            </div>
                          )}

                          {empresa.cidade && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span className="font-medium">Cidade:</span>
                              <span className="ml-1">{empresa.cidade}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          {empresa.whatsapp && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MessageCircle className="w-4 h-4 mr-2" />
                              <span className="font-medium">WhatsApp:</span>
                              <span className="ml-1">{empresa.whatsapp}</span>
                            </div>
                          )}

                          {empresa.website && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Globe className="w-4 h-4 mr-2" />
                              <span className="font-medium">Website:</span>
                              <span className="ml-1">{empresa.website}</span>
                            </div>
                          )}

                          {empresa.user_source && (
                            <div className="flex items-center text-sm text-gray-600">
                              <User className="w-4 h-4 mr-2" />
                              <span className="font-medium">Fonte:</span>
                              <span className="ml-1">{empresa.user_source}</span>
                            </div>
                          )}

                          <div className="flex items-center text-sm text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="font-medium">Enviado em:</span>
                            <span className="ml-1">{formatDate(empresa.submitted_at)}</span>
                          </div>
                        </div>
                      </div>

                      {empresa.description && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Descrição:</span> {empresa.description}
                          </p>
                        </div>
                      )}

                      {empresa.address && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Endereço:</span> {empresa.address}
                          </p>
                        </div>
                      )}

                      {(empresa.horario_funcionamento_dias || empresa.horario_funcionamento_horario) && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Horário:</span> 
                            {empresa.horario_funcionamento_dias && ` ${empresa.horario_funcionamento_dias}`}
                            {empresa.horario_funcionamento_horario && ` - ${empresa.horario_funcionamento_horario}`}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-4">
                      <button
                        onClick={() => setSelectedEmpresa(empresa)}
                        className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Detalhes
                      </button>

                      {empresa.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(empresa.id)}
                            disabled={loading}
                            className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovar
                          </button>

                          <button
                            onClick={() => handleReject(empresa.id)}
                            disabled={loading}
                            className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Detalhes */}
        {selectedEmpresa && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Detalhes da Empresa</h2>
                  <button
                    onClick={() => setSelectedEmpresa(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{selectedEmpresa.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedEmpresa.status)}`}>
                      {getStatusIcon(selectedEmpresa.status)}
                      <span className="ml-1 capitalize">{selectedEmpresa.status === 'pending' ? 'Pendente' : selectedEmpresa.status === 'approved' ? 'Aprovada' : 'Rejeitada'}</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.category}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.cidade || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.phone}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.whatsapp || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.email || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.website || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.facebook || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.instagram || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.user_source || 'Não informado'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Data de Envio</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedEmpresa.submitted_at)}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                    <p className="text-sm text-gray-900">{selectedEmpresa.address}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <p className="text-sm text-gray-900">{selectedEmpresa.description}</p>
                  </div>

                  {(selectedEmpresa.horario_funcionamento_dias || selectedEmpresa.horario_funcionamento_horario) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Horário de Funcionamento</label>
                      <p className="text-sm text-gray-900">
                        {selectedEmpresa.horario_funcionamento_dias && selectedEmpresa.horario_funcionamento_dias}
                        {selectedEmpresa.horario_funcionamento_horario && ` - ${selectedEmpresa.horario_funcionamento_horario}`}
                      </p>
                    </div>
                  )}

                  {selectedEmpresa.maps && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Google Maps</label>
                      <p className="text-sm text-gray-900">{selectedEmpresa.maps}</p>
                    </div>
                  )}

                  {selectedEmpresa.form_submission_id && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ID da Submissão</label>
                      <p className="text-sm text-gray-900 font-mono">{selectedEmpresa.form_submission_id}</p>
                    </div>
                  )}
                </div>

                {selectedEmpresa.status === 'pending' && (
                  <div className="flex space-x-3 mt-6 pt-4 border-t">
                    <button
                      onClick={() => handleApprove(selectedEmpresa.id)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Aprovar Empresa
                    </button>

                    <button
                      onClick={() => handleReject(selectedEmpresa.id)}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Rejeitar Empresa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabase = createServerSupabaseClient(ctx)

    // Buscar todas as empresas com status de moderação
    const { data: empresasPendentes, error } = await supabase
      .from('empresas')
      .select(`
        id,
        name,
        description,
        category,
        phone,
        email,
        website,
        address,
        whatsapp,
        horario_funcionamento_dias,
        horario_funcionamento_horario,
        facebook,
        instagram,
        maps,
        user_source,
        cidade,
        form_submission_id,
        submitted_at,
        status,
        created_at
      `)
      .in('status', ['pending', 'approved', 'rejected'])
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar empresas pendentes:', error)
      return {
        props: {
          empresasPendentes: []
        }
      }
    }

    return {
      props: {
        empresasPendentes: empresasPendentes || []
      }
    }
  } catch (error) {
    console.error('Erro no getServerSideProps:', error)
    return {
      props: {
        empresasPendentes: []
      }
    }
  }
}
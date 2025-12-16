import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { Plus, Edit, Trash2, Calendar as CalendarIcon, MapPin, Clock, RefreshCw } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import EventoWizard from '../../components/admin/eventos/EventoWizard'
import { createServerSupabaseClient, supabase, Evento } from '../../lib/supabase'
import { formatDate } from '../../lib/formatters'

interface EventosPageProps {
  initialEventos: Evento[]
}

export default function EventosPage({ initialEventos }: EventosPageProps) {
  const [eventos, setEventos] = useState<Evento[]>(initialEventos)
  const [showWizard, setShowWizard] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(false)

  const loadEventos = async () => {
    if (!supabase) return
    setLoading(true)

    const { data } = await supabase
      .from('eventos')
      .select('*')
      .order('data_hora', { ascending: true })

    if (data) {
      setEventos(data)
    }
    setLoading(false)
  }

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento)
    setShowWizard(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }

    try {
      const { error } = await supabase
        .from('eventos')
        .delete()
        .eq('id', id)

      if (error) throw error

      await loadEventos()
    } catch (error) {
      console.error('Erro ao excluir evento:', error)
      alert('Erro ao excluir evento')
    }
  }

  const handleCloseWizard = () => {
    setShowWizard(false)
    setEditingEvento(null)
  }

  const handleSuccess = () => {
    loadEventos()
  }

  const formatDateTime = (dateTime: string) => {
    return formatDate(dateTime, { includeTime: true })
  }

  const isEventPast = (dateTime: string) => {
    return new Date(dateTime) < new Date()
  }

  const eventosAtivos = eventos.filter(e => !isEventPast(e.data_hora))
  const eventosPassados = eventos.filter(e => isEventPast(e.data_hora))

  return (
    <AdminLayout title="Gerenciar Eventos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
            <p className="text-gray-500 mt-1">
              {eventosAtivos.length} ativo{eventosAtivos.length !== 1 ? 's' : ''} • {eventosPassados.length} finalizado{eventosPassados.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadEventos}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Evento
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total de Eventos</p>
                <p className="text-3xl font-bold">{eventos.length}</p>
              </div>
              <CalendarIcon className="w-10 h-10 text-purple-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Eventos Ativos</p>
                <p className="text-3xl font-bold">{eventosAtivos.length}</p>
              </div>
              <Clock className="w-10 h-10 text-green-200" />
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-200 text-sm">Finalizados</p>
                <p className="text-3xl font-bold">{eventosPassados.length}</p>
              </div>
              <CalendarIcon className="w-10 h-10 text-gray-300" />
            </div>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Lista de Eventos</h3>
          </div>

          {eventos.length === 0 ? (
            <div className="text-center py-16">
              <CalendarIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h4 className="text-lg font-medium text-gray-500 mb-2">Nenhum evento cadastrado</h4>
              <p className="text-gray-400 mb-4">Clique em "Novo Evento" para começar</p>
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100"
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar primeiro evento
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Evento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data/Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Local
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {eventos.map((evento) => (
                    <tr key={evento.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {evento.imagem ? (
                            <img
                              className="h-12 w-12 rounded-lg object-cover mr-4"
                              src={evento.imagem}
                              alt={evento.titulo}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center mr-4">
                              <CalendarIcon className="w-6 h-6 text-white" />
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {evento.titulo}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {evento.descricao}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2.5 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                          {evento.tipo}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="h-4 w-4 mr-1.5 text-purple-600" />
                          {formatDateTime(evento.data_hora)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1.5 text-gray-400" />
                          {evento.local}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${isEventPast(evento.data_hora)
                            ? 'bg-gray-100 text-gray-700'
                            : 'bg-green-100 text-green-700'
                          }`}>
                          {isEventPast(evento.data_hora) ? 'Finalizado' : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(evento)}
                            className="p-2 text-purple-600 hover:text-purple-900 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(evento.id)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Excluir"
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
          )}
        </div>
      </div>

      {/* Wizard Modal */}
      <EventoWizard
        isOpen={showWizard}
        onClose={handleCloseWizard}
        onSuccess={handleSuccess}
        editingEvento={editingEvento}
      />
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabase = createServerSupabaseClient(ctx)

    // Buscar eventos
    const { data: eventos } = await supabase
      .from('eventos')
      .select('*')
      .order('data_hora', { ascending: true })

    return {
      props: {
        initialEventos: eventos || [],
      },
    }
  } catch (error) {
    // Durante o build, as variáveis de ambiente podem não estar disponíveis
    console.warn('Supabase not configured during build time:', error)
    return {
      props: {
        initialEventos: [],
      },
    }
  }
}
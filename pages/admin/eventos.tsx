import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Calendar as CalendarIcon, MapPin, Clock } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { createServerSupabaseClient, supabase, Evento } from '../../lib/supabase'

const eventoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  tipo: z.string().min(1, 'Tipo é obrigatório'),
  data_hora: z.string().min(1, 'Data e hora são obrigatórias'),
  local: z.string().min(1, 'Local é obrigatório'),
  imagem: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
})

type EventoForm = z.infer<typeof eventoSchema>

interface EventosPageProps {
  initialEventos: Evento[]
}

const tiposEvento = [
  'Show',
  'Teatro',
  'Palestra',
  'Workshop',
  'Feira',
  'Festival',
  'Exposição',
  'Esporte',
  'Religioso',
  'Educacional',
  'Outros'
]

export default function EventosPage({ initialEventos }: EventosPageProps) {
  const [eventos, setEventos] = useState<Evento[]>(initialEventos)
  const [showForm, setShowForm] = useState(false)
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EventoForm>({
    resolver: zodResolver(eventoSchema),
  })

  const watchedImagem = watch('imagem')

  const loadEventos = async () => {
    const { data } = await supabase
      .from('eventos')
      .select('*')
      .order('data_hora', { ascending: true })
    
    if (data) {
      setEventos(data)
    }
  }

  const onSubmit = async (data: EventoForm) => {
    setLoading(true)
    
    try {
      if (editingEvento) {
        // Atualizar evento existente
        const { error } = await supabase
          .from('eventos')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingEvento.id)
        
        if (error) throw error
      } else {
        // Criar novo evento
        const { error } = await supabase
          .from('eventos')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
        
        if (error) throw error
      }
      
      await loadEventos()
      handleCloseForm()
    } catch (error) {
      console.error('Erro ao salvar evento:', error)
      alert('Erro ao salvar evento')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento)
    reset({
      titulo: evento.titulo,
      tipo: evento.tipo,
      data_hora: evento.data_hora,
      local: evento.local,
      imagem: evento.imagem || '',
      descricao: evento.descricao,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return
    
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

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingEvento(null)
    reset({
      titulo: '',
      tipo: '',
      data_hora: '',
      local: '',
      imagem: '',
      descricao: '',
    })
  }

  const formatDateTime = (dateTime: string) => {
    return new Date(dateTime).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isEventPast = (dateTime: string) => {
    return new Date(dateTime) < new Date()
  }

  return (
    <AdminLayout title="Gerenciar Eventos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Evento
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <FormCard title={editingEvento ? 'Editar Evento' : 'Novo Evento'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    {...register('titulo')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Título do evento"
                  />
                  {errors.titulo && (
                    <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    {...register('tipo')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="">Selecione um tipo</option>
                    {tiposEvento.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                  {errors.tipo && (
                    <p className="mt-1 text-sm text-red-600">{errors.tipo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data e Hora *
                  </label>
                  <input
                    {...register('data_hora')}
                    type="datetime-local"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  {errors.data_hora && (
                    <p className="mt-1 text-sm text-red-600">{errors.data_hora.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Local *
                  </label>
                  <input
                    {...register('local')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    placeholder="Local do evento"
                  />
                  {errors.local && (
                    <p className="mt-1 text-sm text-red-600">{errors.local.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem
                </label>
                <ImageUploader
                  value={watchedImagem}
                  onChange={(url) => setValue('imagem', url || '')}
                  bucket="eventos"
                  folder="images"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  {...register('descricao')}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Descrição detalhada do evento"
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingEvento ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </FormCard>
        )}

        {/* Lista de Eventos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lista de Eventos</h3>
          </div>
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
                  <tr key={evento.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {evento.imagem && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-4"
                            src={evento.imagem}
                            alt={evento.titulo}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {evento.titulo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {evento.descricao.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {evento.tipo}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <Clock className="h-4 w-4 mr-1 text-purple-600" />
                        {formatDateTime(evento.data_hora)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {evento.local}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        isEventPast(evento.data_hora)
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {isEventPast(evento.data_hora) ? 'Finalizado' : 'Ativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(evento)}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(evento.id)}
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
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const supabase = createServerSupabaseClient()
  
  // Verificar autenticação
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return {
      redirect: {
        destination: '/admin/login',
        permanent: false,
      },
    }
  }

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
}
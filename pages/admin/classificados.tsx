import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, MapPin, DollarSign } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { createServerSupabaseClient, supabase, Classificado } from '../../lib/supabase'
import { formatCurrency } from '../../lib/formatters'

const classificadoSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  preco: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  imagem: z.string().optional(),
  localizacao: z.string().min(1, 'Localização é obrigatória'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
})

type ClassificadoForm = z.infer<typeof classificadoSchema>

interface ClassificadosPageProps {
  initialClassificados: Classificado[]
}

const categorias = [
  'Veículos',
  'Imóveis',
  'Eletrônicos',
  'Móveis',
  'Roupas',
  'Esportes',
  'Livros',
  'Serviços',
  'Outros'
]

export default function ClassificadosPage({ initialClassificados }: ClassificadosPageProps) {
  const [classificados, setClassificados] = useState<Classificado[]>(initialClassificados)
  const [showForm, setShowForm] = useState(false)
  const [editingClassificado, setEditingClassificado] = useState<Classificado | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClassificadoForm>({
    resolver: zodResolver(classificadoSchema),
    defaultValues: {
      preco: 0,
    },
  })

  const watchedImagem = watch('imagem')

  const loadClassificados = async () => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('classificados')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setClassificados(data)
    }
  }

  const onSubmit = async (data: ClassificadoForm) => {
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
    setLoading(true)
    
    try {
      if (editingClassificado) {
        // Atualizar classificado existente
        const { error } = await supabase
          .from('classificados')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingClassificado.id)
        
        if (error) throw error
      } else {
        // Criar novo classificado
        const { error } = await supabase
          .from('classificados')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
        
        if (error) throw error
      }
      
      await loadClassificados()
      handleCloseForm()
    } catch (error) {
      console.error('Erro ao salvar classificado:', error)
      alert('Erro ao salvar classificado')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (classificado: Classificado) => {
    setEditingClassificado(classificado)
    reset({
      titulo: classificado.titulo,
      categoria: classificado.categoria,
      preco: classificado.preco,
      imagem: classificado.imagem || '',
      localizacao: classificado.localizacao,
      descricao: classificado.descricao,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este classificado?')) return
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
    try {
      const { error } = await supabase
        .from('classificados')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadClassificados()
    } catch (error) {
      console.error('Erro ao excluir classificado:', error)
      alert('Erro ao excluir classificado')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingClassificado(null)
    reset({
      titulo: '',
      categoria: '',
      preco: 0,
      imagem: '',
      localizacao: '',
      descricao: '',
    })
  }

  const formatPrice = (price: number) => {
    return formatCurrency(price)
  }

  return (
    <AdminLayout title="Gerenciar Classificados">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Classificados</h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Classificado
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <FormCard title={editingClassificado ? 'Editar Classificado' : 'Novo Classificado'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    {...register('titulo')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Título do classificado"
                  />
                  {errors.titulo && (
                    <p className="mt-1 text-sm text-red-600">{errors.titulo.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoria *
                  </label>
                  <select
                    {...register('categoria')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                  {errors.categoria && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço (R$) *
                  </label>
                  <input
                    {...register('preco', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                  {errors.preco && (
                    <p className="mt-1 text-sm text-red-600">{errors.preco.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Localização *
                  </label>
                  <input
                    {...register('localizacao')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Cidade, Estado"
                  />
                  {errors.localizacao && (
                    <p className="mt-1 text-sm text-red-600">{errors.localizacao.message}</p>
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
                  bucket="classificados"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Descrição detalhada do item"
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingClassificado ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </FormCard>
        )}

        {/* Lista de Classificados */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lista de Classificados</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classificados.map((classificado) => (
                  <tr key={classificado.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {classificado.imagem && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-4"
                            src={classificado.imagem}
                            alt={classificado.titulo}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {classificado.titulo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {classificado.descricao.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {classificado.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {formatPrice(classificado.preco)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {classificado.localizacao}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(classificado)}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(classificado.id)}
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabase = createServerSupabaseClient(ctx)
    
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

    // Buscar classificados
    const { data: classificados } = await supabase
      .from('classificados')
      .select('*')
      .order('created_at', { ascending: false })

    return {
      props: {
        initialClassificados: classificados || [],
      },
    }
  } catch (error) {
    // Durante o build, as variáveis de ambiente podem não estar disponíveis
    console.warn('Supabase not configured during build time:', error)
    return {
      props: {
        initialClassificados: [],
      },
    }
  }
}
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { createServerSupabaseClient, supabase, Noticia } from '../../lib/supabase'

const noticiaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória'),
  imagem: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
})

type NoticiaForm = z.infer<typeof noticiaSchema>

interface NoticiasPageProps {
  initialNoticias: Noticia[]
}

const categorias = [
  'Política',
  'Economia',
  'Esportes',
  'Cultura',
  'Saúde',
  'Educação',
  'Tecnologia',
  'Entretenimento'
]

export default function NoticiasPage({ initialNoticias }: NoticiasPageProps) {
  const [noticias, setNoticias] = useState<Noticia[]>(initialNoticias)
  const [showForm, setShowForm] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NoticiaForm>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: {
      data: new Date().toISOString().split('T')[0],
    },
  })

  const watchedImagem = watch('imagem')

  const loadNoticias = async () => {
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setNoticias(data)
    }
  }

  const onSubmit = async (data: NoticiaForm) => {
    setLoading(true)
    
    try {
      if (editingNoticia) {
        // Atualizar notícia existente
        const { error } = await supabase
          .from('noticias')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingNoticia.id)
        
        if (error) throw error
      } else {
        // Criar nova notícia
        const { error } = await supabase
          .from('noticias')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
        
        if (error) throw error
      }
      
      await loadNoticias()
      handleCloseForm()
    } catch (error) {
      console.error('Erro ao salvar notícia:', error)
      alert('Erro ao salvar notícia')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (noticia: Noticia) => {
    setEditingNoticia(noticia)
    reset({
      titulo: noticia.titulo,
      categoria: noticia.categoria,
      data: noticia.data,
      imagem: noticia.imagem || '',
      descricao: noticia.descricao,
      conteudo: noticia.conteudo,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return
    
    try {
      const { error } = await supabase
        .from('noticias')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadNoticias()
    } catch (error) {
      console.error('Erro ao excluir notícia:', error)
      alert('Erro ao excluir notícia')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingNoticia(null)
    reset({
      titulo: '',
      categoria: '',
      data: new Date().toISOString().split('T')[0],
      imagem: '',
      descricao: '',
      conteudo: '',
    })
  }

  return (
    <AdminLayout title="Gerenciar Notícias">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Notícia
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <FormCard title={editingNoticia ? 'Editar Notícia' : 'Nova Notícia'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    {...register('titulo')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Título da notícia"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    Data *
                  </label>
                  <input
                    {...register('data')}
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.data && (
                    <p className="mt-1 text-sm text-red-600">{errors.data.message}</p>
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
                  bucket="noticias"
                  folder="images"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição *
                </label>
                <textarea
                  {...register('descricao')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Breve descrição da notícia"
                />
                {errors.descricao && (
                  <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo *
                </label>
                <textarea
                  {...register('conteudo')}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Conteúdo completo da notícia"
                />
                {errors.conteudo && (
                  <p className="mt-1 text-sm text-red-600">{errors.conteudo.message}</p>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingNoticia ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </FormCard>
        )}

        {/* Lista de Notícias */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lista de Notícias</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
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
                {noticias.map((noticia) => (
                  <tr key={noticia.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {noticia.imagem && (
                          <img
                            className="h-10 w-10 rounded-lg object-cover mr-4"
                            src={noticia.imagem}
                            alt={noticia.titulo}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {noticia.titulo}
                          </div>
                          <div className="text-sm text-gray-500">
                            {noticia.descricao.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {noticia.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(noticia.data).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(noticia)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(noticia.id)}
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
  try {
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

    // Buscar notícias
    const { data: noticias } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })

    return {
      props: {
        initialNoticias: noticias || [],
      },
    }
  } catch (error) {
    // Durante o build, as variáveis de ambiente podem não estar disponíveis
    console.warn('Supabase not configured during build time:', error)
    return {
      props: {
        initialNoticias: [],
      },
    }
  }
}
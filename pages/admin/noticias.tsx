import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { createServerSupabaseClient, supabase, Noticia, Banner } from '../../lib/supabase'
import { formatDate, formatDateInput } from '../../lib/formatters'
import { useBanners } from '../../hooks/useBanners'

const noticiaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória'),
  imagem: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  banner_id: z.string().optional().transform(val => val === '' ? undefined : val),
  destaque: z.boolean().optional(),
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
  const [user, setUser] = useState<any>(null)
  const { banners } = useBanners()
  const router = useRouter()

  // Verificar autenticação
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/admin/login')
        return
      }
      setUser(session.user)
    }
    
    checkAuth()
    
    // Escutar mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/admin/login')
      } else {
        setUser(session.user)
      }
    })
    
    return () => subscription.unsubscribe()
  }, [router])

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
      data: formatDateInput(new Date()),
    },
  })

  const watchedImagem = watch('imagem')

  const loadNoticias = async () => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setNoticias(data)
    }
  }

  const onSubmit = async (data: NoticiaForm) => {
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
    setLoading(true)
    
    try {
      // Preparar dados, removendo campos vazios que devem ser null
      const preparedData = {
        ...data,
        banner_id: data.banner_id || null,
        imagem: data.imagem || null,
      }
      
      if (editingNoticia) {
        // Atualizar notícia existente
        const { error } = await supabase
          .from('noticias')
          .update({
            ...preparedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingNoticia.id)
        
        if (error) throw error
      } else {
        // Criar nova notícia
        const { error } = await supabase
          .from('noticias')
          .insert([{
            ...preparedData,
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
      banner_id: noticia.banner_id || '',
      destaque: noticia.destaque || false,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
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
      data: formatDateInput(new Date()),
      imagem: '',
      descricao: '',
      conteudo: '',
      banner_id: '',
      destaque: false,
    })
  }

  // Mostrar loading enquanto verifica autenticação
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
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
                  Banner no meio da notícia (opcional)
                </label>
                <select
                  {...register('banner_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Nenhum banner</option>
                  {banners.map((banner) => (
                    <option key={banner.id} value={banner.id}>
                      {banner.nome} - {banner.posicao}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  O banner será exibido no meio do conteúdo da notícia
                </p>
              </div>

              <div>
                <label className="flex items-center space-x-2">
                  <input
                    {...register('destaque')}
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Marcar como notícia em destaque
                  </span>
                </label>
                <p className="mt-1 text-sm text-gray-500">
                  Notícias em destaque aparecem na página inicial
                </p>
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
                    Destaque
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
                      {formatDate(noticia.data)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {noticia.destaque ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          Destaque
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Normal
                        </span>
                      )}
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

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabase = createServerSupabaseClient(ctx)

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
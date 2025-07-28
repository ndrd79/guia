import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { createServerSupabaseClient, supabase, Banner } from '../../lib/supabase'

const bannerSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  posicao: z.string().min(1, 'Posição é obrigatória'),
  imagem: z.string().min(1, 'Imagem é obrigatória'),
  link: z.string().url('Link deve ser uma URL válida').optional().or(z.literal('')),
  ativo: z.boolean(),
})

type BannerForm = z.infer<typeof bannerSchema>

interface BannersPageProps {
  initialBanners: Banner[]
}

const posicoesBanner = [
  'Header Superior',
  'Header Inferior',
  'Sidebar Direita',
  'Sidebar Esquerda',
  'Entre Conteúdo',
  'Footer',
  'Popup',
  'Banner Principal'
]

export default function BannersPage({ initialBanners }: BannersPageProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerForm>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      ativo: true,
    },
  })

  const watchedImagem = watch('imagem')

  const loadBanners = async () => {
    if (!supabase) return
    
    const { data } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setBanners(data)
    }
  }

  const onSubmit = async (data: BannerForm) => {
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
    setLoading(true)
    
    try {
      if (editingBanner) {
        // Atualizar banner existente
        const { error } = await supabase
          .from('banners')
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBanner.id)
        
        if (error) throw error
      } else {
        // Criar novo banner
        const { error } = await supabase
          .from('banners')
          .insert([{
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
        
        if (error) throw error
      }
      
      await loadBanners()
      handleCloseForm()
    } catch (error) {
      console.error('Erro ao salvar banner:', error)
      alert('Erro ao salvar banner')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    reset({
      nome: banner.nome,
      posicao: banner.posicao,
      imagem: banner.imagem,
      link: banner.link || '',
      ativo: banner.ativo,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      await loadBanners()
    } catch (error) {
      console.error('Erro ao excluir banner:', error)
      alert('Erro ao excluir banner')
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
    try {
      const { error } = await supabase
        .from('banners')
        .update({ 
          ativo: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      
      if (error) throw error
      
      await loadBanners()
    } catch (error) {
      console.error('Erro ao alterar status do banner:', error)
      alert('Erro ao alterar status do banner')
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingBanner(null)
    reset({
      nome: '',
      posicao: '',
      imagem: '',
      link: '',
      ativo: true,
    })
  }

  return (
    <AdminLayout title="Gerenciar Banners">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Banners Publicitários</h1>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Banner
          </button>
        </div>

        {/* Formulário */}
        {showForm && (
          <FormCard title={editingBanner ? 'Editar Banner' : 'Novo Banner'}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome *
                  </label>
                  <input
                    {...register('nome')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Nome do banner"
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posição *
                  </label>
                  <select
                    {...register('posicao')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selecione uma posição</option>
                    {posicoesBanner.map((posicao) => (
                      <option key={posicao} value={posicao}>
                        {posicao}
                      </option>
                    ))}
                  </select>
                  {errors.posicao && (
                    <p className="mt-1 text-sm text-red-600">{errors.posicao.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Link (opcional)
                  </label>
                  <input
                    {...register('link')}
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="https://exemplo.com"
                  />
                  {errors.link && (
                    <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Imagem *
                </label>
                <ImageUploader
                  value={watchedImagem}
                  onChange={(url) => setValue('imagem', url || '')}
                  bucket="banners"
                  folder="images"
                />
                {errors.imagem && (
                  <p className="mt-1 text-sm text-red-600">{errors.imagem.message}</p>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    {...register('ativo')}
                    type="checkbox"
                    className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                  />
                  <span className="ml-2 text-sm text-gray-700">Banner ativo</span>
                </label>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
                >
                  {loading ? 'Salvando...' : editingBanner ? 'Atualizar' : 'Criar'}
                </button>
              </div>
            </form>
          </FormCard>
        )}

        {/* Lista de Banners */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lista de Banners</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Banner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Link
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
                {banners.map((banner) => (
                  <tr key={banner.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-16 w-24 rounded-lg object-cover mr-4"
                          src={banner.imagem}
                          alt={banner.nome}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {banner.nome}
                          </div>
                          <div className="text-sm text-gray-500">
                            Criado em {new Date(banner.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                        {banner.posicao}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {banner.link ? (
                        <a
                          href={banner.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-sm text-blue-600 hover:text-blue-900"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Link
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">Sem link</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStatus(banner.id, banner.ativo)}
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          banner.ativo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        } transition-colors`}
                      >
                        {banner.ativo ? (
                          <>
                            <Eye className="h-3 w-3 mr-1" />
                            Ativo
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-3 w-3 mr-1" />
                            Inativo
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(banner.id)}
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

    // Buscar banners
    const { data: banners } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })

    return {
      props: {
        initialBanners: banners || [],
      },
    }
  } catch (error) {
    // Durante o build, as variáveis de ambiente podem não estar disponíveis
    console.warn('Supabase not configured during build time:', error)
    return {
      props: {
        initialBanners: [],
      },
    }
  }
}
import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle, AlertCircle } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { autoFormatNews } from '../../lib/text/autoFormatNews'
import Breadcrumb from '../../components/admin/Breadcrumb'
import EnhancedButton from '../../components/admin/EnhancedButton'
import SearchBar from '../../components/admin/SearchBar'
import FilterDropdowns from '../../components/admin/FilterDropdowns'
import ModernTable from '../../components/admin/ModernTable'
import Pagination from '../../components/admin/Pagination'
import ToastProvider, { useToastActions } from '../../components/admin/ToastProvider'
import StatsPanel from '../../components/admin/StatsPanel'
import PreviewModal from '../../components/admin/PreviewModal'
import { createServerSupabaseClient, supabase, Noticia, Banner } from '../../lib/supabase'
import { formatDateInput } from '../../lib/formatters'
import { useBanners } from '../../hooks/useBanners'

const noticiaSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  categoria: z.string().min(1, 'Categoria é obrigatória'),
  data: z.string().min(1, 'Data é obrigatória'),
  imagem: z.string().optional(),
  banner_id: z.string().optional(),
  destaque: z.boolean().default(false),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  conteudo: z.string().min(1, 'Conteúdo é obrigatório'),
  credito_foto: z.string().optional(),
  fonte: z.string().optional(),
})

type NoticiaFormData = z.infer<typeof noticiaSchema>

interface NoticiasPageProps {
  initialNoticias: Noticia[]
  totalItems: number
  currentPage: number
}

const categorias = [
  'Cidade',
  'Policial',
  'Política',
  'Economia',
  'Esportes',
  'Cultura',
  'Saúde',
  'Educação',
  'Tecnologia',
  'Entretenimento',
  'Segurança',
  'Meio Ambiente',
  'Turismo',
  'Agronegócios',
  'Trânsito',
  'Eventos',
  'Infraestrutura',
  'Assistência Social',
  'Justiça',
  'Clima',
  'Negócios',
  'Gastronomia'
]

const ITEMS_PER_PAGE = 10

function NoticiasAdminContent({ initialNoticias, totalItems, currentPage }: NoticiasPageProps) {
  const { showToast } = useToastActions()
  const router = useRouter()
  const [noticias, setNoticias] = useState<Noticia[]>(initialNoticias)
  const [showForm, setShowForm] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(false)

  // Sync com SSR
  useEffect(() => {
    setNoticias(initialNoticias)
  }, [initialNoticias])

  // Obter valores dos filtros da URL
  const querySearch = (router.query.search as string) || ''
  const queryCategory = (router.query.category as string) || ''
  const queryStatus = (router.query.status as string) || ''
  const queryDateStart = (router.query.dateStart as string) || ''
  const queryDateEnd = (router.query.dateEnd as string) || ''

  const [searchQuery, setSearchQuery] = useState(querySearch)

  useEffect(() => {
    setSearchQuery(querySearch)
  }, [querySearch])

  const updateFiltros = (novosFiltros: {
    search?: string
    category?: string
    status?: string
    dateStart?: string
    dateEnd?: string
    page?: number
  }) => {
    const query = { ...router.query }
    
    if (novosFiltros.search !== undefined) {
      if (novosFiltros.search) query.search = novosFiltros.search
      else delete query.search
    }
    if (novosFiltros.category !== undefined) {
      if (novosFiltros.category) query.category = novosFiltros.category
      else delete query.category
    }
    if (novosFiltros.status !== undefined) {
      if (novosFiltros.status) query.status = novosFiltros.status
      else delete query.status
    }
    if (novosFiltros.dateStart !== undefined) {
      if (novosFiltros.dateStart) query.dateStart = novosFiltros.dateStart
      else delete query.dateStart
    }
    if (novosFiltros.dateEnd !== undefined) {
      if (novosFiltros.dateEnd) query.dateEnd = novosFiltros.dateEnd
      else delete query.dateEnd
    }
    
    if (novosFiltros.page !== undefined) {
      query.page = String(novosFiltros.page)
    } else {
      delete query.page
    }

    router.push({
      pathname: router.pathname,
      query
    })
  }

  const [previewNoticia, setPreviewNoticia] = useState<Noticia | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const { banners } = useBanners()

  // Estado para controlar carregamento e erros
  const [authChecked, setAuthChecked] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  const [authSuccess, setAuthSuccess] = useState(true)

  const filteredAndPaginatedNoticias = useMemo(() => {
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    return {
      items: noticias,
      totalItems,
      totalPages
    }
  }, [noticias, totalItems])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NoticiaFormData>({
    resolver: zodResolver(noticiaSchema),
    defaultValues: {
      data: formatDateInput(new Date()),
    },
  })

  // Adicionar os watches necessários
  const watchedImagem = watch('imagem')
  const watchedTitulo = watch('titulo')
  const watchedDescricao = watch('descricao')
  const watchedConteudo = watch('conteudo')
  
  // Função para atualizar o conteúdo reescrito pela IA
  const handleRewrittenContent = (rewrittenContent: { title: string; subtitle: string; content: string }) => {
    setValue('titulo', rewrittenContent.title)
    setValue('descricao', rewrittenContent.subtitle)
    setValue('conteudo', rewrittenContent.content)
  }

  const loadNoticias = async () => {
    router.replace(router.asPath)
  }

  const onSubmit = async (data: NoticiaFormData) => {
    setLoading(true)
    try {
      // Obter token da sessão para autenticação da API admin
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        showToast('Sessão expirada. Faça login novamente.', 'error')
        router.replace('/admin/login')
        return
      }

      const payload = {
        ...data,
        banner_id: data.banner_id || null,
        imagem: data.imagem || null,
        destaque: data.destaque || false,
      }

      const endpoint = '/api/admin/noticias'
      const method = editingNoticia ? 'PUT' : 'POST'
      const body = editingNoticia ? { id: editingNoticia.id, ...payload } : payload

      const resp = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(body),
      })

      if (!resp.ok) {
        const json = await resp.json().catch(() => ({ error: resp.statusText }))
        throw new Error(json.error || `Erro ${resp.status}`)
      }

      showToast(editingNoticia ? 'Notícia atualizada com sucesso!' : 'Notícia criada com sucesso!', 'success')
      await loadNoticias()
      handleCloseForm()
    } catch (error: any) {
      console.error('Erro ao salvar notícia:', error)
      const message = error?.message || 'Erro ao salvar notícia'
      showToast(message, 'error')
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
      credito_foto: noticia.credito_foto || '',
      fonte: noticia.fonte || '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta notícia?')) return
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        showToast('Sessão expirada. Faça login novamente.', 'error')
        router.replace('/admin/login')
        return
      }

      const resp = await fetch(`/api/admin/noticias?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!resp.ok) {
        const json = await resp.json().catch(() => ({ error: resp.statusText }))
        throw new Error(json.error || `Erro ${resp.status}`)
      }

      await loadNoticias()
      showToast('Notícia excluída com sucesso!', 'success')
    } catch (error: any) {
      console.error('Erro ao excluir notícia:', error)
      const message = error?.message || 'Erro ao excluir notícia'
      showToast(message, 'error')
    }
  }

  const handleToggleFeature = async (noticia: Noticia) => {
    if (!supabase) {
      showToast('Sistema não está configurado', 'error')
      return
    }
    
    try {
      const newDestaqueValue = !noticia.destaque

      // Se está marcando como destaque, desmarcar outras primeiro
      if (newDestaqueValue) {
        await supabase
          .from('noticias')
          .update({ destaque: false })
          .neq('id', noticia.id)
      }

      // Atualizar a notícia atual
      const { error } = await supabase
        .from('noticias')
        .update({ destaque: newDestaqueValue })
        .eq('id', noticia.id)

      if (error) throw error

      // Atualizar estado local
      setNoticias(prev => prev.map(n => 
        n.id === noticia.id 
          ? { ...n, destaque: newDestaqueValue }
          : newDestaqueValue ? { ...n, destaque: false } : n
      ))

      showToast(
        newDestaqueValue ? 'Notícia marcada como destaque!' : 'Destaque removido!', 
        'success'
      )
    } catch (error) {
      console.error('Erro ao alterar destaque:', error)
      showToast('Erro ao alterar destaque', 'error')
    }
  }

  const handleView = (noticia: Noticia) => {
    const url = `/noticias/${noticia.slug || noticia.id}`
    window.open(url, '_blank')
  }

  const handlePreview = (noticia: Noticia) => {
    setPreviewNoticia(noticia)
    setShowPreview(true)
  }

  const handleToggleStatus = async (noticia: Noticia) => {
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }
    
    try {
      const newStatus = noticia.workflow_status === 'published' ? 'draft' : 'published'
      const { error } = await supabase
        .from('noticias')
        .update({ 
          workflow_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', noticia.id)
      
      if (error) throw error
      
      await loadNoticias()
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert('Erro ao alterar status')
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

  // Os filtros e paginação agora são disparados via updateFiltros e refletem na URL



  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Notícias', href: '/admin/noticias' },
    { label: 'Lista' }
  ]

  // Renderizar estados de carregamento e erro
  if (!authChecked) {
    return (
      <AdminLayout title="Gerenciar Notícias">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Verificando autenticação...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (authError) {
    return (
      <AdminLayout title="Gerenciar Notícias">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="text-red-600 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Erro de Autenticação</h3>
            <p className="text-red-600 mb-4">{authError}</p>
            <div className="space-y-2">
              <button
                onClick={() => router.push('/admin/login')}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Fazer Login
              </button>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-md transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Gerenciar Notícias">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
            {authSuccess && (
              <p className="text-sm text-green-600 mt-1">✅ Autenticação verificada com sucesso</p>
            )}
          </div>
          <EnhancedButton
            onClick={() => setShowForm(true)}
            icon={PlusCircle}
          >
            Nova Notícia
          </EnhancedButton>
        </div>

        {/* Statistics Panel */}
        {!showForm && <StatsPanel news={noticias} />}

        {/* Search and Filters */}
        {!showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4 space-y-4 lg:space-y-0">
                <div className="flex-1">
                  <SearchBar onSearch={(query) => updateFiltros({ search: query })} />
                </div>
              </div>
              
              <FilterDropdowns
                categories={categorias}
                selectedCategory={queryCategory}
                selectedStatus={queryStatus}
                dateStart={queryDateStart}
                dateEnd={queryDateEnd}
                onCategoryChange={(cat) => updateFiltros({ category: cat })}
                onStatusChange={(status) => updateFiltros({ status })}
                onDateStartChange={(ds) => updateFiltros({ dateStart: ds })}
                onDateEndChange={(de) => updateFiltros({ dateEnd: de })}
              />
            </div>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <FormCard 
            title={editingNoticia ? 'Editar Notícia' : 'Nova Notícia'}
            showForm={false}
          >
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
                  showLibraryButton={true}
                  useNewMediaAPI={true}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Crédito da Foto
                </label>
                <input
                  {...register('credito_foto')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nome do fotógrafo ou fonte da imagem"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fonte da Notícia
                </label>
                <input
                  {...register('fonte')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: Assessoria de Imprensa, Entrevista, etc."
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
                <div className="mt-3">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={async () => {
                      try {
                        const category = watch('categoria')
                        const resp = await fetch('/api/news/paraphrase', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            title: watchedTitulo,
                            content: watchedConteudo,
                            category
                          })
                        })
                        const json = await resp.json()
                        if (!json?.success) throw new Error(json?.error || 'Falha ao reescrever notícia')
                        const p = json.paraphrased
                        const formatted = json.formatted
                        if (p?.title) setValue('titulo', p.title)
                        if (formatted?.dek) setValue('descricao', formatted.dek)
                        const plain = Array.isArray(formatted?.sections)
                          ? formatted.sections.map((s: any) => s.body.join(' ')).join('\n\n')
                          : (formatted?.html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() || p.content
                        setValue('conteudo', plain)
                        showToast('Notícia reescrita com sucesso', 'success')
                      } catch (e: any) {
                        showToast(e?.message || 'Erro ao reescrever notícia', 'error')
                      }
                    }}
                  >
                    Reescrever notícia
                  </button>
                </div>
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

        {/* Modern Table with all features */}
        {!showForm && (
          <>
            <ModernTable
              noticias={filteredAndPaginatedNoticias.items}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleFeature={handleToggleFeature}
              onView={handleView}
              onToggleStatus={handleToggleStatus}
              onPreview={handlePreview}
            />
            
            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={filteredAndPaginatedNoticias.totalPages}
              totalItems={filteredAndPaginatedNoticias.totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={(page) => updateFiltros({ page })}
            />
          </>
        )}

        {/* Preview Modal */}
        <PreviewModal
          news={previewNoticia}
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
        />
       </div>
     </AdminLayout>
  )
}

export default function NoticiasAdmin({ initialNoticias, totalItems, currentPage }: NoticiasPageProps) {
  return (
    <ToastProvider>
      <NoticiasAdminContent initialNoticias={initialNoticias} totalItems={totalItems} currentPage={currentPage} />
    </ToastProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const page = Number(ctx.query.page) || 1
  const limit = 10
  const from = (page - 1) * limit
  const to = from + limit - 1

  const search = (ctx.query.search as string) || ''
  const category = (ctx.query.category as string) || ''
  const status = (ctx.query.status as string) || ''
  const dateStart = (ctx.query.dateStart as string) || ''
  const dateEnd = (ctx.query.dateEnd as string) || ''

  try {
    const supabase = createServerSupabaseClient(ctx)
    let query = supabase
      .from('noticias')
      .select('id, titulo, descricao, data, imagem, categoria, destaque, workflow_status, created_at, banner_id, credito_foto, fonte, conteudo, slug', { count: 'exact' })

    if (search) {
      query = query.or(`titulo.ilike.%${search}%,descricao.ilike.%${search}%,conteudo.ilike.%${search}%`)
    }

    if (category) {
      query = query.eq('categoria', category)
    }

    if (status === 'destaque') {
      query = query.eq('destaque', true)
    } else if (status === 'normal') {
      query = query.eq('destaque', false)
    }

    if (dateStart) {
      query = query.gte('data', dateStart)
    }
    if (dateEnd) {
      query = query.lte('data', dateEnd)
    }

    const { data: noticias, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    return {
      props: {
        initialNoticias: noticias || [],
        totalItems: count || 0,
        currentPage: page,
      },
    }
  } catch (error) {
    console.warn('Error loading noticias in SSR:', error)
    return {
      props: {
        initialNoticias: [],
        totalItems: 0,
        currentPage: 1,
      },
    }
  }
}

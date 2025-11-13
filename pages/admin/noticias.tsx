import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/router'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircle } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import AINewsRewriter from '../../components/admin/AINewsRewriter'
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
})

type NoticiaFormData = z.infer<typeof noticiaSchema>

interface NoticiasPageProps {
  initialNoticias: Noticia[]
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

function NoticiasAdminContent({ initialNoticias }: NoticiasPageProps) {
  const { showToast } = useToastActions()
  const router = useRouter()
  const [noticias, setNoticias] = useState<Noticia[]>(initialNoticias)
  const [showForm, setShowForm] = useState(false)
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Filter and search states
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [previewNoticia, setPreviewNoticia] = useState<Noticia | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  
  const { banners } = useBanners()

  // Guarda de autenticação client-side
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) {
          showToast('Faça login para acessar o painel de notícias.', 'error')
          router.replace('/admin/login')
          return
        }
        // Verificar perfil admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single()
        if (!profile || profile.role !== 'admin') {
          showToast('Acesso restrito a administradores.', 'error')
          router.replace('/admin/login?error=unauthorized')
        }
      } catch (e) {
        // Em caso de erro de sessão, redirecionar para login
        router.replace('/admin/login')
      }
    }
    checkAuth()
  }, [router, showToast])

  // Filter and paginate noticias
  const filteredAndPaginatedNoticias = useMemo(() => {
    let filtered = noticias.filter(noticia => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!noticia.titulo.toLowerCase().includes(query) &&
            !noticia.descricao.toLowerCase().includes(query) &&
            !noticia.conteudo.toLowerCase().includes(query)) {
          return false
        }
      }
      
      // Category filter
      if (selectedCategory && noticia.categoria !== selectedCategory) {
        return false
      }
      
      // Status filter
      if (selectedStatus === 'destaque' && !noticia.destaque) {
        return false
      }
      if (selectedStatus === 'normal' && noticia.destaque) {
        return false
      }
      
      // Date range filter
      if (dateStart && new Date(noticia.data) < new Date(dateStart)) {
        return false
      }
      if (dateEnd && new Date(noticia.data) > new Date(dateEnd)) {
        return false
      }
      
      return true
    })

    const totalItems = filtered.length
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    const paginatedItems = filtered.slice(startIndex, endIndex)

    return {
      items: paginatedItems,
      totalItems,
      totalPages
    }
  }, [noticias, searchQuery, selectedCategory, selectedStatus, dateStart, dateEnd, currentPage])

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
    if (!supabase) return
    
    const { data } = await supabase
      .from('noticias')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      setNoticias(data)
    }
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

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query)
    setCurrentPage(1) // Reset to first page when searching
  }, [])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, selectedStatus, dateStart, dateEnd])



  const breadcrumbItems = [
    { label: 'Admin', href: '/admin' },
    { label: 'Notícias', href: '/admin/noticias' },
    { label: 'Lista' }
  ]

  return (
    <AdminLayout title="Gerenciar Notícias">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
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
                  <SearchBar onSearch={handleSearch} />
                </div>
              </div>
              
              <FilterDropdowns
                categories={categorias}
                selectedCategory={selectedCategory}
                selectedStatus={selectedStatus}
                dateStart={dateStart}
                dateEnd={dateEnd}
                onCategoryChange={setSelectedCategory}
                onStatusChange={setSelectedStatus}
                onDateStartChange={setDateStart}
                onDateEndChange={setDateEnd}
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
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={async () => {
                      try {
                        const resp = await fetch('/api/news/auto-format', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: watchedTitulo, content: watchedConteudo, category: watch('categoria') })
                        })
                        const json = await resp.json()
                        if (!resp.ok) throw new Error(json?.error || 'Falha ao autoformatar')
                        const r = json.result
                        if (r?.dek) setValue('descricao', r.dek)
                        if (r?.html) setValue('conteudo', r.html)
                        showToast('Conteúdo autoformatado', 'success')
                      } catch (e: any) {
                        showToast(e?.message || 'Erro ao autoformatar', 'error')
                      }
                    }}
                  >
                    Autoformatar
                  </button>
                  <button
                    type="button"
                    className="px-3 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                    onClick={async () => {
                      try {
                        const resp = await fetch('/api/news/paraphrase', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ title: watchedTitulo, content: watchedConteudo, category: watch('categoria') })
                        })
                        const json = await resp.json()
                        if (!resp.ok) throw new Error(json?.error || 'Falha ao reescrever')
                        const p = json.paraphrased
                        const f = json.formatted
                        if (p?.title) setValue('titulo', p.title)
                        if (f?.dek) setValue('descricao', f.dek)
                        if (f?.html) setValue('conteudo', f.html)
                        showToast('Texto reescrito e formatado', 'success')
                      } catch (e: any) {
                        showToast(e?.message || 'Erro ao reescrever', 'error')
                      }
                    }}
                  >
                    Reescrever e formatar
                  </button>
                </div>
              </div>
              
              {/* Componente de IA para reescrita */}
              {watchedTitulo && watchedConteudo && (
                <div className="mt-4">
                  <AINewsRewriter
                    title={watchedTitulo}
                    subtitle={watchedDescricao}
                    content={watchedConteudo}
                    onRewrite={handleRewrittenContent}
                  />
                </div>
              )}

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
              onPageChange={handlePageChange}
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

export default function NoticiasAdmin({ initialNoticias }: NoticiasPageProps) {
  return (
    <ToastProvider>
      <NoticiasAdminContent initialNoticias={initialNoticias} />
    </ToastProvider>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabase = createServerSupabaseClient(ctx)
    // Nota: evitar redirecionamento SSR aqui para não causar "bounce" para login
    // quando a sessão do Supabase não está disponível via cookies no servidor.
    // A verificação de autenticação será feita no client-side ao montar a página.
    // Buscar notícias (leitura pública permitida pelas políticas RLS)
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

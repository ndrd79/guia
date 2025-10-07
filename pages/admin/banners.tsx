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
import { formatDate } from '../../lib/formatters'

// Função para validar URLs seguras
const isSecureUrl = (url: string): boolean => {
  if (!url) return true // URLs vazias são permitidas
  
  try {
    const parsedUrl = new URL(url)
    
    // Permitir apenas protocolos seguros
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return false
    }
    
    // Bloquear IPs locais e privados
    const hostname = parsedUrl.hostname.toLowerCase()
    const blockedPatterns = [
      /^localhost$/,
      /^127\./,
      /^192\.168\./,
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^0\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/
    ]
    
    return !blockedPatterns.some(pattern => pattern.test(hostname))
  } catch {
    return false
  }
}

const bannerSchema = z.object({
  nome: z.string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9\s\-_áéíóúàèìòùâêîôûãõçÁÉÍÓÚÀÈÌÒÙÂÊÎÔÛÃÕÇ]+$/, 'Nome contém caracteres inválidos'),
  posicao: z.string().min(1, 'Posição é obrigatória'),
  imagem: z.string()
    .min(1, 'Imagem é obrigatória')
    .url('URL da imagem inválida')
    .refine(url => url.includes('supabase'), 'Apenas imagens do Supabase são permitidas'),
  link: z.string()
    .optional()
    .refine(url => !url || isSecureUrl(url), 'URL não é segura ou contém protocolo inválido')
    .transform(url => url?.trim() || ''),
  largura: z.number()
    .min(50, 'Largura mínima é 50px')
    .max(2000, 'Largura máxima é 2000px')
    .int('Largura deve ser um número inteiro'),
  altura: z.number()
    .min(50, 'Altura mínima é 50px')
    .max(1000, 'Altura máxima é 1000px')
    .int('Altura deve ser um número inteiro'),
  ativo: z.boolean(),
})

type BannerForm = z.infer<typeof bannerSchema>

interface BannersPageProps {
  initialBanners: Banner[]
}

// Configurações de posições com tamanhos recomendados
const posicoesBanner = [
  {
    nome: 'Hero Carousel',
    descricao: 'Carrossel principal da página inicial (4 slides de cores)',
    tamanhoRecomendado: '1170x330 (Hero Banner)',
    larguraRecomendada: 1170,
    alturaRecomendada: 330,
    paginas: ['Página Inicial']
  },
  {
    nome: 'Categorias Banner',
    descricao: 'Banner acima da seção "Explore Nossas Categorias"',
    tamanhoRecomendado: '1170x330 (Hero Banner)',
    larguraRecomendada: 1170,
    alturaRecomendada: 330,
    paginas: ['Página Inicial']
  },
  {
    nome: 'Serviços Banner',
    descricao: 'Banner abaixo da seção "Serviços Úteis"',
    tamanhoRecomendado: '1170x330 (Hero Banner)',
    larguraRecomendada: 1170,
    alturaRecomendada: 330,
    paginas: ['Página Inicial']
  },
  {
    nome: 'Header Superior',
    descricao: 'Topo da página, acima do menu principal',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Header Inferior', 
    descricao: 'Abaixo do menu principal',
    tamanhoRecomendado: '970x90 (Super Banner)',
    larguraRecomendada: 970,
    alturaRecomendada: 90,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Banner Principal',
    descricao: 'Banner principal da página inicial (lado direito do hero)',
    tamanhoRecomendado: '400x300 (Retângulo)',
    larguraRecomendada: 400,
    alturaRecomendada: 300,
    paginas: ['Página Inicial']
  },
  {
    nome: 'Empresas Destaque - Topo',
    descricao: 'Acima da seção de empresas em destaque',
    tamanhoRecomendado: '970x250 (Billboard)',
    larguraRecomendada: 970,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Empresas Destaque - Rodapé 1',
    descricao: 'Primeira posição após empresas em destaque',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Empresas Destaque - Rodapé 2',
    descricao: 'Segunda posição após empresas em destaque',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Eventos - Rodapé',
    descricao: 'Após a seção de eventos',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Página Inicial', 'Eventos']
  },
  {
    nome: 'Sidebar Direita',
    descricao: 'Barra lateral direita',
    tamanhoRecomendado: '300x600 (Arranha-céu)',
    larguraRecomendada: 300,
    alturaRecomendada: 600,
    paginas: ['Notícias', 'Eventos', 'Classificados']
  },
  {
    nome: 'Sidebar Esquerda',
    descricao: 'Barra lateral esquerda',
    tamanhoRecomendado: '300x600 (Arranha-céu)',
    larguraRecomendada: 300,
    alturaRecomendada: 600,
    paginas: ['Notícias', 'Eventos', 'Classificados']
  },
  {
    nome: 'Entre Conteúdo',
    descricao: 'No meio do conteúdo das páginas',
    tamanhoRecomendado: '336x280 (Retângulo Grande)',
    larguraRecomendada: 336,
    alturaRecomendada: 280,
    paginas: ['Notícias', 'Eventos', 'Classificados']
  },
  {
    nome: 'Footer',
    descricao: 'Rodapé do site',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Popup',
    descricao: 'Modal/popup sobreposto',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Mobile Banner',
    descricao: 'Banner otimizado para dispositivos móveis',
    tamanhoRecomendado: '320x50 (Mobile Banner)',
    larguraRecomendada: 320,
    alturaRecomendada: 50,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Empresas Destaque - Rodapé 3',
    descricao: 'Terceira posição após empresas em destaque',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Notícias - Topo',
    descricao: 'Acima da listagem de notícias',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Notícias']
  }
]

export default function BannersPage({ initialBanners }: BannersPageProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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
      nome: '',
      posicao: '',
      imagem: '',
      link: '',
      largura: 400,
      altura: 200,
      ativo: true,
    },
  })

  const watchedImagem = watch('imagem')
  const watchedPosicao = watch('posicao')

  // Carregar banners quando o componente for montado
  useEffect(() => {
    console.log('🔄 Carregando banners...')
    loadBanners()
  }, [])

  // Função para preencher automaticamente as dimensões baseado na posição
  const handlePosicaoChange = (posicaoNome: string) => {
    const posicao = posicoesBanner.find(p => p.nome === posicaoNome)
    if (posicao) {
      setValue('largura', posicao.larguraRecomendada)
      setValue('altura', posicao.alturaRecomendada)
    }
  }

  const loadBanners = async () => {
    console.log('📊 Iniciando carregamento dos banners...')
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      setError('Sistema não está configurado')
      return
    }
    
    setLoadingList(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Erro ao carregar banners:', error)
        setError('Erro ao carregar banners: ' + error.message)
        return
      }
      
      console.log('✅ Banners carregados:', data?.length || 0)
      setBanners(data || [])
    } catch (error) {
      console.error('❌ Erro na função loadBanners:', error)
      setError('Erro inesperado ao carregar banners')
    } finally {
      setLoadingList(false)
    }
  }

  const onSubmit = async (data: BannerForm) => {
    console.log('💾 Salvando banner:', data)
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      alert('Sistema não está configurado')
      return
    }
    
    setLoading(true)
    
    try {
      // Validações de segurança adicionais
      
      // 1. Verificar se a imagem existe no bucket
      if (data.imagem) {
        try {
          const imageUrl = new URL(data.imagem)
          const pathParts = imageUrl.pathname.split('/')
          const bucketIndex = pathParts.findIndex(part => part === 'banners')
          
          if (bucketIndex === -1) {
            throw new Error('Imagem deve estar no bucket "banners"')
          }
          
          const imagePath = pathParts.slice(bucketIndex + 1).join('/')
          
          // Verificar se o arquivo existe
          const { data: fileData, error: fileError } = await supabase.storage
            .from('banners')
            .list(imagePath.split('/').slice(0, -1).join('/') || '', {
              search: imagePath.split('/').pop()
            })
          
          if (fileError || !fileData?.length) {
            throw new Error('Arquivo de imagem não encontrado no storage')
          }
        } catch (error) {
          console.error('❌ Erro na validação da imagem:', error)
          alert('Erro: ' + (error as Error).message)
          return
        }
      }
      
      // 2. Verificar se já existe um banner ativo na mesma posição (apenas para novos banners)
      if (!editingBanner) {
        const { data: existingBanners, error: checkError } = await supabase
          .from('banners')
          .select('id, nome')
          .eq('posicao', data.posicao)
          .eq('ativo', true)
        
        if (checkError) {
          console.error('❌ Erro ao verificar banners existentes:', checkError)
          throw checkError
        }
        
        if (existingBanners && existingBanners.length > 0) {
          const confirmReplace = confirm(
            `Já existe um banner ativo na posição "${data.posicao}" (${existingBanners[0].nome}). ` +
            'Deseja continuar? O banner existente será desativado automaticamente.'
          )
          
          if (!confirmReplace) {
            return
          }
          
          // Desativar banners existentes na mesma posição
          const { error: deactivateError } = await supabase
            .from('banners')
            .update({ ativo: false, updated_at: new Date().toISOString() })
            .eq('posicao', data.posicao)
            .eq('ativo', true)
          
          if (deactivateError) {
            console.error('❌ Erro ao desativar banners existentes:', deactivateError)
            throw deactivateError
          }
        }
      }
      
      // 3. Sanitizar dados antes de salvar
      const sanitizedData = {
        ...data,
        nome: data.nome.trim(),
        link: data.link?.trim() || null,
        // Garantir que dimensões sejam números inteiros
        largura: Math.round(data.largura),
        altura: Math.round(data.altura)
      }
      
      if (editingBanner) {
        console.log('✏️ Atualizando banner existente:', editingBanner.id)
        // Atualizar banner existente
        const { error } = await supabase
          .from('banners')
          .update({
            ...sanitizedData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingBanner.id)
        
        if (error) {
          console.error('❌ Erro ao atualizar banner:', error)
          throw error
        }
        console.log('✅ Banner atualizado com sucesso')
      } else {
        console.log('➕ Criando novo banner')
        // Criar novo banner
        const { error } = await supabase
          .from('banners')
          .insert([{
            ...sanitizedData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }])
        
        if (error) {
          console.error('❌ Erro ao criar banner:', error)
          throw error
        }
        console.log('✅ Banner criado com sucesso')
      }
      
      console.log('🔄 Recarregando lista de banners...')
      await loadBanners()
      handleCloseForm()
      console.log('✅ Operação concluída com sucesso')
    } catch (error) {
      console.error('❌ Erro ao salvar banner:', error)
      const errorMessage = (error as Error).message
      setError('Erro ao salvar banner: ' + errorMessage)
      
      // Mostrar alerta apenas para erros críticos
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        alert('Erro de permissão: Você não tem autorização para realizar esta ação.')
      }
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
      largura: banner.largura || 400,
      altura: banner.altura || 200,
      ativo: banner.ativo,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return
    console.log('🗑️ Excluindo banner:', id)
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      setError('Sistema não está configurado')
      return
    }
    
    setDeletingId(id)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error('❌ Erro ao excluir banner:', error)
        throw error
      }
      
      console.log('✅ Banner excluído com sucesso')
      console.log('🔄 Recarregando lista de banners...')
      await loadBanners()
    } catch (error) {
      console.error('❌ Erro ao excluir banner:', error)
      setError('Erro ao excluir banner: ' + (error as Error).message)
    } finally {
      setDeletingId(null)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    console.log('🔄 Alterando status do banner:', id, 'para:', !currentStatus)
    if (!supabase) {
      console.error('❌ Supabase não configurado')
      setError('Sistema não está configurado')
      return
    }
    
    setTogglingId(id)
    setError(null)
    
    try {
      const { error } = await supabase
        .from('banners')
        .update({
          ativo: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
      
      if (error) {
        console.error('❌ Erro ao alterar status:', error)
        throw error
      }
      
      console.log('✅ Status alterado com sucesso')
      console.log('🔄 Recarregando lista de banners...')
      await loadBanners()
    } catch (error) {
      console.error('❌ Erro ao alterar status do banner:', error)
      setError('Erro ao alterar status do banner: ' + (error as Error).message)
    } finally {
      setTogglingId(null)
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
      largura: 400,
      altura: 200,
      ativo: true,
    })
  }

  return (
    <AdminLayout title="Gerenciar Banners">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Banners Publicitários</h1>
          <button
            onClick={() => setShowForm(true)}
            disabled={loadingList}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            Novo Banner
          </button>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => setError(null)}
                    className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulário */}
        {showForm && (
          <FormCard 
            title={editingBanner ? 'Editar Banner' : 'Novo Banner'}
            onSubmit={handleSubmit(onSubmit)}
            isLoading={loading}
            submitText={editingBanner ? 'Atualizar' : 'Criar'}
            onCancel={handleCloseForm}
            showForm={true}
          >
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Banner *
                  </label>
                  <input
                    {...register('nome')}
                    type="text"
                    placeholder="Ex: Banner Loja ABC - Header"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                  {errors.nome && (
                    <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posição no Site *
                  </label>
                  <select
                    value={watchedPosicao || ''}
                    onChange={(e) => {
                      setValue('posicao', e.target.value)
                      handlePosicaoChange(e.target.value)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="">Selecione onde o banner será exibido</option>
                    {posicoesBanner.map((posicao) => (
                      <option key={posicao.nome} value={posicao.nome}>
                        {posicao.nome} - {posicao.tamanhoRecomendado} | {posicao.paginas.join(', ')}
                      </option>
                    ))}
                  </select>
                  {errors.posicao && (
                    <p className="mt-1 text-sm text-red-600">{errors.posicao.message}</p>
                  )}
                  {watchedPosicao && (
                    <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      {(() => {
                        const posicaoSelecionada = posicoesBanner.find(p => p.nome === watchedPosicao)
                        return posicaoSelecionada ? (
                          <div>
                            <p className="text-sm font-medium text-blue-800">{posicaoSelecionada.nome}</p>
                            <p className="text-sm text-blue-600">{posicaoSelecionada.descricao}</p>
                            <p className="text-sm text-blue-600">📏 Tamanho recomendado: {posicaoSelecionada.tamanhoRecomendado}</p>
                            <p className="text-sm text-blue-600">📍 Páginas: {posicaoSelecionada.paginas.join(', ')}</p>
                          </div>
                        ) : null
                      })()} 
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Largura (px) *
                    {watchedPosicao && (
                      <span className="text-xs text-blue-600 ml-2">
                        (Recomendado: {posicoesBanner.find(p => p.nome === watchedPosicao)?.larguraRecomendada}px)
                      </span>
                    )}
                  </label>
                  <input
                    {...register('largura', { valueAsNumber: true })}
                    type="number"
                    min="50"
                    max="2000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="400"
                  />
                  {errors.largura && (
                    <p className="mt-1 text-sm text-red-600">{errors.largura.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (px) *
                    {watchedPosicao && (
                      <span className="text-xs text-blue-600 ml-2">
                        (Recomendado: {posicoesBanner.find(p => p.nome === watchedPosicao)?.alturaRecomendada}px)
                      </span>
                    )}
                  </label>
                  <input
                    {...register('altura', { valueAsNumber: true })}
                    type="number"
                    min="50"
                    max="1000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="200"
                  />
                  {errors.altura && (
                    <p className="mt-1 text-sm text-red-600">{errors.altura.message}</p>
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
            </div>
          </FormCard>
        )}

        {/* Lista de Banners */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Lista de Banners</h3>
          </div>
          <div className="overflow-x-auto">
            {loadingList ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-3 text-gray-600">Carregando banners...</span>
              </div>
            ) : banners.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum banner encontrado</h3>
                  <p className="mt-1 text-sm text-gray-500">Comece criando seu primeiro banner publicitário.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Versão Desktop - Tabela */}
                <div className="hidden md:block">
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
                          Dimensões
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
                                  Criado em {formatDate(banner.created_at)}
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
                            <div className="text-sm text-gray-900">
                              {banner.largura || 400} × {banner.altura || 200} px
                            </div>
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
                              disabled={togglingId === banner.id}
                              className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                banner.ativo
                                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                  : 'bg-red-100 text-red-800 hover:bg-red-200'
                              } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {togglingId === banner.id ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                                  Alterando...
                                </>
                              ) : banner.ativo ? (
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
                                disabled={deletingId === banner.id || togglingId === banner.id}
                                className="text-orange-600 hover:text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(banner.id)}
                                disabled={deletingId === banner.id || togglingId === banner.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === banner.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b border-current"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Versão Mobile - Cards */}
                <div className="md:hidden space-y-4 p-4">
                  {banners.map((banner) => (
                    <div key={banner.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex items-start space-x-4">
                        <img
                          className="h-20 w-28 rounded-lg object-cover flex-shrink-0"
                          src={banner.imagem}
                          alt={banner.nome}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="text-sm font-medium text-gray-900 truncate">
                                {banner.nome}
                              </h3>
                              <p className="text-xs text-gray-500 mt-1">
                                Criado em {formatDate(banner.created_at)}
                              </p>
                            </div>
                            <div className="flex space-x-2 ml-2">
                              <button
                                onClick={() => handleEdit(banner)}
                                disabled={deletingId === banner.id || togglingId === banner.id}
                                className="text-orange-600 hover:text-orange-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(banner.id)}
                                disabled={deletingId === banner.id || togglingId === banner.id}
                                className="text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === banner.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b border-current"></div>
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Posição:</span>
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                                {banner.posicao}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Dimensões:</span>
                              <span className="text-xs text-gray-900">
                                {banner.largura || 400} × {banner.altura || 200} px
                              </span>
                            </div>
                            
                            {banner.link && (
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-500">Link:</span>
                                <a
                                  href={banner.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center text-xs text-blue-600 hover:text-blue-900"
                                >
                                  <ExternalLink className="h-3 w-3 mr-1" />
                                  Abrir
                                </a>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between pt-2">
                              <span className="text-xs text-gray-500">Status:</span>
                              <button
                                onClick={() => handleToggleStatus(banner.id, banner.ativo)}
                                disabled={togglingId === banner.id}
                                className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                                  banner.ativo
                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                } transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {togglingId === banner.id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-1"></div>
                                    Alterando...
                                  </>
                                ) : banner.ativo ? (
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
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabase = createServerSupabaseClient(ctx)
    
    // Buscar banners
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })

    if (bannersError) {
      console.error('Erro ao buscar banners:', bannersError)
    }

    return {
      props: {
        initialBanners: banners || [],
      },
    }
  } catch (error) {
    console.error('Erro no getServerSideProps:', error)
    return {
      props: {
        initialBanners: [],
      },
    }
  }
}
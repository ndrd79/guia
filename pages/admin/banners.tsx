import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Eye, EyeOff, ExternalLink, BarChart3, Search, X, Filter, Calendar, CheckCircle, Clock, AlertTriangle, Monitor, Tablet, Smartphone } from 'lucide-react'
import BannerModelSelect from '../../components/admin/banners/BannerModelSelect'
import BannerModelGrid from '../../components/admin/banners/BannerModelGrid'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { AnalyticsDashboard } from '../../src/components/analytics/AnalyticsDashboard'
import { createServerSupabaseClient, supabase, Banner } from '../../lib/supabase'
import { formatDate } from '../../lib/formatters'
import { useToastActions } from '../../components/admin/ToastProvider'

interface BannerStats {
  impressoes: number
  cliques: number
  ctr: number
}

interface BannerWithStats extends Banner {
  stats?: BannerStats
}

interface FilterState {
  search: string
  status: 'all' | 'active' | 'inactive'
  position: string
  period: 'all' | 'week' | 'month'
  schedule: 'all' | 'active' | 'scheduled' | 'expired' | 'inactive'
}

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
  ordem: z.number()
    .int('Ordem deve ser um número inteiro')
    .min(0, 'Ordem mínima é 0')
    .max(9999, 'Ordem máxima é 9999')
    .optional(),
  tempo_exibicao: z.number()
    .int('Tempo deve ser um número inteiro')
    .min(1, 'Tempo mínimo é 1 segundo')
    .max(60, 'Tempo máximo é 60 segundos')
    .default(5),
  local: z.enum(['geral', 'home', 'guia_comercial', 'noticias', 'eventos', 'classificados'])
    .default('geral'),
  ativo: z.boolean(),
  data_inicio: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Data de início inválida'),
  data_fim: z.string()
    .optional()
    .refine(val => !val || !isNaN(Date.parse(val)), 'Data de fim inválida'),
}).refine(data => {
  if (data.data_inicio && data.data_fim) {
    const inicio = new Date(data.data_inicio)
    const fim = new Date(data.data_fim)
    return fim > inicio
  }
  return true
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['data_fim']
})

type BannerForm = z.infer<typeof bannerSchema>

interface BannersPageProps {
  initialBanners: Banner[]
}

// Configurações de posições com tamanhos recomendados
const posicoesBanner = [
  {
    nome: 'Hero Carousel',
    descricao: 'Carrossel grande no topo da página inicial; ocupa toda a largura e alterna automaticamente. Exemplo: primeiro bloco visível logo abaixo do cabeçalho.',
    tamanhoRecomendado: '1170x330 (Hero Banner)',
    larguraRecomendada: 1170,
    alturaRecomendada: 330,
    paginas: ['Página Inicial']
  },
  {
    nome: 'Categorias Banner',
    descricao: 'Faixa acima da seção "Explore Nossas Categorias" na página inicial, antes dos ícones de categorias. Exemplo: logo após o carrossel principal.',
    tamanhoRecomendado: '1170x330 (Hero Banner)',
    larguraRecomendada: 1170,
    alturaRecomendada: 330,
    paginas: ['Página Inicial']
  },
  {
    nome: 'Serviços Banner',
    descricao: 'Faixa abaixo da seção "Serviços Úteis" na página inicial, separando serviços e próximo conteúdo. Exemplo: bloco imediatamente após os cartões de serviços.',
    tamanhoRecomendado: '1170x330 (Hero Banner)',
    larguraRecomendada: 1170,
    alturaRecomendada: 330,
    paginas: ['Página Inicial']
  },

  {
    nome: 'CTA Banner',
    descricao: 'Faixa retangular na coluna direita do bloco escuro (abaixo de Notícias e acima do Banner Categorias).',
    tamanhoRecomendado: '585x360 (Retângulo amplo)',
    larguraRecomendada: 585,
    alturaRecomendada: 360,
    paginas: ['Página Inicial']
  },

  {
    nome: 'Header Inferior', 
    descricao: 'Faixa horizontal logo abaixo do menu principal (topo da página). Visível em todas as páginas.',
    tamanhoRecomendado: '970x90 (Super Banner)',
    larguraRecomendada: 970,
    alturaRecomendada: 90,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Banner Principal',
    descricao: 'Banner destacado à direita do carrossel principal na página inicial. Exemplo: bloco lateral direito do topo.',
    tamanhoRecomendado: '400x300 (Retângulo)',
    larguraRecomendada: 400,
    alturaRecomendada: 300,
    paginas: ['Página Inicial']
  },
  {
    nome: 'Empresas Destaque - Topo',
    descricao: 'Faixa posicionada acima da seção "Empresas em Destaque" na página inicial e no Guia Comercial.',
    tamanhoRecomendado: '970x250 (Billboard)',
    larguraRecomendada: 970,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Empresas Destaque - Rodapé 1',
    descricao: 'Primeira faixa logo após a seção "Empresas em Destaque" na página inicial e no Guia Comercial.',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Empresas Destaque - Rodapé 2',
    descricao: 'Segunda faixa após a seção "Empresas em Destaque" na página inicial e no Guia Comercial.',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Eventos - Rodapé',
    descricao: 'Faixa logo após a seção de eventos. Visível na página inicial e na página de Eventos.',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Página Inicial', 'Eventos']
  },
  {
    nome: 'Sidebar Direita',
    descricao: 'Banner na barra lateral direita, ao lado do conteúdo principal. Páginas: Notícias, Eventos e Classificados.',
    tamanhoRecomendado: '300x600 (Arranha-céu)',
    larguraRecomendada: 300,
    alturaRecomendada: 600,
    paginas: ['Notícias', 'Eventos', 'Classificados']
  },
  {
    nome: 'Sidebar Esquerda',
    descricao: 'Banner na barra lateral esquerda, ao lado do conteúdo principal. Páginas: Notícias, Eventos e Classificados.',
    tamanhoRecomendado: '300x600 (Arranha-céu)',
    larguraRecomendada: 300,
    alturaRecomendada: 600,
    paginas: ['Notícias', 'Eventos', 'Classificados']
  },
  {
    nome: 'Entre Conteúdo',
    descricao: 'Banner inserido entre blocos de conteúdo, dentro do corpo das páginas. Ideal para breaks de leitura.',
    tamanhoRecomendado: '336x280 (Retângulo Grande)',
    larguraRecomendada: 336,
    alturaRecomendada: 280,
    paginas: ['Notícias', 'Eventos', 'Classificados']
  },
  {
    nome: 'Footer',
    descricao: 'Faixa posicionada no rodapé do site, antes dos links finais. Visível em todas as páginas.',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Popup',
    descricao: 'Janela modal sobreposta ao conteúdo. Pode aparecer sobre qualquer página, ideal para campanhas pontuais.',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Mobile Banner',
    descricao: 'Faixa otimizada para dispositivos móveis. Exibido em telas pequenas, geralmente no topo ou entre blocos.',
    tamanhoRecomendado: '320x50 (Mobile Banner)',
    larguraRecomendada: 320,
    alturaRecomendada: 50,
    paginas: ['Todas as páginas']
  },
  {
    nome: 'Empresas Destaque - Rodapé 3',
    descricao: 'Terceira faixa após a seção "Empresas em Destaque" na página inicial e no Guia Comercial.',
    tamanhoRecomendado: '300x250 (Retângulo Médio)',
    larguraRecomendada: 300,
    alturaRecomendada: 250,
    paginas: ['Página Inicial', 'Guia Comercial']
  },
  {
    nome: 'Notícias - Topo',
    descricao: 'Faixa acima da listagem de notícias na página de Notícias. Exemplo: aparece antes dos cards de notícia.',
    tamanhoRecomendado: '728x90 (Leaderboard)',
    larguraRecomendada: 728,
    alturaRecomendada: 90,
    paginas: ['Notícias']
  }
]

// Função para determinar o status de agendamento de um banner
const getBannerScheduleStatus = (banner: Banner) => {
  const now = new Date()
  
  // Se o banner está inativo, retorna inativo
  if (!banner.ativo) {
    return {
      status: 'inactive' as const,
      label: 'Inativo',
      color: 'bg-gray-100 text-gray-800',
      icon: EyeOff
    }
  }
  
  // Se não tem agendamento, é ativo normal
  if (!banner.data_inicio && !banner.data_fim) {
    return {
      status: 'active' as const,
      label: 'Ativo',
      color: 'bg-green-100 text-green-800',
      icon: CheckCircle
    }
  }
  
  const dataInicio = banner.data_inicio ? new Date(banner.data_inicio) : null
  const dataFim = banner.data_fim ? new Date(banner.data_fim) : null
  
  // Banner agendado para o futuro
  if (dataInicio && now < dataInicio) {
    return {
      status: 'scheduled' as const,
      label: 'Agendado',
      color: 'bg-blue-100 text-blue-800',
      icon: Calendar
    }
  }
  
  // Banner expirado
  if (dataFim && now > dataFim) {
    return {
      status: 'expired' as const,
      label: 'Expirado',
      color: 'bg-red-100 text-red-800',
      icon: AlertTriangle
    }
  }
  
  // Banner ativo no período
  return {
    status: 'active' as const,
    label: 'Ativo',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  }
}

// Função para calcular tempo restante
const getTimeRemaining = (targetDate: Date) => {
  const now = new Date()
  const diff = targetDate.getTime() - now.getTime()
  
  if (diff <= 0) return null
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Função para verificar se banner está prestes a expirar (menos de 24h)
const isBannerExpiringSoon = (banner: Banner) => {
  if (!banner.data_fim) return false
  
  const now = new Date()
  const dataFim = new Date(banner.data_fim)
  const hoursUntilExpiry = (dataFim.getTime() - now.getTime()) / (1000 * 60 * 60)
  
  return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24
}

// Componente de contagem regressiva
const CountdownTimer = ({ banner }: { banner: Banner }) => {
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
  const [targetDate, setTargetDate] = useState<Date | null>(null)
  const [countdownType, setCountdownType] = useState<'start' | 'end' | null>(null)

  useEffect(() => {
    const now = new Date()
    const dataInicio = banner.data_inicio ? new Date(banner.data_inicio) : null
    const dataFim = banner.data_fim ? new Date(banner.data_fim) : null

    // Determinar qual data usar para contagem regressiva
    if (dataInicio && now < dataInicio) {
      setTargetDate(dataInicio)
      setCountdownType('start')
    } else if (dataFim && now < dataFim) {
      setTargetDate(dataFim)
      setCountdownType('end')
    } else {
      setTargetDate(null)
      setCountdownType(null)
    }
  }, [banner.data_inicio, banner.data_fim])

  useEffect(() => {
    if (!targetDate) {
      setTimeRemaining(null)
      return
    }

    const updateTimer = () => {
      const remaining = getTimeRemaining(targetDate)
      setTimeRemaining(remaining)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 60000) // Atualizar a cada minuto

    return () => clearInterval(interval)
  }, [targetDate])

  if (!timeRemaining || !countdownType) return null

  return (
    <div className={`text-xs px-2 py-1 rounded-full ${
      countdownType === 'start' 
        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
        : 'bg-orange-50 text-orange-700 border border-orange-200'
    }`}>
      <Clock className="h-3 w-3 inline mr-1" />
      {countdownType === 'start' ? 'Inicia em' : 'Expira em'} {timeRemaining}
    </div>
  )
}

export default function BannersPage({ initialBanners }: BannersPageProps) {
  const loadedOnceRef = useRef(false)
  const { success: showSuccess, error: showError } = useToastActions()
  const [banners, setBanners] = useState<BannerWithStats[]>(initialBanners)
  const [showForm, setShowForm] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingList, setLoadingList] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bannerStats, setBannerStats] = useState<Record<string, BannerStats>>({})
  const [loadingStats, setLoadingStats] = useState<{ [key: string]: boolean }>({})
  const [loadingAllStats, setLoadingAllStats] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  
  // Estados para filtros e busca
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'all' as const,
    position: 'all',
    period: 'all' as const,
    schedule: 'all' as const
  })
  const [searchDebounced, setSearchDebounced] = useState(filters.search)
  const [isFiltering, setIsFiltering] = useState(false)
  
  // Estado para controlar as abas
  const [activeTab, setActiveTab] = useState<'banners' | 'analytics'>('banners')

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
    ordem: 0,
    ativo: true,
  },
  })

  const watchedImagem = watch('imagem')
  const watchedPosicao = watch('posicao')
  const watchedLargura = watch('largura')
  const watchedAltura = watch('altura')
  const [posicaoOpen] = useState(false)
  const [posicaoQuery] = useState('')
  const [validateLoading, setValidateLoading] = useState(false)
  const [validateError, setValidateError] = useState<string | null>(null)
  const [validateResult, setValidateResult] = useState<{
    valid: boolean
    message?: string
    conflictingBanners?: Array<{ id: string; nome: string; ativo: boolean; local?: string | null }>
    count?: number
  } | null>(null)

  // Cálculo para preview responsivo e validação de tamanho ideal
  const posInfo = posicoesBanner.find(p => p.nome === watchedPosicao)
  const idealWidth = posInfo?.larguraRecomendada || watchedLargura || 0
  const idealHeight = posInfo?.alturaRecomendada || watchedAltura || 0
  const deviceWidths: Record<'desktop' | 'tablet' | 'mobile', number> = {
    desktop: idealWidth || 1170,
    tablet: 768,
    mobile: 360,
  }
  const displayWidth = Math.min(deviceWidths[previewDevice], idealWidth || deviceWidths[previewDevice])
  const ratio = idealWidth && idealHeight ? idealHeight / idealWidth : (watchedAltura && watchedLargura ? watchedAltura / watchedLargura : 1)
  const displayHeight = Math.max(1, Math.round(displayWidth * ratio))
  const isSizeCorrect = !!(watchedLargura && watchedAltura && idealWidth && idealHeight && watchedLargura === idealWidth && watchedAltura === idealHeight)
  const ordemValue = (watch('ordem') ?? '') as any

  // Funções de carregamento de dados
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
      // Verificar autenticação: em ambiente admin, evite consultas cliente sem sessão
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        console.warn('⚠️ Usuário não autenticado no admin. Mantendo dados SSR, sem consultar novamente.')
        return
      }

      // Ordenação principal por 'created_at' (mais recentes primeiro) e secundária por 'ordem'
      const { data, error } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })
        .order('ordem', { ascending: true })

      if (error) {
        const errMsg = (error as any)?.message || (error as any)?.error_description || String(error)
        console.warn('⚠️ Erro ao ordenar por "ordem". Aplicando fallback.', errMsg)

        // Fallback: tentar apenas ordenar por created_at
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('banners')
          .select('*')
          .order('created_at', { ascending: false })

        if (fallbackError) {
          const fbMsg = (fallbackError as any)?.message || (fallbackError as any)?.error_description || String(fallbackError)
          console.error('❌ Erro ao carregar banners (fallback):', fbMsg)
          setError('Erro ao carregar banners: ' + fbMsg)
          return
        }

        console.log('✅ Banners carregados (fallback):', fallbackData?.length || 0)
        setBanners(fallbackData || [])
        return
      }

      console.log('✅ Banners carregados:', data?.length || 0)
      setBanners(data || [])
    } catch (error) {
      console.error('❌ Erro na função loadBanners:', error)
      const msg = (error as any)?.message || (error as any)?.error_description || (typeof error === 'object' ? JSON.stringify(error) : String(error))
      setError('Erro inesperado ao carregar banners: ' + msg)
    } finally {
      setLoadingList(false)
    }
  }

  const loadBannerStats = async (signal?: AbortSignal) => {
    console.log('📊 Carregando estatísticas dos banners...')
    setLoadingAllStats(true)
    
    try {
      // Obter token de autenticação
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.warn('⚠️ Usuário não autenticado para carregar estatísticas')
        return
      }

      const response = await fetch('/api/analytics/stats/all', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        signal
      })
      
      if (!response.ok) {
        console.warn('⚠️ Não foi possível carregar estatísticas:', response.status)
        return
      }
      
      const data = await response.json()

      const statsMap: Record<string, BannerStats> = {}

      // Suporte ao formato atual do endpoint: { success, data: BannerStatsResumido[] }
      if (data?.success && Array.isArray(data?.data)) {
        data.data.forEach((stat: any) => {
          const bannerId = stat.bannerId || stat.id
          if (!bannerId) return
          statsMap[bannerId] = {
            impressoes: stat.impressoes || 0,
            cliques: stat.cliques || 0,
            ctr: stat.ctr || 0
          }
        })
      }

      // Suporte a formato alternativo: { banners: [...] }
      if (!Object.keys(statsMap).length && Array.isArray(data?.banners)) {
        data.banners.forEach((stat: any) => {
          const bannerId = stat.bannerId || stat.id
          if (!bannerId) return
          statsMap[bannerId] = {
            impressoes: stat.impressoes || 0,
            cliques: stat.cliques || 0,
            ctr: stat.ctr || 0
          }
        })
      }

      if (Object.keys(statsMap).length) {
        setBannerStats(statsMap)
        console.log('✅ Estatísticas carregadas para', Object.keys(statsMap).length, 'banners')
      } else {
        console.log('ℹ️ Nenhuma estatística disponível no endpoint')
      }
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        console.log('⏹️ Requisição de estatísticas abortada (navegação/desmontagem)')
      } else {
        console.warn('⚠️ Erro ao carregar estatísticas:', error)
      }
      // Não mostrar erro para o usuário, apenas log
    } finally {
      setLoadingAllStats(false)
    }
  }

  // Carregar banners e estatísticas quando o componente for montado
  useEffect(() => {
    if (loadedOnceRef.current) return
    loadedOnceRef.current = true
    console.log('🔄 Carregando banners...')
    const controller = new AbortController()
    loadBanners()
    loadBannerStats(controller.signal)
    return () => {
      controller.abort()
    }
  }, [])

  // Carregar filtros do localStorage após montagem
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bannerFilters')
      if (saved) {
        try {
          const parsedFilters = JSON.parse(saved)
          // Garantir que todos os campos necessários existem
          setFilters({
            search: parsedFilters.search || '',
            status: parsedFilters.status || 'all',
            position: parsedFilters.position || 'all',
            period: parsedFilters.period || 'all',
            schedule: parsedFilters.schedule || 'all'
          })
        } catch {
          // Se houver erro ao parsear, manter valores padrão
        }
      }
    }
  }, [])

  // Debounce para busca
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounced(filters.search)
    }, 300)

    return () => clearTimeout(timer)
  }, [filters.search])

  // Persistir filtros no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('bannerFilters', JSON.stringify(filters))
    }
  }, [filters])

  // Função para preencher automaticamente as dimensões baseado na posição
  const handlePosicaoChange = (posicaoNome: string) => {
    const posicao = posicoesBanner.find(p => p.nome === posicaoNome)
    if (posicao) {
      setValue('largura', posicao.larguraRecomendada)
      setValue('altura', posicao.alturaRecomendada)
    }
    triggerValidate(posicaoNome)
  }

  // Funções de filtro
  const updateFilter = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: 'all',
      position: 'all',
      period: 'all',
      schedule: 'all'
    })
  }, [])

  const triggerValidate = async (posicaoNome: string) => {
    try {
      setValidateLoading(true)
      setValidateError(null)
      setValidateResult(null)
      const resp = await fetch('/api/banners/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posicao: posicaoNome, bannerId: editingBanner?.id })
      })
      const json = await resp.json()
      setValidateResult(json)
    } catch (e: any) {
      setValidateError(e?.message || 'Falha ao validar posição')
    } finally {
      setValidateLoading(false)
    }
  }

  // Função para filtrar banners
  const filteredBanners = useMemo(() => {
    setIsFiltering(true)
    
    let filtered = [...banners]

    // Filtro por busca (nome)
    if (searchDebounced.trim()) {
      const searchTerm = searchDebounced.toLowerCase().trim()
      filtered = filtered.filter(banner =>
        banner.nome.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por status
    if (filters.status !== 'all') {
      filtered = filtered.filter(banner =>
        filters.status === 'active' ? banner.ativo : !banner.ativo
      )
    }

    // Filtro por posição
    if (filters.position !== 'all') {
      filtered = filtered.filter(banner =>
        banner.posicao === filters.position
      )
    }

    // Filtro por período
    if (filters.period !== 'all') {
      const now = new Date()
      const filterDate = new Date()
      
      if (filters.period === 'week') {
        filterDate.setDate(now.getDate() - 7)
      } else if (filters.period === 'month') {
        filterDate.setMonth(now.getMonth() - 1)
      }

      filtered = filtered.filter(banner => {
        const bannerDate = new Date(banner.created_at)
        return bannerDate >= filterDate
      })
    }

    // Filtro por status de agendamento
    if (filters.schedule !== 'all') {
      filtered = filtered.filter(banner => {
        const scheduleStatus = getBannerScheduleStatus(banner)
        return scheduleStatus.status === filters.schedule
      })
    }

    setTimeout(() => setIsFiltering(false), 100)
    return filtered
  }, [banners, searchDebounced, filters.status, filters.position, filters.period, filters.schedule])

  // Verificar se há filtros ativos
  const hasActiveFilters = useMemo(() => {
    return filters.search.trim() !== '' ||
           filters.status !== 'all' ||
           filters.position !== 'all' ||
           filters.period !== 'all' ||
           filters.schedule !== 'all'
  }, [filters])

  // Obter posições disponíveis: união das posições configuradas com as existentes nos dados
  const availablePositions = useMemo(() => {
    const configured = posicoesBanner.map(p => p.nome)
    const fromData = Array.from(new Set(banners.map(banner => banner.posicao)))
    const all = Array.from(new Set([...configured, ...fromData]))
    return all.sort((a, b) => a.localeCompare(b))
  }, [banners])

  const validateBannerPosition = async (data: BannerForm): Promise<boolean> => {
    try {
      const response = await fetch('/api/banners/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          posicao: data.posicao,
          // Removido do frontend: validação por local na interface
          bannerId: editingBanner?.id,
        }),
      })

      const result = await response.json()

      if (!result.valid) {
        const conflicts = Array.isArray(result.conflictingBanners) ? result.conflictingBanners : []
        const list = conflicts.length ? ` Conflitos: ${conflicts.map((c: any) => c.nome).join(', ')}` : ''
        const msg = result.message || 'Conflito de posição. Use o botão "Desativar conflitos" para liberar a posição.'
        setError(`Erro ao validar posição: ${msg}.${list}`)
        showError('Posição com conflitos. Use "Desativar conflitos" e tente novamente.')
        return false
      }

      return true
    } catch (error) {
      console.error('❌ Erro ao validar posição:', error)
      // Se houver erro na validação, permite salvar (fallback)
      return true
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
      
      // 1. Verificar se a imagem está no bucket público e acessível
      if (data.imagem) {
        try {
          const imageUrl = new URL(data.imagem)
          const urlPath = imageUrl.pathname || ''

          // Garantir que é uma URL pública do Supabase Storage para o bucket banners
          const isPublicBannerUrl = urlPath.includes('/storage/v1/object/public/banners/') || urlPath.split('/').includes('banners')
          if (!isPublicBannerUrl) {
            throw new Error('Imagem deve estar no bucket público "banners" do Supabase')
          }

          // Verificar acessibilidade via HEAD na URL pública
          const headResp = await fetch(data.imagem, { method: 'HEAD', cache: 'no-store' })
          if (!headResp.ok) {
            throw new Error(`Imagem inacessível (status ${headResp.status}). Verifique se o bucket está público.`)
          }
        } catch (error) {
          console.error('❌ Erro na validação da imagem:', error)
          alert('Erro: ' + (error as Error).message)
          return
        }
      }
      
      // 2. Validar se pode salvar nesta posição/local
      const isValid = await validateBannerPosition(data)
      if (!isValid) {
        return
      }
      
      // 3. A checagem e desativação de conflitos agora é feita em validateBannerPosition
      
      // 3. Sanitizar dados antes de salvar
      const sanitizedData = {
        ...data,
        nome: data.nome.trim(),
        link: data.link?.trim() || null,
        // Garantir que dimensões sejam números inteiros
        largura: Math.round(data.largura),
        altura: Math.round(data.altura),
        ordem: typeof data.ordem === 'number' ? Math.round(data.ordem) : 0,
        // Não enviar 'local' do formulário visual
        local: undefined,
        // Converter datas para ISO string ou null
        data_inicio: data.data_inicio ? new Date(data.data_inicio).toISOString() : null,
        data_fim: data.data_fim ? new Date(data.data_fim).toISOString() : null,
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
        console.log('➕ Criando novo banner via rota admin')
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token || ''
        const resp = await fetch('/api/admin/banners', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify(sanitizedData)
        })
        const json = await resp.json()
        if (!resp.ok || !json?.success) {
          throw new Error(json?.message || `Falha ao criar banner (status ${resp.status})`)
        }
        console.log('✅ Banner criado com sucesso, id:', json.id)
      }
      
      console.log('🔄 Recarregando lista de banners...')
      await loadBanners()
      handleCloseForm()
      console.log('✅ Operação concluída com sucesso')
    } catch (error) {
      console.error('❌ Erro ao salvar banner:', error)
      const errorMessage = (error as Error).message
      setError('Erro ao salvar banner: ' + errorMessage)
      
      // Mostrar toast apenas para erros críticos
      if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
        showError('Erro de permissão: Você não tem autorização para realizar esta ação.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    
    // Converter datas para formato datetime-local se existirem
    const formatDateForInput = (dateString: string | null) => {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toISOString().slice(0, 16) // Remove segundos e timezone
    }
    
    reset({
      nome: banner.nome,
      posicao: banner.posicao,
      imagem: banner.imagem,
      link: banner.link || '',
      largura: banner.largura || 400,
      altura: banner.altura || 200,
      ordem: banner.ordem ?? 0,
      ativo: banner.ativo,
      data_inicio: formatDateForInput(banner.data_inicio ?? null),
      data_fim: formatDateForInput(banner.data_fim ?? null),
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
        {/* Header com Abas */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Banners Publicitários</h1>
          {activeTab === 'banners' && (
            <button
              onClick={() => setShowForm(true)}
              disabled={loadingList}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Banner
            </button>
          )}
        </div>

        {/* Navegação por Abas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('banners')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'banners'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Filter className="h-4 w-4 inline mr-2" />
              Gerenciar Banners
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="h-4 w-4 inline mr-2" />
              Analytics
            </button>
          </nav>
        </div>

        {/* Conteúdo da Aba Banners */}
        {activeTab === 'banners' && (
          <>
            {/* Alerta de Banners Expirando */}
            {(() => {
              const expiringSoon = banners.filter(isBannerExpiringSoon)
              if (expiringSoon.length === 0) return null
              
              return (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-amber-800">
                        {expiringSoon.length === 1 
                          ? 'Banner expirando em breve' 
                          : `${expiringSoon.length} banners expirando em breve`
                        }
                      </h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p className="mb-2">
                          {expiringSoon.length === 1 
                            ? 'O seguinte banner expira nas próximas 24 horas:' 
                            : 'Os seguintes banners expiram nas próximas 24 horas:'
                          }
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          {expiringSoon.map(banner => (
                            <li key={banner.id}>
                              <span className="font-medium">{banner.nome}</span>
                              {banner.data_fim && (
                                <span className="text-amber-600 ml-2">
                                  (expira em {formatDate(banner.data_fim)})
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
        })()}

        {/* Seção de Filtros e Busca */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Filtros e Busca</h3>
              {hasActiveFilters && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Filtros ativos
                </span>
              )}
            </div>
            
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                <X className="h-4 w-4" />
                <span>Limpar filtros</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Barra de Busca */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por nome
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  placeholder="Digite o nome do banner..."
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                {filters.search && (
                  <button
                    onClick={() => updateFilter('search', '')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Todos</option>
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {/* Filtro por Posição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Posição
              </label>
              <select
                value={filters.position}
                onChange={(e) => updateFilter('position', e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Todas as posições</option>
                {availablePositions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
            {/* Filtro por Período */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="inline h-4 w-4 mr-1" />
                Período de criação
              </label>
              <select
                value={filters.period}
                onChange={(e) => updateFilter('period', e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Todos os períodos</option>
                <option value="week">Última semana</option>
                <option value="month">Último mês</option>
              </select>
            </div>

            {/* Filtro por Agendamento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="inline h-4 w-4 mr-1" />
                Status de agendamento
              </label>
              <select
                value={filters.schedule}
                onChange={(e) => updateFilter('schedule', e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Todos os status</option>
                <option value="active">Ativo</option>
                <option value="scheduled">Agendado</option>
                <option value="expired">Expirado</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>

            {/* Contador de Resultados */}
            <div className="lg:col-span-2 flex items-end">
              <div className="text-sm text-gray-600">
                {isFiltering ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b border-orange-600"></div>
                    <span>Filtrando...</span>
                  </div>
                ) : (
                  <span>
                    Mostrando <span className="font-medium text-gray-900">{filteredBanners.length}</span> de{' '}
                    <span className="font-medium text-gray-900">{banners.length}</span> banners
                    {hasActiveFilters && (
                      <span className="text-orange-600 ml-1">(filtrado)</span>
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Posição no Site *</label>
                  <BannerModelSelect
                    options={posicoesBanner}
                    value={watchedPosicao}
                    onChange={(nome) => { setValue('posicao', nome); handlePosicaoChange(nome); }}
                    placeholder="Digite para buscar posição..."
                  />
                  {errors.posicao && (
                    <p className="mt-1 text-sm text-red-600">{errors.posicao.message}</p>
                  )}
                {watchedPosicao && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    {(() => {
                      const posicaoSelecionada = posicoesBanner.find(p => p.nome === watchedPosicao)
                      return posicaoSelecionada ? (
                        <div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{posicaoSelecionada.tamanhoRecomendado}</span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{posicaoSelecionada.paginas.join(', ')}</span>
                          </div>
                          <div className="text-sm text-blue-800 font-medium">{posicaoSelecionada.nome}</div>
                          <div className="text-sm text-blue-600">{posicaoSelecionada.descricao}</div>
                          <div className="mt-3">
                            <div className="text-xs text-blue-900 font-semibold mb-1">Status da posição</div>
                            {validateLoading ? (
                              <div className="flex items-center text-sm text-blue-700"><div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-2"></div>Validando...</div>
                            ) : validateError ? (
                              <div className="text-sm text-red-700">{validateError}</div>
                            ) : validateResult ? (
                              <div className="space-y-2">
                                <div className={`text-sm ${validateResult.valid ? 'text-green-700' : 'text-orange-700'}`}>{validateResult.message || (validateResult.valid ? 'Posição disponível' : 'Conflitos detectados')}</div>
                                {typeof validateResult.count === 'number' && (
                                  <div className="text-xs text-gray-700">Banners ativos nessa posição: <span className="font-semibold">{validateResult.count}</span></div>
                                )}
                                {Array.isArray(validateResult.conflictingBanners) && validateResult.conflictingBanners.length > 0 && (
                                  <div className="text-xs text-gray-700">
                                    Conflitos:
                                    <ul className="list-disc list-inside">
                                      {validateResult.conflictingBanners.map(cb => (
                                        <li key={cb.id}>{cb.nome}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {!validateResult.valid && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        const resp = await fetch('/api/banners/deactivate', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ posicao: watchedPosicao, local: 'geral', excludeBannerId: editingBanner?.id || undefined })
                                        })
                                        const json = await resp.json()
                                        if (!resp.ok || !json.success) {
                                          alert(json.message || 'Falha ao desativar banners conflitantes')
                                          return
                                        }
                                        alert('Banners conflitantes desativados com sucesso.')
                                        // Revalidar
                                        await triggerValidate(watchedPosicao)
                                      } catch (e: any) {
                                        alert('Erro ao desativar: ' + (e?.message || 'desconhecido'))
                                      }
                                    }}
                                    className="mt-2 inline-flex items-center px-3 py-1.5 rounded bg-orange-600 text-white text-xs hover:bg-orange-700"
                                  >Desativar conflitos</button>
                                )}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null
                    })()}
                  </div>
                )}
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Seleção visual</div>
                  <BannerModelGrid
                    options={posicoesBanner}
                    value={watchedPosicao}
                    onSelect={(nome) => { setValue('posicao', nome); handlePosicaoChange(nome); }}
                  />
                </div>
              </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordem de Exibição
                  </label>
                  <input
                    {...register('ordem', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    max="9999"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">Menor número aparece primeiro na posição.</p>
                </div>

                

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo de Exibição (segundos)
                  </label>
                  <input
                    {...register('tempo_exibicao', { valueAsNumber: true })}
                    type="number"
                    min="1"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="5"
                  />
                  <p className="mt-1 text-xs text-gray-500">Tempo que o banner ficará visível antes de trocar (1-60 segundos).</p>
                  {errors.tempo_exibicao && (
                    <p className="mt-1 text-sm text-red-600">{errors.tempo_exibicao.message}</p>
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

                {/* Botões rápidos de dimensões */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Botões Rápidos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      onClick={() => { setValue('largura', 640); setValue('altura', 200); }}
                    >Aplicar 640×200 (Guia)</button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      onClick={() => { setValue('largura', 585); setValue('altura', 330); }}
                    >Aplicar 585×330 (Padrão)</button>
                    <button
                      type="button"
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                      onClick={() => { setValue('largura', 300); setValue('altura', 600); }}
                    >Aplicar 300×600 (Sidebar)</button>
                  </div>
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
                  showLibraryButton={true}
                  useNewMediaAPI={false}
                />
                {errors.imagem && (
                  <p className="mt-1 text-sm text-red-600">{errors.imagem.message}</p>
                )}
              </div>

              {/* Preview do Banner */}
              {watchedImagem && watchedLargura && watchedAltura && (
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-orange-600" />
                    Preview do Banner
                  </h4>
                  
                    (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                        {/* Header estilo chips */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                            {ordemValue !== '' && (
                              <span className="inline-flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-full bg-gray-200 text-gray-800">
                                {ordemValue}
                              </span>
                            )}
                            {watchedPosicao && (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                {watchedPosicao}
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isSizeCorrect ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                              {isSizeCorrect ? 'Tamanho Correto' : 'Ajustar Tamanho'}
                            </span>
                          </div>
                          {/* Seletor de dispositivo */}
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-gray-600">Visualizar em:</span>
                            <button type="button" onClick={() => setPreviewDevice('desktop')} aria-label="Desktop" className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}>
                              <Monitor className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setPreviewDevice('tablet')} aria-label="Tablet" className={`p-1.5 rounded ${previewDevice === 'tablet' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}>
                              <Tablet className="w-4 h-4" />
                            </button>
                            <button type="button" onClick={() => setPreviewDevice('mobile')} aria-label="Mobile" className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}>
                              <Smartphone className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Área de preview com dimensões exibidas */}
                        <div className="flex justify-center">
                          <div
                            className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white"
                            style={{ width: displayWidth, height: displayHeight, maxWidth: '100%' }}
                          >
                            <img
                              src={watchedImagem}
                              alt={watch('nome') || 'Preview do banner'}
                              className="w-full h-full object-contain"
                              style={{ width: '100%', height: '100%' }}
                            />

                            {/* Overlay para banners inativos */}
                            {!watch('ativo') && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full">Banner Inativo</span>
                              </div>
                            )}

                            {/* Indicador de link */}
                            {watch('link') && (
                              <div className="absolute top-2 right-2">
                                <div className="bg-blue-600 text-white p-1 rounded-full">
                                  <ExternalLink className="w-3 h-3" />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Informações do Preview no estilo da foto */}
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Dimensões:</span>
                            <div className="font-medium">{watchedLargura} × {watchedAltura}px</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Exibindo:</span>
                            <div className="font-medium">{displayWidth} × {displayHeight}px</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Tamanho Ideal:</span>
                            <div className="font-medium">{idealWidth} × {idealHeight}px</div>
                          </div>
                          <div>
                            <span className="text-gray-500">Tipo:</span>
                            <div className="font-medium">Banner Padrão</div>
                          </div>
                        </div>

                        {/* Linha de Link */}
                        <div className="mt-2 text-sm">
                          <span className="text-gray-500">Link:</span>{' '}
                          <span className="font-medium">{watch('link') ? 'Sim' : 'Não'}</span>
                        </div>

                        {/* Dicas de Otimização */}
                        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">💡 Dicas de Otimização</h5>
                          <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Use imagens com boa qualidade e resolução adequada</li>
                            <li>• Mantenha o tamanho do arquivo abaixo de 500KB para melhor performance</li>
                            <li>• Teste a legibilidade em diferentes dispositivos</li>
                            {(watchedLargura <= 320 || watchedAltura <= 100) && (
                              <li>• Para banners pequenos, use texto grande e poucas palavras</li>
                            )}
                            {watch('link') && <li>• Certifique-se de que o link está funcionando corretamente</li>}
                          </ul>
                        </div>
                      </div>
                    )
                </div>
              )}

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

              {/* Seção de Agendamento */}
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                  Agendamento (Opcional)
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Configure quando o banner deve ser exibido automaticamente. Se não definir datas, o banner seguirá apenas o status ativo/inativo.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data/Hora de Início
                    </label>
                    <input
                      {...register('data_inicio')}
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {errors.data_inicio && (
                      <p className="mt-1 text-sm text-red-600">{errors.data_inicio.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Banner começará a ser exibido nesta data/hora
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Data/Hora de Fim
                    </label>
                    <input
                      {...register('data_fim')}
                      type="datetime-local"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                    {errors.data_fim && (
                      <p className="mt-1 text-sm text-red-600">{errors.data_fim.message}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Banner parará de ser exibido nesta data/hora
                    </p>
                  </div>
                </div>

                {/* Preview do período */}
                {(watch('data_inicio') || watch('data_fim')) && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <h5 className="text-sm font-medium text-blue-800 mb-2">Preview do Agendamento:</h5>
                    <div className="text-sm text-blue-600">
                      {watch('data_inicio') && (
                        <p>📅 Início: {new Date(watch('data_inicio')!).toLocaleString('pt-BR')}</p>
                      )}
                      {watch('data_fim') && (
                        <p>📅 Fim: {new Date(watch('data_fim')!).toLocaleString('pt-BR')}</p>
                      )}
                      {watch('data_inicio') && watch('data_fim') && (
                        <p className="mt-1 font-medium">
                          ⏱️ Duração: {Math.ceil((new Date(watch('data_fim')!).getTime() - new Date(watch('data_inicio')!).getTime()) / (1000 * 60 * 60 * 24))} dias
                        </p>
                      )}
                    </div>
                  </div>
                )}
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
            ) : filteredBanners.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum banner encontrado com os filtros aplicados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Tente ajustar os filtros ou{' '}
                    <button
                      onClick={clearFilters}
                      className="text-orange-600 hover:text-orange-500 font-medium"
                    >
                      limpar todos os filtros
                    </button>
                    .
                  </p>
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
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="h-3 w-3" />
                            <span>Analytics</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Link
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Agendamento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBanners.map((banner) => (
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
                            {loadingAllStats ? (
                              <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b border-gray-400"></div>
                                <span className="text-xs text-gray-500">Carregando...</span>
                              </div>
                            ) : bannerStats[banner.id] ? (
                              <div className="text-xs space-y-1">
                                <div className="text-gray-900">
                                  <span className="font-medium">{bannerStats[banner.id].impressoes}</span> impressões
                                </div>
                                <div className="text-gray-900">
                                  <span className="font-medium">{bannerStats[banner.id].cliques}</span> cliques
                                </div>
                                <div className="text-gray-900">
                                  <span className="font-medium">{bannerStats[banner.id].ctr.toFixed(2)}%</span> CTR
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-400">
                                Sem dados
                              </div>
                            )}
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
                            <div className="space-y-1">
                              {(() => {
                                const status = getBannerScheduleStatus(banner)
                                return (
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                    <status.icon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </span>
                                )
                              })()}
                              <CountdownTimer banner={banner} />
                            </div>
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
                  {filteredBanners.map((banner) => (
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
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">Agendamento:</span>
                              {(() => {
                                const status = getBannerScheduleStatus(banner)
                                return (
                                  <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${status.color}`}>
                                    <status.icon className="h-3 w-3 mr-1" />
                                    {status.label}
                                  </span>
                                )
                              })()}
                            </div>
                            
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
            </>
        )}

        {/* Conteúdo da Aba Analytics */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard banners={banners} />
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  try {
    const supabase = createServerSupabaseClient(ctx)
    
    // Buscar banners com ordenação principal por 'created_at' desc e secundária por 'ordem'
    let initialBanners: Banner[] = []

    const { data: orderedByOrdem, error: ordemError } = await supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })
      .order('ordem', { ascending: true })

    if (ordemError) {
      console.warn('SSR: falha ao ordenar por "ordem". Aplicando fallback.', ordemError)
      const { data: orderedByCreatedAt, error: createdAtError } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (createdAtError) {
        console.error('SSR: erro ao buscar banners (fallback):', createdAtError)
      }
      initialBanners = orderedByCreatedAt || []
    } else {
      initialBanners = orderedByOrdem || []
    }

    return {
      props: {
        initialBanners,
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

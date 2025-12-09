/**
 * Banners Admin Page - REFACTORED
 * 
 * Versão refatorada usando componentes modulares
 * Reduzido de 2089 linhas para ~400 linhas
 */

import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { GetServerSideProps } from 'next'
import { Plus, BarChart3 } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import BannerForm from '../../components/admin/banners/BannerForm'
import BannerList from '../../components/admin/banners/BannerList'
import BannerFilters from '../../components/admin/banners/BannerFilters'
import AnalyticsDashboard from '../../components/admin/AnalyticsDashboard'
import { createServerSupabaseClient, supabase, Banner } from '../../lib/supabase'
import { bannerCatalog } from '../../lib/banners/catalog'
import { useToastActions } from '../../components/admin/ToastProvider'
import { log } from '../../lib/logger'
import {
    BannersPageProps,
    BannerWithStats,
    BannerStats,
    BannerFilterState,
    BannerFormData
} from '../../types/banner'
import { getBannerScheduleStatus } from '../../lib/banners/utils'

const posicoesBanner = bannerCatalog.map(p => ({
    ...p,
    tamanhoRecomendado: p.larguraRecomendada && p.alturaRecomendada ? `${p.larguraRecomendada}x${p.alturaRecomendada}` : undefined,
}))

export default function BannersPage({ initialBanners }: BannersPageProps) {
    const loadedOnceRef = useRef(false)
    const { success: showSuccess, error: showError } = useToastActions()

    // State
    const [banners, setBanners] = useState<BannerWithStats[]>(initialBanners)
    const [showForm, setShowForm] = useState(false)
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
    const [loading, setLoading] = useState(false)
    const [loadingList, setLoadingList] = useState(false)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [togglingId, setTogglingId] = useState<string | null>(null)
    const [bannerStats, setBannerStats] = useState<Record<string, BannerStats>>({})
    const [activeTab, setActiveTab] = useState<'banners' | 'analytics'>('banners')

    // Filters - carrega do localStorage se disponível
    const [filters, setFilters] = useState<BannerFilterState>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('bannerFilters')
                if (saved) {
                    const parsed = JSON.parse(saved)
                    // Validar estrutura básica
                    if (parsed && typeof parsed.search === 'string') {
                        return parsed
                    }
                }
            } catch {
                // Ignora erros de parse
            }
        }
        return {
            search: '',
            status: 'all',
            position: 'all',
            period: 'all',
            schedule: 'all'
        }
    })
    const [searchDebounced, setSearchDebounced] = useState(filters.search)

    // Load banners
    const loadBanners = async () => {
        log.info('[Admin] Carregando banners...')
        if (!supabase) {
            showError('Sistema não configurado')
            return
        }

        setLoadingList(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) {
                log.warn('[Admin] Usuário não autenticado')
                return
            }

            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('created_at', { ascending: false })
                .order('ordem', { ascending: true })

            if (error) throw error

            log.info(`[Admin] Banners carregados: ${data?.length || 0}`)
            setBanners(data || [])
        } catch (error: any) {
            log.error('[Admin] Erro ao carregar banners', { error: error.message })
            showError('Erro ao carregar banners: ' + error.message)
        } finally {
            setLoadingList(false)
        }
    }

    // Load stats
    const loadBannerStats = async (signal?: AbortSignal) => {
        log.info('[Admin] Carregando estatísticas...')

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.access_token) return

            const response = await fetch('/api/analytics/stats/all', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                },
                signal
            })

            if (!response.ok) return

            const data = await response.json()
            const statsMap: Record<string, BannerStats> = {}

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

            if (Object.keys(statsMap).length) {
                setBannerStats(statsMap)
                log.info(`[Admin] Stats carregadas: ${Object.keys(statsMap).length}`)
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                log.warn('[Admin] Erro ao carregar stats', { error })
            }
        }
    }

    // Initial load
    useEffect(() => {
        if (loadedOnceRef.current) return
        loadedOnceRef.current = true

        const controller = new AbortController()
        loadBanners()
        loadBannerStats(controller.signal)

        return () => controller.abort()
    }, [])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchDebounced(filters.search)
        }, 300)
        return () => clearTimeout(timer)
    }, [filters.search])

    // Persist filters
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('bannerFilters', JSON.stringify(filters))
        }
    }, [filters])

    // Filter banners
    const filteredBanners = useMemo(() => {
        let filtered = [...banners]

        // Search
        if (searchDebounced.trim()) {
            const searchTerm = searchDebounced.toLowerCase().trim()
            filtered = filtered.filter(banner =>
                banner.nome.toLowerCase().includes(searchTerm)
            )
        }

        // Status
        if (filters.status !== 'all') {
            filtered = filtered.filter(banner =>
                filters.status === 'active' ? banner.ativo : !banner.ativo
            )
        }

        // Position
        if (filters.position !== 'all') {
            filtered = filtered.filter(banner =>
                banner.posicao === filters.position
            )
        }

        // Period
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

        // Schedule status
        if (filters.schedule !== 'all') {
            filtered = filtered.filter(banner => {
                const scheduleStatus = getBannerScheduleStatus(banner)
                return scheduleStatus.status === filters.schedule
            })
        }

        return filtered
    }, [banners, searchDebounced, filters.status, filters.position, filters.period, filters.schedule])

    // Has active filters
    const hasActiveFilters = useMemo(() => {
        return filters.search.trim() !== '' ||
            filters.status !== 'all' ||
            filters.position !== 'all' ||
            filters.period !== 'all' ||
            filters.schedule !== 'all'
    }, [filters])

    // Available positions
    const availablePositions = useMemo(() => {
        const configured = posicoesBanner.map(p => p.nome)
        const fromData = Array.from(new Set(banners.map(banner => banner.posicao)))
        const all = Array.from(new Set([...configured, ...fromData]))
        return all.sort((a, b) => a.localeCompare(b))
    }, [banners])

    // Handlers
    const updateFilter = useCallback((key: keyof BannerFilterState, value: string) => {
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

    const handleEdit = useCallback((banner: Banner) => {
        setEditingBanner(banner)
        setShowForm(true)
    }, [])

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este banner?')) return

        setDeletingId(id)
        try {
            const { error } = await supabase
                .from('banners')
                .delete()
                .eq('id', id)

            if (error) throw error

            showSuccess('Banner excluído com sucesso!')
            loadBanners()
        } catch (error: any) {
            showError('Erro ao excluir banner: ' + error.message)
        } finally {
            setDeletingId(null)
        }
    }

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        setTogglingId(id)
        try {
            const { error } = await supabase
                .from('banners')
                .update({ ativo: !currentStatus })
                .eq('id', id)

            if (error) throw error

            showSuccess(`Banner ${!currentStatus ? 'ativado' : 'desativado'} com sucesso!`)
            loadBanners()
        } catch (error: any) {
            showError('Erro ao atualizar status: ' + error.message)
        } finally {
            setTogglingId(null)
        }
    }

    const handleSubmit = async (data: BannerFormData) => {
        setLoading(true)

        try {
            // Validar imagem - apenas verifica se é URL do Supabase
            // A verificação HEAD foi removida pois pode falhar por CORS e gerar falsos positivos
            if (data.imagem) {
                const imageUrl = new URL(data.imagem)
                const urlPath = imageUrl.pathname || ''
                const hostname = imageUrl.hostname || ''
                const isSupabaseUrl = hostname.includes('supabase.co') || hostname.includes('supabase.in')
                const isPublicBannerUrl = urlPath.includes('/storage/v1/object/public/banners/') || urlPath.split('/').includes('banners')

                if (!isSupabaseUrl) {
                    throw new Error('Imagem deve ser hospedada no Supabase Storage')
                }
                if (!isPublicBannerUrl) {
                    throw new Error('Imagem deve estar no bucket público "banners" do Supabase')
                }
            }

            const sanitizedData = {
                ...data,
                nome: data.nome.trim(),
                link: data.link?.trim() || null,
                largura: Math.round(data.largura),
                altura: Math.round(data.altura),
                ordem: typeof data.ordem === 'number' ? Math.round(data.ordem) : 0,
                local: undefined,
                data_inicio: data.data_inicio ? new Date(data.data_inicio).toISOString() : null,
                data_fim: data.data_fim ? new Date(data.data_fim).toISOString() : null,
            }

            if (editingBanner) {
                const { error } = await supabase
                    .from('banners')
                    .update({
                        ...sanitizedData,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingBanner.id)

                if (error) throw error
                showSuccess('Banner atualizado com sucesso!')
            } else {
                const { data: { session } } = await supabase.auth.getSession()
                const token = session?.access_token || ''

                const response = await fetch('/api/banners', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(sanitizedData)
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || 'Erro ao criar banner')
                }

                showSuccess('Banner criado com sucesso!')
            }

            // Revalidate pages com feedback
            try {
                const revalidateResp = await fetch('/api/revalidate')
                if (!revalidateResp.ok) {
                    log.warn('[Admin] Falha ao revalidar cache', { status: revalidateResp.status })
                }
            } catch (e) {
                log.error('[Admin] Erro ao revalidar cache', { error: e })
                // Não bloqueia o fluxo, apenas avisa
            }

            setShowForm(false)
            setEditingBanner(null)
            loadBanners()
        } catch (error: any) {
            showError('Erro ao salvar banner: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelForm = () => {
        setShowForm(false)
        setEditingBanner(null)
    }

    // Merge stats with banners
    const bannersWithStats: BannerWithStats[] = useMemo(() => {
        return filteredBanners.map(banner => ({
            ...banner,
            stats: bannerStats[banner.id]
        }))
    }, [filteredBanners, bannerStats])

    return (
        <AdminLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Gerencie os banners publicitários do site
                        </p>
                    </div>
                    {!showForm && (
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
                        >
                            <Plus className="h-5 w-5" />
                            <span>Novo Banner</span>
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('banners')}
                            className={`py-2 px-4 border-b-2 transition-colors ${activeTab === 'banners'
                                ? 'border-orange-600 text-orange-600 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Banners ({banners.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`py-2 px-4 border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'analytics'
                                ? 'border-orange-600 text-orange-600 font-medium'
                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            <BarChart3 className="h-4 w-4" />
                            <span>Analytics</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                {activeTab === 'banners' ? (
                    <>
                        {/* Form */}
                        {showForm && (
                            <BannerForm
                                banner={editingBanner}
                                onSubmit={handleSubmit}
                                onCancel={handleCancelForm}
                                loading={loading}
                            />
                        )}

                        {/* Filters */}
                        {!showForm && (
                            <BannerFilters
                                filters={filters}
                                onFilterChange={updateFilter}
                                onClearFilters={clearFilters}
                                availablePositions={availablePositions}
                                hasActiveFilters={hasActiveFilters}
                            />
                        )}

                        {/* List */}
                        {!showForm && (
                            <BannerList
                                banners={bannersWithStats}
                                loading={loadingList}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                                onToggleStatus={handleToggleStatus}
                                deletingId={deletingId}
                                togglingId={togglingId}
                            />
                        )}
                    </>
                ) : (
                    <AnalyticsDashboard />
                )}
            </div>
        </AdminLayout>
    )
}

// Server-side props
export const getServerSideProps: GetServerSideProps = async (context) => {
    const supabase = createServerSupabaseClient(context)

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) {
        return {
            redirect: {
                destination: '/admin/login',
                permanent: false,
            },
        }
    }

    const { data: banners } = await supabase
        .from('banners')
        .select('*')
        .order('created_at', { ascending: false })
        .order('ordem', { ascending: true })

    return {
        props: {
            initialBanners: banners || [],
        },
    }
}

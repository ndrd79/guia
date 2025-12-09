import { useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { BannerWithStats, BannerStats } from '../types/banner'
import { BannerFormData } from '../lib/banners/validation'
import { log } from '../lib/logger'

interface UseBannersAdminOptions {
    onSuccess?: (message: string) => void
    onError?: (message: string) => void
}

/**
 * Hook para gerenciar banners no painel admin
 * Diferente do useBanners público, este hook lida com CRUD completo
 */
export const useBannersAdmin = (initialBanners: BannerWithStats[] = [], options?: UseBannersAdminOptions) => {
    const [banners, setBanners] = useState<BannerWithStats[]>(initialBanners)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [bannerStats, setBannerStats] = useState<Record<string, BannerStats>>({})
    const [loadingStats, setLoadingStats] = useState(false)
    const loadedOnceRef = useRef(false)

    /**
     * Carrega todos os banners do Supabase (incluindo inativos)
     */
    const loadBanners = useCallback(async () => {
        log.debug('[useBannersAdmin] Iniciando carregamento dos banners...')
        if (!supabase) {
            log.error('[useBannersAdmin] Supabase não configurado')
            setError('Sistema não está configurado')
            return
        }

        setLoading(true)
        setError(null)

        try {
            // Verificar autenticação
            const { data: { session } } = await supabase.auth.getSession()
            if (!session?.user) {
                log.warn('[useBannersAdmin] Usuário não autenticado')
                return
            }

            // Ordenação principal por 'created_at' (mais recentes primeiro) e secundária por 'ordem'
            const { data, error } = await supabase
                .from('banners')
                .select('*')
                .order('created_at', { ascending: false })
                .order('ordem', { ascending: true })

            if (error) {
                const errMsg = (error as any)?.message || String(error)
                log.warn('[useBannersAdmin] Erro ao ordenar. Aplicando fallback.', { error: errMsg })

                // Fallback: tentar apenas ordenar por created_at
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('banners')
                    .select('*')
                    .order('created_at', { ascending: false })

                if (fallbackError) {
                    const fbMsg = (fallbackError as any)?.message || String(fallbackError)
                    log.error('[useBannersAdmin] Erro ao carregar banners (fallback)', { error: fbMsg })
                    setError('Erro ao carregar banners: ' + fbMsg)
                    return
                }

                log.info(`[useBannersAdmin] Banners carregados (fallback): ${fallbackData?.length || 0}`)
                setBanners(fallbackData || [])
                return
            }

            log.info(`[useBannersAdmin] Banners carregados: ${data?.length || 0}`)
            setBanners(data || [])
        } catch (error) {
            log.error('[useBannersAdmin] Erro na função loadBanners', { error })
            const msg = (error as any)?.message || String(error)
            setError('Erro inesperado: ' + msg)
        } finally {
            setLoading(false)
        }
    }, [])

    /**
     * Carrega estatísticas de todos os banners
     */
    const loadBannerStats = useCallback(async (signal?: AbortSignal) => {
        log.debug('[useBannersAdmin] Carregando estatísticas...')
        setLoadingStats(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session?.access_token) {
                log.warn('[useBannersAdmin] Não autenticado para carregar estatísticas')
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
                log.warn('[useBannersAdmin] Estatísticas indisponíveis', { status: response.status })
                return
            }

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
                log.info(`[useBannersAdmin] Estatísticas carregadas para ${Object.keys(statsMap).length} banners`)
            }
        } catch (error: any) {
            if (error?.name !== 'AbortError') {
                log.warn('[useBannersAdmin] Erro ao carregar estatísticas', { error })
            }
        } finally {
            setLoadingStats(false)
        }
    }, [])

    /**
     * Cria novo banner
     */
    const createBanner = useCallback(async (data: BannerFormData): Promise<boolean> => {
        log.debug('[useBannersAdmin] Criando banner...')
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token || ''

            const resp = await fetch('/api/admin/banners', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(data)
            })

            const json = await resp.json()
            if (!resp.ok || !json?.success) {
                throw new Error(json?.message || `Falha (status ${resp.status})`)
            }

            log.info('[useBannersAdmin] Banner criado', { id: json.id })
            await loadBanners()
            options?.onSuccess?.('Banner criado!')
            return true
        } catch (error) {
            log.error('[useBannersAdmin] Erro ao criar banner', { error })
            const msg = (error as Error).message
            setError('Erro: ' + msg)
            options?.onError?.(msg)
            return false
        } finally {
            setLoading(false)
        }
    }, [loadBanners, options])

    /**
     * Atualiza banner
     */
    const updateBanner = useCallback(async (id: string, data: BannerFormData): Promise<boolean> => {
        log.debug('[useBannersAdmin] Atualizando banner', { id })
        setLoading(true)

        try {
            const { error } = await supabase
                .from('banners')
                .update({
                    ...data,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)

            if (error) throw error

            log.info('[useBannersAdmin] Banner atualizado', { id })
            await loadBanners()
            options?.onSuccess?.('Banner atualizado!')
            return true
        } catch (error) {
            log.error('[useBannersAdmin] Erro ao atualizar banner', { error })
            const msg = (error as Error).message
            setError('Erro: ' + msg)
            options?.onError?.(msg)
            return false
        } finally {
            setLoading(false)
        }
    }, [loadBanners, options])

    /**
     * Deleta banner
     */
    const deleteBanner = useCallback(async (id: string): Promise<boolean> => {
        log.debug('[useBannersAdmin] Excluindo banner', { id })
        setLoading(true)

        try {
            const { error } = await supabase
                .from('banners')
                .delete()
                .eq('id', id)

            if (error) throw error

            log.info('[useBannersAdmin] Banner excluído', { id })
            await loadBanners()
            options?.onSuccess?.('Banner excluído!')
            return true
        } catch (error) {
            log.error('[useBannersAdmin] Erro ao excluir banner', { error })
            const msg = (error as Error).message
            setError('Erro: ' + msg)
            options?.onError?.(msg)
            return false
        } finally {
            setLoading(false)
        }
    }, [loadBanners, options])

    /**
     * Alterna status ativo/inativo
     */
    const toggleStatus = useCallback(async (id: string, current: boolean): Promise<boolean> => {
        log.debug('[useBannersAdmin] Toggle status', { id, current })
        setLoading(true)

        try {
            const { error } = await supabase
                .from('banners')
                .update({
                    ativo: !current,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)

            if (error) throw error

            log.info('[useBannersAdmin] Status alterado', { id, newStatus: !current })
            await loadBanners()
            options?.onSuccess?.(`Banner ${!current ? 'ativado' : 'desativado'}!`)
            return true
        } catch (error) {
            log.error('[useBannersAdmin] Erro ao alterar status', { error })
            const msg = (error as Error).message
            setError('Erro: ' + msg)
            options?.onError?.(msg)
            return false
        } finally {
            setLoading(false)
        }
    }, [loadBanners, options])

    return {
        banners,
        loading,
        error,
        bannerStats,
        loadingStats,
        loadBanners,
        loadBannerStats,
        createBanner,
        updateBanner,
        deleteBanner,
        toggleStatus,
        loadedOnceRef
    }
}

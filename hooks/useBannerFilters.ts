import { useState, useMemo, useCallback, useEffect } from 'react'
import { BannerWithStats, BannerFilterState } from '../types/banner'
import { getBannerScheduleStatus } from '../lib/banners/helpers'

/**
 * Hook para gerenciar filtros de banners
 */
export const useBannerFilters = () => {
    const [filters, setFilters] = useState<BannerFilterState>({
        search: '',
        status: 'all',
        position: 'all',
        period: 'all',
        schedule: 'all'
    })

    const [searchDebounced, setSearchDebounced] = useState(filters.search)
    const [isFiltering, setIsFiltering] = useState(false)

    // Debounce da busca
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

    // Carregar filtros do localStorage na montagem
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('bannerFilters')
            if (saved) {
                try {
                    const parsedFilters = JSON.parse(saved)
                    setFilters({
                        search: parsedFilters.search || '',
                        status: parsedFilters.status || 'all',
                        position: parsedFilters.position || 'all',
                        period: parsedFilters.period || 'all',
                        schedule: parsedFilters.schedule || 'all'
                    })
                } catch {
                    // Se houver erro, manter valores padrão
                }
            }
        }
    }, [])

    /**
     * Atualiza um filtro específico
     */
    const updateFilter = useCallback((key: keyof BannerFilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }, [])

    /**
     * Limpa todos os filtros
     */
    const clearFilters = useCallback(() => {
        setFilters({
            search: '',
            status: 'all',
            position: 'all',
            period: 'all',
            schedule: 'all'
        })
    }, [])

    /**
     * Aplica filtros ao array de banners
     */
    const filterBanners = useCallback((banners: BannerWithStats[]) => {
        setIsFiltering(true)

        let filtered = [...banners]

        // Filtro por busca (nome)
        if (searchDebounced.trim()) {
            const searchTerm = searchDebounced.toLowerCase().trim()
            filtered = filtered.filter(banner =>
                banner.nome.toLowerCase().includes(searchTerm)
            )
        }

        // Filtro por status ativo/inativo
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
    }, [searchDebounced, filters])

    /**
     * Verifica se há filtros ativos
     */
    const hasActiveFilters = useMemo(() => {
        return filters.search.trim() !== '' ||
            filters.status !== 'all' ||
            filters.position !== 'all' ||
            filters.period !== 'all' ||
            filters.schedule !== 'all'
    }, [filters])

    return {
        filters,
        searchDebounced,
        isFiltering,
        updateFilter,
        clearFilters,
        filterBanners,
        hasActiveFilters
    }
}

import { Banner } from '../lib/supabase'
import { LucideIcon } from 'lucide-react'

// Stats interface
export interface BannerStats {
    impressoes: number
    cliques: number
    ctr: number
}

// Banner with stats
export interface BannerWithStats extends Banner {
    stats?: BannerStats
}

// Filter state
export interface BannerFilterState {
    search: string
    status: 'all' | 'active' | 'inactive'
    position: string
    period: 'all' | 'week' | 'month'
    schedule: 'all' | 'active' | 'scheduled' | 'expired' | 'inactive'
}

// Schedule status
export interface BannerScheduleStatus {
    status: 'inactive' | 'active' | 'scheduled' | 'expired'
    label: string
    color: string
    icon: LucideIcon
}

// Validation result
export interface BannerValidationResult {
    valid: boolean
    message?: string
    conflictingBanners?: Array<{
        id: string
        nome: string
        ativo: boolean
        local?: string | null
    }>
    count?: number
}

// Position info from catalog
export interface BannerPositionInfo {
    nome: string
    descricao?: string
    larguraRecomendada?: number
    alturaRecomendada?: number
    tamanhoRecomendado?: string
    paginas?: string[]
}

// Tipo centralizado para local de banner
export type BannerLocal = 'geral' | 'home' | 'guia_comercial' | 'noticias' | 'eventos' | 'classificados' | 'contato'

// Form data (matches zod schema)
export interface BannerFormData {
    nome: string
    posicao: string
    imagem: string
    link?: string
    largura: number
    altura: number
    ordem?: number
    tempo_exibicao: number
    local: BannerLocal
    ativo: boolean
    data_inicio?: string
    data_fim?: string
}

// Page props
export interface BannersPageProps {
    initialBanners: Banner[]
}

// Device preview type
export type DeviceType = 'desktop' | 'tablet' | 'mobile'

// Banner card props
export interface BannerCardProps {
    banner: BannerWithStats
    onEdit: (banner: Banner) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string, currentStatus: boolean) => void
    isDeleting?: boolean
    isToggling?: boolean
}

// Banner list props
export interface BannerListProps {
    banners: BannerWithStats[]
    loading?: boolean
    onEdit: (banner: Banner) => void
    onDelete: (id: string) => void
    onToggleStatus: (id: string, currentStatus: boolean) => void
    deletingId?: string | null
    togglingId?: string | null
}

// Banner form props
export interface BannerFormProps {
    banner?: Banner | null
    onSubmit: (data: BannerFormData) => Promise<void>
    onCancel: () => void
    loading?: boolean
}

// Banner filters props
export interface BannerFiltersProps {
    filters: BannerFilterState
    onFilterChange: (key: keyof BannerFilterState, value: string) => void
    onClearFilters: () => void
    availablePositions: string[]
    hasActiveFilters: boolean
}

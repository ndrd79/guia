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

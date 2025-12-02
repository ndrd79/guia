import { Banner } from '../lib/supabase'
import { BannerScheduleStatus } from '../types/banner'
import { EyeOff, CheckCircle, Calendar, AlertTriangle } from 'lucide-react'

/**
 * Valida se uma URL é segura (protocolo HTTP/HTTPS, não é IP local/privado)
 */
export const isSecureUrl = (url: string): boolean => {
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

/**
 * Determina o status de agendamento de um banner
 */
export const getBannerScheduleStatus = (banner: Banner): BannerScheduleStatus => {
    const now = new Date()

    // Se o banner está inativo, retorna inativo
    if (!banner.ativo) {
        return {
            status: 'inactive',
            label: 'Inativo',
            color: 'bg-gray-100 text-gray-800',
            icon: EyeOff
        }
    }

    // Se não tem agendamento, é ativo normal
    if (!banner.data_inicio && !banner.data_fim) {
        return {
            status: 'active',
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
            status: 'scheduled',
            label: 'Agendado',
            color: 'bg-blue-100 text-blue-800',
            icon: Calendar
        }
    }

    // Banner expirado
    if (dataFim && now > dataFim) {
        return {
            status: 'expired',
            label: 'Expirado',
            color: 'bg-red-100 text-red-800',
            icon: AlertTriangle
        }
    }

    // Banner ativo no período
    return {
        status: 'active',
        label: 'Ativo',
        color: 'bg-green-100 text-green-800',
        icon: CheckCircle
    }
}

/**
 * Calcula o tempo restante até uma data alvo
 */
export const getTimeRemaining = (targetDate: Date): string | null => {
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

/**
 * Verifica se o banner está prestes a expirar (menos de 24h)
 */
export const isBannerExpiringSoon = (banner: Banner): boolean => {
    if (!banner.data_fim) return false

    const now = new Date()
    const dataFim = new Date(banner.data_fim)
    const hoursUntilExpiry = (dataFim.getTime() - now.getTime()) / (1000 * 60 * 60)

    return hoursUntilExpiry > 0 && hoursUntilExpiry <= 24
}

/**
 * Mapeia "local" para nomes de páginas legíveis
 */
export const mapLocalToPagina = (local: string): string[] => {
    switch (local) {
        case 'home': return ['Página Inicial']
        case 'guia_comercial': return ['Guia Comercial']
        case 'noticias': return ['Notícias']
        case 'eventos': return ['Eventos']
        case 'classificados': return ['Classificados']
        case 'geral':
        default:
            return ['Todas as páginas']
    }
}

/**
 * Formata uma data para o formato datetime-local do HTML
 */
export const formatDateForInput = (dateString: string | null): string => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toISOString().slice(0, 16) // Remove segundos e timezone
}

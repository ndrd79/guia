/**
 * Utilitários centralizados para APIs
 * 
 * Este módulo exporta todas as funções de segurança e utilidades
 * para APIs do projeto.
 */

export {
    withAdminAuth,
    withAuth,
    type AdminApiHandler
} from './withAdminAuth'

export {
    rateLimit,
    getClientIP,
    withRateLimit
} from './rateLimit'

// Re-exportar tipos úteis
export type { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'

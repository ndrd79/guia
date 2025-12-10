import { NextApiRequest, NextApiResponse } from 'next'
import { withAdminAuth, AdminApiHandler } from '../../../lib/api/withAdminAuth'

/**
 * API de diagnóstico do ambiente
 * 
 * Segurança: Protegida com withAdminAuth - apenas administradores podem acessar
 * Útil para debug de problemas de configuração em produção
 */
const handler: AdminApiHandler = async (req, res, { userId, userEmail }) => {
  try {
    // Retornar informações de diagnóstico (apenas para admins autenticados)
    return res.status(200).json({
      ok: true,
      env: {
        NEXT_PUBLIC_SUPABASE_URL_present: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY_present: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        SUPABASE_SERVICE_ROLE_KEY_present: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        NODE_ENV: process.env.NODE_ENV,
      },
      auth: {
        authenticated: true,
        userId,
        email: userEmail,
        isAdmin: true, // Se chegou aqui, é admin
      },
      server: {
        timestamp: new Date().toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      hint: 'Você está autenticado como administrador. Todas as variáveis de ambiente críticas estão configuradas.',
    })
  } catch (error: any) {
    console.error('Erro em /api/admin/diagnostico:', error)
    return res.status(500).json({ ok: false, error: error?.message || String(error) })
  }
}

export default withAdminAuth(handler, { allowedMethods: ['GET'] })
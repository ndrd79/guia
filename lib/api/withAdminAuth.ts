import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import { createClient } from '@supabase/supabase-js'

/**
 * Middleware centralizado para autenticação de APIs administrativas
 * 
 * Segurança:
 * - Usa getUser() em vez de getSession() para validação server-side
 * - Verifica role admin no banco de dados
 * - Sem bypass de desenvolvimento (evita vulnerabilidades)
 * - Rate limiting opcional
 */

export type AdminApiHandler = (
    req: NextApiRequest,
    res: NextApiResponse,
    context: {
        userId: string
        userEmail: string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        adminClient: any // Supabase client com service role
    }
) => Promise<void | NextApiResponse>

interface WithAdminAuthOptions {
    /** Métodos HTTP permitidos (default: todos) */
    allowedMethods?: ('GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH')[]
    /** Requer verificação de CSRF para métodos mutantes (default: false) */
    requireCsrf?: boolean
}

/**
 * Wrapper para APIs que requerem autenticação de administrador
 * 
 * @example
 * export default withAdminAuth(async (req, res, { userId, adminClient }) => {
 *   const { data } = await adminClient.from('banners').select('*')
 *   return res.json({ data })
 * })
 */
export function withAdminAuth(
    handler: AdminApiHandler,
    options: WithAdminAuthOptions = {}
): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const { allowedMethods, requireCsrf = false } = options

        // Verificar método HTTP permitido
        if (allowedMethods && !allowedMethods.includes(req.method as any)) {
            res.setHeader('Allow', allowedMethods.join(', '))
            return res.status(405).json({
                success: false,
                error: 'Método não permitido',
                allowedMethods
            })
        }

        // Verificar configuração do Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            console.error('[withAdminAuth] Configuração do Supabase ausente')
            return res.status(500).json({
                success: false,
                error: 'Erro de configuração do servidor'
            })
        }

        // Extrair token de autenticação
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticação não fornecido',
                code: 'MISSING_TOKEN'
            })
        }

        const token = authHeader.slice(7)

        if (!token || token.length < 10) {
            return res.status(401).json({
                success: false,
                error: 'Token de autenticação inválido',
                code: 'INVALID_TOKEN'
            })
        }

        try {
            // Criar cliente público para validar o token
            const publicClient = createClient(supabaseUrl, supabaseAnonKey)

            // IMPORTANTE: Usar getUser() em vez de getSession()
            // getUser() valida o token no servidor Supabase
            // getSession() pode retornar dados de cookie/localStorage adulterados
            const { data: { user }, error: userError } = await publicClient.auth.getUser(token)

            if (userError || !user) {
                console.warn('[withAdminAuth] Token inválido ou expirado:', userError?.message)
                return res.status(401).json({
                    success: false,
                    error: 'Sessão expirada ou inválida. Faça login novamente.',
                    code: 'INVALID_SESSION'
                })
            }

            // Criar cliente administrativo (bypass RLS)
            const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
                auth: { autoRefreshToken: false, persistSession: false }
            })

            // Verificar se o usuário tem role admin
            const { data: profile, error: profileError } = await adminClient
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profileError) {
                console.error('[withAdminAuth] Erro ao buscar perfil:', profileError.message)
                return res.status(500).json({
                    success: false,
                    error: 'Erro ao verificar permissões'
                })
            }

            if (!profile || profile.role !== 'admin') {
                console.warn('[withAdminAuth] Acesso negado para usuário:', user.id, 'Role:', profile?.role)
                return res.status(403).json({
                    success: false,
                    error: 'Acesso negado. Apenas administradores.',
                    code: 'FORBIDDEN'
                })
            }

            // Verificação CSRF para métodos mutantes (opcional)
            if (requireCsrf && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method || '')) {
                const csrfCookie = req.cookies?.csrf
                const csrfHeader = req.headers['x-csrf-token']

                if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
                    return res.status(403).json({
                        success: false,
                        error: 'Token CSRF inválido',
                        code: 'CSRF_FAILED'
                    })
                }
            }

            // Chamar o handler com o contexto autenticado
            return await handler(req, res, {
                userId: user.id,
                userEmail: user.email || '',
                adminClient
            })

        } catch (error) {
            console.error('[withAdminAuth] Erro inesperado:', error)
            return res.status(500).json({
                success: false,
                error: 'Erro interno do servidor',
                details: error instanceof Error ? error.message : String(error)
            })
        }
    }
}

/**
 * Versão simplificada que apenas verifica autenticação (qualquer usuário logado)
 * Útil para APIs de usuário normal (não admin)
 */
export function withAuth(
    handler: (
        req: NextApiRequest,
        res: NextApiResponse,
        context: { userId: string; userEmail: string }
    ) => Promise<void | NextApiResponse>
): NextApiHandler {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
            return res.status(500).json({ error: 'Erro de configuração do servidor' })
        }

        const authHeader = req.headers.authorization

        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Token não fornecido' })
        }

        const token = authHeader.slice(7)
        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        const { data: { user }, error } = await supabase.auth.getUser(token)

        if (error || !user) {
            return res.status(401).json({ error: 'Sessão inválida' })
        }

        return handler(req, res, {
            userId: user.id,
            userEmail: user.email || ''
        })
    }
}

export default withAdminAuth

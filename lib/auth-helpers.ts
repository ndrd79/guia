import { supabase } from './supabase'

/**
 * Obtém um token de acesso fresco, forçando refresh se necessário.
 * 
 * O `getSession()` do Supabase pode retornar um token expirado/stale do cache local.
 * Esta função verifica se o token está prestes a expirar e força um refresh quando
 * necessário, evitando erros 401 em chamadas de API.
 * 
 * @returns O access_token válido ou null se não houver sessão
 */
export async function getFreshAccessToken(): Promise<string | null> {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      console.warn('[auth-helpers] Sem sessão ativa, tentando refresh...')
      // Tentar refresh da sessão
      const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError || !refreshData.session) {
        console.error('[auth-helpers] Falha ao renovar sessão:', refreshError?.message)
        return null
      }
      return refreshData.session.access_token
    }

    // Verificar se o token expira em menos de 60 segundos
    const expiresAt = session.expires_at
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000)
      const timeUntilExpiry = expiresAt - now

      if (timeUntilExpiry < 60) {
        console.log('[auth-helpers] Token expirando em breve, fazendo refresh...')
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError || !refreshData.session) {
          console.warn('[auth-helpers] Falha no refresh, usando token atual')
          return session.access_token
        }
        return refreshData.session.access_token
      }
    }

    return session.access_token
  } catch (err) {
    console.error('[auth-helpers] Erro ao obter token:', err)
    return null
  }
}

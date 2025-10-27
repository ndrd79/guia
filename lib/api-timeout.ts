// Utilitário para implementar timeouts nas APIs
// Previne APIs que ficam "penduradas" indefinidamente

export interface TimeoutConfig {
  timeoutMs?: number
  timeoutMessage?: string
}

export const DEFAULT_API_TIMEOUT = 10000 // 10 segundos
export const UPLOAD_API_TIMEOUT = 30000 // 30 segundos para uploads
export const AUTH_API_TIMEOUT = 5000 // 5 segundos para autenticação

/**
 * Wrapper para adicionar timeout a qualquer Promise
 */
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number = DEFAULT_API_TIMEOUT,
  timeoutMessage: string = 'Operação expirou'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`TIMEOUT: ${timeoutMessage} (${timeoutMs}ms)`))
      }, timeoutMs)
    })
  ])
}

/**
 * Middleware para adicionar timeout automático às APIs Next.js
 */
export function withApiTimeout(
  handler: (req: any, res: any) => Promise<any>,
  config: TimeoutConfig = {}
) {
  const { timeoutMs = DEFAULT_API_TIMEOUT, timeoutMessage = 'API timeout' } = config

  return async (req: any, res: any) => {
    // Verificar se a resposta já foi enviada
    if (res.headersSent) {
      return
    }

    try {
      await withTimeout(
        handler(req, res),
        timeoutMs,
        timeoutMessage
      )
    } catch (error: any) {
      // Se a resposta já foi enviada, não fazer nada
      if (res.headersSent) {
        return
      }

      // Se for timeout, retornar erro específico
      if (error.message?.includes('TIMEOUT:')) {
        return res.status(408).json({
          error: 'Request Timeout',
          message: 'A operação demorou muito para ser concluída',
          timeout: timeoutMs
        })
      }

      // Para outros erros, re-lançar
      throw error
    }
  }
}

/**
 * Timeout específico para operações de banco de dados
 */
export function withDatabaseTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 8000
): Promise<T> {
  return withTimeout(promise, timeoutMs, 'Operação de banco de dados expirou')
}

/**
 * Timeout específico para operações de autenticação
 */
export function withAuthTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = AUTH_API_TIMEOUT
): Promise<T> {
  return withTimeout(promise, timeoutMs, 'Verificação de autenticação expirou')
}

/**
 * Timeout específico para uploads
 */
export function withUploadTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = UPLOAD_API_TIMEOUT
): Promise<T> {
  return withTimeout(promise, timeoutMs, 'Upload expirou')
}
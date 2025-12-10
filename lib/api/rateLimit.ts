/**
 * Rate Limiting simples para APIs
 * 
 * Implementação em memória - para produção com múltiplas instâncias,
 * considere usar Redis ou similar
 */

interface RateLimitEntry {
    count: number
    firstRequest: number
    lastRequest: number
}

// Armazena contagem de requests por IP
const rateLimitMap = new Map<string, RateLimitEntry>()

// Limpa entradas antigas periodicamente (a cada 5 minutos)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanupOldEntries(windowMs: number) {
    const now = Date.now()
    if (now - lastCleanup < CLEANUP_INTERVAL) return

    lastCleanup = now
    const entries = Array.from(rateLimitMap.entries())
    for (let i = 0; i < entries.length; i++) {
        const [key, entry] = entries[i]
        if (now - entry.lastRequest > windowMs) {
            rateLimitMap.delete(key)
        }
    }
}

interface RateLimitOptions {
    /** Número máximo de requests permitidos na janela de tempo */
    maxRequests?: number
    /** Janela de tempo em milissegundos (default: 60 segundos) */
    windowMs?: number
    /** Mensagem de erro personalizada */
    message?: string
}

interface RateLimitResult {
    /** Se o request deve ser permitido */
    allowed: boolean
    /** Número de requests restantes na janela */
    remaining: number
    /** Timestamp de quando a janela reseta */
    resetAt: number
    /** Tempo em segundos até o reset */
    retryAfter: number
}

/**
 * Verifica se um IP ultrapassou o limite de requests
 * 
 * @example
 * const result = rateLimit(getClientIP(req), { maxRequests: 100, windowMs: 60000 })
 * if (!result.allowed) {
 *   res.setHeader('Retry-After', result.retryAfter)
 *   return res.status(429).json({ error: 'Too many requests' })
 * }
 */
export function rateLimit(
    identifier: string,
    options: RateLimitOptions = {}
): RateLimitResult {
    const {
        maxRequests = 100,
        windowMs = 60 * 1000 // 1 minuto
    } = options

    const now = Date.now()

    // Limpar entradas antigas periodicamente
    cleanupOldEntries(windowMs)

    const entry = rateLimitMap.get(identifier)

    // Primeira request deste IP
    if (!entry) {
        rateLimitMap.set(identifier, {
            count: 1,
            firstRequest: now,
            lastRequest: now
        })

        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetAt: now + windowMs,
            retryAfter: 0
        }
    }

    // Janela expirou - resetar contagem
    if (now - entry.firstRequest > windowMs) {
        rateLimitMap.set(identifier, {
            count: 1,
            firstRequest: now,
            lastRequest: now
        })

        return {
            allowed: true,
            remaining: maxRequests - 1,
            resetAt: now + windowMs,
            retryAfter: 0
        }
    }

    // Dentro da janela - verificar limite
    entry.count++
    entry.lastRequest = now

    const resetAt = entry.firstRequest + windowMs
    const retryAfter = Math.ceil((resetAt - now) / 1000)

    if (entry.count > maxRequests) {
        return {
            allowed: false,
            remaining: 0,
            resetAt,
            retryAfter
        }
    }

    return {
        allowed: true,
        remaining: maxRequests - entry.count,
        resetAt,
        retryAfter: 0
    }
}

/**
 * Extrai o IP real do cliente considerando proxies
 */
export function getClientIP(req: {
    headers: Record<string, string | string[] | undefined>
    socket?: { remoteAddress?: string }
}): string {
    // Vercel/Cloudflare headers
    const forwardedFor = req.headers['x-forwarded-for']
    if (forwardedFor) {
        const ips = Array.isArray(forwardedFor)
            ? forwardedFor[0]
            : forwardedFor.split(',')[0]
        return ips.trim()
    }

    // Cloudflare specific
    const cfIP = req.headers['cf-connecting-ip']
    if (cfIP) {
        return Array.isArray(cfIP) ? cfIP[0] : cfIP
    }

    // Real IP header (nginx)
    const realIP = req.headers['x-real-ip']
    if (realIP) {
        return Array.isArray(realIP) ? realIP[0] : realIP
    }

    // Socket remote address
    return req.socket?.remoteAddress || 'unknown'
}

/**
 * Middleware wrapper para aplicar rate limiting
 * 
 * @example
 * import { withRateLimit } from '@/lib/api/rateLimit'
 * 
 * export default withRateLimit(handler, { maxRequests: 50, windowMs: 60000 })
 */
export function withRateLimit<T extends (...args: any[]) => any>(
    handler: T,
    options: RateLimitOptions = {}
): T {
    const wrappedHandler = async (req: any, res: any, ...rest: any[]) => {
        const ip = getClientIP(req)
        const result = rateLimit(ip, options)

        // Adicionar headers de rate limit
        res.setHeader('X-RateLimit-Limit', options.maxRequests || 100)
        res.setHeader('X-RateLimit-Remaining', result.remaining)
        res.setHeader('X-RateLimit-Reset', result.resetAt)

        if (!result.allowed) {
            res.setHeader('Retry-After', result.retryAfter)
            return res.status(429).json({
                success: false,
                error: options.message || 'Muitas requisições. Tente novamente em alguns segundos.',
                retryAfter: result.retryAfter
            })
        }

        return handler(req, res, ...rest)
    }

    return wrappedHandler as T
}

export default rateLimit

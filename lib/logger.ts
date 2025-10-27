// Sistema de logging estruturado para produção
// Substitui console.log por logging adequado

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isProduction = process.env.NODE_ENV === 'production'

  private formatLog(entry: LogEntry): string {
    if (this.isDevelopment) {
      // Em desenvolvimento, usar formato legível
      const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : ''
      return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${contextStr}`
    } else {
      // Em produção, usar JSON estruturado
      return JSON.stringify(entry)
    }
  }

  private log(level: LogLevel, message: string, context?: Record<string, any>) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context
    }

    const formattedLog = this.formatLog(entry)

    // Em produção, usar apenas console.error para erros críticos
    if (this.isProduction) {
      if (level === 'error') {
        console.error(formattedLog)
      }
      // Em produção, não loggar info/debug/warn no console
      return
    }

    // Em desenvolvimento, usar console apropriado
    switch (level) {
      case 'error':
        console.error(formattedLog)
        break
      case 'warn':
        console.warn(formattedLog)
        break
      case 'info':
        console.info(formattedLog)
        break
      case 'debug':
        console.debug(formattedLog)
        break
    }
  }

  info(message: string, context?: Record<string, any>) {
    this.log('info', message, context)
  }

  warn(message: string, context?: Record<string, any>) {
    this.log('warn', message, context)
  }

  error(message: string, context?: Record<string, any>) {
    this.log('error', message, context)
  }

  debug(message: string, context?: Record<string, any>) {
    this.log('debug', message, context)
  }

  // Método especial para middleware
  middleware(message: string, pathname: string, context?: Record<string, any>) {
    this.info(`[MIDDLEWARE] ${message}`, { pathname, ...context })
  }

  // Método especial para APIs
  api(message: string, endpoint: string, context?: Record<string, any>) {
    this.info(`[API] ${message}`, { endpoint, ...context })
  }

  // Método especial para autenticação
  auth(message: string, context?: Record<string, any>) {
    this.info(`[AUTH] ${message}`, context)
  }
}

// Instância singleton
export const logger = new Logger()

// Função de conveniência para migração gradual
export const log = {
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  debug: logger.debug.bind(logger),
  middleware: logger.middleware.bind(logger),
  api: logger.api.bind(logger),
  auth: logger.auth.bind(logger)
}
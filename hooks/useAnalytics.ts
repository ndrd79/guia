import { useCallback, useRef } from 'react'

interface AnalyticsData {
  bannerId: string
  tipo: 'impressao' | 'clique'
  posicao?: string
}

interface UseAnalyticsReturn {
  trackImpression: (bannerId: string, position?: string) => void
  trackClick: (bannerId: string, position?: string) => void
}

// Cache para evitar múltiplas impressões do mesmo banner na mesma sessão
const impressionCache = new Set<string>()

// Throttle para evitar muitas chamadas simultâneas
const throttleCache = new Map<string, number>()
const THROTTLE_DELAY = 1000 // 1 segundo

export const useAnalytics = (): UseAnalyticsReturn => {
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendAnalytics = useCallback(async (data: AnalyticsData) => {
    console.log('📤 sendAnalytics iniciado:', data);
    
    // Validar se bannerId é válido
    if (!data.bannerId || typeof data.bannerId !== 'string') {
      console.warn('Analytics: bannerId inválido', data.bannerId)
      return
    }

    // Implementar throttling
    const throttleKey = `${data.bannerId}-${data.tipo}`
    const now = Date.now()
    const lastCall = throttleCache.get(throttleKey)
    
    if (lastCall && now - lastCall < THROTTLE_DELAY) {
      console.log('⏰ Throttle ativo, ignorando envio:', {
        key: throttleKey,
        lastSent: new Date(lastCall).toISOString(),
        timeDiff: now - lastCall
      });
      return
    }
    
    throttleCache.set(throttleKey, now)
    console.log('✅ Throttle OK, enviando para API...');

    try {
      // Cancelar requisição anterior se ainda estiver pendente
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Criar novo AbortController
      abortControllerRef.current = new AbortController()

      console.log('🌐 Fazendo requisição para /api/analytics/track');
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: abortControllerRef.current.signal,
      })

      console.log('📡 Resposta da API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.warn('Analytics: erro na resposta', {
          status: response.status,
          error: errorData.error || 'Erro desconhecido'
        })
        return
      }

      const result = await response.json()
      console.log('✅ Analytics enviado com sucesso:', result);

    } catch (error: any) {
      // Ignorar erros de abort (cancelamento)
      if (error.name === 'AbortError') {
        console.debug('Analytics: requisição cancelada')
        return
      }

      // Log silencioso de outros erros (não quebrar a experiência do usuário)
      console.error('❌ Erro ao enviar analytics:', {
        error: error.message,
        tipo: data.tipo,
        bannerId: data.bannerId
      })
    }
  }, [])

  const trackImpression = useCallback((bannerId: string, position?: string) => {
    // Verificar se já foi registrada impressão para este banner nesta sessão
    const cacheKey = `impression-${bannerId}`
    if (impressionCache.has(cacheKey)) {
      console.debug('Analytics: impressão já registrada para', bannerId)
      return
    }

    // Adicionar ao cache
    impressionCache.add(cacheKey)

    // Enviar analytics
    sendAnalytics({
      bannerId,
      tipo: 'impressao',
      posicao: position
    })
  }, [sendAnalytics])

  const trackClick = useCallback((bannerId: string, position?: string) => {
    console.log('🎯 trackClick chamado:', {
      bannerId,
      position,
      timestamp: new Date().toISOString()
    });
    
    sendAnalytics({
      bannerId,
      tipo: 'clique',
      posicao: position
    })
  }, [sendAnalytics])

  return {
    trackImpression,
    trackClick
  }
}

export default useAnalytics
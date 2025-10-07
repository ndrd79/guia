import { useState, useEffect, useCallback, useMemo } from 'react'
import { supabase, Banner } from '../lib/supabase'

// Cache simples para banners
const bannerCache = new Map<string, { data: Banner[], timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

export function useBanners(posicao?: string) {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBanners = useCallback(async () => {
    if (!supabase) {
      setError('Sistema não configurado')
      setLoading(false)
      return
    }

    const cacheKey = posicao || 'all'
    const cached = bannerCache.get(cacheKey)
    
    // Verificar cache
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setBanners(cached.data)
      setLoading(false)
      return
    }

    try {
      let query = supabase
        .from('banners')
        .select('*')
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      if (posicao) {
        query = query.eq('posicao', posicao)
      }

      const { data, error } = await query

      if (error) throw error

      const bannersData = data || []
      setBanners(bannersData)
      
      // Atualizar cache
      bannerCache.set(cacheKey, {
        data: bannersData,
        timestamp: Date.now()
      })
    } catch (err) {
      console.error('Erro ao carregar banners:', err)
      setError('Erro ao carregar banners')
    } finally {
      setLoading(false)
    }
  }, [posicao])

  useEffect(() => {
    loadBanners()
  }, [loadBanners])

  return { banners, loading, error }
}

// Hook para obter um banner específico por posição
export function useBanner(posicao: string) {
  const { banners, loading, error } = useBanners(posicao)
  
  // Retorna o primeiro banner ativo da posição
  const banner = banners.length > 0 ? banners[0] : null
  
  return { banner, loading, error }
}

// Hook para obter múltiplos banners de uma posição
export function useMultipleBanners(posicao: string, limit?: number) {
  const { banners, loading, error } = useBanners(posicao)
  
  const limitedBanners = limit ? banners.slice(0, limit) : banners
  
  return { banners: limitedBanners, loading, error }
}
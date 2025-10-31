import { useCallback } from 'react'

interface AnalyticsEvent {
  event: string
  banner_id: string
  position: string
  url?: string
  timestamp: number
}

export function useAnalytics() {
  // Track banner view
  const trackBannerView = useCallback(async (bannerId: string, position: string) => {
    try {
      const event: AnalyticsEvent = {
        event: 'banner_view',
        banner_id: bannerId,
        position,
        timestamp: Date.now()
      }

      // Enviar para API de analytics
      await fetch('/api/analytics/banner-view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      // Google Analytics (se disponível)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'banner_view', {
          banner_id: bannerId,
          position: position,
          custom_parameter: 'banner_tracking'
        })
      }
    } catch (error) {
      console.warn('Erro ao rastrear visualização do banner:', error)
    }
  }, [])

  // Track banner click
  const trackBannerClick = useCallback(async (bannerId: string, position: string, url: string) => {
    try {
      const event: AnalyticsEvent = {
        event: 'banner_click',
        banner_id: bannerId,
        position,
        url,
        timestamp: Date.now()
      }

      // Enviar para API de analytics
      await fetch('/api/analytics/banner-click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })

      // Google Analytics (se disponível)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'banner_click', {
          banner_id: bannerId,
          position: position,
          destination_url: url,
          custom_parameter: 'banner_tracking'
        })
      }
    } catch (error) {
      console.warn('Erro ao rastrear clique do banner:', error)
    }
  }, [])

  return {
    trackBannerView,
    trackBannerClick
  }
}
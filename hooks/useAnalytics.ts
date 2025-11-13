import { useCallback } from 'react'

interface AnalyticsEvent {
  event: string
  banner_id: string
  position: string
  url?: string
  timestamp: number
}

export function useAnalytics() {
  const sendBeaconJson = (url: string, payload: any) => {
    try {
      if (typeof navigator !== 'undefined' && (navigator as any).sendBeacon) {
        const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
        ;(navigator as any).sendBeacon(url, blob)
        return
      }
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(() => {})
    } catch {}
  }

  const trackBannerView = useCallback((bannerId: string, position: string) => {
    const event: AnalyticsEvent = {
      event: 'banner_view',
      banner_id: bannerId,
      position,
      timestamp: Date.now()
    }
    sendBeaconJson('/api/analytics/banner-view', event)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'banner_view', {
        banner_id: bannerId,
        position: position,
        custom_parameter: 'banner_tracking'
      })
    }
  }, [])

  const trackBannerClick = useCallback((bannerId: string, position: string, url: string) => {
    const event: AnalyticsEvent = {
      event: 'banner_click',
      banner_id: bannerId,
      position,
      url,
      timestamp: Date.now()
    }
    sendBeaconJson('/api/analytics/banner-click', event)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'banner_click', {
        banner_id: bannerId,
        position: position,
        destination_url: url,
        custom_parameter: 'banner_tracking'
      })
    }
  }, [])

  return {
    trackBannerView,
    trackBannerClick
  }
}

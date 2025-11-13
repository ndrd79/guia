import { useCallback } from 'react'

export function useBannerAnalytics() {
  const postEvent = useCallback(async (slug: string, bannerId: string, slotId: string, eventType: 'impression' | 'click' | 'view') => {
    try {
      await fetch(`/api/banners/slot/${slug}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ banner_id: bannerId, slot_id: slotId, event_type: eventType })
      })
    } catch (error) {
    }
  }, [])

  const trackImpression = useCallback(async (bannerId: string, slotId: string, slug: string) => {
    await postEvent(slug, bannerId, slotId, 'impression')
  }, [postEvent])

  const trackClick = useCallback(async (bannerId: string, slotId: string, slug: string) => {
    await postEvent(slug, bannerId, slotId, 'click')
  }, [postEvent])

  const trackView = useCallback(async (bannerId: string, slotId: string, slug: string) => {
    await postEvent(slug, bannerId, slotId, 'view')
  }, [postEvent])

  return { trackImpression, trackClick, trackView }
}

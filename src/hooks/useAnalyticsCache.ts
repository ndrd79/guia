import { useState, useEffect, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds (default: 5 minutes)
  maxSize?: number // Maximum number of entries (default: 50)
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry<any>>()
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes
  private readonly maxSize = 50

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove expired entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.cleanup()
    }

    const now = Date.now()
    const expiresAt = now + (ttl || this.defaultTTL)

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return false
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  cleanup(): void {
    const now = Date.now()
    const expiredKeys: string[] = []

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        expiredKeys.push(key)
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key))

    // If still too many entries, remove oldest ones
    if (this.cache.size >= this.maxSize) {
      const entries = Array.from(this.cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = entries.slice(0, Math.floor(this.maxSize * 0.2)) // Remove 20% of oldest
      toRemove.forEach(([key]) => this.cache.delete(key))
    }
  }

  getStats() {
    const now = Date.now()
    let validEntries = 0
    let expiredEntries = 0

    for (const entry of this.cache.values()) {
      if (now > entry.expiresAt) {
        expiredEntries++
      } else {
        validEntries++
      }
    }

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / (validEntries + expiredEntries) || 0
    }
  }
}

// Global cache instance
const analyticsCache = new AnalyticsCache()

export const useAnalyticsCache = <T>(options: CacheOptions = {}) => {
  const [cacheStats, setCacheStats] = useState(analyticsCache.getStats())

  // Update cache stats periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setCacheStats(analyticsCache.getStats())
      analyticsCache.cleanup()
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const setCache = useCallback(<T>(key: string, data: T, ttl?: number) => {
    analyticsCache.set(key, data, ttl || options.ttl)
    setCacheStats(analyticsCache.getStats())
  }, [options.ttl])

  const getCache = useCallback(<T>(key: string): T | null => {
    return analyticsCache.get<T>(key)
  }, [])

  const hasCache = useCallback((key: string): boolean => {
    return analyticsCache.has(key)
  }, [])

  const deleteCache = useCallback((key: string): boolean => {
    const result = analyticsCache.delete(key)
    setCacheStats(analyticsCache.getStats())
    return result
  }, [])

  const clearCache = useCallback(() => {
    analyticsCache.clear()
    setCacheStats(analyticsCache.getStats())
  }, [])

  const generateCacheKey = useCallback((params: Record<string, any>): string => {
    // Sort keys to ensure consistent cache keys
    const sortedKeys = Object.keys(params).sort()
    const keyParts = sortedKeys.map(key => `${key}:${JSON.stringify(params[key])}`)
    return keyParts.join('|')
  }, [])

  return {
    setCache,
    getCache,
    hasCache,
    deleteCache,
    clearCache,
    generateCacheKey,
    cacheStats
  }
}

export default analyticsCache
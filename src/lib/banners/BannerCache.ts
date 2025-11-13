import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';



interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
}

interface BannerCacheConfig {
  duration: number; // minutes
  enabled: boolean;
}

class BannerCache {
  private cache: Map<string, CacheEntry> = new Map();
  private config: BannerCacheConfig = {
    duration: 5, // 5 minutes default
    enabled: true
  };

  constructor(config?: Partial<BannerCacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }

  // Gerar chave de cache única
  private generateKey(slotSlug: string, page: string, deviceType: string): string {
    return `banner:${slotSlug}:${page}:${deviceType}`;
  }

  // Verificar se a entrada do cache é válida
  private isValid(entry: CacheEntry): boolean {
    return Date.now() < entry.expiresAt;
  }

  // Obter dados do cache
  get(slotSlug: string, page: string, deviceType: string): any | null {
    if (!this.config.enabled) {
      return null;
    }

    const key = this.generateKey(slotSlug, page, deviceType);
    const entry = this.cache.get(key);

    if (entry && this.isValid(entry)) {
      console.log(`[BannerCache] Cache hit for key: ${key}`);
      return entry.data;
    }

    if (entry && !this.isValid(entry)) {
      console.log(`[BannerCache] Cache expired for key: ${key}`);
      this.cache.delete(key);
    }

    return null;
  }

  // Armazenar dados no cache
  set(slotSlug: string, page: string, deviceType: string, data: any): void {
    if (!this.config.enabled) {
      return;
    }

    const key = this.generateKey(slotSlug, page, deviceType);
    const timestamp = Date.now();
    const expiresAt = timestamp + (this.config.duration * 60 * 1000); // Convert minutes to milliseconds

    const entry: CacheEntry = {
      data,
      timestamp,
      expiresAt
    };

    this.cache.set(key, entry);
    console.log(`[BannerCache] Cache set for key: ${key}, expires at: ${new Date(expiresAt).toISOString()}`);
  }

  // Limpar cache para um slot específico
  clearSlot(slotSlug: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`banner:${slotSlug}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => {
      this.cache.delete(key);
      console.log(`[BannerCache] Cleared cache for key: ${key}`);
    });
  }

  // Limpar todo o cache
  clearAll(): void {
    this.cache.clear();
    console.log('[BannerCache] Cleared all cache');
  }

  // Obter estatísticas do cache
  getStats(): { size: number; hitRate: number; entries: Array<{ key: string; expiresIn: number }> } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      expiresIn: Math.max(0, entry.expiresAt - now)
    }));

    return {
      size: this.cache.size,
      hitRate: 0, // Could be implemented with counters
      entries
    };
  }

  // Configurar cache
  configure(config: Partial<BannerCacheConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('[BannerCache] Configuration updated:', this.config);
  }
}

// Instância global do cache
export const bannerCache = new BannerCache();

// Hook para usar o cache com configurações do banco de dados
export async function initializeBannerCache(): Promise<void> {
  try {
    const supabase = createClientComponentClient<Database>();
    
    // Buscar configurações de cache do banco
    const { data: settings, error } = await supabase
      .from('banner_settings')
      .select('cache_duration')
      .single();

    if (error) {
      console.warn('[BannerCache] Failed to load cache settings from database, using defaults');
      return;
    }

    if (settings?.cache_duration) {
      bannerCache.configure({
        duration: settings.cache_duration,
        enabled: true
      });
      console.log(`[BannerCache] Initialized with duration: ${settings.cache_duration} minutes`);
    }
  } catch (error) {
    console.error('[BannerCache] Error initializing cache:', error);
  }
}

// Função para invalidar cache quando banners forem atualizados
export async function invalidateBannerCache(slotSlug?: string): Promise<void> {
  if (slotSlug) {
    bannerCache.clearSlot(slotSlug);
    console.log(`[BannerCache] Invalidated cache for slot: ${slotSlug}`);
  } else {
    bannerCache.clearAll();
    console.log('[BannerCache] Invalidated all cache');
  }
}

// Exportar tipos
export type { BannerCacheConfig, CacheEntry };
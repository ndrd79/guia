import React, { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { BannerTemplateRegistry } from '@/lib/banners/BannerTemplateRegistry';
import { useBannerAnalytics } from '@/hooks/useBannerAnalytics';
import { useDeviceType } from '@/hooks/useDeviceType';
import { ResponsiveBanner } from './ResponsiveBanner';
import { bannerCache, initializeBannerCache } from '@/lib/banners/BannerCache';

interface BannerSlotProps {
  slotSlug: string;
  currentPage?: string;
  className?: string;
  onBannerClick?: (bannerId: string, slotId: string) => void;
}

interface BannerData {
  id: string;
  title: string;
  image_url: string;
  link_url: string;
  target_blank: boolean;
  priority: number;
  start_date: string;
  end_date: string;
  analytics_id: string;
}

interface SlotConfig {
  id: string;
  name: string;
  template_id: string;
  default_config: any;
  desktop_width: number;
  desktop_height: number;
  mobile_width: number;
  mobile_height: number;
  max_banners: number;
  rotation_time: number;
  analytics_enabled: boolean;
  show_on_mobile: boolean;
  show_on_desktop: boolean;
}

export function BannerSlot({ slotSlug, currentPage = 'home', className = '', onBannerClick }: BannerSlotProps) {
  const [slotConfig, setSlotConfig] = useState<SlotConfig | null>(null);
  const [banners, setBanners] = useState<BannerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheHit, setCacheHit] = useState(false);
  
  const supabase = createClientComponentClient<Database>();
  const { trackImpression, trackClick } = useBannerAnalytics();
  const deviceType = useDeviceType();

  // Buscar configuração do slot e banners ativos
  useEffect(() => {
    initializeBannerCache();
    const fetchSlotData = async () => {
      try {
        setLoading(true);
        
        // Verificar cache primeiro
        const cachedData = bannerCache.get(slotSlug, currentPage, deviceType);
        if (cachedData) {
          console.log(`[BannerSlot] Cache hit for ${slotSlug} on ${currentPage} for ${deviceType}`);
          setSlotConfig(cachedData.slot);
          setBanners(cachedData.banners);
          setCacheHit(true);
          setLoading(false);
          return;
        }
        console.log(`[BannerSlot] Cache miss for ${slotSlug} on ${currentPage} for ${deviceType}`);
        setCacheHit(false);
        
        // Buscar configuração do slot
        const { data: slotData, error: slotError } = await supabase
          .from('banner_slots')
          .select('*')
          .eq('slug', slotSlug)
          .eq('is_active', true)
          .single();

        if (slotError || !slotData) {
          throw new Error('Slot não encontrado ou inativo');
        }

        // Verificar se o slot está disponível na página atual e dispositivo
        const isAvailableOnPage = slotData.pages.includes('*') || slotData.pages.includes(currentPage);
        const isAvailableOnDevice = deviceType === 'mobile' ? slotData.show_on_mobile : slotData.show_on_desktop;

        if (!isAvailableOnPage || !isAvailableOnDevice) {
          setSlotConfig(slotData);
          setBanners([]);
          setLoading(false);
          return;
        }

        // Buscar banners ativos para este slot
        const now = new Date().toISOString();
        const { data: bannersData, error: bannersError } = await supabase
          .from('banner_instances')
          .select(`
            *,
            banners:banners(
              id,
              title,
              image_url,
              link_url,
              target_blank,
              priority,
              start_date,
              end_date,
              analytics_id
            )
          `)
          .eq('position_id', slotData.id)
          .eq('is_active', true)
          .lte('start_date', now)
          .gte('end_date', now)
          .order('priority', { ascending: true })
          .limit(slotData.max_banners);

        if (bannersError) {
          throw new Error('Erro ao buscar banners');
        }

        // Transformar dados dos banners
        const activeBanners = bannersData?.map(instance => ({
          id: instance.banners.id,
          title: instance.banners.title,
          image_url: instance.banners.image_url,
          link_url: instance.banners.link_url,
          target_blank: instance.banners.target_blank,
          priority: instance.banners.priority,
          start_date: instance.banners.start_date,
          end_date: instance.banners.end_date,
          analytics_id: instance.banners.analytics_id
        })) || [];

        // Armazenar no cache
        bannerCache.set(slotSlug, currentPage, deviceType, { slot: slotData, banners: activeBanners });

        setSlotConfig(slotData);
        setBanners(activeBanners);
        
        // Track impression se houver banners e analytics estiver habilitado
        if (activeBanners.length > 0 && slotData.analytics_enabled) {
          activeBanners.forEach(banner => {
            trackImpression(banner.id, slotData.id, slotSlug);
          });
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchSlotData();
  }, [slotSlug, currentPage, deviceType]);

  // Handle banner click
  const handleBannerClick = (banner: BannerData) => {
    if (slotConfig && slotConfig.analytics_enabled) {
      trackClick(banner.id, slotConfig.id, slotSlug);
    }
    
    if (onBannerClick) {
      onBannerClick(banner.id, slotConfig?.id || '');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <div className={`banner-slot-loading ${className}`}>
        <div className="animate-pulse bg-gray-200 rounded-lg flex items-center justify-center" style={{
          width: deviceType === 'mobile' ? slotConfig?.mobile_width || 400 : slotConfig?.desktop_width || 800,
          height: deviceType === 'mobile' ? slotConfig?.mobile_height || 200 : slotConfig?.desktop_height || 400
        }}>
          <div className="text-xs text-gray-500">Carregando banner...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error || !slotConfig) {
    return null; // Não renderizar nada em caso de erro
  }

  // Verificar disponibilidade
  const isAvailableOnPage = slotConfig.pages.includes('*') || slotConfig.pages.includes(currentPage);
  const isAvailableOnDevice = deviceType === 'mobile' ? slotConfig.show_on_mobile : slotConfig.show_on_desktop;

  if (!isAvailableOnPage || !isAvailableOnDevice || banners.length === 0) {
    return null; // Não renderizar se não disponível ou sem banners
  }

  // Obter template renderer
  const TemplateComponent = BannerTemplateRegistry.getTemplate(slotConfig.template_id);

  if (!TemplateComponent) {
    console.error(`Template não encontrado: ${slotConfig.template_id}`);
    return null;
  }

  // Calcular dimensões baseado no dispositivo
  const dimensions = {
    width: deviceType === 'mobile' ? slotConfig.mobile_width : slotConfig.desktop_width,
    height: deviceType === 'mobile' ? slotConfig.mobile_height : slotConfig.desktop_height
  };

  return (
    <div className={`banner-slot ${className}`} data-slot-slug={slotSlug}>
      <ResponsiveBanner
        banners={banners}
        template={TemplateComponent}
        config={{
          ...slotConfig.default_config,
          rotationTime: slotConfig.rotation_time,
          maxBanners: slotConfig.max_banners,
          dimensions,
          analyticsEnabled: slotConfig.analytics_enabled
        }}
        onBannerClick={handleBannerClick}
        deviceType={deviceType}
      />
    </div>
  );
}

export default BannerSlot;

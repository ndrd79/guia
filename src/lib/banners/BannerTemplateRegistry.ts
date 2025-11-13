"use client";
import React from 'react';
import { CarouselTemplate } from '@/components/banners/templates/CarouselTemplate';
import { StaticTemplate } from '@/components/banners/templates/StaticTemplate';
import { GridTemplate } from '@/components/banners/templates/GridTemplate';
import { VideoTemplate } from '@/components/banners/templates/VideoTemplate';
import { CustomTemplate } from '@/components/banners/templates/CustomTemplate';

export interface BannerTemplateConfig {
  rotationTime?: number;
  maxBanners?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  analyticsEnabled?: boolean;
  [key: string]: any;
}

export interface BannerData {
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

export interface TemplateProps {
  banners: BannerData[];
  config: BannerTemplateConfig;
  onBannerClick: (banner: BannerData) => void;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

export type TemplateComponent = React.ComponentType<TemplateProps>;

class BannerTemplateRegistryClass {
  private templates: Map<string, TemplateComponent> = new Map();
  private templateConfigs: Map<string, any> = new Map();

  constructor() {
    this.registerDefaultTemplates();
  }

  private registerDefaultTemplates() {
    // Registrar templates padrão
    this.register('carousel', CarouselTemplate, {
      name: 'Carrossel Padrão',
      description: 'Carrossel com rotação automática de banners',
      defaultConfig: {
        rotationTime: 5000,
        showIndicators: true,
        showArrows: true,
        infiniteLoop: true
      }
    });

    this.register('static', StaticTemplate, {
      name: 'Banner Estático',
      description: 'Banner único estático',
      defaultConfig: {
        showBorder: false,
        borderRadius: '8px'
      }
    });

    this.register('grid', GridTemplate, {
      name: 'Grid de Banners',
      description: 'Múltiplos banners em layout de grid',
      defaultConfig: {
        columns: 2,
        gap: '16px',
        showTitles: true
      }
    });

    this.register('video', VideoTemplate, {
      name: 'Vídeo Player',
      description: 'Player de vídeo com banner',
      defaultConfig: {
        autoplay: false,
        muted: true,
        controls: true
      }
    });

    this.register('custom', CustomTemplate, {
      name: 'Custom Widget',
      description: 'Template customizável',
      defaultConfig: {
        customClass: '',
        customStyles: {}
      }
    });
  }

  register(
    templateId: string, 
    component: TemplateComponent, 
    config: any
  ) {
    this.templates.set(templateId, component);
    this.templateConfigs.set(templateId, config);
  }

  getTemplate(templateId: string): TemplateComponent | null {
    return this.templates.get(templateId) || null;
  }

  getTemplateConfig(templateId: string): any {
    return this.templateConfigs.get(templateId) || null;
  }

  getAllTemplates(): Array<{id: string, name: string, description: string}> {
    return Array.from(this.templateConfigs.entries()).map(([id, config]) => ({
      id,
      name: config.name,
      description: config.description
    }));
  }

  getTemplateByComponentType(componentType: string): TemplateComponent | null {
    // Mapear component_type do banco para template_id
    const typeMap: Record<string, string> = {
      'carousel': 'carousel',
      'static': 'static',
      'grid': 'grid',
      'video': 'video',
      'custom': 'custom'
    };

    const templateId = typeMap[componentType];
    return templateId ? this.getTemplate(templateId) : null;
  }

  unregister(templateId: string) {
    this.templates.delete(templateId);
    this.templateConfigs.delete(templateId);
  }

  clear() {
    this.templates.clear();
    this.templateConfigs.clear();
  }
}

export const BannerTemplateRegistry = new BannerTemplateRegistryClass();
export default BannerTemplateRegistry;

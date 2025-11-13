# 🏗️ Arquitetura de Otimização do Sistema de Banners

## 📋 Análise dos Problemas Atuais

### ❌ **Problemas Identificados**
1. **Criação de Posições**: 2-4 horas por posição, copiando 200+ linhas
2. **Hardcoded Dimensions**: Manual em 3+ lugares diferentes
3. **Dropdown Ineficiente**: 17 opções em texto puro, impossível de escanear
4. **Responsividade**: Mobile usa mesmo banner desktop sem crop automático
5. **Gestão de Fila**: Ordem por campo numérico (prone a erros)
6. **Ocupação**: Sem visão calendário de slots vendidos

---

## 🎯 **Solução Arquitetural: BannerSlot Universal**

### 🏗️ **Visão Geral da Nova Arquitetura**

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          BANNER SLOT SYSTEM                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌──────────────────┐    ┌───────────────────┐    │
│  │ banner_positions │    │ banner_templates │    │ banner_instances  │    │
│  │ ─────────────── │    │ ──────────────── │    │ ───────────────── │    │
│  │ id              │    │ id               │    │ id                │    │
│  │ name            │    │ name             │    │ position_id       │    │
│  │ template_id     │    │ component_type   │    │ template_id       │    │
│  │ pages           │    │ default_config │    │ banners[]         │    │
│  │ config          │    │ responsive_rules│    │ config            │    │
│  │ is_active       │    │ is_active        │    │ start_date        │    │
│  └─────────────────┘    └──────────────────┘    │ end_date          │    │
│                                                   └───────────────────┘    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐    │
│  │                    BANNER SLOT COMPONENT                             │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │    │
│  │  │  Template Registry (Factory Pattern)                         │  │    │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │  │    │
│  │  │  │ Carousel    │ │ Static      │ │ Grid        │           │  │    │
│  │  │  │ Template    │ │ Template    │ │ Template    │           │  │    │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │  │    │
│  │  └─────────────────────────────────────────────────────────────────┘  │    │
│  │                                                                          │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │    │
│  │  │  Responsive Engine                                             │  │    │
│  │  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │  │    │
│  │  │  │ Desktop     │ │ Tablet      │ │ Mobile      │           │  │    │
│  │  │  │ 800x400     │ │ 600x300     │ │ 400x200     │           │  │    │
│  │  │  │ Auto-crop   │ │ Auto-crop   │ │ Auto-crop   │           │  │    │
│  │  │  └─────────────┘ └─────────────┘ └─────────────┘           │  │    │
│  │  └─────────────────────────────────────────────────────────────────┘  │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐    │
│  │                    ADMIN UI SYSTEM                                     │    │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐       │    │
│  │  │ Visual Dashboard│ │ Drag & Drop     │ │ Calendar View   │       │    │
│  │  │ Grid Layout     │ │ Reorder         │ │ Occupation      │       │    │
│  │  │ Live Preview    │ │ Queues          │ │ Schedule        │       │    │
│  │  └─────────────────┘ └─────────────────┘ └─────────────────┘       │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏭 **Factory Pattern: Estrutura de Tabelas**

### 1️⃣ **banner_templates** - Templates Reutilizáveis
```sql
CREATE TABLE banner_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  component_type VARCHAR(50) NOT NULL, -- 'carousel', 'static', 'grid'
  default_config JSONB DEFAULT '{}',
  responsive_rules JSONB DEFAULT '{}',
  analytics_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Templates Padrão
INSERT INTO banner_templates (name, component_type, default_config, responsive_rules) VALUES
('Carousel Padrão', 'carousel', 
  '{"interval": 5, "max_banners": 4, "indicators": true, "auto_rotate": true}',
  '{"desktop": {"width": 1170, "height": 330}, "tablet": {"width": 768, "height": 250}, "mobile": {"width": 375, "height": 200}}'
),
('Banner Estático', 'static',
  '{"clickable": true, "lazy_load": true}',
  '{"desktop": {"width": 300, "height": 600}, "tablet": {"width": 250, "height": 500}, "mobile": {"width": 300, "height": 250}}'
),
('Grid Layout', 'grid',
  '{"columns": 2, "gap": 16, "max_banners": 6}',
  '{"desktop": {"width": 800, "height": 400}, "tablet": {"width": 600, "height": 300}, "mobile": {"width": 350, "height": 200}}'
);
```

### 2️⃣ **banner_positions** - Posições do Site
```sql
CREATE TABLE banner_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  template_id UUID REFERENCES banner_templates(id),
  pages JSONB DEFAULT '["*"]', -- ["home", "noticias"] ou ["*"] para todas
  config JSONB DEFAULT '{}', -- Config específica da posição
  location VARCHAR(200), -- Seletor CSS ou descrição da localização
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_banner_positions_template ON banner_positions(template_id);
CREATE INDEX idx_banner_positions_active ON banner_positions(is_active);
CREATE INDEX idx_banner_positions_pages ON banner_positions USING GIN(pages);
```

### 3️⃣ **banner_instances** - Instâncias de Banners Ativos
```sql
CREATE TABLE banner_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  position_id UUID REFERENCES banner_positions(id),
  template_id UUID REFERENCES banner_templates(id),
  banners JSONB NOT NULL, -- Array de banner IDs com ordem
  config JSONB DEFAULT '{}', -- Config específica da instância
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para queries rápidas
CREATE INDEX idx_banner_instances_position ON banner_instances(position_id);
CREATE INDEX idx_banner_instances_active ON banner_instances(is_active);
CREATE INDEX idx_banner_instances_dates ON banner_instances(start_date, end_date);
```

---

## 🧩 **BannerSlot Component: Arquitetura Universal**

### **BannerSlot.tsx** - Componente Universal
```tsx
import React from 'react'
import { BannerTemplateRegistry } from '../lib/banner-templates'
import { useBannerSlot } from '../hooks/useBannerSlot'
import { ResponsiveBanner } from './ResponsiveBanner'

interface BannerSlotProps {
  position: string
  className?: string
  fallback?: React.ReactNode
  onBannerClick?: (banner: Banner) => void
  onBannerView?: (banner: Banner) => void
}

export const BannerSlot: React.FC<BannerSlotProps> = ({
  position,
  className = '',
  fallback = null,
  onBannerClick,
  onBannerView
}) => {
  const { instance, loading, error } = useBannerSlot(position)
  
  if (loading) return <BannerSkeleton />
  if (error || !instance) return <>{fallback}</>
  
  const TemplateComponent = BannerTemplateRegistry.get(instance.template.component_type)
  
  if (!TemplateComponent) {
    console.error(`Template ${instance.template.component_type} não encontrado`)
    return <>{fallback}</>
  }
  
  return (
    <ResponsiveBanner
      instance={instance}
      className={className}
      onBannerClick={onBannerClick}
      onBannerView={onBannerView}
    >
      <TemplateComponent
        banners={instance.banners}
        config={instance.config}
        responsive={instance.template.responsive_rules}
      />
    </ResponsiveBanner>
  )
}
```

### **BannerTemplateRegistry.ts** - Factory Pattern
```tsx
// lib/banner-templates.ts
import { CarouselTemplate } from '../templates/CarouselTemplate'
import { StaticTemplate } from '../templates/StaticTemplate'
import { GridTemplate } from '../templates/GridTemplate'

export interface BannerTemplateConfig {
  component_type: string
  default_config: Record<string, any>
  responsive_rules: Record<string, { width: number; height: number }>
}

export class BannerTemplateRegistry {
  private static templates = new Map<string, React.ComponentType<any>>()
  
  static {
    // Registrar templates padrão
    this.register('carousel', CarouselTemplate)
    this.register('static', StaticTemplate)
    this.register('grid', GridTemplate)
  }
  
  static register(type: string, component: React.ComponentType<any>) {
    this.templates.set(type, component)
  }
  
  static get(type: string): React.ComponentType<any> | undefined {
    return this.templates.get(type)
  }
  
  static getAll(): string[] {
    return Array.from(this.templates.keys())
  }
}
```

---

## 📱 **Templates Dinâmicos**

### **CarouselTemplate.tsx**
```tsx
import React, { useState, useEffect } from 'react'
import { BannerItem } from './BannerItem'

interface CarouselTemplateProps {
  banners: Banner[]
  config: {
    interval?: number
    max_banners?: number
    indicators?: boolean
    auto_rotate?: boolean
  }
  responsive: Record<string, { width: number; height: number }>
}

export const CarouselTemplate: React.FC<CarouselTemplateProps> = ({
  banners,
  config = {},
  responsive
}) => {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  
  const {
    interval = 5,
    max_banners = 4,
    indicators = true,
    auto_rotate = true
  } = config
  
  const displayBanners = banners.slice(0, max_banners)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  useEffect(() => {
    if (!auto_rotate || displayBanners.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayBanners.length)
    }, interval * 1000)
    
    return () => clearInterval(timer)
  }, [displayBanners.length, interval, auto_rotate])
  
  const dimensions = isMobile ? responsive.mobile : responsive.desktop
  
  return (
    <div className="relative w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {displayBanners.map((banner) => (
          <div key={banner.id} className="w-full flex-shrink-0">
            <BannerItem
              banner={banner}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full"
            />
          </div>
        ))}
      </div>
      
      {indicators && displayBanners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {displayBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## 🎨 **Admin UI: Dashboard Visual**

### **BannerDashboard.tsx** - Interface Visual
```tsx
import React, { useState } from 'react'
import { useBannerPositions } from '../hooks/useBannerPositions'
import { BannerPositionCard } from './BannerPositionCard'
import { BannerPositionWizard } from './BannerPositionWizard'
import { DragDropContext } from '@hello-pangea/dnd'

export const BannerDashboard: React.FC = () => {
  const { positions, loading, createPosition, updatePosition } = useBannerPositions()
  const [showWizard, setShowWizard] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null)
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return
    
    // Implementar reordenação
    const newOrder = Array.from(positions)
    const [reorderedItem] = newOrder.splice(result.source.index, 1)
    newOrder.splice(result.destination.index, 0, reorderedItem)
    
    // Atualizar no banco
    updatePosition(reorderedItem.id, { order: result.destination.index })
  }
  
  const handleQuickCreate = async (data: any) => {
    await createPosition({
      name: data.name,
      template_id: data.template_id,
      pages: data.pages,
      config: {
        dimensions: data.dimensions,
        settings: data.settings
      }
    })
    setShowWizard(false)
  }
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciar Posições de Banners</h1>
        <button
          onClick={() => setShowWizard(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Nova Posição
        </button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {positions.map((position) => (
            <BannerPositionCard
              key={position.id}
              position={position}
              onEdit={() => setSelectedPosition(position.id)}
              onPreview={() => {}}
            />
          ))}
        </div>
      </DragDropContext>
      
      {showWizard && (
        <BannerPositionWizard
          onClose={() => setShowWizard(false)}
          onSubmit={handleQuickCreate}
        />
      )}
    </div>
  )
}
```

### **BannerPositionWizard.tsx** - Criação Rápida (2 minutos)
```tsx
import React, { useState } from 'react'
import { useBannerTemplates } from '../hooks/useBannerTemplates'

interface BannerPositionWizardProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

export const BannerPositionWizard: React.FC<BannerPositionWizardProps> = ({
  onClose,
  onSubmit
}) => {
  const { templates } = useBannerTemplates()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    template_id: '',
    pages: [],
    dimensions: {
      desktop: { width: 800, height: 400 },
      mobile: { width: 400, height: 200 }
    },
    settings: {}
  })
  
  const handleNext = () => {
    if (step === 3) {
      onSubmit(formData)
    } else {
      setStep(step + 1)
    }
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Criar Nova Posição</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>
        
        {/* Progress Steps */}
        <div className="flex items-center mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
              }`}>
                {i}
              </div>
              {i < 3 && <div className="w-12 h-0.5 bg-gray-200 mx-2" />}
            </div>
          ))}
        </div>
        
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Nome da Posição</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Banner Meio da Página"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Template</label>
              <div className="grid grid-cols-3 gap-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setFormData({...formData, template_id: template.id})}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      formData.template_id === template.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">
                        {template.component_type === 'carousel' ? '🎠' : 
                         template.component_type === 'grid' ? '⊞' : '🖼️'}
                      </div>
                      <div className="font-medium">{template.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Pages & Preview */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Páginas</label>
              <div className="space-y-2">
                {['Home', 'Notícias', 'Eventos', 'Empresas', 'Todos'].map((page) => (
                  <label key={page} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.pages.includes(page)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({...formData, pages: [...formData.pages, page]})
                        } else {
                          setFormData({...formData, pages: formData.pages.filter(p => p !== page)})
                        }
                      }}
                      className="mr-2"
                    />
                    {page}
                  </label>
                ))}
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-medium mb-3">Preview Responsivo</h3>
              <div className="bg-white p-4 rounded border">
                <div className="text-sm text-gray-600 mb-2">Desktop (800x400)</div>
                <div className="bg-gray-200 h-32 rounded flex items-center justify-center">
                  📱 Preview do Banner
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Largura Desktop</label>
                <input
                  type="number"
                  value={formData.dimensions.desktop.width}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      desktop: { ...formData.dimensions.desktop, width: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Altura Desktop</label>
                <input
                  type="number"
                  value={formData.dimensions.desktop.height}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      desktop: { ...formData.dimensions.desktop, height: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Largura Mobile</label>
                <input
                  type="number"
                  value={formData.dimensions.mobile.width}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      mobile: { ...formData.dimensions.mobile, width: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Altura Mobile</label>
                <input
                  type="number"
                  value={formData.dimensions.mobile.height}
                  onChange={(e) => setFormData({
                    ...formData,
                    dimensions: {
                      ...formData.dimensions,
                      mobile: { ...formData.dimensions.mobile, height: parseInt(e.target.value) }
                    }
                  })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-6">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            {step === 1 ? 'Cancelar' : 'Voltar'}
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {step === 3 ? 'Criar Posição' : 'Próximo'}
          </button>
        </div>
      </div>
    </div>
  )
}
```

---

## 📱 **Responsividade Automática com Crop**

### **ResponsiveBanner.tsx**
```tsx
import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useDeviceType } from '../hooks/useDeviceType'

interface ResponsiveBannerProps {
  instance: BannerInstance
  children: React.ReactNode
  className?: string
  onBannerClick?: (banner: Banner) => void
  onBannerView?: (banner: Banner) => void
}

export const ResponsiveBanner: React.FC<ResponsiveBannerProps> = ({
  instance,
  children,
  className = '',
  onBannerClick,
  onBannerView
}) => {
  const deviceType = useDeviceType() // 'desktop' | 'tablet' | 'mobile'
  const dimensions = instance.template.responsive_rules[deviceType] || 
                    instance.template.responsive_rules.desktop
  
  return (
    <div 
      className={`responsive-banner ${className}`}
      style={{
        width: '100%',
        maxWidth: dimensions.width,
        height: dimensions.height,
        margin: '0 auto'
      }}
    >
      <div className="responsive-banner-container">
        {React.cloneElement(children as React.ReactElement, {
          dimensions,
          onBannerClick,
          onBannerView
        })}
      </div>
    </div>
  )
}
```

### **useDeviceType.ts** - Hook para Detecção de Dispositivo
```tsx
import { useState, useEffect } from 'react'

export type DeviceType = 'desktop' | 'tablet' | 'mobile'

export const useDeviceType = (): DeviceType => {
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop')
  
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth
      if (width < 640) setDeviceType('mobile')
      else if (width < 1024) setDeviceType('tablet')
      else setDeviceType('desktop')
    }
    
    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])
  
  return deviceType
}
```

---

## 📊 **Analytics: Tracking Universal**

### **useBannerAnalytics.ts** - Hook Universal
```tsx
import { useCallback } from 'react'
import { useAnalytics } from './useAnalytics'

interface BannerAnalyticsData {
  banner_id: string
  position_id: string
  template_id: string
  action: 'view' | 'click'
  device_type: string
  timestamp: number
}

export const useBannerAnalytics = () => {
  const { track } = useAnalytics()
  
  const trackBannerView = useCallback((
    banner: Banner,
    position: BannerPosition,
    template: BannerTemplate
  ) => {
    const data: BannerAnalyticsData = {
      banner_id: banner.id,
      position_id: position.id,
      template_id: template.id,
      action: 'view',
      device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
      timestamp: Date.now()
    }
    
    track('banner_view', data)
  }, [track])
  
  const trackBannerClick = useCallback((
    banner: Banner,
    position: BannerPosition,
    template: BannerTemplate
  ) => {
    const data: BannerAnalyticsData = {
      banner_id: banner.id,
      position_id: position.id,
      template_id: template.id,
      action: 'click',
      device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
      timestamp: Date.now()
    }
    
    track('banner_click', data)
  }, [track])
  
  return { trackBannerView, trackBannerClick }
}
```

---

## 🚀 **Plano de Migração Gradual (Sem Downtime)**

### **Fase 1: Preparação (Dia 1-2)**
1. Criar novas tabelas (backward-compatible)
2. Implementar BannerSlot component
3. Criar templates básicos
4. Testar em ambiente de staging

### **Fase 2: Migração das Posições (Dia 3-5)**
```typescript
// Migration Script: migrate-positions.ts
const migratePositions = async () => {
  const legacyPositions = [
    'Hero Carousel', 'Header Superior', 'Header Inferior',
    'Sidebar Direita', 'Sidebar Esquerda', 'Entre Conteúdo'
  ]
  
  for (const pos of legacyPositions) {
    // 1. Criar position na nova tabela
    const position = await createBannerPosition({
      name: pos,
      template_id: getTemplateForPosition(pos),
      pages: getPagesForPosition(pos),
      config: getConfigForPosition(pos)
    })
    
    // 2. Migrar banners existentes
    const legacyBanners = await getLegacyBanners(pos)
    await createBannerInstance({
      position_id: position.id,
      banners: legacyBanners,
      config: {}
    })
    
    console.log(`✅ Posição ${pos} migrada com sucesso`)
  }
}
```

### **Fase 3: Transição Gradual (Dia 6-7)**
1. Atualizar páginas uma por uma para usar BannerSlot
2. Manter componentes legados como fallback
3. Monitorar performance e erros
4. Ajustar configurações conforme necessário

### **Fase 4: Cleanup (Pós-migração)**
1. Remover componentes legados
2. Limpar código duplicado
3. Documentar nova arquitetura
4. Treinar equipe

---

## 📈 **Benefícios da Nova Arquitetura**

### ✅ **Criação de Posições**: De 2-4 horas para **2 minutos**
- Wizard visual com 3 passos
- Templates pré-configurados
- Preview responsivo em tempo real

### ✅ **Gestão Visual**: Dashboard intuitivo
- Drag & drop para reordenar
- Visualização de ocupação por data
- Preview ao vivo das posições

### ✅ **Responsividade Automática**
- Crop automático com Sharp
- 3 breakpoints configuráveis
- Preview em tempo real

### ✅ **Performance Mantida**
- Cache de 5 minutos por posição
- Lazy loading de imagens
- Code splitting por template

### ✅ **Analytics Universal**
- Tracking automático em todos os templates
- Métricas por posição, template e dispositivo
- Dashboard de analytics integrado

---

## 🎯 **Resultado Esperado**

**Tempo de criação de nova posição:** 2 minutos (vs 2-4 horas)
**Templates disponíveis:** Carousel, Static, Grid (extensível)
**Responsividade:** Automática com 3 breakpoints
**Analytics:** Universal e automático
**Migração:** Gradual sem downtime
**Performance:** Mantida com cache e otimizações

**ROI estimado:** Redução de 95% no tempo de desenvolvimento de novas posições
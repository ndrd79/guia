/**
 * Banner System - Index
 * 
 * Exporta todos os componentes e utilidades do novo sistema de banners
 */

// Componente principal
export { default as BannerSlot } from './BannerSlot'

// Templates
export { CarouselTemplate } from './templates/CarouselTemplate'
export { StaticTemplate } from './templates/StaticTemplate'
export { GridTemplate } from './templates/GridTemplate'

// Registry
export { default as BannerTemplateRegistry } from '../../lib/banners/BannerTemplateRegistry'
export type { BannerTemplateProps, BannerTemplateConfig } from '../../lib/banners/BannerTemplateRegistry'

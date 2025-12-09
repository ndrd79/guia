/**
 * BannerSlot - Componente Universal de Banner
 * 
 * Componente que carrega banners dinamicamente baseado na posição
 * e renderiza usando o template apropriado do registry.
 */

import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import BannerTemplateRegistry from '../../lib/banners/BannerTemplateRegistry'
import CarouselTemplate from './templates/CarouselTemplate'
import StaticTemplate from './templates/StaticTemplate'
import GridTemplate from './templates/GridTemplate'

// Registrar templates padrão
if (typeof window !== 'undefined') {
    BannerTemplateRegistry.register('carousel', CarouselTemplate)
    BannerTemplateRegistry.register('static', StaticTemplate)
    BannerTemplateRegistry.register('grid', GridTemplate)
}

interface BannerSlotProps {
    /**
     * Nome ou slug da posição do banner
     */
    position: string

    /**
     * Classes CSS personalizadas
     */
    className?: string

    /**
     * Componente para exibir em caso de erro ou sem banners
     */
    fallback?: React.ReactNode

    /**
     * Callback quando um banner é clicado
     */
    onBannerClick?: (banner: any) => void

    /**
     * Callback quando um banner é visualizado
     */
    onBannerView?: (banner: any) => void

    /**
     * Modo de debug para desenvolvimento
     */
    debug?: boolean
}

interface BannerInstance {
    id: string
    banners: any[]
    config: Record<string, any>
    template: {
        id: string
        name: string
        component_type: string
        default_config: Record<string, any>
        responsive_rules: Record<string, { width: number; height: number }>
    }
    position: {
        id: string
        name: string
        slug: string
    }
}

/**
 * BannerSlot Component
 * 
 * @example
 * ```tsx
 * <BannerSlot position="hero-carousel" />
 * <BannerSlot position="sidebar-top-right" className="mt-4" />
 * ```
 */
export const BannerSlot: React.FC<BannerSlotProps> = ({
    position,
    className = '',
    fallback = null,
    onBannerClick,
    onBannerView,
    debug = false
}) => {
    const [instance, setInstance] = useState<BannerInstance | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadBannerInstance()
    }, [position])

    const loadBannerInstance = async () => {
        try {
            setLoading(true)
            setError(null)

            // Buscar instância ativa de banner para esta posição
            const { data, error: queryError } = await supabase
                .from('banner_instances')
                .select(`
          id,
          banners,
          config,
          template:banner_templates (
            id,
            name,
            component_type,
            default_config,
            responsive_rules
          ),
          position:banner_positions (
            id,
            name,
            slug
          )
        `)
                .eq('position.slug', position)
                .eq('is_active', true)
                .gte('end_date', new Date().toISOString())
                .lte('start_date', new Date().toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single()

            if (queryError) {
                // Se não encontrou, não é um erro crítico
                if (queryError.code === 'PGRST116') {
                    console.log(`ℹ️ Nenhuma instância ativa encontrada para posição: ${position}`)
                    setInstance(null)
                    return
                }
                throw queryError
            }

            setInstance(data as any)

            if (debug) {
                console.log('✅ Banner instance carregada:', data)
            }
        } catch (err: any) {
            console.error('❌ Erro ao carregar banner:', err)
            setError(err.message || 'Erro ao carregar banner')
        } finally {
            setLoading(false)
        }
    }

    // Loading skeleton
    if (loading) {
        return (
            <div className={`banner-slot-loading ${className}`}>
                <div className="animate-pulse bg-gray-200 rounded-lg h-64 w-full"></div>
            </div>
        )
    }

    // Error ou sem instância
    if (error || !instance) {
        if (debug) {
            return (
                <div className={`banner-slot-debug border-2 border-dashed border-yellow-500 p-4 rounded-lg ${className}`}>
                    <p className="text-yellow-700 font-semibold">🔍 Debug Mode - Banner Slot</p>
                    <p className="text-sm text-gray-600">Position: {position}</p>
                    <p className="text-sm text-gray-600">Error: {error || 'Nenhuma instância encontrada'}</p>
                </div>
            )
        }
        return <>{fallback}</>
    }

    // Obter componente do template
    const TemplateComponent = BannerTemplateRegistry.get(instance.template.component_type)

    if (!TemplateComponent) {
        console.error(`❌ Template não encontrado: ${instance.template.component_type}`)

        if (debug) {
            return (
                <div className={`banner-slot-error border-2 border-red-500 p-4 rounded-lg ${className}`}>
                    <p className="text-red-700 font-semibold">❌ Template não encontrado</p>
                    <p className="text-sm text-gray-600">Type: {instance.template.component_type}</p>
                    <p className="text-sm text-gray-600">Available: {BannerTemplateRegistry.getAll().join(', ')}</p>
                </div>
            )
        }

        return <>{fallback}</>
    }

    // Mesclar configurações (default do template + override da instância)
    const mergedConfig = {
        ...instance.template.default_config,
        ...instance.config
    }

    return (
        <div className={`banner-slot ${className}`} data-position={position}>
            <TemplateComponent
                banners={instance.banners}
                config={mergedConfig}
                responsive={instance.template.responsive_rules}
                onBannerClick={onBannerClick}
                onBannerView={onBannerView}
            />

            {debug && (
                <div className="mt-2 p-2 text-xs bg-blue-50 border border-blue-200 rounded">
                    <p className="font-semibold text-blue-800">🔍 Debug Info</p>
                    <p>Position: {instance.position.name} ({position})</p>
                    <p>Template: {instance.template.name} ({instance.template.component_type})</p>
                    <p>Banners: {instance.banners.length}</p>
                </div>
            )}
        </div>
    )
}

export default BannerSlot

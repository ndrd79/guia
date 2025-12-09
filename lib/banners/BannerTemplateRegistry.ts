/**
 * Banner Template Registry - Factory Pattern
 * 
 * Registro central de templates de banner que permite adicionar novos templates
 * dinamicamente sem modificar o código existente.
 */

import React from 'react'

export interface BannerTemplateConfig {
    component_type: string
    default_config: Record<string, any>
    responsive_rules: Record<string, { width: number; height: number }>
}

export interface BannerTemplateProps {
    banners: any[]
    config: Record<string, any>
    responsive: Record<string, { width: number; height: number }>
    onBannerClick?: (banner: any) => void
    onBannerView?: (banner: any) => void
}

/**
 * Registro de templates de banner
 * Usa padrão Singleton para garantir uma únicainstância
 */
export class BannerTemplateRegistry {
    private static templates = new Map<string, React.ComponentType<BannerTemplateProps>>()

    /**
     * Registra um novo template
     */
    static register(type: string, component: React.ComponentType<BannerTemplateProps>) {
        this.templates.set(type, component)
        console.log(`✅ Template registrado: ${type}`)
    }

    /**
     * Obtém um template pelo tipo
     */
    static get(type: string): React.ComponentType<BannerTemplateProps> | undefined {
        return this.templates.get(type)
    }

    /**
     * Lista todos os tipos de templates registrados
     */
    static getAll(): string[] {
        return Array.from(this.templates.keys())
    }

    /**
     * Verifica se um template está registrado
     */
    static has(type: string): boolean {
        return this.templates.has(type)
    }

    /**
     * Remove um template (útil para testes)
     */
    static unregister(type: string): boolean {
        return this.templates.delete(type)
    }

    /**
     * Limpa todos os templates (útil para testes)
     */
    static clear() {
        this.templates.clear()
    }
}

export default BannerTemplateRegistry

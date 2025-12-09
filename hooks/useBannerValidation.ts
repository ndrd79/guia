import { useState, useCallback } from 'react'
import { bannerCatalog } from '../lib/banners/catalog'

export interface ValidationResult {
    valid: boolean
    message?: string
    conflictingBanners?: Array<{
        id: string
        nome: string
        ativo: boolean
        local?: string | null
    }>
    count?: number
}

export function useBannerValidation(bannerId?: string) {
    const [validateLoading, setValidateLoading] = useState(false)
    const [validateError, setValidateError] = useState<string | null>(null)
    const [validateResult, setValidateResult] = useState<ValidationResult | null>(null)

    const validatePosition = useCallback(async (posicaoNome: string) => {
        try {
            setValidateLoading(true)
            setValidateError(null)
            setValidateResult(null)

            const resp = await fetch('/api/banners/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ posicao: posicaoNome, bannerId })
            })

            const json = await resp.json()
            setValidateResult(json)
            return json
        } catch (e: any) {
            const errorMsg = e?.message || 'Falha ao validar posição'
            setValidateError(errorMsg)
            return { valid: false, message: errorMsg }
        } finally {
            setValidateLoading(false)
        }
    }, [bannerId])

    const deactivateConflicts = useCallback(async (posicao: string, local: string = 'geral') => {
        try {
            const resp = await fetch('/api/banners/deactivate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    posicao,
                    local,
                    excludeBannerId: bannerId
                })
            })

            const json = await resp.json()

            if (!resp.ok || !json.success) {
                throw new Error(json.message || 'Falha ao desativar banners conflitantes')
            }

            return true
        } catch (e: any) {
            throw e
        }
    }, [bannerId])

    const checkCompatibility = useCallback((local: string, posicaoNome: string) => {
        const mapLocalToPagina = (loc: string): string[] => {
            switch (loc) {
                case 'home': return ['Página Inicial']
                case 'guia_comercial': return ['Guia Comercial']
                case 'noticias': return ['Notícias']
                case 'eventos': return ['Eventos']
                case 'classificados': return ['Classificados']
                case 'geral':
                default:
                    return ['Todas as páginas']
            }
        }

        const posInfo = bannerCatalog.find(p => p.nome === posicaoNome)
        const paginaNames = mapLocalToPagina(local || 'geral')

        const isCompatible = !posInfo ||
            (posInfo.paginas || []).includes('Todas as páginas') ||
            paginaNames.some(n => (posInfo.paginas || []).includes(n))

        const suggestedForLocal = bannerCatalog.filter(p =>
            (p.paginas || []).includes('Todas as páginas') ||
            paginaNames.some(n => (p.paginas || []).includes(n))
        )

        return { isCompatible, suggestedForLocal, posInfo }
    }, [])

    return {
        validateLoading,
        validateError,
        validateResult,
        validatePosition,
        deactivateConflicts,
        checkCompatibility
    }
}

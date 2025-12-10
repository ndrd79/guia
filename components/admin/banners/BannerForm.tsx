import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Calendar, Eye, Monitor, Tablet, Smartphone, ExternalLink,
    ChevronDown, ChevronUp, Settings, Clock, AlertTriangle, CheckCircle
} from 'lucide-react'
import FormCard from '../FormCard'
import ImageUploader from '../ImageUploader'
import BannerModelGrid from './BannerModelGrid'
import { BannerFormProps, BannerFormData, DeviceType } from '../../../types/banner'
import { bannerCatalog } from '../../../lib/banners/catalog'
import { bannerSchema } from '../../../lib/banners/validation'
import { useBannerValidation } from '../../../hooks/useBannerValidation'

const posicoesBanner = bannerCatalog.map(p => ({
    ...p,
    tamanhoRecomendado: p.larguraRecomendada && p.alturaRecomendada ? `${p.larguraRecomendada}x${p.alturaRecomendada}` : undefined,
}))

// Componente de seção colapsável
const CollapsibleSection: React.FC<{
    title: string
    icon: React.ReactNode
    children: React.ReactNode
    defaultOpen?: boolean
    badge?: string
}> = ({ title, icon, children, defaultOpen = false, badge }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
            >
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="font-medium text-gray-700">{title}</span>
                    {badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-orange-100 text-orange-700">
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
            </button>
            {isOpen && (
                <div className="p-4 border-t border-gray-200 bg-white">
                    {children}
                </div>
            )}
        </div>
    )
}

export const BannerForm: React.FC<BannerFormProps> = ({
    banner,
    onSubmit,
    onCancel,
    loading = false
}) => {
    const [previewDevice, setPreviewDevice] = useState<DeviceType>('desktop')

    const {
        validateLoading,
        validateError,
        validateResult,
        validatePosition,
        deactivateConflicts,
    } = useBannerValidation(banner?.id)

    // Find initial profile ID
    const initialProfile = banner
        ? posicoesBanner.find(p => p.nome === banner.posicao && (p.local === banner.local || (!p.local && banner.local === 'geral')))
        : null

    const [selectedProfileId, setSelectedProfileId] = useState<string>(initialProfile?.id || '')

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<BannerFormData>({
        resolver: zodResolver(bannerSchema),
        defaultValues: banner ? {
            nome: banner.nome,
            posicao: banner.posicao,
            imagem: banner.imagem,
            link: banner.link || '',
            largura: banner.largura || 400,
            altura: banner.altura || 200,
            ordem: banner.ordem || 0,
            tempo_exibicao: banner.tempo_exibicao || 5,
            local: (banner.local as any) || 'geral',
            ativo: banner.ativo,
            data_inicio: banner.data_inicio ? formatDateForInput(banner.data_inicio) : '',
            data_fim: banner.data_fim ? formatDateForInput(banner.data_fim) : '',
        } : {
            nome: '',
            posicao: '',
            imagem: '',
            link: '',
            largura: 400,
            altura: 200,
            ordem: 0,
            tempo_exibicao: 5,
            local: 'geral',
            ativo: true,
            data_inicio: '',
            data_fim: '',
        }
    })

    const watchedImagem = watch('imagem')
    const watchedPosicao = watch('posicao')
    const watchedLargura = watch('largura')
    const watchedAltura = watch('altura')
    const watchedLocal = watch('local')

    // Converter data para formato datetime-local
    function formatDateForInput(dateString: string) {
        if (!dateString) return ''
        const date = new Date(dateString)
        const tzOffset = date.getTimezoneOffset() * 60000
        const localDate = new Date(date.getTime() - tzOffset)
        return localDate.toISOString().slice(0, 16)
    }

    // Auto-fill dimensions and local when profile changes
    const handleProfileChange = (profileId: string) => {
        const profile = posicoesBanner.find(p => p.id === profileId)
        if (profile) {
            setSelectedProfileId(profileId)
            setValue('posicao', profile.nome)
            setValue('local', (profile.local as any) || 'geral')
            setValue('largura', profile.larguraRecomendada || watchedLargura || 400)
            setValue('altura', profile.alturaRecomendada || watchedAltura || 200)
            validatePosition(profile.nome)
        }
    }

    // Deactivate conflicts wrapper
    const handleDeactivateConflicts = async () => {
        try {
            await deactivateConflicts(watchedPosicao, watchedLocal)
            alert('Banners conflitantes desativados com sucesso.')
            await validatePosition(watchedPosicao)
        } catch (e: any) {
            alert('Erro ao desativar: ' + (e?.message || 'desconhecido'))
        }
    }

    // Get posInfo from local definition
    const posInfo = posicoesBanner.find(p => p.id === selectedProfileId) || posicoesBanner.find(p => p.nome === watchedPosicao)

    const idealWidth = posInfo?.larguraRecomendada || watchedLargura || 0
    const idealHeight = posInfo?.alturaRecomendada || watchedAltura || 0

    // Preview dimensions
    const deviceWidths: Record<DeviceType, number> = {
        desktop: idealWidth || 1170,
        tablet: 768,
        mobile: 360,
    }
    const displayWidth = Math.min(deviceWidths[previewDevice], idealWidth || deviceWidths[previewDevice])
    const ratio = idealWidth && idealHeight ? idealHeight / idealWidth : (watchedAltura && watchedLargura ? watchedAltura / watchedLargura : 1)
    const displayHeight = Math.max(1, Math.round(displayWidth * ratio))

    // Has conflicts?
    const hasConflicts = validateResult && !validateResult.valid && validateResult.conflictingBanners && validateResult.conflictingBanners.length > 0

    // Get all form errors
    const allErrors = Object.entries(errors)
    const hasErrors = allErrors.length > 0

    // Handle validation errors
    const onError = (formErrors: any) => {
        console.error('Erros de validação:', formErrors)
        // Scroll to first error
        const firstErrorField = Object.keys(formErrors)[0]
        const element = document.querySelector(`[name="${firstErrorField}"]`)
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }

    return (
        <FormCard
            title={banner ? 'Editar Banner' : 'Novo Banner'}
            onSubmit={handleSubmit(onSubmit, onError)}
            onCancel={onCancel}
            isLoading={loading}
        >
            <div className="space-y-6">
                {/* Bloco de erros de validação */}
                {hasErrors && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="font-medium text-red-800">Corrija os erros abaixo:</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                            {allErrors.map(([field, error]: [string, any]) => (
                                <li key={field} className="text-sm text-red-700">
                                    <strong>{field}:</strong> {error?.message || 'Campo inválido'}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* ===== PASSO 1: NOME ===== */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Banner *
                    </label>
                    <input
                        {...register('nome')}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg"
                        placeholder="Ex: Promoção de Verão, Banner Loja X..."
                    />
                    {errors.nome && (
                        <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                    )}
                </div>

                {/* ===== PASSO 2: POSIÇÃO (único seletor visual) ===== */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Onde este banner vai aparecer? *
                    </label>
                    <input type="hidden" {...register('posicao')} />
                    <input type="hidden" {...register('local')} />

                    <BannerModelGrid
                        options={posicoesBanner}
                        value={selectedProfileId}
                        onSelect={(id) => handleProfileChange(id)}
                    />

                    {errors.posicao && (
                        <p className="mt-2 text-sm text-red-600">{errors.posicao.message}</p>
                    )}

                    {/* Info da posição selecionada */}
                    {posInfo && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="font-semibold text-blue-900 text-lg">{posInfo.label || posInfo.nome}</div>
                                    <div className="text-sm text-blue-700 mt-1">{posInfo.descricao}</div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        📐 {posInfo.tamanhoRecomendado}
                                    </span>
                                    <span className="text-xs text-blue-600">
                                        📍 {(posInfo.paginas || ['Todas as páginas']).join(', ')}
                                    </span>
                                </div>
                            </div>

                            {/* Status de validação simplificado */}
                            {validateLoading ? (
                                <div className="mt-3 flex items-center text-sm text-blue-700">
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent mr-2"></div>
                                    Verificando disponibilidade...
                                </div>
                            ) : hasConflicts ? (
                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                                    <div className="flex items-center text-amber-800 font-medium">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        {validateResult.conflictingBanners!.length} banner(s) já estão usando esta posição
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDeactivateConflicts}
                                        className="mt-2 text-sm text-orange-600 hover:text-orange-700 font-medium underline"
                                    >
                                        Desativar banners conflitantes
                                    </button>
                                </div>
                            ) : validateResult?.valid ? (
                                <div className="mt-3 flex items-center text-sm text-green-700">
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Posição disponível
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* ===== PASSO 3: IMAGEM ===== */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagem do Banner *
                    </label>
                    <ImageUploader
                        value={watchedImagem}
                        onChange={(url) => setValue('imagem', url || '')}
                        bucket="banners"
                        folder="images"
                        showLibraryButton={true}
                        useNewMediaAPI={false}
                        aspectRatio={idealWidth && idealHeight ? idealWidth / idealHeight : undefined}
                    />
                    {errors.imagem && (
                        <p className="mt-1 text-sm text-red-600">{errors.imagem.message}</p>
                    )}
                    {posInfo && (
                        <p className="mt-2 text-xs text-gray-500">
                            💡 Tamanho recomendado: {posInfo.tamanhoRecomendado}
                        </p>
                    )}
                </div>

                {/* ===== PREVIEW (aparece após upload) ===== */}
                {watchedImagem && (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-medium text-gray-900 flex items-center">
                                <Eye className="h-5 w-5 mr-2 text-orange-600" />
                                Preview do Banner
                            </h4>

                            {/* Device selector */}
                            <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('desktop')}
                                    className={`p-2 rounded ${previewDevice === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Desktop"
                                >
                                    <Monitor className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('tablet')}
                                    className={`p-2 rounded ${previewDevice === 'tablet' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Tablet"
                                >
                                    <Tablet className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPreviewDevice('mobile')}
                                    className={`p-2 rounded ${previewDevice === 'mobile' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:text-gray-700'}`}
                                    title="Mobile"
                                >
                                    <Smartphone className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Preview image */}
                        <div className="flex justify-center">
                            <div
                                className="relative overflow-hidden rounded-lg shadow-lg border border-gray-200 bg-white"
                                style={{ width: Math.min(displayWidth, 800), height: Math.min(displayHeight, 400), maxWidth: '100%' }}
                            >
                                <img
                                    src={watchedImagem}
                                    alt={watch('nome') || 'Preview do banner'}
                                    className="w-full h-full object-cover"
                                />
                                {!watch('ativo') && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <span className="text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full">Banner Inativo</span>
                                    </div>
                                )}
                                {watch('link') && (
                                    <div className="absolute top-2 right-2">
                                        <div className="bg-blue-600 text-white p-1.5 rounded-full shadow-lg">
                                            <ExternalLink className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 text-center text-sm text-gray-500">
                            Visualizando em {previewDevice === 'desktop' ? 'Desktop' : previewDevice === 'tablet' ? 'Tablet' : 'Mobile'}
                            ({displayWidth} × {displayHeight}px)
                        </div>
                    </div>
                )}

                {/* ===== CONFIGURAÇÕES ADICIONAIS (colapsável) ===== */}
                <CollapsibleSection
                    title="Configurações"
                    icon={<Settings className="w-5 h-5 text-gray-500" />}
                    defaultOpen={!!watch('link') || !watch('ativo')}
                >
                    <div className="space-y-4">
                        {/* Link */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Link de destino (opcional)
                            </label>
                            <input
                                {...register('link')}
                                type="url"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                placeholder="https://exemplo.com"
                            />
                            {errors.link && (
                                <p className="mt-1 text-sm text-red-600">{errors.link.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Se preenchido, o banner será clicável e redirecionará para este link.
                            </p>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                                <span className="font-medium text-gray-700">Status do Banner</span>
                                <p className="text-sm text-gray-500">Banners inativos não aparecem no site</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    {...register('ativo')}
                                    type="checkbox"
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-700">
                                    {watch('ativo') ? 'Ativo' : 'Inativo'}
                                </span>
                            </label>
                        </div>
                    </div>
                </CollapsibleSection>

                {/* ===== AGENDAMENTO (colapsável) ===== */}
                <CollapsibleSection
                    title="Agendamento"
                    icon={<Calendar className="w-5 h-5 text-gray-500" />}
                    defaultOpen={!!(watch('data_inicio') || watch('data_fim'))}
                    badge="Opcional"
                >
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600">
                            Configure quando o banner deve aparecer automaticamente. Se não definir datas, o banner seguirá apenas o status ativo/inativo.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Início
                                </label>
                                <input
                                    {...register('data_inicio')}
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                {errors.data_inicio && (
                                    <p className="mt-1 text-sm text-red-600">{errors.data_inicio.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fim
                                </label>
                                <input
                                    {...register('data_fim')}
                                    type="datetime-local"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                {errors.data_fim && (
                                    <p className="mt-1 text-sm text-red-600">{errors.data_fim.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Schedule preview */}
                        {(watch('data_inicio') || watch('data_fim')) && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                                {watch('data_inicio') && (
                                    <p className="text-blue-700">
                                        📅 Início: {new Date(watch('data_inicio')!).toLocaleString('pt-BR')}
                                    </p>
                                )}
                                {watch('data_fim') && (
                                    <p className="text-blue-700">
                                        📅 Fim: {new Date(watch('data_fim')!).toLocaleString('pt-BR')}
                                    </p>
                                )}
                                {watch('data_inicio') && watch('data_fim') && (
                                    <p className="mt-1 font-medium text-blue-800">
                                        ⏱️ Duração: {Math.ceil((new Date(watch('data_fim')!).getTime() - new Date(watch('data_inicio')!).getTime()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </CollapsibleSection>

                {/* ===== AVANÇADO (colapsável) ===== */}
                <CollapsibleSection
                    title="Configurações Avançadas"
                    icon={<Clock className="w-5 h-5 text-gray-500" />}
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Ordem */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Ordem
                                </label>
                                <input
                                    {...register('ordem', { valueAsNumber: true })}
                                    type="number"
                                    min="0"
                                    max="9999"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">Menor = aparece primeiro</p>
                            </div>

                            {/* Tempo de exibição */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tempo (seg)
                                </label>
                                <input
                                    {...register('tempo_exibicao', { valueAsNumber: true })}
                                    type="number"
                                    min="1"
                                    max="60"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                <p className="mt-1 text-xs text-gray-500">Para carrosséis</p>
                            </div>

                            {/* Largura */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Largura (px)
                                </label>
                                <input
                                    {...register('largura', { valueAsNumber: true })}
                                    type="number"
                                    min="50"
                                    max="2000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                {errors.largura && (
                                    <p className="mt-1 text-sm text-red-600">{errors.largura.message}</p>
                                )}
                            </div>

                            {/* Altura */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Altura (px)
                                </label>
                                <input
                                    {...register('altura', { valueAsNumber: true })}
                                    type="number"
                                    min="50"
                                    max="1000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                {errors.altura && (
                                    <p className="mt-1 text-sm text-red-600">{errors.altura.message}</p>
                                )}
                            </div>
                        </div>

                        <p className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
                            💡 As dimensões são preenchidas automaticamente ao selecionar uma posição.
                            Só altere se souber o que está fazendo.
                        </p>
                    </div>
                </CollapsibleSection>
            </div>
        </FormCard>
    )
}

export default BannerForm

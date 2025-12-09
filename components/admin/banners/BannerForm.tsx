import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Eye, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react'
import FormCard from '../FormCard'
import ImageUploader from '../ImageUploader'
import BannerModelSelect from './BannerModelSelect'
import BannerModelGrid from './BannerModelGrid'
import { BannerFormProps, BannerFormData, DeviceType } from '../../../types/banner'
import { bannerCatalog } from '../../../lib/banners/catalog'
import { bannerSchema } from '../../../lib/banners/validation'
import { useBannerValidation } from '../../../hooks/useBannerValidation'

const posicoesBanner = bannerCatalog.map(p => ({
    ...p,
    tamanhoRecomendado: p.larguraRecomendada && p.alturaRecomendada ? `${p.larguraRecomendada}x${p.alturaRecomendada}` : undefined,
}))

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
        checkCompatibility
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
    const ordemValue = watch('ordem') ?? ''

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

    // Compatibility check
    const { isCompatible, suggestedForLocal } = checkCompatibility(watchedLocal, watchedPosicao)

    // Get posInfo from local definition which has tamanhoRecomendado
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
    const isSizeCorrect = !!(watchedLargura && watchedAltura && idealWidth && idealHeight && watchedLargura === idealWidth && watchedAltura === idealHeight)

    return (
        <FormCard
            title={banner ? 'Editar Banner' : 'Novo Banner'}
            onSubmit={handleSubmit(onSubmit)}
            onCancel={onCancel}
            isLoading={loading}
        >
            <div className="space-y-6">
                {/* Nome */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Banner *
                    </label>
                    <input
                        {...register('nome')}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        placeholder="Ex: Banner Promocional Verão 2024"
                    />
                    {errors.nome && (
                        <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                    )}
                </div>

                {/* Posição (Profile) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posição e Local *
                    </label>
                    <BannerModelSelect
                        options={posicoesBanner}
                        value={selectedProfileId}
                        onChange={handleProfileChange}
                        placeholder="Selecione onde o banner vai aparecer..."
                    />
                    <input type="hidden" {...register('posicao')} />
                    <input type="hidden" {...register('local')} />

                    {errors.posicao && (
                        <p className="mt-1 text-sm text-red-600">{errors.posicao.message}</p>
                    )}

                    {/* Compatibility check */}
                    {watchedPosicao && (
                        <div className={`mt-3 p-3 rounded border text-sm ${isCompatible ? 'border-green-200 bg-green-50 text-green-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                            <div className="font-medium mb-1">Compatibilidade com local selecionado</div>
                            <div>{isCompatible ? 'Compatível' : 'Posição pouco indicada para este local'}</div>
                            {!isCompatible && (
                                <div className="mt-2">
                                    <div className="text-xs font-semibold mb-1">Sugestões para este local:</div>
                                    <div className="flex flex-wrap gap-2">
                                        {suggestedForLocal.slice(0, 6).map(s => (
                                            <button
                                                key={s.nome}
                                                type="button"
                                                onClick={() => { handleProfileChange(s.id); }}
                                                className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-xs"
                                            >{s.label || s.nome}</button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Position validation */}
                    {watchedPosicao && posInfo && (
                        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <div className="flex flex-wrap gap-2 mb-2">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{posInfo.tamanhoRecomendado}</span>
                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{(posInfo.paginas || ['Todas as páginas']).join(', ')}</span>
                            </div>
                            <div className="text-sm text-blue-800 font-medium">{posInfo.nome}</div>
                            <div className="text-sm text-blue-600">{posInfo.descricao}</div>

                            {/* Validation status */}
                            <div className="mt-3">
                                <div className="text-xs text-blue-900 font-semibold mb-1">Status da posição</div>
                                {validateLoading ? (
                                    <div className="flex items-center text-sm text-blue-700">
                                        <div className="animate-spin rounded-full h-3 w-3 border-b border-current mr-2"></div>
                                        Validando...
                                    </div>
                                ) : validateError ? (
                                    <div className="text-sm text-red-700">{validateError}</div>
                                ) : validateResult ? (
                                    <div className="space-y-2">
                                        <div className={`text-sm ${validateResult.valid ? 'text-green-700' : 'text-orange-700'}`}>
                                            {validateResult.message || (validateResult.valid ? 'Posição disponível' : 'Conflitos detectados')}
                                        </div>
                                        {typeof validateResult.count === 'number' && (
                                            <div className="text-xs text-gray-700">
                                                Banners ativos nessa posição: <span className="font-semibold">{validateResult.count}</span>
                                            </div>
                                        )}
                                        {Array.isArray(validateResult.conflictingBanners) && validateResult.conflictingBanners.length > 0 && (
                                            <div className="text-xs text-gray-700">
                                                Conflitos:
                                                <ul className="list-disc list-inside">
                                                    {validateResult.conflictingBanners.map((cb: any) => (
                                                        <li key={cb.id}>{cb.nome}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {!validateResult.valid && (
                                            <button
                                                type="button"
                                                onClick={handleDeactivateConflicts}
                                                className="mt-2 inline-flex items-center px-3 py-1.5 rounded bg-orange-600 text-white text-xs hover:bg-orange-700"
                                            >
                                                Desativar conflitos
                                            </button>
                                        )}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    {/* Visual grid */}
                    <div className="mt-4">
                        <div className="text-sm font-medium text-gray-700 mb-2">Seleção visual</div>
                        <BannerModelGrid
                            options={posicoesBanner}
                            value={selectedProfileId}
                            onSelect={(id) => handleProfileChange(id)}
                        />
                    </div>
                </div>

                {/* Grid: Dimensions, Order, Tempo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ordem */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ordem de Exibição
                        </label>
                        <input
                            {...register('ordem', { valueAsNumber: true })}
                            type="number"
                            min="0"
                            max="9999"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="0"
                        />
                        <p className="mt-1 text-xs text-gray-500">Menor número aparece primeiro na posição.</p>
                    </div>

                    {/* Tempo de exibição */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tempo de Exibição (segundos)
                        </label>
                        <input
                            {...register('tempo_exibicao', { valueAsNumber: true })}
                            type="number"
                            min="1"
                            max="60"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="5"
                        />
                        <p className="mt-1 text-xs text-gray-500">Tempo que o banner ficará visível antes de trocar (1-60 segundos).</p>
                    </div>

                    {/* Largura */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Largura (px) *
                            {watchedPosicao && idealWidth > 0 && (
                                <span className="text-xs text-blue-600 ml-2">
                                    (Recomendado: {idealWidth}px)
                                </span>
                            )}
                        </label>
                        <input
                            {...register('largura', { valueAsNumber: true })}
                            type="number"
                            min="50"
                            max="2000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="400"
                        />
                        {errors.largura && (
                            <p className="mt-1 text-sm text-red-600">{errors.largura.message}</p>
                        )}
                    </div>

                    {/* Altura */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Altura (px) *
                            {watchedPosicao && idealHeight > 0 && (
                                <span className="text-xs text-blue-600 ml-2">
                                    (Recomendado: {idealHeight}px)
                                </span>
                            )}
                        </label>
                        <input
                            {...register('altura', { valueAsNumber: true })}
                            type="number"
                            min="50"
                            max="1000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            placeholder="200"
                        />
                        {errors.altura && (
                            <p className="mt-1 text-sm text-red-600">{errors.altura.message}</p>
                        )}
                    </div>

                    {/* Quick dimension buttons */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Botões Rápidos
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                                onClick={() => { setValue('largura', 640); setValue('altura', 200); }}
                            >Aplicar 640×200 (Guia)</button>
                            <button
                                type="button"
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                                onClick={() => { setValue('largura', 585); setValue('altura', 330); }}
                            >Aplicar 585×330 (Padrão)</button>
                            <button
                                type="button"
                                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                                onClick={() => { setValue('largura', 300); setValue('altura', 600); }}
                            >Aplicar 300×600 (Sidebar)</button>
                        </div>
                    </div>

                    {/* Link */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Link (opcional)
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
                    </div>
                </div>

                {/* Imagem */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Imagem *
                    </label>
                    <ImageUploader
                        value={watchedImagem}
                        onChange={(url) => setValue('imagem', url || '')}
                        bucket="banners"
                        folder="images"
                        showLibraryButton={true}
                        useNewMediaAPI={false}
                    />
                    {errors.imagem && (
                        <p className="mt-1 text-sm text-red-600">{errors.imagem.message}</p>
                    )}
                </div>

                {/* Preview */}
                {watchedImagem && watchedLargura && watchedAltura && (
                    <div className="border-t pt-6">
                        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                            <Eye className="h-5 w-5 mr-2 text-orange-600" />
                            Preview do Banner
                        </h4>

                        <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    {ordemValue !== '' && (
                                        <span className="inline-flex items-center justify-center w-6 h-6 text-sm font-semibold rounded-full bg-gray-200 text-gray-800">
                                            {ordemValue}
                                        </span>
                                    )}
                                    {watchedPosicao && (
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            {watchedPosicao}
                                        </span>
                                    )}
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${isSizeCorrect ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                                        {isSizeCorrect ? 'Tamanho Correto' : 'Ajustar Tamanho'}
                                    </span>
                                </div>

                                {/* Device selector */}
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-600">Visualizar em:</span>
                                    <button type="button" onClick={() => setPreviewDevice('desktop')} className={`p-1.5 rounded ${previewDevice === 'desktop' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}>
                                        <Monitor className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => setPreviewDevice('tablet')} className={`p-1.5 rounded ${previewDevice === 'tablet' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}>
                                        <Tablet className="w-4 h-4" />
                                    </button>
                                    <button type="button" onClick={() => setPreviewDevice('mobile')} className={`p-1.5 rounded ${previewDevice === 'mobile' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:text-gray-800'}`}>
                                        <Smartphone className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Preview image */}
                            <div className="flex justify-center">
                                <div
                                    className="relative overflow-hidden rounded-lg shadow-sm border border-gray-200 bg-white"
                                    style={{ width: displayWidth, height: displayHeight, maxWidth: '100%' }}
                                >
                                    <img
                                        src={watchedImagem}
                                        alt={watch('nome') || 'Preview do banner'}
                                        className="w-full h-full object-contain"
                                    />
                                    {!watch('ativo') && (
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                            <span className="text-white text-sm font-medium bg-red-600 px-3 py-1 rounded-full">Banner Inativo</span>
                                        </div>
                                    )}
                                    {watch('link') && (
                                        <div className="absolute top-2 right-2">
                                            <div className="bg-blue-600 text-white p-1 rounded-full">
                                                <ExternalLink className="w-3 h-3" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Info grid */}
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-500">Dimensões:</span>
                                    <div className="font-medium">{watchedLargura} × {watchedAltura}px</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Exibindo:</span>
                                    <div className="font-medium">{displayWidth} × {displayHeight}px</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Tamanho Ideal:</span>
                                    <div className="font-medium">{idealWidth} × {idealHeight}px</div>
                                </div>
                                <div>
                                    <span className="text-gray-500">Link:</span>
                                    <div className="font-medium">{watch('link') ? 'Sim' : 'Não'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Status */}
                <div>
                    <label className="flex items-center">
                        <input
                            {...register('ativo')}
                            type="checkbox"
                            className="rounded border-gray-300 text-orange-600 shadow-sm focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-700">Banner ativo</span>
                    </label>
                </div>

                {/* Agendamento */}
                <div className="border-t pt-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                        Agendamento (Opcional)
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Configure quando o banner deve ser exibido automaticamente. Se não definir datas, o banner seguirá apenas o status ativo/inativo.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data/Hora de Início
                            </label>
                            <input
                                {...register('data_inicio')}
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            {errors.data_inicio && (
                                <p className="mt-1 text-sm text-red-600">{errors.data_inicio.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Banner começará a ser exibido nesta data/hora
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data/Hora de Fim
                            </label>
                            <input
                                {...register('data_fim')}
                                type="datetime-local"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                            {errors.data_fim && (
                                <p className="mt-1 text-sm text-red-600">{errors.data_fim.message}</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">
                                Banner parará de ser exibido nesta data/hora
                            </p>
                        </div>
                    </div>

                    {/* Schedule preview */}
                    {(watch('data_inicio') || watch('data_fim')) && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <h5 className="text-sm font-medium text-blue-800 mb-2">Preview do Agendamento:</h5>
                            <div className="text-sm text-blue-600">
                                {watch('data_inicio') && (
                                    <p>📅 Início: {new Date(watch('data_inicio')!).toLocaleString('pt-BR')}</p>
                                )}
                                {watch('data_fim') && (
                                    <p>📅 Fim: {new Date(watch('data_fim')!).toLocaleString('pt-BR')}</p>
                                )}
                                {watch('data_inicio') && watch('data_fim') && (
                                    <p className="mt-1 font-medium">
                                        ⏱️ Duração: {Math.ceil((new Date(watch('data_fim')!).getTime() - new Date(watch('data_inicio')!).getTime()) / (1000 * 60 * 60 * 24))} dias
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </FormCard>
    )
}

export default BannerForm

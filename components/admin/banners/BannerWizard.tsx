/**
 * BannerWizard - Modal wizard para CRIAR e EDITAR banners
 * 
 * Modo Criação: Página → Posição → Imagem → Configurações → Salvar
 * Modo Edição: Imagem → Configurações → Salvar (posição mantida)
 */

import { useState, useEffect } from 'react'
import { X, ArrowLeft, ArrowRight, Home, Newspaper, Store, Calendar, Phone, Globe, ChevronRight, Image as ImageIcon, Check, Loader2, Link as LinkIcon, Settings, Save, Edit } from 'lucide-react'
import { BannerModelOption, bannerCatalog } from '../../../lib/banners/catalog'
import { supabase, Banner } from '../../../lib/supabase'
import ImageUploader from '../ImageUploader'

type WizardStep = 'page' | 'position' | 'image' | 'config'

interface BannerWizardProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    accessToken?: string | null
    editingBanner?: Banner | null // Banner para editar (null = modo criação)
    duplicatingBanner?: Banner | null // Banner para duplicar (começa em 'page' com dados copiados)
}

interface BannerFormState {
    nome: string
    posicao: string
    local: string
    imagem: string
    link: string
    largura: number
    altura: number
    ordem: number
    tempo_exibicao: number
    ativo: boolean
    data_inicio: string | null
    data_fim: string | null
}

// Configuração das páginas disponíveis
const pageOptions = [
    { id: 'home', name: 'Home', icon: Home, color: 'bg-indigo-500', description: 'Página inicial do portal' },
    { id: 'noticias', name: 'Notícias', icon: Newspaper, color: 'bg-blue-500', description: 'Lista de notícias' },
    { id: 'guia_comercial', name: 'Guia Comercial', icon: Store, color: 'bg-green-500', description: 'Empresas e serviços' },
    { id: 'eventos', name: 'Eventos', icon: Calendar, color: 'bg-purple-500', description: 'Agenda de eventos' },
    { id: 'contato', name: 'Contato', icon: Phone, color: 'bg-orange-500', description: 'Página de contato' },
    { id: 'geral', name: 'Todas as Páginas', icon: Globe, color: 'bg-gray-600', description: 'Banners globais' },
]

// Agrupar posições por página
const getPositionsByPage = (pageId: string): BannerModelOption[] => {
    return bannerCatalog.filter(p => p.local === pageId)
}

// Componente de Preview Visual da Página (simplificado)
const PagePreview = ({ pageId, highlightPosition }: { pageId: string; highlightPosition?: string }) => {
    const isHighlighted = (pos: string) => highlightPosition === pos
    const w = 180, h = 240
    const headerColor = "#4f46e5", contentColor = "#e5e7eb", bannerColor = "#fbbf24", highlightColor = "#f97316"
    const getColor = (pos: string) => isHighlighted(pos) ? highlightColor : bannerColor

    return (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="rounded-lg border border-gray-300 bg-white shadow-sm">
            <rect x="0" y="0" width={w} height="16" fill={headerColor} />
            <rect x="8" y="24" width={w - 16} height="30" rx="3" fill={getColor('Banner Grande - Topo')} stroke={isHighlighted('Banner Grande - Topo') ? '#000' : 'none'} strokeWidth="2">
                {isHighlighted('Banner Grande - Topo') && <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />}
            </rect>
            <text x={w / 2} y="43" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">TOPO</text>
            <rect x="8" y="60" width={w - 16} height="50" rx="3" fill={contentColor} />
            <rect x="8" y="116" width={w - 16} height="25" rx="3" fill={getColor('Banner Grande - Meio')} stroke={isHighlighted('Banner Grande - Meio') ? '#000' : 'none'} strokeWidth="2">
                {isHighlighted('Banner Grande - Meio') && <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />}
            </rect>
            <text x={w / 2} y="132" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="bold">MEIO</text>
            <rect x="8" y="147" width={w - 16} height="50" rx="3" fill={contentColor} />
            <rect x="8" y="203" width={w - 16} height="20" rx="3" fill={getColor('Banner Grande - Final')} stroke={isHighlighted('Banner Grande - Final') ? '#000' : 'none'} strokeWidth="2">
                {isHighlighted('Banner Grande - Final') && <animate attributeName="opacity" values="1;0.7;1" dur="1.5s" repeatCount="indefinite" />}
            </rect>
            <text x={w / 2} y="216" textAnchor="middle" fontSize="6" fill="#fff" fontWeight="bold">FINAL</text>
        </svg>
    )
}

// Steps config
const steps: { id: WizardStep; label: string; icon: any }[] = [
    { id: 'page', label: 'Página', icon: Home },
    { id: 'position', label: 'Posição', icon: ImageIcon },
    { id: 'image', label: 'Imagem', icon: ImageIcon },
    { id: 'config', label: 'Configurar', icon: Settings },
]

export default function BannerWizard({ isOpen, onClose, onSuccess, accessToken, editingBanner, duplicatingBanner }: BannerWizardProps) {
    // Determinar se é modo edição ou duplicação
    const isEditMode = !!editingBanner
    const isDuplicateMode = !!duplicatingBanner

    // Modo edição: pular para imagem. Duplicação/Criação: começar na página
    const initialStep: WizardStep = isEditMode ? 'image' : 'page'

    const [step, setStep] = useState<WizardStep>(initialStep)
    const [selectedPage, setSelectedPage] = useState<string | null>(null)
    const [selectedPosition, setSelectedPosition] = useState<BannerModelOption | null>(null)
    const [hoveredPosition, setHoveredPosition] = useState<string | null>(null)
    const [bannerCounts, setBannerCounts] = useState<Record<string, number>>({})
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')

    // Form state padrão
    const defaultFormState: BannerFormState = {
        nome: '',
        posicao: '',
        local: 'geral',
        imagem: '',
        link: '',
        largura: 970,
        altura: 250,
        ordem: 0,
        tempo_exibicao: 5,
        ativo: true,
        data_inicio: null,
        data_fim: null,
    }

    const [formState, setFormState] = useState<BannerFormState>(defaultFormState)

    // Estado para banners existentes por posição (com imagens)
    const [existingBanners, setExistingBanners] = useState<Record<string, Array<{ id: string, imagem: string, nome: string }>>>({})

    // Carregar contagem de banners e miniaturas
    useEffect(() => {
        if (isOpen && selectedPage) {
            loadBannerCounts()
        }
    }, [isOpen, selectedPage])

    const loadBannerCounts = async () => {
        if (!supabase) return
        try {
            const { data } = await supabase
                .from('banners')
                .select('id, posicao, imagem, nome, ativo')
                .eq('ativo', true)
                .order('ordem', { ascending: true })

            if (data) {
                const counts: Record<string, number> = {}
                const byPosition: Record<string, Array<{ id: string, imagem: string, nome: string }>> = {}

                data.forEach(b => {
                    counts[b.posicao] = (counts[b.posicao] || 0) + 1
                    if (!byPosition[b.posicao]) byPosition[b.posicao] = []
                    if (byPosition[b.posicao].length < 4) { // Máximo 4 miniaturas
                        byPosition[b.posicao].push({ id: b.id, imagem: b.imagem, nome: b.nome })
                    }
                })

                setBannerCounts(counts)
                setExistingBanners(byPosition)
            }
        } catch (err) {
            console.error('Erro ao carregar contagem:', err)
        }
    }

    // Inicializar/Reset ao abrir/fechar
    useEffect(() => {
        if (isOpen) {
            if (editingBanner) {
                // Modo edição: pré-preencher com dados do banner
                setStep('image')
                setFormState({
                    nome: editingBanner.nome || '',
                    posicao: editingBanner.posicao || '',
                    local: editingBanner.local || 'geral',
                    imagem: editingBanner.imagem || '',
                    link: editingBanner.link || '',
                    largura: editingBanner.largura || 970,
                    altura: editingBanner.altura || 250,
                    ordem: editingBanner.ordem || 0,
                    tempo_exibicao: editingBanner.tempo_exibicao || 5,
                    ativo: editingBanner.ativo !== false,
                    data_inicio: editingBanner.data_inicio || null,
                    data_fim: editingBanner.data_fim || null,
                })
                // Encontrar posição no catálogo
                const pos = bannerCatalog.find(p => p.nome === editingBanner.posicao)
                if (pos) {
                    setSelectedPosition(pos)
                    setSelectedPage(pos.local || 'geral')
                }
            } else if (duplicatingBanner) {
                // Modo duplicação: pré-preencher mas começar do início (nova posição)
                setStep('page')
                setFormState({
                    nome: `${duplicatingBanner.nome || ''} (cópia)`,
                    posicao: '', // Resetar posição para o usuário escolher
                    local: 'geral',
                    imagem: duplicatingBanner.imagem || '',
                    link: duplicatingBanner.link || '',
                    largura: duplicatingBanner.largura || 970,
                    altura: duplicatingBanner.altura || 250,
                    ordem: duplicatingBanner.ordem || 0,
                    tempo_exibicao: duplicatingBanner.tempo_exibicao || 5,
                    ativo: true,
                    data_inicio: null, // Não copiar agendamento
                    data_fim: null,
                })
                setSelectedPage(null)
                setSelectedPosition(null)
            } else {
                // Modo criação: resetar tudo
                setStep('page')
                setFormState(defaultFormState)
                setSelectedPage(null)
                setSelectedPosition(null)
            }
            setError(null)
            setHoveredPosition(null)
        }
    }, [isOpen, editingBanner, duplicatingBanner])

    // Handlers
    const handlePageSelect = (pageId: string) => {
        setSelectedPage(pageId)
        setFormState(prev => ({ ...prev, local: pageId }))
        setStep('position')
    }

    const handlePositionSelect = (position: BannerModelOption) => {
        setSelectedPosition(position)
        setFormState(prev => ({
            ...prev,
            posicao: position.nome,
            local: position.local || 'geral',
            largura: position.larguraRecomendada || 970,
            altura: position.alturaRecomendada || 250,
            nome: `Banner ${position.label || position.nome}`,
        }))
        setStep('image')
    }

    const handleImageChange = (url: string | null) => {
        setFormState(prev => ({ ...prev, imagem: url || '' }))
    }

    const handleBack = () => {
        const stepIndex = steps.findIndex(s => s.id === step)
        if (stepIndex > 0) {
            setStep(steps[stepIndex - 1].id)
        }
    }

    const handleNext = () => {
        if (step === 'image' && formState.imagem) {
            setStep('config')
        }
    }

    // Calcular status do agendamento
    const getScheduleStatus = (): 'active' | 'scheduled' | 'expired' => {
        const now = new Date()
        const start = formState.data_inicio ? new Date(formState.data_inicio) : null
        const end = formState.data_fim ? new Date(formState.data_fim) : null

        if (end && now > end) return 'expired'
        if (start && now < start) return 'scheduled'
        return 'active'
    }

    const handleSave = async () => {
        if (!supabase) {
            setError('Sistema não configurado')
            return
        }

        // Validação
        if (!formState.nome.trim()) {
            setError('Nome é obrigatório')
            return
        }
        if (!formState.imagem) {
            setError('Imagem é obrigatória')
            return
        }
        if (!formState.posicao) {
            setError('Posição é obrigatória')
            return
        }

        setSaving(true)
        setError(null)

        try {
            const bannerData = {
                nome: formState.nome.trim(),
                posicao: formState.posicao,
                local: formState.local,
                imagem: formState.imagem,
                link: formState.link?.trim() || null,
                largura: formState.largura,
                altura: formState.altura,
                ordem: formState.ordem,
                tempo_exibicao: formState.tempo_exibicao,
                ativo: formState.ativo,
                data_inicio: formState.data_inicio,
                data_fim: formState.data_fim,
            }

            let response: Response

            if (isEditMode && editingBanner?.id) {
                // Modo edição: atualizar banner existente
                response = await fetch('/api/admin/updateBanner', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ id: editingBanner.id, ...bannerData }),
                })
            } else {
                // Modo criação: criar novo banner
                response = await fetch('/api/admin/createBanner', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(bannerData),
                })
            }

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || result.error || 'Erro ao salvar banner')
            }

            // Sucesso
            onSuccess()
            onClose()
        } catch (err: any) {
            console.error('Erro ao salvar banner:', err)
            setError(err.message || 'Erro ao salvar banner')
        } finally {
            setSaving(false)
        }
    }

    if (!isOpen) return null

    const positions = selectedPage ? getPositionsByPage(selectedPage) : []
    const selectedPageInfo = pageOptions.find(p => p.id === selectedPage)
    const stepIndex = steps.findIndex(s => s.id === step)
    const canGoBack = stepIndex > 0
    const isLastStep = step === 'config'

    // Get modal width based on step
    const getModalWidth = () => {
        if (step === 'position') return 'max-w-4xl'
        if (step === 'image') return 'max-w-3xl'
        return 'max-w-2xl'
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`bg-white rounded-xl w-full max-h-[90vh] overflow-hidden shadow-2xl transition-all ${getModalWidth()}`}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        {canGoBack && (
                            <button onClick={handleBack} className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors">
                                <ArrowLeft size={20} />
                            </button>
                        )}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {isEditMode ? 'Editar Banner' : 'Novo Banner'}
                            </h2>
                            <p className="text-sm text-gray-500">{steps[stepIndex].label}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="px-6 pt-4">
                    <div className="flex items-center justify-between mb-2">
                        {steps.map((s, i) => (
                            <div key={s.id} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${i < stepIndex ? 'bg-green-500 text-white' :
                                    i === stepIndex ? 'bg-orange-500 text-white' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                    {i < stepIndex ? <Check size={16} /> : i + 1}
                                </div>
                                {i < steps.length - 1 && (
                                    <div className={`w-12 md:w-20 h-1 mx-1 rounded ${i < stepIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 px-1">
                        {steps.map(s => <span key={s.id} className="w-8 text-center">{s.label}</span>)}
                    </div>
                </div>

                {/* Content */}
                <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6">
                    {/* STEP 1: Page Selection */}
                    {step === 'page' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {pageOptions.map((page) => {
                                const Icon = page.icon
                                const positionCount = getPositionsByPage(page.id).length
                                return (
                                    <button
                                        key={page.id}
                                        onClick={() => handlePageSelect(page.id)}
                                        className="group p-4 rounded-xl border-2 border-gray-200 hover:border-indigo-400 hover:shadow-lg transition-all text-left"
                                    >
                                        <div className={`${page.color} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                            <Icon className="text-white" size={24} />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{page.name}</h3>
                                        <p className="text-xs text-gray-500 mb-2">{page.description}</p>
                                        <span className="text-xs font-medium text-indigo-600">{positionCount} posições</span>
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* STEP 2: Position Selection */}
                    {step === 'position' && selectedPage && (
                        <div className="flex gap-6">
                            <div className="hidden md:flex flex-col items-center justify-start flex-shrink-0">
                                <PagePreview pageId={selectedPage} highlightPosition={hoveredPosition || undefined} />
                                <p className="text-xs text-gray-500 mt-2 text-center max-w-[180px]">Passe o mouse para visualizar</p>
                            </div>
                            <div className="flex-1 space-y-3">
                                {positions.map((position) => {
                                    const count = bannerCounts[position.nome] || 0
                                    const thumbnails = existingBanners[position.nome] || []
                                    const isHovered = hoveredPosition === position.nome
                                    return (
                                        <button
                                            key={position.id}
                                            onClick={() => handlePositionSelect(position)}
                                            onMouseEnter={() => setHoveredPosition(position.nome)}
                                            onMouseLeave={() => setHoveredPosition(null)}
                                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${isHovered ? 'border-orange-400 bg-orange-50 shadow-md' : 'border-gray-200 hover:border-indigo-400'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-16 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${isHovered ? 'bg-orange-100' : 'bg-gray-100'}`}>
                                                    <ImageIcon className={isHovered ? 'text-orange-500' : 'text-gray-400'} size={20} />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-gray-900 truncate">{position.label || position.nome}</h3>
                                                    <p className="text-sm text-gray-500 truncate">{position.descricao}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${isHovered ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                                                            {position.larguraRecomendada}×{position.alturaRecomendada}px
                                                        </span>
                                                        {count > 0 && <span className="text-xs text-indigo-600">{count} banner(s) ativos</span>}
                                                    </div>
                                                </div>
                                                <ChevronRight className={isHovered ? 'text-orange-500' : 'text-gray-400'} size={20} />
                                            </div>

                                            {/* Miniaturas dos banners existentes */}
                                            {thumbnails.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-100">
                                                    <p className="text-xs text-gray-400 mb-2">Banners nesta posição:</p>
                                                    <div className="flex items-center gap-2">
                                                        {thumbnails.map((b) => (
                                                            <div
                                                                key={b.id}
                                                                className="relative group/thumb"
                                                                title={b.nome}
                                                            >
                                                                <img
                                                                    src={b.imagem}
                                                                    alt={b.nome}
                                                                    className="w-12 h-8 object-cover rounded border border-gray-200"
                                                                />
                                                            </div>
                                                        ))}
                                                        {count > 4 && (
                                                            <span className="text-xs text-gray-400">+{count - 4}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}

                    {/* STEP 3: Image Upload */}
                    {step === 'image' && selectedPosition && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-100 p-2 rounded-lg">
                                        <ImageIcon className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-blue-900">{selectedPosition.label || selectedPosition.nome}</h3>
                                        <p className="text-sm text-blue-700">Tamanho recomendado: {selectedPosition.larguraRecomendada}×{selectedPosition.alturaRecomendada}px</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Banner *</label>
                                <ImageUploader
                                    value={formState.imagem}
                                    onChange={handleImageChange}
                                    bucket="banners"
                                    folder="images"
                                    showLibraryButton={true}
                                    aspectRatio={selectedPosition.larguraRecomendada && selectedPosition.alturaRecomendada
                                        ? selectedPosition.larguraRecomendada / selectedPosition.alturaRecomendada
                                        : undefined}
                                />
                            </div>

                            {formState.imagem && (
                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                    <h4 className="font-medium text-gray-700 mb-3">Preview</h4>
                                    <div className="flex justify-center">
                                        <img
                                            src={formState.imagem}
                                            alt="Preview"
                                            className="max-w-full max-h-64 rounded-lg shadow-md object-contain"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP 4: Configuration */}
                    {step === 'config' && (
                        <div className="space-y-6">
                            {/* Preview Responsivo */}
                            {formState.imagem && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-gray-700 flex items-center gap-2">
                                            <ImageIcon className="w-4 h-4 text-blue-600" />
                                            Preview do Banner
                                        </h4>
                                        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                                            <button
                                                onClick={() => setPreviewSize('desktop')}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${previewSize === 'desktop'
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                Desktop
                                            </button>
                                            <button
                                                onClick={() => setPreviewSize('tablet')}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${previewSize === 'tablet'
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                Tablet
                                            </button>
                                            <button
                                                onClick={() => setPreviewSize('mobile')}
                                                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${previewSize === 'mobile'
                                                    ? 'bg-white text-blue-600 shadow-sm'
                                                    : 'text-gray-600 hover:text-gray-800'
                                                    }`}
                                            >
                                                Mobile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Preview Container */}
                                    <div className="bg-gradient-to-b from-gray-100 to-gray-50 rounded-lg p-4 flex justify-center overflow-hidden">
                                        <div
                                            className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${previewSize === 'desktop' ? 'w-full max-w-[500px]' :
                                                previewSize === 'tablet' ? 'w-[320px]' :
                                                    'w-[200px]'
                                                }`}
                                        >
                                            <img
                                                src={formState.imagem}
                                                alt="Preview"
                                                className="w-full h-auto object-cover"
                                                style={{
                                                    aspectRatio: `${formState.largura}/${formState.altura}`
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-500 text-center mt-2">
                                        {formState.posicao} • {formState.largura}×{formState.altura}px
                                    </p>
                                </div>
                            )}

                            {/* Nome */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Banner *</label>
                                <input
                                    type="text"
                                    value={formState.nome}
                                    onChange={(e) => setFormState(prev => ({ ...prev, nome: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Ex: Promoção de Verão"
                                />
                            </div>

                            {/* Link */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <LinkIcon className="inline w-4 h-4 mr-1" />
                                    Link de destino (opcional)
                                </label>
                                <input
                                    type="url"
                                    value={formState.link}
                                    onChange={(e) => setFormState(prev => ({ ...prev, link: e.target.value }))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="https://exemplo.com"
                                />
                            </div>

                            {/* Configurações Avançadas */}
                            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Settings className="w-5 h-5 text-gray-600" />
                                    <h4 className="font-medium text-gray-700">Configurações Avançadas</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Prioridade/Ordem */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Prioridade (ordem de exibição)
                                        </label>
                                        <input
                                            type="number"
                                            value={formState.ordem}
                                            onChange={(e) => setFormState(prev => ({ ...prev, ordem: parseInt(e.target.value) || 0 }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                            min="0"
                                            max="100"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Menor número = aparece primeiro</p>
                                    </div>

                                    {/* Tempo de Exibição */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Tempo de exibição (carrossel)
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="number"
                                                value={formState.tempo_exibicao}
                                                onChange={(e) => setFormState(prev => ({ ...prev, tempo_exibicao: parseInt(e.target.value) || 5 }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                min="2"
                                                max="30"
                                            />
                                            <span className="text-sm text-gray-500 whitespace-nowrap">segundos</span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Tempo antes de trocar (2-30s)</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                    <span className="font-medium text-gray-700">Banner Ativo</span>
                                    <p className="text-sm text-gray-500">O banner aparecerá no site imediatamente</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formState.ativo}
                                        onChange={(e) => setFormState(prev => ({ ...prev, ativo: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
                                </label>
                            </div>

                            {/* Agendamento */}
                            <div className="border border-gray-200 rounded-lg p-4 space-y-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-5 h-5 text-purple-600" />
                                    <h4 className="font-medium text-gray-700">Agendamento (opcional)</h4>
                                </div>
                                <p className="text-xs text-gray-500 -mt-2">Defina quando o banner deve começar e parar de ser exibido</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Data Início */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Data de Início
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formState.data_inicio || ''}
                                            onChange={(e) => setFormState(prev => ({ ...prev, data_inicio: e.target.value || null }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Deixe vazio para iniciar imediatamente</p>
                                    </div>

                                    {/* Data Fim */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Data de Término
                                        </label>
                                        <input
                                            type="datetime-local"
                                            value={formState.data_fim || ''}
                                            onChange={(e) => setFormState(prev => ({ ...prev, data_fim: e.target.value || null }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                                        />
                                        <p className="text-xs text-gray-400 mt-1">Deixe vazio para exibir indefinidamente</p>
                                    </div>
                                </div>

                                {/* Indicador visual de status de agendamento */}
                                {(formState.data_inicio || formState.data_fim) && (
                                    <div className={`flex items-center gap-2 p-2 rounded-lg text-sm ${getScheduleStatus() === 'active' ? 'bg-green-50 text-green-700' :
                                        getScheduleStatus() === 'scheduled' ? 'bg-blue-50 text-blue-700' :
                                            'bg-gray-100 text-gray-600'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${getScheduleStatus() === 'active' ? 'bg-green-500' :
                                            getScheduleStatus() === 'scheduled' ? 'bg-blue-500' :
                                                'bg-gray-400'
                                            }`} />
                                        <span>
                                            {getScheduleStatus() === 'active' ? 'Ativo agora' :
                                                getScheduleStatus() === 'scheduled' ? 'Agendado para o futuro' :
                                                    'Período de exibição encerrado'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Error message */}
                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                    {error}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            Passo {stepIndex + 1} de {steps.length}
                        </span>
                        <div className="flex gap-2">
                            {step === 'image' && formState.imagem && (
                                <button
                                    onClick={handleNext}
                                    className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    Continuar
                                    <ArrowRight size={18} />
                                </button>
                            )}
                            {isLastStep && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !formState.nome.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Salvar Banner
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

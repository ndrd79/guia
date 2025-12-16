/**
 * EventoWizard - Modal wizard para CRIAR e EDITAR eventos
 * 
 * Etapas:
 * 1. Informações Básicas (título, tipo, descrição)
 * 2. Data, Hora e Local
 * 3. Imagem
 * 4. Preview e Confirmação
 */

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, Calendar, MapPin, Clock, FileText, Image as ImageIcon, Eye, Check, AlertCircle } from 'lucide-react'
import ImageUploader from '../ImageUploader'
import { Evento } from '../../../lib/supabase'

type WizardStep = 'info' | 'datetime' | 'image' | 'preview'

interface EventoWizardProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    editingEvento?: Evento | null
}

interface EventoFormState {
    titulo: string
    tipo: string
    descricao: string
    data_hora: string
    local: string
    imagem: string
}

const tiposEvento = [
    { id: 'show', label: 'Show', icon: '🎤' },
    { id: 'festa', label: 'Festa', icon: '🎉' },
    { id: 'feira', label: 'Feira', icon: '🛒' },
    { id: 'festival', label: 'Festival', icon: '🎪' },
    { id: 'esporte', label: 'Esporte', icon: '⚽' },
    { id: 'teatro', label: 'Teatro', icon: '🎭' },
    { id: 'palestra', label: 'Palestra', icon: '🎓' },
    { id: 'workshop', label: 'Workshop', icon: '🔧' },
    { id: 'religioso', label: 'Religioso', icon: '⛪' },
    { id: 'outro', label: 'Outro', icon: '📅' },
]

const steps: { id: WizardStep; label: string; icon: any }[] = [
    { id: 'info', label: 'Informações', icon: FileText },
    { id: 'datetime', label: 'Data e Local', icon: Calendar },
    { id: 'image', label: 'Imagem', icon: ImageIcon },
    { id: 'preview', label: 'Preview', icon: Eye },
]

const initialFormState: EventoFormState = {
    titulo: '',
    tipo: '',
    descricao: '',
    data_hora: '',
    local: '',
    imagem: '',
}

export default function EventoWizard({ isOpen, onClose, onSuccess, editingEvento }: EventoWizardProps) {
    const [currentStep, setCurrentStep] = useState<WizardStep>('info')
    const [formData, setFormData] = useState<EventoFormState>(initialFormState)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const isEditMode = !!editingEvento

    // Carregar dados do evento em modo edição
    useEffect(() => {
        if (editingEvento) {
            setFormData({
                titulo: editingEvento.titulo || '',
                tipo: editingEvento.tipo || '',
                descricao: editingEvento.descricao || '',
                data_hora: editingEvento.data_hora ? new Date(editingEvento.data_hora).toISOString().slice(0, 16) : '',
                local: editingEvento.local || '',
                imagem: editingEvento.imagem || '',
            })
        } else {
            setFormData(initialFormState)
        }
        setCurrentStep('info')
        setError(null)
    }, [editingEvento, isOpen])

    if (!isOpen) return null

    const currentStepIndex = steps.findIndex(s => s.id === currentStep)

    const handleBack = () => {
        const prevStep = steps[currentStepIndex - 1]
        if (prevStep) setCurrentStep(prevStep.id)
    }

    const handleNext = () => {
        const nextStep = steps[currentStepIndex + 1]
        if (nextStep) setCurrentStep(nextStep.id)
    }

    const canProceed = () => {
        switch (currentStep) {
            case 'info':
                return formData.titulo.trim() !== '' && formData.tipo !== '' && formData.descricao.trim() !== ''
            case 'datetime':
                return formData.data_hora !== '' && formData.local.trim() !== ''
            case 'image':
                return true // Imagem é opcional
            case 'preview':
                return true
            default:
                return false
        }
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)

        try {
            const endpoint = '/api/admin/eventos'
            const method = isEditMode ? 'PUT' : 'POST'

            const body = isEditMode
                ? { ...formData, id: editingEvento?.id }
                : formData

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Erro ao salvar evento')
            }

            onSuccess()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Erro ao salvar evento')
        } finally {
            setSaving(false)
        }
    }

    const formatDateTimePreview = (dateStr: string) => {
        if (!dateStr) return { date: '-', time: '-' }
        const date = new Date(dateStr)
        return {
            date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
            time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        }
    }

    const getTipoLabel = (tipo: string) => {
        return tiposEvento.find(t => t.id === tipo)?.label || tipo
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-indigo-500 to-purple-600">
                    <h2 className="text-xl font-bold text-white">
                        {isEditMode ? 'Editar Evento' : 'Novo Evento'}
                    </h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Steps Indicator */}
                <div className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 border-b">
                    {steps.map((step, index) => {
                        const Icon = step.icon
                        const isActive = step.id === currentStep
                        const isCompleted = index < currentStepIndex
                        return (
                            <div key={step.id} className="flex items-center">
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${isActive ? 'bg-indigo-600 text-white' :
                                    isCompleted ? 'bg-green-100 text-green-700' :
                                        'bg-gray-200 text-gray-500'
                                    }`}>
                                    {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                                    <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                                </div>
                                {index < steps.length - 1 && (
                                    <ChevronRight className="w-4 h-4 mx-1 text-gray-400" />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Step 1: Informações Básicas */}
                    {currentStep === 'info' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Título do Evento *
                                </label>
                                <input
                                    type="text"
                                    value={formData.titulo}
                                    onChange={e => setFormData({ ...formData, titulo: e.target.value })}
                                    placeholder="Ex: Festival de Música 2025"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Evento *
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {tiposEvento.map(tipo => (
                                        <button
                                            key={tipo.id}
                                            onClick={() => setFormData({ ...formData, tipo: tipo.id })}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${formData.tipo === tipo.id
                                                ? 'border-indigo-600 bg-indigo-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                        >
                                            <span className="text-2xl">{tipo.icon}</span>
                                            <span className="text-xs font-medium">{tipo.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Descrição *
                                </label>
                                <textarea
                                    value={formData.descricao}
                                    onChange={e => setFormData({ ...formData, descricao: e.target.value })}
                                    placeholder="Descreva o evento..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Data, Hora e Local */}
                    {currentStep === 'datetime' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Data e Hora *
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.data_hora}
                                    onChange={e => setFormData({ ...formData, data_hora: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Local *
                                </label>
                                <input
                                    type="text"
                                    value={formData.local}
                                    onChange={e => setFormData({ ...formData, local: e.target.value })}
                                    placeholder="Ex: Praça Central, Centro"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Preview do que foi preenchido */}
                            <div className="bg-indigo-50 rounded-xl p-4">
                                <h4 className="font-semibold text-indigo-900 mb-2">Resumo</h4>
                                <p className="text-sm text-indigo-700">
                                    <strong>{formData.titulo || 'Título do evento'}</strong>
                                </p>
                                <p className="text-sm text-indigo-600">
                                    {formData.data_hora
                                        ? `${formatDateTimePreview(formData.data_hora).date} às ${formatDateTimePreview(formData.data_hora).time}`
                                        : 'Data não definida'
                                    }
                                </p>
                                <p className="text-sm text-indigo-600">
                                    {formData.local || 'Local não definido'}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Imagem */}
                    {currentStep === 'image' && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Imagem do Evento (opcional)
                                </label>
                                <p className="text-sm text-gray-500 mb-4">
                                    Adicione uma imagem ou cartaz para o evento. Tamanho recomendado: 800x400px
                                </p>

                                <ImageUploader
                                    value={formData.imagem}
                                    onChange={(url) => setFormData({ ...formData, imagem: url || '' })}
                                    bucket="eventos"
                                    folder="images"
                                    aspectRatio={16 / 9}
                                    maxSize={5}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 4: Preview */}
                    {currentStep === 'preview' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
                                {/* Imagem */}
                                <div className="relative h-48 bg-gradient-to-br from-indigo-500 to-purple-600">
                                    {formData.imagem ? (
                                        <Image
                                            src={formData.imagem}
                                            alt={formData.titulo}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 600px"
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Calendar className="w-16 h-16 text-white/40" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                    {/* Badge */}
                                    <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 text-sm font-semibold rounded-full">
                                        {getTipoLabel(formData.tipo)}
                                    </span>
                                </div>

                                {/* Conteúdo */}
                                <div className="p-5">
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                                        {formData.titulo || 'Título do Evento'}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDateTimePreview(formData.data_hora).date}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatDateTimePreview(formData.data_hora).time}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            <span>{formData.local || 'Local não definido'}</span>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 text-sm line-clamp-3">
                                        {formData.descricao || 'Descrição do evento...'}
                                    </p>
                                </div>
                            </div>

                            {error && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-xl">
                                    <AlertCircle className="w-5 h-5" />
                                    <span>{error}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50">
                    <button
                        onClick={currentStepIndex > 0 ? handleBack : onClose}
                        className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                        {currentStepIndex > 0 ? 'Voltar' : 'Cancelar'}
                    </button>

                    {currentStep === 'preview' ? (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Check className="w-4 h-4" />
                                    {isEditMode ? 'Salvar Alterações' : 'Criar Evento'}
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            Próximo
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

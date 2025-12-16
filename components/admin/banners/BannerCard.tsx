/**
 * BannerCard Component
 * 
 * Displays a single banner with actions and status information
 */

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Edit, Trash2, Eye, EyeOff, ExternalLink, Clock, Copy } from 'lucide-react'
import { BannerCardProps } from '../../../types/banner'
import { getBannerScheduleStatus, getTimeRemaining } from '../../../lib/banners/utils'
import { formatDate } from '../../../lib/formatters'

const CountdownTimer: React.FC<{ banner: any }> = ({ banner }) => {
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null)
    const [targetDate, setTargetDate] = useState<Date | null>(null)
    const [countdownType, setCountdownType] = useState<'start' | 'end' | null>(null)

    useEffect(() => {
        const now = new Date()
        const dataInicio = banner.data_inicio ? new Date(banner.data_inicio) : null
        const dataFim = banner.data_fim ? new Date(banner.data_fim) : null

        if (dataInicio && now < dataInicio) {
            setTargetDate(dataInicio)
            setCountdownType('start')
        } else if (dataFim && now < dataFim) {
            setTargetDate(dataFim)
            setCountdownType('end')
        } else {
            setTargetDate(null)
            setCountdownType(null)
        }
    }, [banner.data_inicio, banner.data_fim])

    useEffect(() => {
        if (!targetDate) {
            setTimeRemaining(null)
            return
        }

        const updateTimer = () => {
            const remaining = getTimeRemaining(targetDate)
            setTimeRemaining(remaining)
        }

        updateTimer()
        const interval = setInterval(updateTimer, 60000)

        return () => clearInterval(interval)
    }, [targetDate])

    if (!timeRemaining || !countdownType) return null

    return (
        <div className={`text-xs px-2 py-1 rounded-full ${countdownType === 'start'
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-orange-50 text-orange-700 border border-orange-200'
            }`}>
            <Clock className="h-3 w-3 inline mr-1" />
            {countdownType === 'start' ? 'Inicia em' : 'Expira em'} {timeRemaining}
        </div>
    )
}

export const BannerCard: React.FC<BannerCardProps> = ({
    banner,
    onEdit,
    onDelete,
    onToggleStatus,
    onDuplicate,
    isDeleting = false,
    isToggling = false
}) => {
    const [imageError, setImageError] = useState(false)
    const scheduleStatus = getBannerScheduleStatus(banner)
    const Icon = scheduleStatus.icon

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {banner.nome}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {banner.posicao}
                    </p>
                </div>

                {/* Status Badge */}
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${scheduleStatus.color}`}>
                    <Icon className="h-3 w-3" />
                    <span>{scheduleStatus.label}</span>
                </div>
            </div>

            {/* Banner Preview */}
            <div className="relative w-full mb-3 rounded-lg overflow-hidden bg-gray-100"
                style={{ aspectRatio: `${banner.largura}/${banner.altura}` }}>
                {!imageError && banner.imagem ? (
                    <Image
                        src={banner.imagem}
                        alt={banner.nome}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 300px"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <svg className="w-8 h-8 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-xs">Sem imagem</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Dimensões:</span>
                    <span className="font-medium">{banner.largura}x{banner.altura}px</span>
                </div>

                {banner.stats && (
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500">Performance:</span>
                        <span className="font-medium">
                            {banner.stats.impressoes} views • {banner.stats.cliques} clicks
                            {banner.stats.ctr > 0 && ` • ${banner.stats.ctr.toFixed(2)}% CTR`}
                        </span>
                    </div>
                )}

                {(banner.data_inicio || banner.data_fim) && (
                    <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                        {banner.data_inicio && (
                            <div>Início: {formatDate(banner.data_inicio)}</div>
                        )}
                        {banner.data_fim && (
                            <div>Fim: {formatDate(banner.data_fim)}</div>
                        )}
                    </div>
                )}
            </div>

            {/* Countdown Timer */}
            <div className="mb-3">
                <CountdownTimer banner={banner} />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onEdit(banner)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                    <Edit className="h-3.5 w-3.5" />
                    <span>Editar</span>
                </button>

                {onDuplicate && (
                    <button
                        onClick={() => onDuplicate(banner)}
                        className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors"
                        title="Duplicar banner"
                    >
                        <Copy className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Duplicar</span>
                    </button>
                )}

                <button
                    onClick={() => onToggleStatus(banner.id, banner.ativo)}
                    disabled={isToggling}
                    className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${banner.ativo
                        ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                        : 'text-green-600 bg-green-50 hover:bg-green-100'
                        } ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {banner.ativo ? (
                        <>
                            <EyeOff className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Desativar</span>
                        </>
                    ) : (
                        <>
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Ativar</span>
                        </>
                    )}
                </button>

                {banner.link && (
                    <a
                        href={banner.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                        title="Abrir link"
                    >
                        <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                )}

                <button
                    onClick={() => {
                        if (confirm(`Tem certeza que deseja excluir o banner "${banner.nome}"?`)) {
                            onDelete(banner.id)
                        }
                    }}
                    disabled={isDeleting}
                    className={`flex items-center justify-center px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    title="Excluir"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

export default BannerCard

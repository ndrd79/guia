/**
 * BannerFilters Component
 * 
 * Filtros avançados para lista de banners
 */

import React, { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { BannerFiltersProps } from '../../../types/banner'

export const BannerFilters: React.FC<BannerFiltersProps> = ({
    filters,
    onFilterChange,
    onClearFilters,
    availablePositions,
    hasActiveFilters
}) => {
    // Estado para evitar hydration mismatch - só mostra badge após montar no cliente
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
                    {mounted && hasActiveFilters && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            Ativos
                        </span>
                    )}
                </div>
                {mounted && hasActiveFilters && (
                    <button
                        onClick={onClearFilters}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                        <X className="h-4 w-4" />
                        <span>Limpar filtros</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Buscar
                    </label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            value={filters.search}
                            onChange={(e) => onFilterChange('search', e.target.value)}
                            placeholder="Nome do banner..."
                            className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status
                    </label>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange('status', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </div>

                {/* Position */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Posição
                    </label>
                    <select
                        value={filters.position}
                        onChange={(e) => onFilterChange('position', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Todas</option>
                        {availablePositions.map((position) => (
                            <option key={position} value={position}>
                                {position}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Schedule Status */}
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        Agendamento
                    </label>
                    <select
                        value={filters.schedule}
                        onChange={(e) => onFilterChange('schedule', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">Todos</option>
                        <option value="active">Ativos agora</option>
                        <option value="scheduled">Agendados</option>
                        <option value="expired">Expirados</option>
                        <option value="inactive">Inativos</option>
                    </select>
                </div>
            </div>

            {/* Period Filter (secondary row) */}
            <div className="mt-3 pt-3 border-t border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-2">
                    Criado em
                </label>
                <div className="flex gap-2">
                    <button
                        onClick={() => onFilterChange('period', 'all')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.period === 'all'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => onFilterChange('period', 'week')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.period === 'week'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Última semana
                    </button>
                    <button
                        onClick={() => onFilterChange('period', 'month')}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filters.period === 'month'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        Último mês
                    </button>
                </div>
            </div>
        </div>
    )
}

export default BannerFilters

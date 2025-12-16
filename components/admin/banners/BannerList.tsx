/**
 * BannerList Component
 * 
 * Displays a grid of banner cards with loading and empty states
 */

import React from 'react'
import { BannerListProps } from '../../../types/banner'
import BannerCard from './BannerCard'

export const BannerList: React.FC<BannerListProps> = ({
    banners,
    loading = false,
    onEdit,
    onDelete,
    onToggleStatus,
    onDuplicate,
    deletingId = null,
    togglingId = null
}) => {
    // Loading state
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                        <div className="h-32 bg-gray-200 rounded mb-3"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    // Empty state
    if (banners.length === 0) {
        return (
            <div className="text-center py-12">
                <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum banner encontrado</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Comece criando um novo banner ou ajuste os filtros.
                </p>
            </div>
        )
    }

    // Banner grid
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {banners.map((banner) => (
                <BannerCard
                    key={banner.id}
                    banner={banner}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onToggleStatus={onToggleStatus}
                    onDuplicate={onDuplicate}
                    isDeleting={deletingId === banner.id}
                    isToggling={togglingId === banner.id}
                />
            ))}
        </div>
    )
}

export default BannerList

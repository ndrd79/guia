import React from 'react'
import { PlanType } from '../lib/supabase'

interface PlanBadgeProps {
  planType: PlanType
  expiresAt?: string
  size?: 'sm' | 'md' | 'lg'
  showExpiration?: boolean
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ 
  planType, 
  expiresAt, 
  size = 'md',
  showExpiration = false 
}) => {
  const isPremium = planType === 'premium'
  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
  
  // Determinar o status do plano
  const getStatus = () => {
    if (isPremium && isExpired) return 'expired'
    if (isPremium && !isExpired) return 'premium'
    return 'basic'
  }
  
  const status = getStatus()
  
  // Configurações de estilo baseadas no tamanho
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }
  
  // Configurações de estilo baseadas no status
  const statusClasses = {
    premium: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg',
    basic: 'bg-gray-100 text-gray-700 border border-gray-300',
    expired: 'bg-red-100 text-red-700 border border-red-300'
  }
  
  // Ícones para cada tipo
  const getIcon = () => {
    switch (status) {
      case 'premium':
        return '👑'
      case 'basic':
        return '📋'
      case 'expired':
        return '⏰'
      default:
        return '📋'
    }
  }
  
  // Texto do badge
  const getText = () => {
    switch (status) {
      case 'premium':
        return 'Premium'
      case 'basic':
        return 'Básico'
      case 'expired':
        return 'Expirado'
      default:
        return 'Básico'
    }
  }
  
  // Formatação da data de expiração
  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }
  
  // Calcular dias restantes
  const getDaysRemaining = () => {
    if (!expiresAt || !isPremium) return null
    
    const now = new Date()
    const expiration = new Date(expiresAt)
    const diffTime = expiration.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays
  }
  
  const daysRemaining = getDaysRemaining()
  
  return (
    <div className="inline-flex flex-col items-start">
      <span 
        className={`
          inline-flex items-center gap-1 rounded-full font-medium
          ${sizeClasses[size]} 
          ${statusClasses[status]}
          transition-all duration-200 hover:scale-105
        `}
        title={
          status === 'premium' && expiresAt 
            ? `Plano Premium - Expira em ${formatExpirationDate(expiresAt)}`
            : status === 'expired' && expiresAt
            ? `Plano expirado em ${formatExpirationDate(expiresAt)}`
            : 'Plano Básico - Listagem por categoria'
        }
      >
        <span className="text-xs">{getIcon()}</span>
        {getText()}
      </span>
      
      {/* Informações de expiração */}
      {showExpiration && isPremium && expiresAt && (
        <div className="mt-1">
          {isExpired ? (
            <span className="text-xs text-red-600 font-medium">
              Expirou em {formatExpirationDate(expiresAt)}
            </span>
          ) : (
            <span className="text-xs text-gray-600">
              {daysRemaining !== null && daysRemaining <= 7 ? (
                <span className="text-orange-600 font-medium">
                  {daysRemaining === 0 
                    ? 'Expira hoje!' 
                    : daysRemaining === 1 
                    ? 'Expira amanhã!' 
                    : `${daysRemaining} dias restantes`
                  }
                </span>
              ) : (
                `Expira em ${formatExpirationDate(expiresAt)}`
              )}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default PlanBadge
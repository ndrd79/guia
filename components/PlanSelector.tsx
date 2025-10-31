import React, { useState, useEffect } from 'react'
import { PlanType } from '../lib/supabase'

interface PlanSelectorProps {
  value: PlanType
  onChange: (planType: PlanType) => void
  expirationDate?: string
  onExpirationChange?: (date: string) => void
  disabled?: boolean
  error?: string
  expirationError?: string
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  value,
  onChange,
  expirationDate,
  onExpirationChange,
  disabled = false,
  error,
  expirationError
}) => {
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(value)
  const [showExpirationField, setShowExpirationField] = useState(value === 'premium')

  useEffect(() => {
    setSelectedPlan(value)
    setShowExpirationField(value === 'premium')
  }, [value])

  const handlePlanChange = (planType: PlanType) => {
    setSelectedPlan(planType)
    setShowExpirationField(planType === 'premium')
    onChange(planType)
    
    // Se mudou para básico, limpar a data de expiração
    if (planType === 'basic' && onExpirationChange) {
      onExpirationChange('')
    }
  }

  const handleExpirationChange = (date: string) => {
    if (onExpirationChange) {
      onExpirationChange(date)
    }
  }

  // Gerar data mínima (hoje + 1 dia)
  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().slice(0, 16)
  }

  // Gerar data padrão (hoje + 30 dias)
  const getDefaultDate = () => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30)
    return defaultDate.toISOString().slice(0, 16)
  }

  return (
    <div className="space-y-4">
      {/* Seletor de Tipo de Plano */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Plano *
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Plano Básico */}
          <div 
            className={`
              relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
              ${selectedPlan === 'basic' 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !disabled && handlePlanChange('basic')}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="planType"
                value="basic"
                checked={selectedPlan === 'basic'}
                onChange={() => handlePlanChange('basic')}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📋</span>
                  <h3 className="text-lg font-semibold text-gray-900">Básico</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Listagem por Categoria
                </p>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>• Aparece na listagem da categoria</li>
                  <li>• Compartilhado com outras empresas</li>
                  <li>• Informações básicas</li>
                  <li>• Gratuito</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Plano Premium */}
          <div 
            className={`
              relative border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
              ${selectedPlan === 'premium' 
                ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-yellow-100' 
                : 'border-gray-200 hover:border-gray-300'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !disabled && handlePlanChange('premium')}
          >
            <div className="flex items-start space-x-3">
              <input
                type="radio"
                name="planType"
                value="premium"
                checked={selectedPlan === 'premium'}
                onChange={() => handlePlanChange('premium')}
                disabled={disabled}
                className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">👑</span>
                  <h3 className="text-lg font-semibold text-gray-900">Premium</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Página Individual Dedicada
                </p>
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  <li>• Página própria com URL única</li>
                  <li>• Destaque na listagem</li>
                  <li>• Informações completas</li>
                  <li>• Galeria de imagens</li>
                </ul>
              </div>
            </div>
            
            {selectedPlan === 'premium' && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Recomendado
                </span>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Campo de Data de Expiração (apenas para Premium) */}
      {showExpirationField && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Data de Expiração do Plano Premium *
          </label>
          <input
            type="datetime-local"
            value={expirationDate || ''}
            onChange={(e) => handleExpirationChange(e.target.value)}
            min={getMinDate()}
            disabled={disabled}
            placeholder={getDefaultDate()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
          {expirationError && (
            <p className="text-red-500 text-sm mt-1">{expirationError}</p>
          )}
          <p className="text-xs text-gray-600 mt-2">
            ⚠️ Defina quando o plano premium expira. Após a expiração, a empresa volta automaticamente para o plano básico.
          </p>
          
          {/* Botões de atalho para datas comuns */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button
              type="button"
              onClick={() => {
                const date = new Date()
                date.setDate(date.getDate() + 30)
                handleExpirationChange(date.toISOString().slice(0, 16))
              }}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
            >
              +30 dias
            </button>
            <button
              type="button"
              onClick={() => {
                const date = new Date()
                date.setDate(date.getDate() + 90)
                handleExpirationChange(date.toISOString().slice(0, 16))
              }}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
            >
              +3 meses
            </button>
            <button
              type="button"
              onClick={() => {
                const date = new Date()
                date.setFullYear(date.getFullYear() + 1)
                handleExpirationChange(date.toISOString().slice(0, 16))
              }}
              disabled={disabled}
              className="px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
            >
              +1 ano
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PlanSelector
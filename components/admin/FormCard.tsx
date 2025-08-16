import { ReactNode } from 'react'

interface FormCardProps {
  title: string
  children: ReactNode
  onSubmit?: () => void
  isLoading?: boolean
  submitText?: string
  onCancel?: () => void
}

export default function FormCard({ 
  title, 
  children, 
  onSubmit, 
  isLoading = false, 
  submitText = 'Salvar', 
  onCancel 
}: FormCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        <form onSubmit={onSubmit}>
          {children}
          
          <div className="flex justify-end space-x-3 mt-6">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Salvando...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
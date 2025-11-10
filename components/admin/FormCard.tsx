import { ReactNode, FormEvent } from 'react'

interface FormCardProps {
  title: string
  children: ReactNode
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  isLoading?: boolean
  submitText?: string
  onCancel?: () => void
  showForm?: boolean // Nova prop para controlar se deve renderizar o form
}

export default function FormCard({ 
  title, 
  children, 
  onSubmit, 
  isLoading = false, 
  submitText = 'Salvar', 
  onCancel,
  showForm = true // Por padrão, mantém o comportamento atual
}: FormCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md w-full max-w-none">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {showForm ? (
          <form onSubmit={onSubmit} noValidate className="w-full">
            <div className="w-full">
              {children}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
              {onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
              >
                {isLoading ? 'Salvando...' : submitText}
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full">
            {children}
          </div>
        )}
      </div>
    </div>
  )
}
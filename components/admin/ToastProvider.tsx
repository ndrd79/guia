import { createContext, useContext, ReactNode } from 'react'
import toast, { Toaster, ToastOptions } from 'react-hot-toast'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

interface ToastContextType {
  success: (message: string, options?: ToastOptions) => void
  error: (message: string, options?: ToastOptions) => void
  info: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const success = (message: string, options?: ToastOptions) => {
    toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <CheckCircle size={20} />,
      ...options,
    })
  }

  const error = (message: string, options?: ToastOptions) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <AlertCircle size={20} />,
      ...options,
    })
  }

  const info = (message: string, options?: ToastOptions) => {
    toast(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#3B82F6',
        color: 'white',
        padding: '16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
      },
      icon: <Info size={20} />,
      ...options,
    })
  }

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            maxWidth: '400px',
          },
        }}
        containerStyle={{
          top: 20,
          right: 20,
        }}
      />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Add a showToast function that matches the expected interface
export function useToastActions() {
  const { success, error, info } = useToast()
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    switch (type) {
      case 'success':
        success(message)
        break
      case 'error':
        error(message)
        break
      case 'info':
        info(message)
        break
    }
  }
  
  return { showToast, success, error, info }
}

export default ToastProvider
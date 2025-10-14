import { LucideIcon } from 'lucide-react'

interface EnhancedButtonProps {
  onClick: () => void
  icon?: LucideIcon
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  disabled?: boolean
  className?: string
}

export default function EnhancedButton({ 
  onClick, 
  icon: Icon, 
  children, 
  variant = 'primary',
  disabled = false,
  className = ''
}: EnhancedButtonProps) {
  const baseClasses = "inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
  
  const variantClasses = {
    primary: "border-transparent text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500"
  }

  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : ""

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {children}
    </button>
  )
}
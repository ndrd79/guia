import { CheckCircle, Clock } from 'lucide-react'

interface StatusIndicatorProps {
  isPublished: boolean
  onClick?: () => void
  className?: string
}

export default function StatusIndicator({ 
  isPublished, 
  onClick, 
  className = "" 
}: StatusIndicatorProps) {
  const baseClasses = "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full transition-colors duration-200"
  const clickableClasses = onClick ? "cursor-pointer hover:opacity-80" : ""
  
  if (isPublished) {
    return (
      <span 
        className={`${baseClasses} ${clickableClasses} bg-green-100 text-green-800 ${className}`}
        onClick={onClick}
        title={onClick ? "Clique para alterar status" : "Publicado"}
      >
        <CheckCircle className="h-3 w-3 mr-1" />
        Publicado
      </span>
    )
  }

  return (
    <span 
      className={`${baseClasses} ${clickableClasses} bg-yellow-100 text-yellow-800 ${className}`}
      onClick={onClick}
      title={onClick ? "Clique para alterar status" : "Rascunho"}
    >
      <Clock className="h-3 w-3 mr-1" />
      Rascunho
    </span>
  )
}
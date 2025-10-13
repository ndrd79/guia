import React from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <Loader2 
      className={`animate-spin ${sizeClasses[size]} ${className}`} 
    />
  )
}

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4' 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded ${width} ${height} ${className}`}
    />
  )
}

export const MetricCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton width="w-20" height="h-4" />
          <Skeleton width="w-16" height="h-8" />
        </div>
        <Skeleton width="w-8" height="h-8" className="rounded-full" />
      </div>
    </div>
  )
}

export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-80' }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${height}`}>
      <div className="space-y-4">
        <Skeleton width="w-32" height="h-6" />
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-end space-x-2">
              <Skeleton 
                width="w-12" 
                height={`h-${Math.floor(Math.random() * 20) + 10}`} 
              />
              <Skeleton 
                width="w-12" 
                height={`h-${Math.floor(Math.random() * 20) + 10}`} 
              />
              <Skeleton 
                width="w-12" 
                height={`h-${Math.floor(Math.random() * 20) + 10}`} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <Skeleton width="w-32" height="h-6" />
      </div>
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center space-x-4">
            <Skeleton width="w-8" height="h-8" className="rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton width="w-3/4" height="h-4" />
              <Skeleton width="w-1/2" height="h-3" />
            </div>
            <Skeleton width="w-16" height="h-4" />
            <Skeleton width="w-12" height="h-4" />
          </div>
        ))}
      </div>
    </div>
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  message?: string
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isLoading, 
  children, 
  message = 'Carregando...' 
}) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <LoadingSpinner size="lg" />
            <span className="text-sm text-gray-600">{message}</span>
          </div>
        </div>
      )}
    </div>
  )
}

interface ProgressBarProps {
  progress: number
  className?: string
  showPercentage?: boolean
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ 
  progress, 
  className = '', 
  showPercentage = true 
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100)

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
      {showPercentage && (
        <div className="text-xs text-gray-600 text-right">
          {clampedProgress.toFixed(0)}%
        </div>
      )}
    </div>
  )
}

export const PulsingDot: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
    </div>
  )
}

interface LazyLoadProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
}

export const LazyLoad: React.FC<LazyLoadProps> = ({ 
  children, 
  fallback = <LoadingSpinner />, 
  threshold = 0.1 
}) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div ref={ref}>
      {isVisible ? children : fallback}
    </div>
  )
}
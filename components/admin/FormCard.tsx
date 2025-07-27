import { ReactNode } from 'react'

interface FormCardProps {
  title: string
  children: ReactNode
  onSubmit?: () => void
}

export default function FormCard({ title, children, onSubmit }: FormCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
import React, { useState } from 'react'
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react'

export type ExportFormat = 'csv' | 'excel' | 'pdf'

interface ExportButtonProps {
  data: any[]
  filename?: string
  onExport?: (format: ExportFormat, data: any[]) => Promise<void>
  className?: string
  disabled?: boolean
}

const exportFormats = [
  {
    value: 'csv' as ExportFormat,
    label: 'CSV',
    icon: FileText,
    description: 'Arquivo de valores separados por vírgula'
  },
  {
    value: 'excel' as ExportFormat,
    label: 'Excel',
    icon: FileSpreadsheet,
    description: 'Planilha do Microsoft Excel'
  },
  {
    value: 'pdf' as ExportFormat,
    label: 'PDF',
    icon: FileText,
    description: 'Documento PDF'
  }
]

const downloadCSV = (data: any[], filename: string) => {
  if (!data.length) return

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadExcel = async (data: any[], filename: string) => {
  // For Excel export, we'll use a simple CSV with .xlsx extension
  // In a real implementation, you might want to use a library like xlsx
  const headers = Object.keys(data[0] || {})
  const csvContent = [
    headers.join('\t'), // Use tabs for better Excel compatibility
    ...data.map(row => 
      headers.map(header => row[header] || '').join('\t')
    )
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.xlsx`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const downloadPDF = async (data: any[], filename: string) => {
  // For PDF export, we'll create a simple HTML table and print it
  // In a real implementation, you might want to use a library like jsPDF
  const headers = Object.keys(data[0] || {})
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        h1 { color: #333; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <h1>Relatório de Analytics - ${filename}</h1>
      <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>
      <table>
        <thead>
          <tr>
            ${headers.map(header => `<th>${header}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${data.map(row => `
            <tr>
              ${headers.map(header => `<td>${row[header] || ''}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  data,
  filename = 'analytics-export',
  onExport,
  className = '',
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState<ExportFormat | null>(null)

  const handleExport = async (format: ExportFormat) => {
    if (disabled || !data.length) return

    setLoading(format)
    
    try {
      if (onExport) {
        await onExport(format, data)
      } else {
        // Default export handlers
        switch (format) {
          case 'csv':
            downloadCSV(data, filename)
            break
          case 'excel':
            await downloadExcel(data, filename)
            break
          case 'pdf':
            await downloadPDF(data, filename)
            break
        }
      }
    } catch (error) {
      console.error('Erro ao exportar dados:', error)
    } finally {
      setLoading(null)
      setIsOpen(false)
    }
  }

  if (!data.length) {
    return (
      <button
        disabled
        className={`inline-flex items-center px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed ${className}`}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </button>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <Download className="h-4 w-4 mr-2" />
        Exportar
      </button>

      {isOpen && (
        <div className="absolute right-0 z-10 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="py-1">
            {exportFormats.map((format) => {
              const Icon = format.icon
              const isLoading = loading === format.value
              
              return (
                <button
                  key={format.value}
                  onClick={() => handleExport(format.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 disabled:opacity-50"
                >
                  <div className="flex items-center">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 mr-3 animate-spin text-orange-600" />
                    ) : (
                      <Icon className="h-4 w-4 mr-3 text-gray-400" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {format.label}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}

export default ExportButton
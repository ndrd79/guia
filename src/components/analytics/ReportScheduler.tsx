import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Clock, 
  Mail, 
  FileText, 
  Settings,
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  CheckCircle
} from 'lucide-react'

interface ScheduledReport {
  id: string
  name: string
  type: 'daily' | 'weekly' | 'monthly'
  format: 'csv' | 'excel' | 'pdf'
  recipients: string[]
  filters: {
    banners: string[]
    positions: string[]
    dateRange: string
  }
  nextRun: Date
  lastRun?: Date
  active: boolean
  created: Date
}

interface ReportSchedulerProps {
  banners: any[]
  onScheduleReport?: (report: Omit<ScheduledReport, 'id' | 'created'>) => void
}

export const ReportScheduler: React.FC<ReportSchedulerProps> = ({ 
  banners, 
  onScheduleReport 
}) => {
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingReport, setEditingReport] = useState<ScheduledReport | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'weekly' as 'daily' | 'weekly' | 'monthly',
    format: 'excel' as 'csv' | 'excel' | 'pdf',
    recipients: [''],
    filters: {
      banners: ['all'],
      positions: ['all'],
      dateRange: 'last-30-days'
    },
    active: true
  })

  // Simular dados de relatórios agendados
  useEffect(() => {
    const mockReports: ScheduledReport[] = [
      {
        id: '1',
        name: 'Relatório Semanal de Performance',
        type: 'weekly',
        format: 'excel',
        recipients: ['admin@empresa.com', 'marketing@empresa.com'],
        filters: {
          banners: ['all'],
          positions: ['all'],
          dateRange: 'last-7-days'
        },
        nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        active: true,
        created: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        id: '2',
        name: 'Relatório Mensal de ROI',
        type: 'monthly',
        format: 'pdf',
        recipients: ['diretor@empresa.com'],
        filters: {
          banners: ['all'],
          positions: ['all'],
          dateRange: 'last-30-days'
        },
        nextRun: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        lastRun: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        active: true,
        created: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
      }
    ]
    setScheduledReports(mockReports)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const newReport: Omit<ScheduledReport, 'id' | 'created'> = {
      ...formData,
      recipients: formData.recipients.filter(email => email.trim() !== ''),
      nextRun: calculateNextRun(formData.type),
      lastRun: undefined
    }

    if (editingReport) {
      setScheduledReports(prev => 
        prev.map(report => 
          report.id === editingReport.id 
            ? { ...report, ...newReport }
            : report
        )
      )
      setEditingReport(null)
    } else {
      const report: ScheduledReport = {
        ...newReport,
        id: Date.now().toString(),
        created: new Date()
      }
      setScheduledReports(prev => [...prev, report])
    }

    if (onScheduleReport) {
      onScheduleReport(newReport)
    }

    resetForm()
    setShowForm(false)
  }

  const calculateNextRun = (type: 'daily' | 'weekly' | 'monthly'): Date => {
    const now = new Date()
    switch (type) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      case 'monthly':
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'weekly',
      format: 'excel',
      recipients: [''],
      filters: {
        banners: ['all'],
        positions: ['all'],
        dateRange: 'last-30-days'
      },
      active: true
    })
  }

  const handleEdit = (report: ScheduledReport) => {
    setFormData({
      name: report.name,
      type: report.type,
      format: report.format,
      recipients: report.recipients,
      filters: report.filters,
      active: report.active
    })
    setEditingReport(report)
    setShowForm(true)
  }

  const handleDelete = (id: string) => {
    setScheduledReports(prev => prev.filter(report => report.id !== id))
  }

  const handleToggleActive = (id: string) => {
    setScheduledReports(prev => 
      prev.map(report => 
        report.id === id 
          ? { ...report, active: !report.active }
          : report
      )
    )
  }

  const addRecipient = () => {
    setFormData(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }))
  }

  const updateRecipient = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.map((email, i) => i === index ? value : email)
    }))
  }

  const removeRecipient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }))
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'daily': return 'Diário'
      case 'weekly': return 'Semanal'
      case 'monthly': return 'Mensal'
      default: return type
    }
  }

  const getFormatLabel = (format: string) => {
    switch (format) {
      case 'csv': return 'CSV'
      case 'excel': return 'Excel'
      case 'pdf': return 'PDF'
      default: return format
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Agendamento de Relatórios
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Configure relatórios automáticos para serem enviados por email
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Novo Relatório
        </button>
      </div>

      {/* Lista de relatórios agendados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Relatórios Agendados ({scheduledReports.length})
          </h4>
          
          {scheduledReports.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum relatório agendado</p>
              <p className="text-sm">Clique em "Novo Relatório" para começar</p>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledReports.map((report) => (
                <div key={report.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h5 className="font-medium text-gray-900">{report.name}</h5>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          report.active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{getTypeLabel(report.type)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          <span>{getFormatLabel(report.format)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{report.recipients.length} destinatário(s)</span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm text-gray-600">
                        <div>
                          <strong>Próxima execução:</strong> {report.nextRun.toLocaleDateString('pt-BR')} às {report.nextRun.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {report.lastRun && (
                          <div>
                            <strong>Última execução:</strong> {report.lastRun.toLocaleDateString('pt-BR')} às {report.lastRun.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleToggleActive(report.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          report.active
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={report.active ? 'Pausar' : 'Ativar'}
                      >
                        {report.active ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleEdit(report)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(report.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Formulário de criação/edição */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingReport ? 'Editar Relatório' : 'Novo Relatório Agendado'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingReport(null)
                    resetForm()
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Nome do relatório */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Relatório
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Ex: Relatório Semanal de Performance"
                    required
                  />
                </div>

                {/* Frequência e formato */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequência
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formato
                    </label>
                    <select
                      value={formData.format}
                      onChange={(e) => setFormData(prev => ({ ...prev, format: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="csv">CSV</option>
                      <option value="pdf">PDF</option>
                    </select>
                  </div>
                </div>

                {/* Destinatários */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Destinatários de Email
                  </label>
                  <div className="space-y-2">
                    {formData.recipients.map((email, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => updateRecipient(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="email@exemplo.com"
                          required
                        />
                        {formData.recipients.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRecipient(index)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addRecipient}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar destinatário
                    </button>
                  </div>
                </div>

                {/* Filtros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período dos Dados
                  </label>
                  <select
                    value={formData.filters.dateRange}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      filters: { ...prev.filters, dateRange: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="last-7-days">Últimos 7 dias</option>
                    <option value="last-30-days">Últimos 30 dias</option>
                    <option value="last-90-days">Últimos 90 dias</option>
                    <option value="current-month">Mês atual</option>
                    <option value="previous-month">Mês anterior</option>
                  </select>
                </div>

                {/* Status ativo */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                    Ativar relatório imediatamente
                  </label>
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingReport(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingReport ? 'Salvar Alterações' : 'Criar Relatório'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useEffect } from 'react'
import AdminLayout from '../../components/admin/AdminLayout'
import { supabase } from '../../lib/supabase'
import { Plus, Edit, Trash2, Save, X, Eye, Palette } from 'lucide-react'
import { useToastActions } from '../../components/admin/ToastProvider'

interface SeasonalTheme {
  id?: string
  name: string
  description: string
  decoration_type: string
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  start_date: string
  end_date: string
  is_active: boolean
  created_at?: string
}

// Templates pré-definidos
const themeTemplates = {
  'dia_dos_pais': {
    name: 'Dia dos Pais',
    description: 'Tema especial para o Dia dos Pais',
    decoration_type: 'stars',
    primary_color: '#1E3A8A', // Azul escuro
    secondary_color: '#3B82F6', // Azul médio
    accent_color: '#FCD34D', // Dourado
    background_color: '#F8FAFC',
    text_color: '#1F2937'
  },
  'dia_das_maes': {
    name: 'Dia das Mães',
    description: 'Tema carinhoso para o Dia das Mães',
    decoration_type: 'hearts',
    primary_color: '#BE185D', // Rosa escuro
    secondary_color: '#EC4899', // Rosa médio
    accent_color: '#FDE68A', // Amarelo suave
    background_color: '#FDF2F8',
    text_color: '#1F2937'
  },
  'natal': {
    name: 'Natal',
    description: 'Tema festivo de Natal',
    decoration_type: 'snowflakes',
    primary_color: '#DC2626', // Vermelho
    secondary_color: '#059669', // Verde
    accent_color: '#FCD34D', // Dourado
    background_color: '#FEF7F0',
    text_color: '#1F2937'
  },
  'halloween': {
    name: 'Halloween',
    description: 'Tema assombrado de Halloween',
    decoration_type: 'bats',
    primary_color: '#EA580C', // Laranja
    secondary_color: '#1F2937', // Preto
    accent_color: '#7C2D12', // Marrom escuro
    background_color: '#1C1917',
    text_color: '#F97316'
  },
  'dia_dos_namorados': {
    name: 'Dia dos Namorados',
    description: 'Tema romântico para o Dia dos Namorados',
    decoration_type: 'hearts',
    primary_color: '#BE123C', // Vermelho romântico
    secondary_color: '#F472B6', // Rosa claro
    accent_color: '#FDE68A', // Dourado suave
    background_color: '#FDF2F8',
    text_color: '#1F2937'
  },
  'pascoa': {
    name: 'Páscoa',
    description: 'Tema alegre de Páscoa',
    decoration_type: 'flowers',
    primary_color: '#7C3AED', // Roxo
    secondary_color: '#10B981', // Verde
    accent_color: '#FCD34D', // Amarelo
    background_color: '#F0FDF4',
    text_color: '#1F2937'
  },
  'ano_novo': {
    name: 'Ano Novo',
    description: 'Tema festivo de Ano Novo',
    decoration_type: 'stars',
    primary_color: '#1E40AF', // Azul escuro
    secondary_color: '#FCD34D', // Dourado
    accent_color: '#DC2626', // Vermelho
    background_color: '#1E1B4B',
    text_color: '#FCD34D'
  },
  'festa_junina': {
    name: 'Festa Junina',
    description: 'Tema caipira para Festa Junina',
    decoration_type: 'stars',
    primary_color: '#DC2626', // Vermelho
    secondary_color: '#FCD34D', // Amarelo
    accent_color: '#059669', // Verde
    background_color: '#FEF3C7',
    text_color: '#1F2937'
  }
}

const initialTheme: SeasonalTheme = {
  name: '',
  description: '',
  decoration_type: 'none',
  primary_color: '#3B82F6',
  secondary_color: '#10B981',
  accent_color: '#F59E0B',
  background_color: '#FFFFFF',
  text_color: '#1F2937',
  start_date: '',
  end_date: '',
  is_active: false
}

export default function TemasSeasonais() {
  const { success, error: showError } = useToastActions()
  const [themes, setThemes] = useState<SeasonalTheme[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTheme, setEditingTheme] = useState<SeasonalTheme | null>(null)
  const [formData, setFormData] = useState<SeasonalTheme>(initialTheme)
  const [saving, setSaving] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)

  useEffect(() => {
    fetchThemes()
  }, [])

  const fetchThemes = async () => {
    try {
      const { data, error } = await supabase
        .from('seasonal_themes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setThemes(data || [])
    } catch (error) {
      console.error('Erro ao buscar temas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showError('Nome é obrigatório')
      return
    }

    setSaving(true)
    try {
      // Preparar dados para salvar
      const dataToSave = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        decoration_type: formData.decoration_type || 'none',
        primary_color: formData.primary_color,
        secondary_color: formData.secondary_color,
        accent_color: formData.accent_color,
        background_color: formData.background_color,
        text_color: formData.text_color,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active
      }

      console.log('Dados a serem salvos:', dataToSave) // Para debug

      if (editingTheme) {
        const { data, error } = await supabase
          .from('seasonal_themes')
          .update(dataToSave)
          .eq('id', editingTheme.id)
          .select()

        if (error) {
          console.error('Erro detalhado:', error)
          throw error
        }
        console.log('Tema atualizado:', data)
      } else {
        const { data, error } = await supabase
          .from('seasonal_themes')
          .insert([dataToSave])
          .select()

        if (error) {
          console.error('Erro detalhado:', error)
          throw error
        }
        console.log('Tema criado:', data)
      }

      await fetchThemes()
      handleCancel()
      success('Tema salvo com sucesso!')
    } catch (error: any) {
      console.error('Erro ao salvar tema:', error)
      
      // Mostrar erro mais específico
      if (error.message) {
        showError(`Erro ao salvar tema: ${error.message}`)
      } else {
        showError('Erro desconhecido ao salvar tema. Verifique o console para mais detalhes.')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (theme: SeasonalTheme) => {
    setEditingTheme(theme)
    setFormData(theme)
    setIsCreating(false)
    setShowTemplates(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este tema?')) return

    try {
      const { error } = await supabase
        .from('seasonal_themes')
        .delete()
        .eq('id', id)

      if (error) throw error
      await fetchThemes()
    } catch (error) {
      console.error('Erro ao excluir tema:', error)
      showError('Erro ao excluir tema')
    }
  }

  const handleToggleActive = async (theme: SeasonalTheme) => {
    try {
      // Se estamos ativando um tema, desativar todos os outros primeiro
      if (!theme.is_active) {
        await supabase
          .from('seasonal_themes')
          .update({ is_active: false })
          .neq('id', theme.id)
      }

      const { error } = await supabase
        .from('seasonal_themes')
        .update({ is_active: !theme.is_active })
        .eq('id', theme.id)

      if (error) throw error
      await fetchThemes()
    } catch (error) {
      console.error('Erro ao alterar status do tema:', error)
      showError('Erro ao alterar status do tema')
    }
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingTheme(null)
    setFormData(initialTheme)
    setShowTemplates(false)
  }

  const handleCreate = () => {
    setIsCreating(true)
    setEditingTheme(null)
    setFormData(initialTheme)
    setShowTemplates(true)
  }

  const handleSelectTemplate = (templateKey: string) => {
    const template = themeTemplates[templateKey as keyof typeof themeTemplates]
    setFormData({
      ...initialTheme,
      ...template
    })
    setShowTemplates(false)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Carregando temas...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Temas Sazonais</h1>
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Tema
          </button>
        </div>

        {/* Templates de Temas */}
        {showTemplates && (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Escolha um Template
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(themeTemplates).map(([key, template]) => (
                <div
                  key={key}
                  onClick={() => handleSelectTemplate(key)}
                  className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all"
                >
                  <h3 className="font-medium text-lg mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{template.description}</p>
                  
                  {/* Preview das cores */}
                  <div className="flex gap-2 mb-3">
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.primary_color }}
                      title="Cor Primária"
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.secondary_color }}
                      title="Cor Secundária"
                    />
                    <div
                      className="w-8 h-8 rounded border"
                      style={{ backgroundColor: template.accent_color }}
                      title="Cor de Destaque"
                    />
                  </div>
                  
                  <div className="text-xs text-gray-500">
                    Decoração: {template.decoration_type}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <button
                onClick={() => {
                  setFormData(initialTheme)
                  setShowTemplates(false)
                }}
                className="text-blue-600 hover:text-blue-800"
              >
                Ou criar tema personalizado
              </button>
            </div>
          </div>
        )}

        {/* Formulário */}
        {(isCreating || editingTheme) && !showTemplates && (
          <div className="bg-white p-6 rounded-lg shadow-md border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editingTheme ? 'Editar Tema' : 'Criar Novo Tema'}
              </h2>
              {isCreating && (
                <button
                  onClick={() => setShowTemplates(true)}
                  className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Palette className="w-4 h-4" />
                  Ver Templates
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Tema
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Natal 2024"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Descrição do tema"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Decoração
                </label>
                <select
                  value={formData.decoration_type}
                  onChange={(e) => setFormData({ ...formData, decoration_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="none">Nenhuma</option>
                  <option value="hearts">Corações ❤️</option>
                  <option value="snowflakes">Flocos de Neve ❄️</option>
                  <option value="bats">Morcegos 🦇</option>
                  <option value="stars">Estrelas ⭐</option>
                  <option value="flowers">Flores 🌸</option>
                  <option value="pumpkins">Abóboras 🎃</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Primária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.primary_color}
                    onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor Secundária
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.secondary_color}
                    onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor de Destaque
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accent_color}
                    onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Início
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Fim
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Preview das Cores */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Preview das Cores</h3>
              <div className="flex gap-4 p-4 rounded-lg" style={{ backgroundColor: formData.background_color }}>
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.primary_color }}
                >
                  P
                </div>
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.secondary_color }}
                >
                  S
                </div>
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: formData.accent_color }}
                >
                  A
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Temas */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Temas Cadastrados</h2>
            
            {themes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum tema cadastrado ainda.</p>
            ) : (
              <div className="space-y-4">
                {themes.map((theme) => (
                  <div key={theme.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{theme.name}</h3>
                          {theme.is_active && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Ativo
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{theme.description}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>Decoração: {theme.decoration_type}</span>
                          {theme.start_date && theme.end_date && (
                            <span>• {new Date(theme.start_date).toLocaleDateString()} - {new Date(theme.end_date).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        {/* Preview das cores */}
                        <div className="flex gap-1">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: theme.primary_color }}
                            title="Cor Primária"
                          />
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: theme.secondary_color }}
                            title="Cor Secundária"
                          />
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: theme.accent_color }}
                            title="Cor de Destaque"
                          />
                        </div>
                        
                        <button
                          onClick={() => handleToggleActive(theme)}
                          className={`px-3 py-1 rounded text-sm ${
                            theme.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {theme.is_active ? 'Desativar' : 'Ativar'}
                        </button>
                        
                        <button
                          onClick={() => handleEdit(theme)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(theme.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
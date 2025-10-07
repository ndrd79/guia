import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Edit, Trash2, Save, X, Users, Settings } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { createServerSupabaseClient, supabase } from '../../lib/supabase'
import { FeiraInfo, Produtor, FeiraProdutor } from '../../lib/types'

const feiraSchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  data_funcionamento: z.string().min(1, 'Data de funcionamento é obrigatória'),
  horario_funcionamento: z.string().min(1, 'Horário é obrigatório'),
  local: z.string().min(1, 'Local é obrigatório'),
  imagem_banner: z.string().optional(),
  informacoes_adicionais: z.string().optional(),
  contato: z.string().optional(),
  ativa: z.boolean()
})

const produtorSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  produtos: z.string().min(1, 'Produtos são obrigatórios'),
  descricao: z.string().optional(),
  contato: z.string().optional(),
  imagem: z.string().optional(),
  ativo: z.boolean()
})

type FeiraForm = z.infer<typeof feiraSchema>
type ProdutorForm = z.infer<typeof produtorSchema>

// Remover esta interface duplicada:
// interface FeiraProdutor {
//   feiraInfo: FeiraInfo | null
//   produtores: Produtor[]
// }

export default function FeiraProdutor({ feiraInfo, produtores }: FeiraProdutor) {
  const [activeTab, setActiveTab] = useState<'feira' | 'produtores'>('feira')
  const [produtoresList, setProdutoresList] = useState<Produtor[]>(produtores)
  const [showProdutorForm, setShowProdutorForm] = useState(false)
  const [editingProdutor, setEditingProdutor] = useState<Produtor | null>(null)
  const [loading, setLoading] = useState(false)

  // Form para informações da feira
  const feiraForm = useForm<FeiraForm>({
    resolver: zodResolver(feiraSchema),
    defaultValues: feiraInfo || {
      titulo: 'Feira do Produtor',
      descricao: '',
      data_funcionamento: 'Toda terça-feira',
      horario_funcionamento: '06:00 às 12:00',
      local: 'Praça Central - Maria Helena',
      ativa: true
    }
  })

  // Form para produtores
  const produtorForm = useForm<ProdutorForm>({
    resolver: zodResolver(produtorSchema),
    defaultValues: {
      nome: '',
      produtos: '',
      descricao: '',
      contato: '',
      imagem: '',
      ativo: true
    }
  })

  const onSubmitFeira = async (data: FeiraForm) => {
    console.log('🔍 Dados do formulário:', data)
    console.log('🔍 feiraInfo existente:', feiraInfo)
    
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }

    setLoading(true)

    try {
      if (feiraInfo) {
        // Atualizar informações existentes
        const { error } = await supabase
          .from('feira_produtor')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', feiraInfo.id)

        if (error) throw error
      } else {
        // Criar novas informações
        const { error } = await supabase
          .from('feira_produtor')
          .insert([data])

        if (error) throw error
      }

      alert('Informações da feira atualizadas com sucesso!')
      window.location.reload()
    } catch (error) {
      alert(`Erro ao salvar informações da feira: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
    }
  }

  const onSubmitProdutor = async (data: ProdutorForm) => {
    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }

    setLoading(true)

    try {
      if (editingProdutor) {
        // Atualizar produtor existente
        const { error } = await supabase
          .from('produtores_feira')
          .update({
            ...data,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingProdutor.id)

        if (error) throw error
      } else {
        // Criar novo produtor
        const { error } = await supabase
          .from('produtores_feira')
          .insert([data])

        if (error) throw error
      }

      // Recarregar lista de produtores
      const { data: produtoresData } = await supabase
        .from('produtores_feira')
        .select('*')
        .order('nome')

      if (produtoresData) {
        setProdutoresList(produtoresData)
      }

      setShowProdutorForm(false)
      setEditingProdutor(null)
      produtorForm.reset()
      alert('Produtor salvo com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar:', error)
      alert('Erro ao salvar produtor')
    } finally {
      setLoading(false)
    }
  }

  const handleEditProdutor = (produtor: Produtor) => {
    setEditingProdutor(produtor)
    produtorForm.reset(produtor)
    setShowProdutorForm(true)
  }

  const handleDeleteProdutor = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produtor?')) return

    if (!supabase) {
      alert('Sistema não está configurado')
      return
    }

    try {
      const { error } = await supabase
        .from('produtores_feira')
        .delete()
        .eq('id', id)

      if (error) throw error

      setProdutoresList(produtoresList.filter(p => p.id !== id))
      alert('Produtor excluído com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir:', error)
      alert('Erro ao excluir produtor')
    }
  }

  const handleCancelProdutor = () => {
    setShowProdutorForm(false)
    setEditingProdutor(null)
    produtorForm.reset()
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Feira do Produtor</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('feira')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'feira'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Settings className="w-4 h-4 inline mr-2" />
              Configurações
            </button>
            <button
              onClick={() => setActiveTab('produtores')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'produtores'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Produtores
            </button>
          </div>
        </div>

        {activeTab === 'feira' && (
          <form onSubmit={feiraForm.handleSubmit(onSubmitFeira)} className="space-y-4">
            <FormCard title="Informações da Feira" showForm={false}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Título
                    </label>
                    <input
                      {...feiraForm.register('titulo')}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {feiraForm.formState.errors.titulo && (
                      <p className="text-red-500 text-sm mt-1">
                        {feiraForm.formState.errors.titulo.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data de Funcionamento
                    </label>
                    <input
                      {...feiraForm.register('data_funcionamento')}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {feiraForm.formState.errors.data_funcionamento && (
                      <p className="text-red-500 text-sm mt-1">
                        {feiraForm.formState.errors.data_funcionamento.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Horário de Funcionamento
                    </label>
                    <input
                      {...feiraForm.register('horario_funcionamento')}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {feiraForm.formState.errors.horario_funcionamento && (
                      <p className="text-red-500 text-sm mt-1">
                        {feiraForm.formState.errors.horario_funcionamento.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Local
                    </label>
                    <input
                      {...feiraForm.register('local')}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {feiraForm.formState.errors.local && (
                      <p className="text-red-500 text-sm mt-1">
                        {feiraForm.formState.errors.local.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contato
                    </label>
                    <input
                      {...feiraForm.register('contato')}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Telefone ou email"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...feiraForm.register('ativa')}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      Feira ativa
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    {...feiraForm.register('descricao')}
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {feiraForm.formState.errors.descricao && (
                    <p className="text-red-500 text-sm mt-1">
                      {feiraForm.formState.errors.descricao.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Informações Adicionais
                  </label>
                  <textarea
                    {...feiraForm.register('informacoes_adicionais')}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Informações extras sobre a feira..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Imagem Banner
                  </label>
                  <ImageUploader
                    value={feiraForm.watch('imagem_banner') || ''}
                    onChange={(url) => feiraForm.setValue('imagem_banner', url || undefined)}
                    bucket="feira-images"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? 'Salvando...' : 'Salvar Informações'}
                  </button>
                </div>
              </div>
            </FormCard>
          </form>
        )}

        {activeTab === 'produtores' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Produtores Participantes</h2>
              <button
                onClick={() => setShowProdutorForm(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Produtor
              </button>
            </div>

            {showProdutorForm && (
              <form onSubmit={produtorForm.handleSubmit(onSubmitProdutor)} className="space-y-4">
                <FormCard title={editingProdutor ? 'Editar Produtor' : 'Novo Produtor'} showForm={false}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nome do Produtor
                        </label>
                        <input
                          {...produtorForm.register('nome')}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {produtorForm.formState.errors.nome && (
                          <p className="text-red-500 text-sm mt-1">
                            {produtorForm.formState.errors.nome.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Produtos
                        </label>
                        <input
                          {...produtorForm.register('produtos')}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ex: Frutas, Verduras, Legumes"
                        />
                        {produtorForm.formState.errors.produtos && (
                          <p className="text-red-500 text-sm mt-1">
                            {produtorForm.formState.errors.produtos.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contato
                        </label>
                        <input
                          {...produtorForm.register('contato')}
                          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Telefone ou WhatsApp"
                        />
                      </div>

                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          {...produtorForm.register('ativo')}
                          className="mr-2"
                        />
                        <label className="text-sm font-medium text-gray-700">
                          Produtor ativo
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descrição
                      </label>
                      <textarea
                        {...produtorForm.register('descricao')}
                        rows={3}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Descrição do produtor e seus produtos..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Foto do Produtor
                      </label>
                      <ImageUploader
                        value={produtorForm.watch('imagem') || ''}
                        onChange={(url) => produtorForm.setValue('imagem', url || undefined)}
                        bucket="produtores-images"
                      />
                    </div>

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={handleCancelProdutor}
                        className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? 'Salvando...' : 'Salvar Produtor'}
                      </button>
                    </div>
                  </div>
                </FormCard>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {produtoresList.map((produtor) => (
                <div key={produtor.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {produtor.imagem && (
                    <div className="h-32 bg-gray-200 overflow-hidden">
                      <img 
                        src={produtor.imagem} 
                        alt={produtor.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{produtor.nome}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        produtor.ativo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {produtor.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{produtor.produtos}</p>
                    {produtor.descricao && (
                      <p className="text-sm text-gray-500 mb-3">{produtor.descricao}</p>
                    )}
                    {produtor.contato && (
                      <p className="text-sm text-gray-500 mb-3">
                        <i className="fas fa-phone mr-1"></i>
                        {produtor.contato}
                      </p>
                    )}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEditProdutor(produtor)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProdutor(produtor.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {produtoresList.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produtor cadastrado</h3>
                <p className="text-gray-500 mb-4">Adicione produtores para que apareçam na página da feira.</p>
                <button
                  onClick={() => setShowProdutorForm(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  Adicionar Primeiro Produtor
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  // Usar cliente simples para evitar problemas de SSR
  const { createClient } = require('@supabase/supabase-js')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const supabaseServer = createClient(supabaseUrl, supabaseAnonKey)
  
  let feiraInfo = null
  let produtores: Produtor[] = []

  try {
    // Buscar informações da feira (pegar o mais recente)
    const { data: feiraData, error: feiraError } = await supabaseServer
      .from('feira_produtor')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(1)
    
    if (feiraData && feiraData.length > 0) {
      feiraInfo = feiraData[0]
    }

    // Buscar produtores
    const { data: produtoresData } = await supabaseServer
      .from('produtores_feira')
      .select('*')
      .order('nome')
    
    if (produtoresData) {
      produtores = produtoresData
    }
  } catch (error) {
    console.error('Erro ao buscar dados:', error)
  }

  return {
    props: {
      feiraInfo,
      produtores
    }
  }
}
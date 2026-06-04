import React, { useState, useEffect, useMemo } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Settings } from 'lucide-react'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import Pagination from '../../components/admin/Pagination'
import ImageUploader from '../../components/admin/ImageUploader'
import PlanBadge from '../../components/PlanBadge'
import PlanSelector from '../../components/PlanSelector'
import { createServerSupabaseClient, Empresa, PlanType } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import { useToastActions } from '../../components/admin/ToastProvider'

interface EmpresasPageProps {
  initialEmpresas: Empresa[]
  totalItems: number
  currentPage: number
  planStats: {
    basic: number
    premium: number
    expired: number
  }
}

// Schema de validação
const empresaSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  category: z.string().min(1, 'Categoria é obrigatória'),
  rating: z.number().min(0).max(5).default(0),
  reviews: z.number().min(0).default(0),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().email('Email inválido').optional()
  ),
  website: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().url('URL inválida').optional()
  ),
  address: z.string().optional(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  ativo: z.boolean().default(true),
  exibir_em_empresas_locais: z.boolean().default(false),
  plan_type: z.enum(['basic', 'premium']).default('basic'),
  premium_expires_at: z.preprocess(
    (val) => val === '' ? undefined : val,
    z.string().optional()
  )
}).refine((data) => {
  // Se o plano for premium, a data de expiração é obrigatória
  if (data.plan_type === 'premium') {
    if (!data.premium_expires_at) {
      return false
    }
    const date = new Date(data.premium_expires_at)
    return !isNaN(date.getTime()) && date > new Date()
  }
  // Se o plano for básico, a data de expiração é opcional
  if (data.premium_expires_at) {
    const date = new Date(data.premium_expires_at)
    return !isNaN(date.getTime()) && date > new Date()
  }
  return true
}, {
  message: 'Data de expiração é obrigatória para planos premium e deve ser futura',
  path: ['premium_expires_at']
})

type EmpresaFormData = z.infer<typeof empresaSchema>

const categorias = [
  'Restaurante',
  'Automotivo', 
  'Saúde',
  'Alimentação',
  'Beleza',
  'Tecnologia',
  'Comércio',
  'Serviços',
  'Educação',
  'Imóveis'
]

export default function EmpresasPage({ initialEmpresas, totalItems, currentPage, planStats }: EmpresasPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [empresasList, setEmpresasList] = useState<Empresa[]>(initialEmpresas)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [planTypeSelected, setPlanTypeSelected] = useState<'basic' | 'premium'>('basic')
  const [expirationDate, setExpirationDate] = useState<string>('')

  // Sincronizar dados com o SSR
  useEffect(() => {
    setEmpresasList(initialEmpresas)
  }, [initialEmpresas])

  const queryBusca = (router.query.busca as string) || ''
  const queryPlanType = (router.query.planType as 'all' | 'basic' | 'premium' | 'expired') || 'all'
  const queryCategoria = (router.query.categoria as string) || 'all'
  const queryStatus = (router.query.status as 'all' | 'ativo' | 'inativo') || 'all'

  const [buscaInput, setBuscaInput] = useState(queryBusca)

  useEffect(() => {
    setBuscaInput(queryBusca)
  }, [queryBusca])

  const updateFiltros = (novosFiltros: {
    busca?: string
    planType?: string
    categoria?: string
    status?: string
    page?: number
  }) => {
    const query = { ...router.query }
    
    if (novosFiltros.busca !== undefined) {
      if (novosFiltros.busca) query.busca = novosFiltros.busca
      else delete query.busca
    }
    if (novosFiltros.planType !== undefined) {
      if (novosFiltros.planType !== 'all') query.planType = novosFiltros.planType
      else delete query.planType
    }
    if (novosFiltros.categoria !== undefined) {
      if (novosFiltros.categoria !== 'all') query.categoria = novosFiltros.categoria
      else delete query.categoria
    }
    if (novosFiltros.status !== undefined) {
      if (novosFiltros.status !== 'all') query.status = novosFiltros.status
      else delete query.status
    }
    
    if (novosFiltros.page !== undefined) {
      query.page = String(novosFiltros.page)
    } else {
      delete query.page
    }

    router.push({
      pathname: router.pathname,
      query
    })
  }

  const ITEMS_PER_PAGE = 20
  const { success, error } = useToastActions()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      rating: 0,
      reviews: 0,
      featured: false,
      is_new: false,
      ativo: true,
      exibir_em_empresas_locais: false,
      plan_type: 'basic',
      premium_expires_at: ''
    }
  })

  const watchPlanType = watch('plan_type')

  // Carregar dados para edição
  useEffect(() => {
    if (editingEmpresa) {
      setValue('name', editingEmpresa.name)
      setValue('description', editingEmpresa.description || '')
      setValue('category', editingEmpresa.category)
      setValue('rating', editingEmpresa.rating || 0)
      setValue('reviews', editingEmpresa.reviews || 0)
      setValue('location', editingEmpresa.location || '')
      setValue('phone', editingEmpresa.phone || '')
      setValue('email', editingEmpresa.email || '')
      setValue('website', editingEmpresa.website || '')
      setValue('address', editingEmpresa.address || '')
      setValue('featured', editingEmpresa.featured || false)
      setValue('is_new', editingEmpresa.is_new || false)
      setValue('ativo', editingEmpresa.ativo !== false)
      setValue('exibir_em_empresas_locais', editingEmpresa.exibir_em_empresas_locais || false)
      setValue('plan_type', editingEmpresa.plan_type || 'basic')
      setValue('premium_expires_at', editingEmpresa.premium_expires_at || '')
      
      setImageUrl(editingEmpresa.image || '')
      setPlanTypeSelected(editingEmpresa.plan_type || 'basic')
      setExpirationDate(editingEmpresa.premium_expires_at || '')
    }
  }, [editingEmpresa, setValue])

  const onSubmit = async (data: EmpresaFormData) => {
    setIsLoading(true)
    try {
      // Validação adicional para plano premium
      if (data.plan_type === 'premium' && !data.premium_expires_at) {
        error('Data de expiração é obrigatória para planos premium')
        return
      }

      // Validar se a data de expiração é futura
      if (data.premium_expires_at) {
        const expirationDate = new Date(data.premium_expires_at)
        if (isNaN(expirationDate.getTime()) || expirationDate <= new Date()) {
          error('Data de expiração deve ser futura')
          return
        }
      }

      const empresaData = {
        name: data.name,
        description: data.description || null,
        category: data.category,
        rating: data.rating,
        reviews: data.reviews,
        location: data.location || null,
        phone: data.phone || null,
        email: data.email || null,
        website: data.website || null,
        address: data.address || null,
        image: imageUrl || null,
        featured: data.featured,
        is_new: data.is_new,
        ativo: data.ativo,
        exibir_em_empresas_locais: data.exibir_em_empresas_locais,
        plan_type: data.plan_type,
        premium_expires_at: data.premium_expires_at || null
      }

      if (editingEmpresa) {
        // Atualizar empresa existente
        const { data: updatedData, error: updateError } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', editingEmpresa.id)
          .select()
          .single()

        if (updateError) throw updateError

        const updatedEmpresaData = {
          ...updatedData,
          id: editingEmpresa.id
        }

        setEmpresasList(prev => prev.map(emp => 
          emp.id === editingEmpresa.id ? updatedEmpresaData : emp
        ))
        success('Empresa atualizada com sucesso!')
        router.replace(router.asPath)
      } else {
        // Criar nova empresa
        const { data: newData, error: insertError } = await supabase
          .from('empresas')
          .insert([empresaData])
          .select()
          .single()

        if (insertError) throw insertError

        setEmpresasList(prev => [...prev, newData])
        success('Empresa criada com sucesso!')
        router.replace(router.asPath)
      }

      // Limpar formulário
      reset()
      setImageUrl('')
      setPlanTypeSelected('basic')
      setExpirationDate('')
      setEditingEmpresa(null)
    } catch (err: any) {
      console.error('Erro ao salvar empresa:', err)
      
      if (err?.message) {
        if (err.message.includes('violates check constraint')) {
          error('Dados inválidos. Verifique os valores inseridos.')
        } else if (err.message.includes('duplicate key')) {
          error('Já existe uma empresa com este nome.')
        } else if (err.message.includes('invalid input syntax')) {
          error('Formato de dados inválido.')
        } else {
          error(`Erro ao salvar empresa: ${err.message}`)
        }
      } else {
        error('Erro inesperado ao salvar empresa')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (empresa: Empresa) => {
    setEditingEmpresa(empresa)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return
    
    try {
      const { error: deleteError } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      setEmpresasList(prev => prev.filter(emp => emp.id !== id))
      success('Empresa excluída com sucesso!')
      router.replace(router.asPath)
    } catch (err) {
      console.error('Erro ao excluir empresa:', err)
      error('Erro ao excluir empresa')
    }
  }

  const cancelEdit = () => {
    setEditingEmpresa(null)
    reset()
    setImageUrl('')
    setPlanTypeSelected('basic')
    setExpirationDate('')
  }

  const empresasPaginadas = empresasList
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header com botão de navegação */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Gerenciar Empresas</h1>
          <button
            onClick={() => router.push('/admin/empresas/gerenciar')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gerenciar Empresas
          </button>
        </div>

        {/* Estatísticas dos Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">B</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Plano Básico</p>
                <p className="text-2xl font-semibold text-gray-900">{planStats.basic}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">P</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Plano Premium</p>
                <p className="text-2xl font-semibold text-gray-900">{planStats.premium}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">E</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Planos Expirados</p>
                <p className="text-2xl font-semibold text-gray-900">{planStats.expired}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Formulário */}
        <FormCard
          title={editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isLoading}
          submitText={editingEmpresa ? 'Atualizar' : 'Criar'}
          onCancel={editingEmpresa ? cancelEdit : undefined}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Empresa *
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome da empresa"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria *
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione uma categoria</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
              )}
            </div>

            {/* Localização */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Localização
              </label>
              <input
                type="text"
                {...register('location')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Localização"
              />
            </div>

            {/* Telefone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telefone
              </label>
              <input
                type="text"
                {...register('phone')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Telefone"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                type="url"
                {...register('website')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://exemplo.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600">{errors.website.message}</p>
              )}
            </div>

            {/* Avaliação */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                {...register('rating', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Número de Avaliações */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Avaliações
              </label>
              <input
                type="number"
                min="0"
                {...register('reviews', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          {/* Descrição */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descrição da empresa"
            />
          </div>

          {/* Endereço */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <textarea
              {...register('address')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Endereço completo"
            />
          </div>

          {/* Upload de Imagem */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem da Empresa
            </label>
            <ImageUploader
              value={imageUrl}
              onChange={(url) => setImageUrl(url || '')}
              bucket="empresas"
              folder="logos"
            />
          </div>

          {/* Seletor de Plano */}
          <div className="mt-6">
            <PlanSelector
              value={watchPlanType}
              onChange={(planType) => {
                setPlanTypeSelected(planType)
                setValue('plan_type', planType)
                if (planType === 'basic') {
                  setValue('premium_expires_at', '')
                  setExpirationDate('')
                }
              }}
              expirationDate={expirationDate}
              onExpirationChange={(date) => {
                setExpirationDate(date)
                setValue('premium_expires_at', date)
              }}
              error={errors.plan_type?.message}
              expirationError={errors.premium_expires_at?.message}
            />
          </div>

          {/* Checkboxes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('featured')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Empresa em Destaque
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('is_new')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Empresa Nova
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('ativo')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Ativo
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                {...register('exibir_em_empresas_locais')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                Exibir em Empresas Locais
              </label>
            </div>
          </div>
        </FormCard>

        {/* Lista de Empresas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Empresas Cadastradas</h2>
              <p className="text-sm text-gray-600 mt-1">
                Total: {planStats.basic + planStats.premium + planStats.expired} empresas | Exibindo: {totalItems} empresas
              </p>
            </div>
            <button
              onClick={() => router.push('/admin/empresas/importar')}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Importar em Lote
            </button>
          </div>

          {/* Filtros */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            {/* Campo de Busca */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Empresa
              </label>
              <input
                type="text"
                value={buscaInput}
                onChange={(e) => setBuscaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    updateFiltros({ busca: buscaInput })
                  }
                }}
                onBlur={() => updateFiltros({ busca: buscaInput })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Buscar por nome, descrição ou categoria..."
              />
            </div>

            {/* Filtros em linha */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Plano
                </label>
                <select
                  value={queryPlanType}
                  onChange={(e) => updateFiltros({ planType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos os Planos</option>
                  <option value="basic">Básico</option>
                  <option value="premium">Premium</option>
                  <option value="expired">Expirados</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  value={queryCategoria}
                  onChange={(e) => updateFiltros({ categoria: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todas as Categorias</option>
                  {categorias.map(cat => (
                     <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={queryStatus}
                  onChange={(e) => updateFiltros({ status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Todos</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={() => {
                    setBuscaInput('')
                    router.push({
                      pathname: router.pathname
                    })
                  }}
                  className="w-full px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabela de Empresas */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresas Locais
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empresasPaginadas.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {empresa.image && (
                          <img
                            className="h-10 w-10 rounded-full object-cover mr-4"
                            src={empresa.image}
                            alt={empresa.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {empresa.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {empresa.location}
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            {empresa.rating && empresa.rating > 0 && (
                              <span className="text-yellow-400">
                                {'★'.repeat(Math.floor(empresa.rating))}
                              </span>
                            )}
                            {empresa.reviews && empresa.reviews > 0 && (
                              <span className="text-xs text-gray-500">
                                ({empresa.reviews} avaliações)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{empresa.category}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <PlanBadge 
                        planType={empresa.plan_type} 
                        expiresAt={empresa.premium_expires_at}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {empresa.featured && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Destaque
                          </span>
                        )}
                        {empresa.is_new && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Novo
                          </span>
                        )}
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          empresa.ativo 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {empresa.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        empresa.exibir_em_empresas_locais 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {empresa.exibir_em_empresas_locais ? 'Sim' : 'Não'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(empresa)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(empresa.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mensagem quando não há resultados */}
          {totalItems === 0 && (planStats.basic + planStats.premium + planStats.expired) > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma empresa encontrada com os filtros aplicados.</p>
            </div>
          )}

          {empresasList.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nenhuma empresa cadastrada ainda.</p>
            </div>
          )}

          {/* Paginação */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={(page) => updateFiltros({ page })}
          />
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx)
  const page = Number(ctx.query.page) || 1
  const limit = 20
  const from = (page - 1) * limit
  const to = from + limit - 1

  const busca = (ctx.query.busca as string) || ''
  const planType = (ctx.query.planType as string) || 'all'
  const categoria = (ctx.query.categoria as string) || 'all'
  const status = (ctx.query.status as string) || 'all'

  try {
    let query = supabase
      .from('empresas')
      .select('id, name, description, category, rating, reviews, location, phone, email, website, address, image, featured, is_new, ativo, exibir_em_empresas_locais, plan_type, premium_expires_at, created_at, updated_at', { count: 'exact' })

    if (busca) {
      query = query.or(`name.ilike.%${busca}%,description.ilike.%${busca}%,category.ilike.%${busca}%`)
    }

    if (categoria !== 'all') {
      query = query.eq('category', categoria)
    }

    if (status === 'ativo') {
      query = query.eq('ativo', true)
    } else if (status === 'inativo') {
      query = query.eq('ativo', false)
    }

    if (planType === 'basic') {
      query = query.eq('plan_type', 'basic')
    } else if (planType === 'premium') {
      query = query.eq('plan_type', 'premium')
      query = query.or(`premium_expires_at.is.null,premium_expires_at.gt.${new Date().toISOString()}`)
    } else if (planType === 'expired') {
      query = query.eq('plan_type', 'premium').lt('premium_expires_at', new Date().toISOString())
    }

    const { data: empresas, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw error

    // Buscar estatísticas gerais dos planos para exibir no topo (sem paginação/filtros)
    const getPlanCount = async (type: string) => {
      let q = supabase.from('empresas').select('*', { count: 'exact', head: true })
      if (type === 'basic') q = q.eq('plan_type', 'basic')
      if (type === 'premium') {
        q = q.eq('plan_type', 'premium')
        q = q.or(`premium_expires_at.is.null,premium_expires_at.gt.${new Date().toISOString()}`)
      }
      if (type === 'expired') {
        q = q.eq('plan_type', 'premium').lt('premium_expires_at', new Date().toISOString())
      }
      const { count } = await q
      return count || 0
    }

    const [basicCount, premiumCount, expiredCount] = await Promise.all([
      getPlanCount('basic'),
      getPlanCount('premium'),
      getPlanCount('expired')
    ])

    return {
      props: {
        initialEmpresas: empresas || [],
        totalItems: count || 0,
        currentPage: page,
        planStats: {
          basic: basicCount,
          premium: premiumCount,
          expired: expiredCount
        }
      }
    }
  } catch (error) {
    console.error('Erro no getServerSideProps:', error)
    return {
      props: {
        initialEmpresas: [],
        totalItems: 0,
        currentPage: 1,
        planStats: { basic: 0, premium: 0, expired: 0 }
      }
    }
  }
}
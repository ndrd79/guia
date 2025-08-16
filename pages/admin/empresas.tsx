import React, { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import AdminLayout from '../../components/admin/AdminLayout'
import FormCard from '../../components/admin/FormCard'
import ImageUploader from '../../components/admin/ImageUploader'
import { createServerSupabaseClient, Empresa } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'

interface EmpresasPageProps {
  empresas: Empresa[]
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
  email: z.string().email('Email inválido').optional().or(z.literal('').transform(() => undefined)),
  website: z.string().url('URL inválida').optional().or(z.literal('').transform(() => undefined)),
  address: z.string().optional(),
  image: z.string().optional(),
  featured: z.boolean().default(false),
  is_new: z.boolean().default(false),
  ativo: z.boolean().default(true)
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

export default function EmpresasPage({ empresas }: EmpresasPageProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [editingEmpresa, setEditingEmpresa] = useState<Empresa | null>(null)
  const [empresasList, setEmpresasList] = useState<Empresa[]>(empresas)
  const [imageUrl, setImageUrl] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm<EmpresaFormData>({
    resolver: zodResolver(empresaSchema),
    defaultValues: {
      rating: 0,
      reviews: 0,
      featured: false,
      is_new: false,
      ativo: true
    }
  })

  // Carregar dados para edição
  useEffect(() => {
    if (editingEmpresa) {
      setValue('name', editingEmpresa.name)
      setValue('description', editingEmpresa.description || '')
      setValue('category', editingEmpresa.category)
      setValue('rating', editingEmpresa.rating)
      setValue('reviews', editingEmpresa.reviews)
      setValue('location', editingEmpresa.location || '')
      setValue('phone', editingEmpresa.phone || '')
      setValue('email', editingEmpresa.email || '')
      setValue('website', editingEmpresa.website || '')
      setValue('address', editingEmpresa.address || '')
      setValue('featured', editingEmpresa.featured)
      setValue('is_new', editingEmpresa.is_new)
      setValue('ativo', editingEmpresa.ativo)
      setImageUrl(editingEmpresa.image || '')
    }
  }, [editingEmpresa, setValue])

  const onSubmit = async (data: EmpresaFormData) => {
    setIsLoading(true)
    try {
      const empresaData = {
        ...data,
        image: imageUrl || null,
        email: data.email || null,
        website: data.website || null
      }

      if (editingEmpresa) {
        // Atualizar empresa existente
        const { error } = await supabase
          .from('empresas')
          .update(empresaData)
          .eq('id', editingEmpresa.id)

        if (error) throw error

        // Atualizar lista local
        setEmpresasList(prev => 
          prev.map(emp => 
            emp.id === editingEmpresa.id 
              ? { ...emp, ...empresaData, updated_at: new Date().toISOString() }
              : emp
          )
        )
      } else {
        // Criar nova empresa
        const { data: newEmpresa, error } = await supabase
          .from('empresas')
          .insert([empresaData])
          .select()
          .single()

        if (error) throw error

        // Adicionar à lista local
        setEmpresasList(prev => [newEmpresa, ...prev])
      }

      // Limpar formulário
      reset()
      setEditingEmpresa(null)
      setImageUrl('')
      
      alert(editingEmpresa ? 'Empresa atualizada com sucesso!' : 'Empresa criada com sucesso!')
    } catch (error) {
      console.error('Erro ao salvar empresa:', error)
      alert('Erro ao salvar empresa. Tente novamente.')
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
      const { error } = await supabase
        .from('empresas')
        .delete()
        .eq('id', id)

      if (error) throw error

      setEmpresasList(prev => prev.filter(emp => emp.id !== id))
      alert('Empresa excluída com sucesso!')
    } catch (error) {
      console.error('Erro ao excluir empresa:', error)
      alert('Erro ao excluir empresa. Tente novamente.')
    }
  }

  const cancelEdit = () => {
    setEditingEmpresa(null)
    reset()
    setImageUrl('')
  }

  return (
    <AdminLayout title="Gerenciar Empresas">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Formulário */}
        <FormCard 
          title={editingEmpresa ? 'Editar Empresa' : 'Nova Empresa'}
          onSubmit={handleSubmit(onSubmit)}
          isLoading={isLoading}
          submitText={editingEmpresa ? 'Atualizar Empresa' : 'Criar Empresa'}
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
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
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
                <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
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
                placeholder="Ex: Centro, Zona Industrial"
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
                placeholder="(11) 99999-9999"
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
                placeholder="contato@empresa.com.br"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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
                placeholder="https://www.empresa.com.br"
              />
              {errors.website && (
                <p className="text-red-500 text-sm mt-1">{errors.website.message}</p>
              )}
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avaliação (0-5)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('rating', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Reviews */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de Avaliações
              </label>
              <input
                type="number"
                min="0"
                {...register('reviews', { valueAsNumber: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              placeholder="Descrição da empresa..."
            />
          </div>

          {/* Endereço */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço Completo
            </label>
            <textarea
              {...register('address')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Rua, número, bairro, cidade..."
            />
          </div>

          {/* Upload de Imagem */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Imagem da Empresa
            </label>
            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              bucket="empresas"
              folder="logos"
            />
          </div>

          {/* Checkboxes */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </FormCard>

        {/* Lista de Empresas */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Empresas Cadastradas</h2>
            <p className="text-sm text-gray-600 mt-1">
              Total: {empresasList.length} empresas
            </p>
          </div>

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
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {empresasList.map((empresa) => (
                  <tr key={empresa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {empresa.image && (
                          <img
                            className="h-10 w-10 rounded-full object-cover mr-3"
                            src={empresa.image}
                            alt={empresa.name}
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {empresa.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {empresa.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {empresa.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {empresa.location || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {empresa.rating.toFixed(1)}
                        </span>
                        <span className="text-yellow-400 ml-1">★</span>
                        <span className="text-sm text-gray-500 ml-1">
                          ({empresa.reviews})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        {empresa.featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Destaque
                          </span>
                        )}
                        {empresa.is_new && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(empresa)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(empresa.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {empresasList.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">Nenhuma empresa cadastrada ainda.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { createServerSupabaseClient } = await import('../../lib/supabase')
  const supabase = createServerSupabaseClient(ctx)

  try {
    const { data: empresas, error } = await supabase
      .from('empresas')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar empresas:', error)
      return {
        props: {
          empresas: []
        }
      }
    }

    return {
      props: {
        empresas: empresas || []
      }
    }
  } catch (error) {
    console.error('Erro ao conectar com o banco:', error)
    return {
      props: {
        empresas: []
      }
    }
  }
}
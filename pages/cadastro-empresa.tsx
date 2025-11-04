import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'
import { CATEGORIAS_VALIDAS } from '../lib/constants/categorias'

export default function CadastroEmpresa() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [formData, setFormData] = useState({
    nome: '',
    categoria: '',
    telefone: '',
    endereco: '',
    descricao: '',
    email: '',
    website: '',
    whatsapp: '',
    cidade: '',
    horario_funcionamento_dias: '',
    horario_funcionamento_horario: '',
    facebook: '',
    instagram: '',
    maps: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validações básicas
    if (!formData.nome.trim()) {
      setError('Nome da empresa é obrigatório')
      setLoading(false)
      return
    }

    if (!formData.categoria) {
      setError('Categoria é obrigatória')
      setLoading(false)
      return
    }

    if (!formData.telefone.trim()) {
      setError('Telefone é obrigatório')
      setLoading(false)
      return
    }

    if (!formData.endereco.trim()) {
      setError('Endereço é obrigatório')
      setLoading(false)
      return
    }

    if (!formData.descricao.trim()) {
      setError('Descrição é obrigatória')
      setLoading(false)
      return
    }

    if (formData.descricao.length > 500) {
      setError('Descrição deve ter no máximo 500 caracteres')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/cadastro-empresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cadastrar empresa')
      }

      setSuccess(true)
      setFormData({
        nome: '',
        categoria: '',
        telefone: '',
        endereco: '',
        descricao: '',
        email: '',
        website: '',
        whatsapp: '',
        cidade: '',
        horario_funcionamento_dias: '',
        horario_funcionamento_horario: '',
        facebook: '',
        instagram: '',
        maps: ''
      })

    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar empresa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  if (success) {
    return (
      <>
        <Head>
          <title>Cadastro Realizado - Portal Maria Helena</title>
          <meta name="description" content="Cadastro de empresa realizado com sucesso" />
        </Head>

        <Header />
        <Nav />

        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Cadastro Realizado com Sucesso!</h1>
              <p className="text-gray-600 mb-6">
                Sua empresa foi cadastrada e está aguardando aprovação. 
                Nossa equipe irá analisar as informações e, após aprovação, 
                sua empresa aparecerá no portal.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setSuccess(false)}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Cadastrar Outra Empresa
                </button>
                <Link 
                  href="/guia"
                  className="block w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-center"
                >
                  Voltar ao Guia
                </Link>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </>
    )
  }

  return (
    <>
      <Head>
        <title>Cadastrar Empresa - Portal Maria Helena</title>
        <meta name="description" content="Cadastre sua empresa no Portal Maria Helena" />
      </Head>

      <Header />
      <Nav />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Cadastrar Empresa</h1>
            <p className="text-gray-600">
              Cadastre sua empresa no Portal Maria Helena e alcance mais clientes
            </p>
          </div>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Básicas */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações Básicas *</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Empresa *
                  </label>
                  <input
                    type="text"
                    name="nome"
                    value={formData.nome}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Padaria do João"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoria *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma categoria</option>
                    {CATEGORIAS_VALIDAS.map((categoria) => (
                      <option key={categoria} value={categoria}>
                        {categoria}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="telefone"
                    value={formData.telefone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(41) 3333-4444"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <select
                    name="cidade"
                    value={formData.cidade}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Itaperuçu">Itaperuçu</option>
                    <option value="Rio Branco do Sul">Rio Branco do Sul</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço Completo *
                  </label>
                  <input
                    type="text"
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleChange}
                    required
                    maxLength={200}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição da Empresa *
                  </label>
                  <textarea
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleChange}
                    required
                    maxLength={500}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Descreva os produtos e serviços oferecidos pela sua empresa..."
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {formData.descricao.length}/500 caracteres
                  </p>
                </div>
              </div>
            </div>

            {/* Informações de Contato */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="contato@empresa.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    WhatsApp
                  </label>
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(41) 99999-8888"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://www.empresa.com"
                  />
                </div>
              </div>
            </div>

            {/* Horário de Funcionamento */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Horário de Funcionamento</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dias da Semana
                  </label>
                  <select
                    name="horario_funcionamento_dias"
                    value={formData.horario_funcionamento_dias}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="Seg a Sáb">Segunda a Sábado</option>
                    <option value="Seg a Sex">Segunda a Sexta</option>
                    <option value="Seg a Dom">Segunda a Domingo</option>
                    <option value="Ter a Dom">Terça a Domingo</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Horário
                  </label>
                  <select
                    name="horario_funcionamento_horario"
                    value={formData.horario_funcionamento_horario}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione</option>
                    <option value="8h às 18h">8h às 18h</option>
                    <option value="9h às 18h">9h às 18h</option>
                    <option value="08h às 17h">08h às 17h</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Redes Sociais */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociais</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Facebook
                  </label>
                  <input
                    type="text"
                    name="facebook"
                    value={formData.facebook}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nomedaempresa"
                  />
                  <p className="text-xs text-gray-500 mt-1">Apenas o nome de usuário</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instagram
                  </label>
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="nomedaempresa"
                  />
                  <p className="text-xs text-gray-500 mt-1">Apenas o nome de usuário</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Google Maps
                  </label>
                  <input
                    type="url"
                    name="maps"
                    value={formData.maps}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://maps.google.com/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">Link completo do Google Maps</p>
                </div>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Informações Importantes
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Sua empresa será analisada antes de aparecer no portal</li>
                      <li>Você receberá um e-mail quando a análise for concluída</li>
                      <li>Todas as informações podem ser editadas posteriormente</li>
                      <li>O cadastro é gratuito</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 font-medium"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Empresa'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma empresa cadastrada?{' '}
              <Link href="/contato" className="text-blue-600 hover:underline">
                Entre em contato
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
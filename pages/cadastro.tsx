import { useState } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Nav from '../components/Nav'
import Footer from '../components/Footer'

export default function Cadastro() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nome_completo: '',
    telefone: '',
    whatsapp: '',
    cidade: '',
    estado: '',
    birthdate: '',
    gender: '',
    acceptedPrivacy: false,
    acceptedTerms: false,
    newsletter: false
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres')
      setLoading(false)
      return
    }

    if (!formData.acceptedPrivacy || !formData.acceptedTerms) {
      setError('É necessário aceitar a Privacidade e os Termos de Uso')
      setLoading(false)
      return
    }

    const dateMatch = /^([0-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/([0-9]{4})$/.test(formData.birthdate)
    if (!dateMatch) {
      setError('Informe a data de nascimento no formato dd/mm/aaaa')
      setLoading(false)
      return
    }

    const [d, m, y] = formData.birthdate.split('/')
    const isoBirthdate = `${y}-${m}-${d}`
    const phoneDigits = (formData.telefone || '').replace(/\D/g, '')
    const whatsappDigits = (formData.whatsapp || formData.telefone || '').replace(/\D/g, '')

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            nome_completo: formData.nome_completo,
            telefone: phoneDigits,
            whatsapp: whatsappDigits,
            cidade: formData.cidade,
            estado: formData.estado,
            birthdate: isoBirthdate,
            gender: formData.gender,
            newsletter: formData.newsletter,
            accepted_privacy: formData.acceptedPrivacy,
            accepted_terms: formData.acceptedTerms
          }
        }
      })

      if (error) {
        setError(error.message)
      } else {
        // Atualizar perfil com dados adicionais
        if (data.user) {
          await supabase
            .from('user_profiles')
            .upsert({
              id: data.user.id,
              nome_completo: formData.nome_completo,
              telefone: phoneDigits,
              whatsapp: whatsappDigits,
              cidade: formData.cidade,
              estado: formData.estado,
              birthdate: isoBirthdate,
              gender: formData.gender,
              newsletter: formData.newsletter
            })
        }
        
        router.push('/login?message=Cadastro realizado! Verifique seu email para confirmar a conta.')
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, type } = e.target
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <>
      <Head>
        <title>Cadastro - Portal Maria Helena</title>
        <meta name="description" content="Crie sua conta no Portal Maria Helena" />
      </Head>

      <Header />
      <Nav />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Criar Conta</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome_completo"
                value={formData.nome_completo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nascimento (dd/mm/aaaa) *</label>
                <input
                  type="text"
                  name="birthdate"
                  placeholder="dd/mm/aaaa"
                  value={formData.birthdate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-6 mt-6 md:mt-0">
                <label className="inline-flex items-center">
                  <input type="radio" name="gender" value="M" checked={formData.gender === 'M'} onChange={handleChange} className="mr-2" />
                  Masculino
                </label>
                <label className="inline-flex items-center">
                  <input type="radio" name="gender" value="F" checked={formData.gender === 'F'} onChange={handleChange} className="mr-2" />
                  Feminino
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Celular / WhatsApp *</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <input
                  type="tel"
                  name="whatsapp"
                  value={formData.whatsapp}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="AC">Acre</option>
                  <option value="AL">Alagoas</option>
                  <option value="AP">Amapá</option>
                  <option value="AM">Amazonas</option>
                  <option value="BA">Bahia</option>
                  <option value="CE">Ceará</option>
                  <option value="DF">Distrito Federal</option>
                  <option value="ES">Espírito Santo</option>
                  <option value="GO">Goiás</option>
                  <option value="MA">Maranhão</option>
                  <option value="MT">Mato Grosso</option>
                  <option value="MS">Mato Grosso do Sul</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="PA">Pará</option>
                  <option value="PB">Paraíba</option>
                  <option value="PR">Paraná</option>
                  <option value="PE">Pernambuco</option>
                  <option value="PI">Piauí</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="RN">Rio Grande do Norte</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="RO">Rondônia</option>
                  <option value="RR">Roraima</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="SP">São Paulo</option>
                  <option value="SE">Sergipe</option>
                  <option value="TO">Tocantins</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Repita sua senha *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-3 text-sm">
              <label className="flex items-center">
                <input type="checkbox" name="acceptedPrivacy" checked={formData.acceptedPrivacy} onChange={handleChange} className="mr-2" />
                <span>Li e concordo com a <Link href="/privacidade" className="text-blue-600 hover:underline">Política de Privacidade</Link></span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="acceptedTerms" checked={formData.acceptedTerms} onChange={handleChange} className="mr-2" />
                <span>Li e concordo com os <Link href="/termos" className="text-blue-600 hover:underline">Termos de Uso</Link></span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="newsletter" checked={formData.newsletter} onChange={handleChange} className="mr-2" />
                <span>Desejo receber novidades por e‑mail</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link href="/login" className="text-blue-600 hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </>
  )
}
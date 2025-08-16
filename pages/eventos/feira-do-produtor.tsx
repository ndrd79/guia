import Head from 'next/head'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { GetServerSideProps } from 'next'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerContainer from '../../components/BannerContainer'
import { createServerSupabaseClient, supabase } from '../../lib/supabase'
import { FeiraInfo, Produtor } from '../../lib/types'

// Função para obter a próxima terça-feira
const getNextTuesday = () => {
  const today = new Date();
  const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
  const nextTuesday = new Date(today);
  nextTuesday.setDate(today.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
  return nextTuesday;
};

const nextTuesday = getNextTuesday();
const nextTuesdayFormatted = `${nextTuesday.getDate()} de ${nextTuesday.toLocaleDateString('pt-BR', { month: 'long' })}`;

export default function FeiraDoProdutor({ feiraInfo, produtores }: FeiraDoProdutor) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Informações padrão caso não haja dados no banco
  const defaultInfo = {
    titulo: "Feira do Produtor",
    descricao: "Produtos frescos direto do campo. Frutas, verduras, legumes e produtos artesanais dos produtores locais de Maria Helena.",
    data_funcionamento: "Toda terça-feira",
    horario_funcionamento: "06:00 às 12:00",
    local: "Praça Central - Maria Helena",
    informacoes_adicionais: "Venha conhecer os melhores produtos da nossa região! Apoie os produtores locais e leve para casa alimentos frescos e de qualidade.",
    contato: undefined
  }

  const info = feiraInfo || defaultInfo

  return (
    <>
      <Head>
        <title>Feira do Produtor - Portal Maria Helena</title>
        <meta name="description" content="Feira do Produtor de Maria Helena. Produtos frescos direto do campo toda terça-feira na Praça Central." />
        <meta name="keywords" content="feira, produtor, Maria Helena, produtos frescos, agricultura local" />
      </Head>

      <Header />
      <Nav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-emerald-500 text-white py-20">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center bg-green-500 bg-opacity-20 rounded-full px-4 py-2 mb-6">
              <i className="fas fa-seedling mr-2"></i>
              <span className="text-sm font-medium">Toda Terça-feira</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{info.titulo}</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">{info.descricao}</p>
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
              <div className="flex items-center">
                <i className="fas fa-calendar-alt mr-3 text-2xl"></i>
                <div>
                  <div className="font-semibold">Próxima feira</div>
                  <div className="text-green-200">{nextTuesdayFormatted}</div>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-clock mr-3 text-2xl"></i>
                <div>
                  <div className="font-semibold">Horário</div>
                  <div className="text-green-200">{info.horario_funcionamento}</div>
                </div>
              </div>
              <div className="flex items-center">
                <i className="fas fa-map-marker-alt mr-3 text-2xl"></i>
                <div>
                  <div className="font-semibold">Local</div>
                  <div className="text-green-200">{info.local}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Publicitário */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <BannerContainer 
            position="feira-topo"
            className="w-full h-32 rounded-lg"
          />
        </div>
      </section>

      {/* Informações da Feira */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Sobre a Feira</h2>
                <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                  {info.informacoes_adicionais || info.descricao}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <i className="fas fa-leaf text-green-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Produtos Frescos</h3>
                      <p className="text-gray-600">Direto do campo para sua mesa</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <i className="fas fa-handshake text-green-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Apoio Local</h3>
                      <p className="text-gray-600">Fortalecendo a economia regional</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-full mr-4">
                      <i className="fas fa-heart text-green-600"></i>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">Qualidade Garantida</h3>
                      <p className="text-gray-600">Produtos selecionados e de qualidade</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl p-8 text-white">
                  <h3 className="text-2xl font-bold mb-4">Informações Importantes</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <i className="fas fa-calendar-check mr-3"></i>
                      <span><strong>Frequência:</strong> {info.data_funcionamento}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-clock mr-3"></i>
                      <span><strong>Horário:</strong> {info.horario_funcionamento}</span>
                    </div>
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-3"></i>
                      <span><strong>Local:</strong> {info.local}</span>
                    </div>
                    {info.contato && (
                      <div className="flex items-center">
                        <i className="fas fa-phone mr-3"></i>
                        <span><strong>Contato:</strong> {info.contato}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produtores Participantes */}
      {produtores.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4 text-gray-800">Nossos Produtores</h2>
                <p className="text-lg text-gray-600">Conheça os produtores locais que participam da feira</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {produtores.map((produtor) => (
                  <div key={produtor.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                    {produtor.imagem && (
                      <div className="h-48 bg-gray-200 overflow-hidden">
                        <img 
                          src={produtor.imagem} 
                          alt={produtor.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-2 text-gray-800">{produtor.nome}</h3>
                      <div className="mb-3">
                        <span className="inline-block bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                          {produtor.produtos}
                        </span>
                      </div>
                      {produtor.descricao && (
                        <p className="text-gray-600 mb-4">{produtor.descricao}</p>
                      )}
                      {produtor.contato && (
                        <div className="flex items-center text-sm text-gray-500">
                          <i className="fas fa-phone mr-2"></i>
                          <span>{produtor.contato}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Banner Publicitário */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <BannerContainer 
            position="feira-meio"
            className="w-full h-40 rounded-lg"
          />
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Visite a Feira do Produtor</h2>
          <p className="text-xl mb-8 opacity-90">Toda terça-feira na Praça Central de Maria Helena</p>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6">
            <Link href="/eventos" className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
              <i className="fas fa-calendar mr-2"></i>
              Ver Todos os Eventos
            </Link>
            <Link href="/guia" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-green-600 transition">
              <i className="fas fa-store mr-2"></i>
              Guia Comercial
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const supabaseServer = createServerSupabaseClient()
  
  let feiraInfo = null
  let produtores: Produtor[] = []

  try {
    // Buscar informações da feira
    const { data: feiraData } = await supabaseServer
      .from('feira_produtor')
      .select('*')
      .eq('ativa', true)
      .single()
    
    if (feiraData) {
      feiraInfo = feiraData
    }

    // Buscar produtores ativos
    const { data: produtoresData } = await supabaseServer
      .from('produtores_feira')
      .select('*')
      .eq('ativo', true)
      .order('nome')
    
    if (produtoresData) {
      produtores = produtoresData
    }
  } catch (error) {
    console.error('Erro ao buscar dados da feira:', error)
  }

  return {
    props: {
      feiraInfo,
      produtores
    }
  }
}


interface FeiraDoProdutor {
  feiraInfo: FeiraInfo | null
  produtores: Produtor[]
}
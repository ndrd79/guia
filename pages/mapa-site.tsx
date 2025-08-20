import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const MapaSite: React.FC = () => {
  const siteMap = [
    {
      title: 'Páginas Principais',
      links: [
        { name: 'Início', href: '/', description: 'Página inicial do portal' },
        { name: 'Sobre Nós', href: '/sobre', description: 'Conheça nossa história e missão' },
        { name: 'Contato', href: '/contato', description: 'Entre em contato conosco' },
      ]
    },
    {
      title: 'Guia Comercial',
      links: [
        { name: 'Guia de Empresas', href: '/guia', description: 'Encontre empresas e serviços locais' },
        { name: 'Restaurantes', href: '/guia?categoria=restaurantes', description: 'Melhores restaurantes da cidade' },
        { name: 'Comércio', href: '/guia?categoria=comercio', description: 'Lojas e estabelecimentos comerciais' },
        { name: 'Automóveis', href: '/guia?categoria=automoveis', description: 'Concessionárias e serviços automotivos' },
        { name: 'Imóveis', href: '/guia?categoria=imoveis', description: 'Imobiliárias e corretores' },
        { name: 'Saúde', href: '/guia?categoria=saude', description: 'Clínicas, hospitais e profissionais da saúde' },
        { name: 'Educação', href: '/guia?categoria=educacao', description: 'Escolas, cursos e instituições de ensino' },
      ]
    },
    {
      title: 'Notícias e Eventos',
      links: [
        { name: 'Notícias', href: '/noticias', description: 'Últimas notícias da cidade' },
        { name: 'Eventos', href: '/eventos', description: 'Agenda de eventos locais' },
        { name: 'Feira do Produtor', href: '/eventos/feira-do-produtor', description: 'Informações sobre a feira do produtor' },
      ]
    },
    {
      title: 'Classificados',
      links: [
        { name: 'Classificados', href: '/classificados', description: 'Anúncios classificados da região' },
      ]
    },
    {
      title: 'Área do Usuário',
      links: [
        { name: 'Login', href: '/login', description: 'Acesse sua conta' },
        { name: 'Cadastro', href: '/cadastro', description: 'Crie sua conta no portal' },
        { name: 'Área do Usuário', href: '/area-usuario', description: 'Gerencie sua conta e anúncios' },
      ]
    },
    {
      title: 'Informações Legais',
      links: [
        { name: 'Política de Privacidade', href: '/privacidade', description: 'Como tratamos seus dados pessoais' },
        { name: 'Termos de Uso', href: '/termos', description: 'Termos e condições de uso do portal' },
        { name: 'Preferências de Cookies', href: '/cookies-preferencias', description: 'Gerencie suas preferências de cookies' },
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Mapa do Site - Portal Maria Helena</title>
        <meta name="description" content="Navegue facilmente pelo Portal Maria Helena com nosso mapa do site completo." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Mapa do Site</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Encontre facilmente todas as páginas e seções do Portal Maria Helena
            </p>
          </div>
        </section>

        {/* Site Map Content */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {siteMap.map((section, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                    {section.title}
                  </h2>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link 
                          href={link.href}
                          className="block group"
                        >
                          <div className="text-indigo-600 hover:text-indigo-800 font-medium group-hover:underline">
                            {link.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {link.description}
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Não encontrou o que procura?
              </h2>
              <p className="text-gray-600 mb-6">
                Entre em contato conosco e teremos prazer em ajudá-lo a encontrar o que precisa.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contato"
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium"
                >
                  Fale Conosco
                </Link>
                <a 
                  href="https://wa.me/5544984355545"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition font-medium"
                >
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default MapaSite;
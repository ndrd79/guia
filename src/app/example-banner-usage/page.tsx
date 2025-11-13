import React from 'react';
import { BannerSlot } from '@/components/banners/BannerSlot';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header com Banner Principal */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Guia Comercial</h1>
          </div>
        </div>
        
        {/* Banner Slot: Header Principal */}
        <BannerSlot 
          slotSlug="header-principal" 
          currentPage="home"
          className="border-b border-gray-200"
        />
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Conteúdo Principal */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Banner no Topo do Conteúdo */}
            <BannerSlot 
              slotSlug="content-top" 
              currentPage="home"
            />

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Bem-vindo ao Guia Comercial
              </h2>
              <p className="text-gray-600">
                Encontre as melhores empresas e serviços da sua região.
                Nosso guia completo traz informações detalhadas sobre
                comércios locais, com avaliações e contatos.
              </p>
            </div>

            {/* Banner no Meio do Conteúdo */}
            <BannerSlot 
              slotSlug="content-middle" 
              currentPage="home"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Empresas Destacadas
                </h3>
                <p className="text-gray-600">
                  Conheça as empresas mais bem avaliadas do guia.
                </p>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ofertas Especiais
                </h3>
                <p className="text-gray-600">
                  Aproveite as melhores ofertas e promoções.
                </p>
              </div>
            </div>

            {/* Banner no Rodapé do Conteúdo */}
            <BannerSlot 
              slotSlug="content-bottom" 
              currentPage="home"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Banner no Topo da Sidebar */}
            <BannerSlot 
              slotSlug="sidebar-top" 
              currentPage="home"
            />

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Categorias
              </h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-blue-600 hover:text-blue-800">Restaurantes</a></li>
                <li><a href="#" className="text-blue-600 hover:text-blue-800">Serviços</a></li>
                <li><a href="#" className="text-blue-600 hover:text-blue-800">Comércio</a></li>
                <li><a href="#" className="text-blue-600 hover:text-blue-800">Saúde</a></li>
              </ul>
            </div>

            {/* Banner no Meio da Sidebar */}
            <BannerSlot 
              slotSlug="sidebar-middle" 
              currentPage="home"
            />

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Newsletter
              </h3>
              <p className="text-gray-600 mb-4">
                Rebaça nossas atualizações e ofertas especiais.
              </p>
              <input
                type="email"
                placeholder="Seu e-mail"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Inscrever-se
              </button>
            </div>

            {/* Banner no Rodapé da Sidebar */}
            <BannerSlot 
              slotSlug="sidebar-bottom" 
              currentPage="home"
            />
          </div>
        </div>
      </main>

      {/* Rodapé */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Banner no Rodapé */}
          <BannerSlot 
            slotSlug="footer" 
            currentPage="home"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mt-8">
            <div>
              <h4 className="text-lg font-semibold mb-4">Guia Comercial</h4>
              <p className="text-gray-300">
                O maior diretório de empresas da região.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Categorias</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Alimentação</a></li>
                <li><a href="#" className="hover:text-white">Serviços</a></li>
                <li><a href="#" className="hover:text-white">Comércio</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Ajuda</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white">Como anunciar</a></li>
                <li><a href="#" className="hover:text-white">Termos de uso</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Redes Sociais</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
                <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
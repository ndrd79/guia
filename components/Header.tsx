import React from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import BannerAd from './BannerAd';

const Header: React.FC = () => {
  return (
    <>
      {/* Top Bar with Login/Admin */}
      <div className="bg-indigo-900 text-white py-2 px-4 flex justify-between items-center text-sm">
        <div>
          <span className="hidden md:inline">Portal Oficial de Maria Helena - Conectando pessoas e negócios</span>
        </div>
        <div className="flex space-x-4">
          <Link href="/auth/login" className="hover:text-indigo-200">
            <i className="fas fa-user mr-1"></i> Área do Usuário
          </Link>
          <Link href="/admin" className="hover:text-indigo-200">
            <i className="fas fa-lock mr-1"></i> Painel Admin
          </Link>
        </div>
      </div>

      {/* Main Header with Logo and Search */}
      <header className="gradient-bg text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="bg-white rounded-full p-2 mr-4 pulse">
                <i className="fas fa-city text-indigo-600 text-3xl"></i>
              </div>
              <div>
                <Link href="/">
                  <h1 className="text-3xl font-bold neon-text cursor-pointer">PORTAL MARIA HELENA</h1>
                </Link>
                <p className="text-indigo-100">Sua cidade em um só lugar</p>
              </div>
            </div>
            
            {/* Advertising Space (Top) */}
            <BannerAd 
              position="header-top" 
              className="w-full md:w-1/3 h-24 rounded-lg mb-4 md:mb-0" 
            />
            
            <div className="w-full md:w-1/4">
              <SearchBar />
            </div>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <div className="bg-red-600 text-white py-2 px-4">
        <div className="container mx-auto flex items-center">
          <div className="font-bold mr-4 hidden sm:block">ÚLTIMAS NOTÍCIAS:</div>
          <div className="news-ticker flex-1">
            <span>
              <span className="mr-8">Prefeitura anuncia novo programa de incentivo fiscal para pequenas empresas</span>
              <span className="mr-8">Escolas municipais terão aulas de robótica a partir do próximo semestre</span>
              <span className="mr-8">Obras de revitalização da praça central começam na próxima semana</span>
              <span className="mr-8">Câmara aprova projeto que regulamenta delivery de alimentos na cidade</span>
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
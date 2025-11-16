import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import SearchBar from './SearchBar';
import { supabase } from '../lib/supabase';

const Header: React.FC = () => {
  const [noticias, setNoticias] = useState<string[]>([]);

  useEffect(() => {
    const fetchNoticias = async () => {
      try {
        const { data, error } = await supabase
          .from('noticias')
          .select('titulo')
          .order('data', { ascending: false })
          .limit(10);
        
        if (error) {
          console.warn('Falha ao buscar notícias, usando fallback.');
          // Fallback para notícias estáticas em caso de erro
          setNoticias([
            'Prefeitura anuncia novo programa de incentivo fiscal para pequenas empresas',
            'Escolas municipais terão aulas de robótica a partir do próximo semestre',
            'Obras de revitalização da praça central começam na próxima semana',
            'Câmara aprova projeto que regulamenta delivery de alimentos na cidade'
          ]);
        } else {
          setNoticias(data?.map(noticia => noticia.titulo) || []);
        }
      } catch (error) {
        console.warn('Falha de conexão, usando fallback.');
        // Fallback para notícias estáticas
        setNoticias([
          'Prefeitura anuncia novo programa de incentivo fiscal para pequenas empresas',
          'Escolas municipais terão aulas de robótica a partir do próximo semestre',
          'Obras de revitalização da praça central começam na próxima semana',
          'Câmara aprova projeto que regulamenta delivery de alimentos na cidade'
        ]);
      }
    };

    fetchNoticias();
  }, []);

  return (
    <>
      {/* Top Bar with Login/Admin */}
      <div className="bg-indigo-900 text-white py-2 px-4 flex justify-between items-center text-sm">
        <div>
          <span className="hidden md:inline">Portal Oficial de Maria Helena - Conectando pessoas e negócios</span>
        </div>
        <div className="flex space-x-4">
          <Link href="/area-usuario" className="hover:text-indigo-200">
            <i className="fas fa-user mr-1"></i> Área do Usuário
          </Link>
          <Link href="/admin/login" className="hover:text-indigo-200">
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


            
            <div className="w-full md:w-1/3">
              <SearchBar />
            </div>
          </div>
        </div>
      </header>

      {/* News Ticker */}
      <div className="bg-red-600 text-white py-2 px-4 overflow-hidden">
        <div className="container mx-auto flex items-center">
          <div className="font-bold mr-4 hidden sm:block text-sm md:text-base">ÚLTIMAS NOTÍCIAS:</div>
          <div className="news-ticker-container flex-1 relative overflow-hidden">
            <div className="news-ticker-content">
              {noticias.length > 0 ? (
                <>
                  {/* Primeira cópia das notícias */}
                  {noticias.map((noticia, index) => (
                    <span key={`first-${index}`} className="news-ticker-item">
                      {noticia}
                    </span>
                  ))}
                  {/* Segunda cópia para loop contínuo */}
                  {noticias.map((noticia, index) => (
                    <span key={`second-${index}`} className="news-ticker-item">
                      {noticia}
                    </span>
                  ))}
                </>
              ) : (
                <>
                  <span className="news-ticker-item">
                    Carregando últimas notícias...
                  </span>
                  <span className="news-ticker-item">
                    Carregando últimas notícias...
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;

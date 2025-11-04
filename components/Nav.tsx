import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const Nav: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Memoizar a função de toggle para evitar re-renders desnecessários
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  // Memoizar a função isActive
  const isActive = useCallback((path: string) => {
    return router.pathname === path;
  }, [router.pathname]);

  // Memoizar os itens de navegação
  const navItems = useMemo(() => [
    { href: '/', label: 'Início' },
    { href: '/noticias', label: 'Notícias' },
    { href: '/guia', label: 'Guia Comercial' },
    { href: '/classificados', label: 'Classificados' },
    { href: '/eventos', label: 'Eventos' },
    { href: '/servicos', label: 'Serviços' },
    { href: '/contato', label: 'Contato' },
  ], []);

  // Memoizar o callback para fechar o menu mobile
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="text-indigo-600 focus:outline-none"
            >
              <i className="fas fa-bars text-2xl"></i>
            </button>
          </div>
          
          <div className="hidden md:flex space-x-6">
            {navItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`${
                  isActive(item.href)
                    ? 'text-indigo-600 font-medium border-b-2 border-indigo-600 pb-1'
                    : 'text-gray-600 hover:text-indigo-600 transition'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="flex space-x-3">
            <Link href="/servicos">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition flex items-center">
                <i className="fas fa-plus-circle mr-2"></i> Anunciar
              </button>
            </Link>
            <Link href="/cadastro-empresa">
              <button className="bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition flex items-center">
                <i className="fas fa-building mr-2"></i> Cadastrar Empresa
              </button>
            </Link>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:hidden py-4 border-t mt-2`}>
          {navItems.map((item) => (
            <Link 
              key={item.href}
              href={item.href}
              className={`block py-2 ${
                isActive(item.href) ? 'text-indigo-600' : 'text-gray-600'
              }`}
              onClick={closeMobileMenu}
            >
              {item.label}
            </Link>
          ))}
          
          {/* Botões de ação no menu mobile */}
          <div className="mt-4 space-y-2">
            <Link href="/servicos" onClick={closeMobileMenu}>
              <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition flex items-center justify-center">
                <i className="fas fa-plus-circle mr-2"></i> Anunciar
              </button>
            </Link>
            <Link href="/cadastro-empresa" onClick={closeMobileMenu}>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-full hover:bg-green-700 transition flex items-center justify-center">
                <i className="fas fa-building mr-2"></i> Cadastrar Empresa
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
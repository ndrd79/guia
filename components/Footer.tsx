import React, { useState } from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubscribing(true);
    try {
      // Aqui você implementaria a lógica de inscrição na newsletter
      // Por enquanto, apenas simula o processo
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Inscrição realizada com sucesso!');
      setEmail('');
    } catch (error) {
      alert('Erro ao realizar inscrição. Tente novamente.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <>
      {/* Newsletter */}
      <section className="py-12 gradient-bg text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Receba as novidades no seu e-mail</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Cadastre-se e receba promoções, eventos e notícias importantes da sua cidade.
          </p>
          
          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex">
            <input 
              type="email" 
              placeholder="Seu melhor e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-grow py-3 px-4 rounded-l-lg focus:outline-none text-gray-800"
            />
            <button 
              type="submit"
              disabled={isSubscribing}
              className="bg-indigo-900 hover:bg-indigo-800 py-3 px-6 rounded-r-lg font-medium transition disabled:opacity-50"
            >
              {isSubscribing ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Portal Maria Helena</h3>
              <p className="mb-4">
                O guia completo da sua cidade, conectando pessoas, negócios e oportunidades.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-whatsapp"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition">
                  <i className="fab fa-youtube"></i>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Links Rápidos</h3>
              <ul className="space-y-2">
                <li><Link href="/" className="hover:text-white transition">Início</Link></li>
                <li><Link href="/guia" className="hover:text-white transition">Guia Comercial</Link></li>
                <li><Link href="/classificados" className="hover:text-white transition">Classificados</Link></li>
                <li><Link href="/eventos" className="hover:text-white transition">Eventos</Link></li>
                <li><Link href="/servicos" className="hover:text-white transition">Serviços</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Informações</h3>
              <ul className="space-y-2">
                <li><Link href="/sobre" className="hover:text-white transition">Sobre Nós</Link></li>
                <li><Link href="/anuncie" className="hover:text-white transition">Anuncie Conosco</Link></li>
                <li><Link href="/termos" className="hover:text-white transition">Termos de Uso</Link></li>
                <li><Link href="/privacidade" className="hover:text-white transition">Política de Privacidade</Link></li>
                <li><Link href="/contato" className="hover:text-white transition">Fale Conosco</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
              <ul className="space-y-2">
                <li className="flex items-center">
                  <i className="fas fa-map-marker-alt mr-2"></i> Rua Piedade, 1385 - Maria Helena PR
                </li>
                <li className="flex items-center">
                  <i className="fab fa-whatsapp mr-2"></i> (44) 98435-5545
                </li>
                <li className="flex items-center">
                  <i className="fas fa-envelope mr-2"></i> contato@portalmariahelena.com.br
                </li>
                <li className="flex items-center">
                  <i className="fas fa-clock mr-2"></i> Seg-Sex: 8h às 18h
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              &copy; 2025 Portal Maria Helena. Todos os direitos reservados.
            </div>
            <div className="flex space-x-6">
              <Link href="/termos" className="hover:text-white transition">Termos de Serviço</Link>
              <Link href="/privacidade" className="hover:text-white transition">Política de Privacidade</Link>
              <Link href="/mapa-site" className="hover:text-white transition">Mapa do Site</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="bg-indigo-600 text-white w-14 h-14 rounded-full shadow-lg hover:bg-indigo-700 transition flex items-center justify-center">
          <i className="fas fa-comment-dots text-2xl"></i>
        </button>
      </div>
    </>
  );
};

export default Footer;
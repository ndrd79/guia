import React, { useState } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const AnuncieConoscoPage = () => {
  const [formData, setFormData] = useState({
    nome: '',
    empresa: '',
    email: '',
    telefone: '',
    tipoAnuncio: '',
    mensagem: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui você implementaria o envio do formulário
    alert('Obrigado pelo seu interesse! Entraremos em contato em breve.');
    setFormData({
      nome: '',
      empresa: '',
      email: '',
      telefone: '',
      tipoAnuncio: '',
      mensagem: ''
    });
  };

  const planos = [
    {
      nome: 'Banner Básico',
      preco: 'R$ 150/mês',
      descricao: 'Banner lateral no site',
      beneficios: ['Posição lateral', 'Formato 300x250px', 'Link direto', 'Relatório mensal']
    },
    {
      nome: 'Banner Premium',
      preco: 'R$ 300/mês',
      descricao: 'Banner destaque no topo',
      beneficios: ['Posição de destaque', 'Formato 728x90px', 'Link direto', 'Relatório semanal', 'Prioridade na busca']
    },
    {
      nome: 'Pacote Completo',
      preco: 'R$ 500/mês',
      descricao: 'Presença completa no portal',
      beneficios: ['Banner premium', 'Perfil no guia comercial', 'Destaque em classificados', 'Post em redes sociais', 'Relatório detalhado']
    }
  ];

  const depoimentos = [
    {
      nome: 'Maria Silva',
      empresa: 'Padaria do Centro',
      texto: 'Desde que comecei a anunciar no Portal Maria Helena, minhas vendas aumentaram 40%. Recomendo!'
    },
    {
      nome: 'João Santos',
      empresa: 'Auto Peças Santos',
      texto: 'Excelente retorno sobre investimento. O portal realmente conecta com o público local.'
    },
    {
      nome: 'Ana Costa',
      empresa: 'Salão Beleza & Estilo',
      texto: 'Consegui muitos clientes novos através do portal. A equipe é muito profissional.'
    }
  ];

  return (
    <>
      <Head>
        <title>Anuncie Conosco - Portal Maria Helena</title>
        <meta name="description" content="Anuncie sua empresa no Portal Maria Helena e alcance milhares de pessoas na região. Planos acessíveis e resultados garantidos." />
        <meta name="keywords" content="anunciar, publicidade, marketing digital, Maria Helena, portal, negócios" />
        <meta property="og:title" content="Anuncie Conosco - Portal Maria Helena" />
        <meta property="og:description" content="Anuncie sua empresa no Portal Maria Helena e alcance milhares de pessoas na região." />
        <meta property="og:type" content="website" />
        <link rel="icon" href="/favicon.svg" />
      </Head>

      <Header />
      <Nav />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="gradient-bg text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 neon-text">
              Anuncie Conosco
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Conecte sua empresa com milhares de pessoas em Maria Helena e região. 
              Aumente suas vendas com nossa plataforma digital líder.
            </p>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <a 
                href="#planos" 
                className="bg-yellow-500 text-gray-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-yellow-400 transition"
              >
                Ver Planos
              </a>
              <a 
                href="https://wa.me/5544984355545" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition flex items-center justify-center"
              >
                <i className="fab fa-whatsapp mr-2"></i>
                Falar no WhatsApp
              </a>
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Por que anunciar conosco?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-users text-indigo-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Alcance Local</h3>
                <p className="text-gray-600">
                  Conecte-se diretamente com o público de Maria Helena e região. 
                  Mais de 10.000 visitantes únicos mensais.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-chart-line text-green-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Resultados Comprovados</h3>
                <p className="text-gray-600">
                  Nossos anunciantes relatam aumento médio de 35% nas vendas 
                  após começarem a anunciar conosco.
                </p>
              </div>

              <div className="text-center p-6 rounded-xl shadow-md hover:shadow-lg transition">
                <div className="bg-yellow-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-dollar-sign text-yellow-600 text-2xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-3">Custo-Benefício</h3>
                <p className="text-gray-600">
                  Planos acessíveis com excelente retorno sobre investimento. 
                  Muito mais barato que mídia tradicional.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Planos */}
        <section id="planos" className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Nossos Planos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {planos.map((plano, index) => (
                <div key={index} className={`bg-white rounded-xl shadow-lg p-8 ${index === 1 ? 'border-4 border-indigo-600 transform scale-105' : ''}`}>
                  {index === 1 && (
                    <div className="bg-indigo-600 text-white text-center py-2 px-4 rounded-full text-sm font-bold mb-4 -mt-4">
                      MAIS POPULAR
                    </div>
                  )}
                  <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                  <div className="text-3xl font-bold text-indigo-600 mb-4">{plano.preco}</div>
                  <p className="text-gray-600 mb-6">{plano.descricao}</p>
                  
                  <ul className="space-y-3 mb-8">
                    {plano.beneficios.map((beneficio, idx) => (
                      <li key={idx} className="flex items-center">
                        <i className="fas fa-check text-green-600 mr-3"></i>
                        {beneficio}
                      </li>
                    ))}
                  </ul>
                  
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
                    Escolher Plano
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">O que nossos clientes dizem</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {depoimentos.map((depoimento, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                      <i className="fas fa-user text-white"></i>
                    </div>
                    <div>
                      <h4 className="font-bold">{depoimento.nome}</h4>
                      <p className="text-sm text-gray-600">{depoimento.empresa}</p>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">"{depoimento.texto}"</p>
                  <div className="flex text-yellow-500 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <i key={i} className="fas fa-star"></i>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulário de Contato */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Entre em Contato</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Informações de Contato */}
                <div>
                  <h3 className="text-2xl font-bold mb-6">Fale com Nossa Equipe Comercial</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <i className="fab fa-whatsapp text-white"></i>
                      </div>
                      <div>
                        <h4 className="font-bold">WhatsApp</h4>
                        <p className="text-gray-600">(44) 98435-5545</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <i className="fas fa-envelope text-white"></i>
                      </div>
                      <div>
                        <h4 className="font-bold">E-mail</h4>
                        <p className="text-gray-600">comercial@portalmariahelena.com.br</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mr-4">
                        <i className="fas fa-clock text-white"></i>
                      </div>
                      <div>
                        <h4 className="font-bold">Horário de Atendimento</h4>
                        <p className="text-gray-600">Segunda a Sexta: 8h às 18h</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-6 bg-indigo-50 rounded-xl">
                    <h4 className="font-bold text-indigo-800 mb-2">Resposta Rápida</h4>
                    <p className="text-indigo-700">
                      Respondemos todos os contatos em até 2 horas durante o horário comercial.
                    </p>
                  </div>
                </div>

                {/* Formulário */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-2">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Seu nome completo"
                      />
                    </div>

                    <div>
                      <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-2">
                        Empresa
                      </label>
                      <input
                        type="text"
                        id="empresa"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Nome da sua empresa"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="seu@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-2">
                        Telefone/WhatsApp *
                      </label>
                      <input
                        type="tel"
                        id="telefone"
                        name="telefone"
                        value={formData.telefone}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="(44) 99999-9999"
                      />
                    </div>

                    <div>
                      <label htmlFor="tipoAnuncio" className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Anúncio de Interesse
                      </label>
                      <select
                        id="tipoAnuncio"
                        name="tipoAnuncio"
                        value={formData.tipoAnuncio}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Selecione uma opção</option>
                        <option value="banner-basico">Banner Básico</option>
                        <option value="banner-premium">Banner Premium</option>
                        <option value="pacote-completo">Pacote Completo</option>
                        <option value="personalizado">Plano Personalizado</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="mensagem" className="block text-sm font-medium text-gray-700 mb-2">
                        Mensagem
                      </label>
                      <textarea
                        id="mensagem"
                        name="mensagem"
                        value={formData.mensagem}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Conte-nos mais sobre suas necessidades..."
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-indigo-700 transition"
                    >
                      Enviar Solicitação
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 gradient-bg text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Pronto para Crescer?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Junte-se a dezenas de empresas que já confiam no Portal Maria Helena 
              para impulsionar seus negócios.
            </p>
            <a 
              href="https://wa.me/5544984355545" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-green-700 transition inline-flex items-center"
            >
              <i className="fab fa-whatsapp mr-2"></i>
              Começar Agora
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
};

export default AnuncieConoscoPage;
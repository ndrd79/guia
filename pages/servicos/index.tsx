import React from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import Link from 'next/link';

const ServicosPage: React.FC = () => {
  const servicos = [
    {
      icon: 'fas fa-store',
      title: 'Guia Comercial Premium',
      description: 'Destaque sua empresa no nosso guia comercial com fotos, descrição completa e informações de contato.',
      features: ['Perfil completo da empresa', 'Galeria de fotos', 'Localização no mapa', 'Avaliações de clientes'],
      price: 'A partir de R$ 49,90/mês',
      color: 'blue'
    },
    {
      icon: 'fas fa-bullhorn',
      title: 'Banners Publicitários',
      description: 'Anuncie sua marca em posições estratégicas do portal com alta visibilidade.',
      features: ['Banner no topo da página', 'Banner lateral', 'Banner no rodapé', 'Relatórios de visualização'],
      price: 'A partir de R$ 99,90/mês',
      color: 'green'
    },
    {
      icon: 'fas fa-tags',
      title: 'Classificados Destacados',
      description: 'Seus anúncios em destaque na seção de classificados com maior visibilidade.',
      features: ['Posição prioritária', 'Selo de destaque', 'Renovação automática', 'Estatísticas detalhadas'],
      price: 'A partir de R$ 19,90/anúncio',
      color: 'purple'
    },
    {
      icon: 'fas fa-newspaper',
      title: 'Assessoria de Imprensa',
      description: 'Divulgação de notícias e eventos da sua empresa no portal.',
      features: ['Redação profissional', 'Publicação garantida', 'Compartilhamento nas redes', 'SEO otimizado'],
      price: 'A partir de R$ 79,90/matéria',
      color: 'red'
    },
    {
      icon: 'fas fa-calendar-alt',
      title: 'Divulgação de Eventos',
      description: 'Promova seus eventos e atraia mais participantes da região.',
      features: ['Página dedicada do evento', 'Integração com redes sociais', 'Sistema de inscrições', 'Lembretes automáticos'],
      price: 'A partir de R$ 39,90/evento',
      color: 'yellow'
    },
    {
      icon: 'fas fa-chart-line',
      title: 'Marketing Digital',
      description: 'Estratégias completas de marketing digital para sua empresa.',
      features: ['Gestão de redes sociais', 'Criação de conteúdo', 'Campanhas pagas', 'Relatórios mensais'],
      price: 'Consulte valores',
      color: 'indigo'
    }
  ];

  const stats = [
    { number: '15.000+', label: 'Visitantes mensais' },
    { number: '500+', label: 'Empresas cadastradas' },
    { number: '2.000+', label: 'Classificados ativos' },
    { number: '98%', label: 'Satisfação dos clientes' }
  ];

  const testimonials = [
    {
      name: 'Maria Silva',
      business: 'Padaria Pão Dourado',
      text: 'Desde que anunciei no Portal Maria Helena, minhas vendas aumentaram 40%. Recomendo!',
      rating: 5
    },
    {
      name: 'João Santos',
      business: 'Auto Peças Santos',
      text: 'Excelente plataforma! Recebo muitos clientes através do guia comercial.',
      rating: 5
    },
    {
      name: 'Ana Costa',
      business: 'Salão Beleza Pura',
      text: 'O banner publicitário trouxe muita visibilidade para meu salão. Estou muito satisfeita!',
      rating: 5
    }
  ];

  return (
    <>
      <Head>
        <title>Nossos Serviços - Portal Maria Helena</title>
        <meta name="description" content="Conectamos sua empresa a milhares de clientes potenciais em Maria Helena. Conheça nossos serviços de marketing digital e publicidade local." />
        <meta name="keywords" content="marketing digital, publicidade, Maria Helena, guia comercial, banners, classificados" />
      </Head>
      
      <Header />
      <Nav />
      
      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="gradient-bg text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6 neon-text">
              Conectamos Sua Empresa aos Clientes Certos
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto leading-relaxed">
              Mais de 15.000 pessoas visitam nosso portal mensalmente. 
              Seja encontrado pelos seus clientes ideais em Maria Helena e região!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#servicos">
                <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition transform hover:scale-105">
                  <i className="fas fa-rocket mr-2"></i>
                  Ver Nossos Serviços
                </button>
              </Link>
              <Link href="#contato">
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-indigo-600 transition">
                  <i className="fas fa-phone mr-2"></i>
                  Falar com Consultor
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="">
                  <div className="text-4xl font-bold text-indigo-600 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section id="servicos" className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Nossos Serviços
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Soluções completas para aumentar a visibilidade da sua empresa e atrair mais clientes
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {servicos.map((servico, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className={`bg-${servico.color}-100 w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto`}>
                    <i className={`${servico.icon} text-${servico.color}-600 text-2xl`}></i>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                    {servico.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    {servico.description}
                  </p>
                  
                  <ul className="space-y-2 mb-6">
                    {servico.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-700">
                        <i className="fas fa-check text-green-500 mr-2"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="text-center">
                    <div className={`text-lg font-bold text-${servico.color}-600 mb-4`}>
                      {servico.price}
                    </div>
                    <button className={`bg-${servico.color}-600 text-white px-6 py-3 rounded-full hover:bg-${servico.color}-700 transition w-full font-medium`}>
                      Contratar Agora
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Como Funciona
              </h2>
              <p className="text-xl text-gray-600">
                Processo simples e eficiente para começar a atrair mais clientes
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-indigo-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Escolha seu Plano</h3>
                <p className="text-gray-600">
                  Selecione o serviço que melhor atende às necessidades da sua empresa
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Configure sua Presença</h3>
                <p className="text-gray-600">
                  Nossa equipe ajuda você a criar um perfil atrativo e otimizado
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Receba Clientes</h3>
                <p className="text-gray-600">
                  Comece a receber contatos e vendas através do nosso portal
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                O que Nossos Clientes Dizem
              </h2>
              <p className="text-xl text-gray-600">
                Empresas que já cresceram conosco
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <i key={i} className="fas fa-star text-yellow-400"></i>
                    ))}
                  </div>
                  <p className="text-gray-700 mb-6 italic">
                    "{testimonial.text}"
                  </p>
                  <div>
                    <div className="font-bold text-gray-800">{testimonial.name}</div>
                    <div className="text-gray-600 text-sm">{testimonial.business}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contato" className="py-20 gradient-bg text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold mb-6">
              Pronto para Crescer?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Entre em contato conosco e descubra como podemos ajudar sua empresa a alcançar mais clientes
            </p>
            
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <div className="text-center">
                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-phone text-2xl"></i>
                </div>
                <h3 className="font-bold mb-2">Telefone</h3>
                <p>(44) 98435-5545</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-envelope text-2xl"></i>
                </div>
                <h3 className="font-bold mb-2">E-mail</h3>
                <p>contato@portalmariahelena.com.br</p>
              </div>
              
              <div className="text-center">
                <div className="bg-white bg-opacity-20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <i className="fab fa-whatsapp text-2xl"></i>
                </div>
                <h3 className="font-bold mb-2">WhatsApp</h3>
                <p>Atendimento rápido</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contato">
                <button className="bg-white text-indigo-600 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition">
                  <i className="fas fa-comments mr-2"></i>
                  Falar com Consultor
                </button>
              </Link>
              <a href="https://wa.me/5544984355545" target="_blank" rel="noopener noreferrer">
                <button className="border-2 border-white text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white hover:text-indigo-600 transition">
                  <i className="fab fa-whatsapp mr-2"></i>
                  WhatsApp Direto
                </button>
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default ServicosPage;
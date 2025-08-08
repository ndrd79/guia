import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BannerContainer from '../../components/BannerContainer';

interface Business {
  id: string;
  name: string;
  description: string;
  rating: number;
  reviews: number;
  location: string;
  featured: boolean;
  isNew?: boolean;
  image: string;
  category: string;
  phone?: string;
  email?: string;
  website?: string;
  hours?: string;
  services?: string[];
  about?: string;
}

interface BusinessPageProps {
  business: Business | null;
}

const BusinessPage: React.FC<BusinessPageProps> = ({ business }) => {
  if (!business) {
    return (
      <>
        <Head>
          <title>Empresa não encontrada - Portal Maria Helena</title>
        </Head>
        <Header />
        <Nav />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Empresa não encontrada</h1>
            <Link href="/guia" className="text-indigo-600 hover:text-indigo-800">
              Voltar ao Guia Comercial
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <i 
        key={i} 
        className={`fas fa-star${
          i < Math.floor(rating) ? '' : 
          i < rating ? '-half-alt' : ' far'
        } text-yellow-400`}
      ></i>
    ));
  };

  return (
    <>
      <Head>
        <title>{business.name} - Portal Maria Helena</title>
        <meta name="description" content={business.description} />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center mb-6">
              <Link href="/guia" className="text-indigo-600 hover:text-indigo-800 mr-2">
                <i className="fas fa-arrow-left mr-1"></i> Voltar ao Guia
              </Link>
              <span className="text-gray-400">•</span>
              <span className="ml-2 text-gray-600">{business.category}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Business Image */}
              <div className="relative">
                <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
                  <Image
                    src={business.image}
                    alt={business.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    {business.featured && (
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        <i className="fas fa-star mr-1"></i> Destaque
                      </div>
                    )}
                    {business.isNew && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                        <i className="fas fa-sparkles mr-1"></i> Novo
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{business.name}</h1>
                
                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderStars(business.rating)}
                  </div>
                  <span className="text-gray-600 text-sm">
                    {business.rating} ({business.reviews} avaliações)
                  </span>
                </div>

                {/* Category Badge */}
                <div className="mb-4">
                  <span className="bg-indigo-100 text-indigo-800 text-sm font-medium px-3 py-1 rounded-full">
                    {business.category}
                  </span>
                </div>

                <p className="text-gray-600 text-lg mb-6">{business.description}</p>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <i className="fas fa-map-marker-alt text-indigo-600 w-5 mr-3"></i>
                    <span>{business.location}</span>
                  </div>
                  
                  {business.phone && (
                    <div className="flex items-center text-gray-700">
                      <i className="fas fa-phone text-indigo-600 w-5 mr-3"></i>
                      <a href={`tel:${business.phone}`} className="hover:text-indigo-600 transition">
                        {business.phone}
                      </a>
                    </div>
                  )}
                  
                  {business.email && (
                    <div className="flex items-center text-gray-700">
                      <i className="fas fa-envelope text-indigo-600 w-5 mr-3"></i>
                      <a href={`mailto:${business.email}`} className="hover:text-indigo-600 transition">
                        {business.email}
                      </a>
                    </div>
                  )}
                  
                  {business.website && (
                    <div className="flex items-center text-gray-700">
                      <i className="fas fa-globe text-indigo-600 w-5 mr-3"></i>
                      <a href={business.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition">
                        Visitar site
                      </a>
                    </div>
                  )}
                  
                  {business.hours && (
                    <div className="flex items-center text-gray-700">
                      <i className="fas fa-clock text-indigo-600 w-5 mr-3"></i>
                      <span>{business.hours}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-6">
                  {business.phone && (
                    <a 
                      href={`tel:${business.phone}`}
                      className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition flex items-center"
                    >
                      <i className="fas fa-phone mr-2"></i> Ligar
                    </a>
                  )}
                  
                  {business.phone && (
                    <a 
                      href={`https://wa.me/55${business.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center"
                    >
                      <i className="fab fa-whatsapp mr-2"></i> WhatsApp
                    </a>
                  )}
                  
                  <button className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition flex items-center">
                    <i className="fas fa-share-alt mr-2"></i> Compartilhar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <BannerContainer position="Empresa - Topo" className="w-full h-32 rounded-lg" />
          </div>
        </section>

        {/* About Section */}
        {business.about && (
          <section className="py-8 bg-white">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sobre a Empresa</h2>
              <div className="prose max-w-none">
                <p className="text-gray-600 leading-relaxed">{business.about}</p>
              </div>
            </div>
          </section>
        )}

        {/* Services Section */}
        {business.services && business.services.length > 0 && (
          <section className="py-8 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Serviços Oferecidos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {business.services.map((service, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center">
                      <i className="fas fa-check-circle text-green-500 mr-3"></i>
                      <span className="text-gray-700">{service}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Contact Section */}
        <section className="py-8 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Entre em Contato</h2>
            <div className="bg-gray-50 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Informações de Contato</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <i className="fas fa-map-marker-alt text-indigo-600 w-5 mr-3"></i>
                      <span className="text-gray-700">{business.location}</span>
                    </div>
                    
                    {business.phone && (
                      <div className="flex items-center">
                        <i className="fas fa-phone text-indigo-600 w-5 mr-3"></i>
                        <span className="text-gray-700">{business.phone}</span>
                      </div>
                    )}
                    
                    {business.email && (
                      <div className="flex items-center">
                        <i className="fas fa-envelope text-indigo-600 w-5 mr-3"></i>
                        <span className="text-gray-700">{business.email}</span>
                      </div>
                    )}
                    
                    {business.hours && (
                      <div className="flex items-center">
                        <i className="fas fa-clock text-indigo-600 w-5 mr-3"></i>
                        <span className="text-gray-700">{business.hours}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-bold text-lg mb-4">Localização</h3>
                  <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <i className="fas fa-map-marked-alt text-4xl mb-2"></i>
                      <p>Mapa em breve</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Ad */}
        <section className="py-6">
          <div className="container mx-auto px-4">
            <BannerContainer position="Empresa - Rodapé" className="w-full h-32 rounded-lg" />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  // Mock data - em produção, isso viria de um banco de dados
  const businesses = [
    {
      id: '13',
      name: 'MH Cell',
      description: 'Assistência técnica especializada em celulares, vendas de aparelhos e acessórios.',
      rating: 4.8,
      reviews: 156,
      location: 'Rua Piedade, 1385',
      featured: true,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80',
      category: 'Tecnologia',
      phone: '(44) 98435-5545',
      email: 'contato@mhcell.com.br',
      website: 'https://mhcell.com.br',
      hours: 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h',
      about: 'A MH Cell é uma empresa especializada em assistência técnica de celulares e smartphones, oferecendo serviços de qualidade com técnicos experientes e peças originais. Localizada na Rua Piedade, 1385, atendemos Maria Helena e região com excelência há mais de 5 anos. Nossa missão é proporcionar soluções rápidas e eficientes para seus dispositivos móveis, sempre com garantia e preços justos.',
      services: [
        'Troca de tela e display',
        'Reparo de placa-mãe',
        'Substituição de bateria',
        'Reparo de conectores de carga',
        'Desbloqueio de aparelhos',
        'Instalação de películas e capas',
        'Backup e recuperação de dados',
        'Venda de acessórios originais',
        'Consultoria em smartphones',
        'Manutenção preventiva'
      ]
    }
    // Adicione outras empresas aqui conforme necessário
  ];
  
  const business = businesses.find(b => b.id === id) || null;
  
  return {
    props: {
      business
    }
  };
};

export default BusinessPage;
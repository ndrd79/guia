import React from 'react';
import Head from 'next/head';
import { GetServerSideProps } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import BannerContainer from '../../components/BannerContainer';
import { createServerSupabaseClient, Empresa } from '../../lib/supabase';

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
            <BannerContainer 
              position="Empresa - Topo" 
              className="w-full rounded-lg mx-auto max-w-4xl" 
            />
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
            <BannerContainer 
              position="Empresa - Rodapé" 
              className="w-full rounded-lg mx-auto max-w-4xl" 
            />
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { id } = context.params!;
  
  try {
    const supabase = createServerSupabaseClient();
    
    // Buscar empresa real do banco de dados
    const { data: empresa, error } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', id)
      .eq('ativo', true)
      .single();
    
    if (error || !empresa) {
      console.error('Erro ao buscar empresa:', error);
      return {
        props: {
          business: null
        }
      };
    }

    // Verificar se a empresa tem plano básico - redirecionar para página de categoria
    if (empresa.plan_type === 'basic') {
      return {
        redirect: {
          destination: `/guia/categoria/${encodeURIComponent(empresa.category)}`,
          permanent: false
        }
      };
    }

    // Verificar se o plano premium expirou
    if (empresa.plan_type === 'premium' && empresa.premium_expires_at) {
      const expirationDate = new Date(empresa.premium_expires_at);
      const now = new Date();
      
      if (expirationDate < now) {
        // Plano expirado - redirecionar para página de categoria
        return {
          redirect: {
            destination: `/guia/categoria/${encodeURIComponent(empresa.category)}`,
            permanent: false
          }
        };
      }
    }
    
    // Mapear dados da empresa para o formato esperado pelo componente
    const business = {
      id: empresa.id,
      name: empresa.name,
      description: empresa.description || '',
      rating: empresa.rating || 0,
      reviews: empresa.reviews || 0,
      location: empresa.location || empresa.address || '',
      featured: empresa.featured,
      isNew: empresa.is_new,
      image: empresa.image || '/images/placeholder-business.jpg',
      category: empresa.category,
      phone: empresa.phone,
      email: empresa.email,
      website: empresa.website,
      hours: 'Segunda a Sexta: 8h às 18h | Sábado: 8h às 12h', // Valor padrão
      about: empresa.description || 'Informações sobre a empresa em breve.',
      services: [] // Pode ser expandido futuramente
    };
    
    return {
      props: {
        business
      }
    };
  } catch (error) {
    console.error('Erro no getServerSideProps:', error);
    return {
      props: {
        business: null
      }
    };
  }
};

export default BusinessPage;
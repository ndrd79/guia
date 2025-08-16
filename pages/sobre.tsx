import React from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Nav from '../components/Nav';
import Footer from '../components/Footer';

const SobrePage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Sobre Nós - Portal Maria Helena</title>
        <meta name="description" content="Conheça a história e missão do Portal Maria Helena, o guia comercial completo da sua cidade." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Sobre o Portal Maria Helena</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Conectando pessoas, negócios e oportunidades em Maria Helena desde 2023
            </p>
          </div>
        </section>

        {/* Nossa História */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Nossa História</h2>
              
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-indigo-600">Como Tudo Começou</h3>
                  <p className="text-gray-600 mb-6">
                    O Portal Maria Helena nasceu da necessidade de conectar melhor nossa comunidade local. 
                    Percebemos que muitos negócios incríveis da nossa cidade não tinham a visibilidade que mereciam, 
                    e que os moradores precisavam de uma forma mais fácil de descobrir serviços, eventos e oportunidades.
                  </p>
                  <p className="text-gray-600">
                    Assim surgiu a ideia de criar um portal completo que fosse muito mais que um simples guia comercial - 
                    um verdadeiro hub de informações e conexões para nossa cidade.
                  </p>
                </div>
                <div className="bg-gray-100 p-8 rounded-lg">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-indigo-600 mb-2">2023</div>
                    <div className="text-gray-600">Ano de Fundação</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">500+</div>
                      <div className="text-sm text-gray-600">Empresas Cadastradas</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">50+</div>
                      <div className="text-sm text-gray-600">Eventos Divulgados</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-12">Nossa Missão</h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="text-indigo-600 text-4xl mb-4">
                    <i className="fas fa-handshake"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Conectar</h3>
                  <p className="text-gray-600">
                    Aproximar pessoas e negócios, criando uma rede forte de relacionamentos comerciais e sociais em nossa cidade.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="text-purple-600 text-4xl mb-4">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Impulsionar</h3>
                  <p className="text-gray-600">
                    Dar visibilidade aos negócios locais, ajudando empreendedores a crescer e prosperar em nossa comunidade.
                  </p>
                </div>
                
                <div className="bg-white p-8 rounded-lg shadow-md">
                  <div className="text-green-600 text-4xl mb-4">
                    <i className="fas fa-users"></i>
                  </div>
                  <h3 className="text-xl font-semibold mb-4">Informar</h3>
                  <p className="text-gray-600">
                    Manter nossa comunidade sempre informada sobre eventos, oportunidades e novidades da cidade.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Nossos Valores */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-12">Nossos Valores</h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="flex items-start space-x-4">
                  <div className="text-indigo-600 text-2xl mt-1">
                    <i className="fas fa-heart"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Compromisso com a Comunidade</h3>
                    <p className="text-gray-600">
                      Acreditamos no poder da comunidade local e trabalhamos para fortalecê-la todos os dias.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-purple-600 text-2xl mt-1">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Transparência</h3>
                    <p className="text-gray-600">
                      Mantemos informações sempre atualizadas e verdadeiras, construindo confiança com nossos usuários.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-green-600 text-2xl mt-1">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Inovação</h3>
                    <p className="text-gray-600">
                      Buscamos sempre novas formas de melhorar a experiência e oferecer mais valor para nossa comunidade.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="text-orange-600 text-2xl mt-1">
                    <i className="fas fa-star"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Excelência</h3>
                    <p className="text-gray-600">
                      Nos dedicamos a oferecer sempre o melhor serviço, com qualidade e atenção aos detalhes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Faça Parte da Nossa História</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Seja você um empresário, morador ou visitante, todos são bem-vindos em nossa comunidade digital.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/cadastro" className="bg-white text-indigo-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition">
                Cadastre sua Empresa
              </a>
              <a href="/contato" className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white hover:text-indigo-600 transition">
                Entre em Contato
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default SobrePage;
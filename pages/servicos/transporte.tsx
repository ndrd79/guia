import React from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

interface BusSchedule {
  route: string;
  direction: string;
  icon: string;
  color: string;
  schedules: {
    time: string;
    company?: string;
    isSpecial?: boolean;
  }[];
}

const TransportePage: React.FC = () => {
  const busSchedules: BusSchedule[] = [
    {
      route: "Umuarama → Maria Helena",
      direction: "ida",
      icon: "arrow-right",
      color: "from-emerald-500 to-teal-600",
      schedules: [
        { time: "07:00", company: "VIAÇÃO REAL", isSpecial: true },
        { time: "11:30" },
        { time: "12:30" },
        { time: "14:15" },
        { time: "16:00" },
        { time: "17:15" },
        { time: "17:45" },
        { time: "18:20" }
      ]
    },
    {
      route: "Maria Helena → Umuarama",
      direction: "volta",
      icon: "arrow-left",
      color: "from-blue-500 to-indigo-600",
      schedules: [
        { time: "06:20" },
        { time: "06:50" },
        { time: "09:20" },
        { time: "10:40" },
        { time: "14:20" },
        { time: "14:50" },
        { time: "17:40", company: "VIAÇÃO REAL", isSpecial: true }
      ]
    }
  ];

  return (
    <>
      <Head>
        <title>Transporte Público - Portal Maria Helena</title>
        <meta name="description" content="Horários de ônibus entre Maria Helena e Umuarama - Consulte as linhas e horários disponíveis." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative container mx-auto px-4 py-20">
            <div className="text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-8 backdrop-blur-sm">
                <i className="fas fa-bus text-4xl text-white"></i>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Transporte Público
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Horários atualizados de ônibus entre Maria Helena e Umuarama.
                <br />
                <span className="text-white font-medium">Planeje sua viagem com facilidade!</span>
              </p>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-white opacity-5 rounded-full"></div>
            <div className="absolute top-20 right-20 w-32 h-32 bg-white opacity-5 rounded-full"></div>
            <div className="absolute bottom-10 left-1/4 w-24 h-24 bg-white opacity-5 rounded-full"></div>
          </div>
        </div>

        {/* Schedules Section */}
        <div className="container mx-auto px-4 py-16">

          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {busSchedules.map((route, routeIndex) => (
              <div key={routeIndex} className="group">
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02] hover:shadow-3xl">
                  {/* Header do Card */}
                  <div className={`bg-gradient-to-r ${route.color} p-8 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black opacity-10"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <i className={`fas fa-${route.icon} text-2xl text-white`}></i>
                          </div>
                          <div>
                            <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight">
                              {route.route}
                            </h2>
                            <p className="text-white text-opacity-90 text-sm font-medium">
                              {route.schedules.length} horários disponíveis
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative pattern */}
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white opacity-10 rounded-full"></div>
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white opacity-10 rounded-full"></div>
                  </div>
                  
                  {/* Horários Grid */}
                  <div className="p-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {route.schedules.map((schedule, scheduleIndex) => (
                        <div 
                          key={scheduleIndex} 
                          className={`relative group/item transition-all duration-300 ${
                            schedule.isSpecial 
                              ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg' 
                              : 'bg-gradient-to-br from-gray-50 to-slate-100 border border-gray-200 hover:border-blue-300'
                          } rounded-2xl p-4 hover:shadow-lg hover:scale-105`}
                        >
                          {/* Special badge for VIAÇÃO REAL */}
                          {schedule.isSpecial && (
                            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                              <i className="fas fa-star mr-1"></i>
                              REAL
                            </div>
                          )}
                          
                          <div className="text-center">
                            <div className={`text-3xl font-bold mb-2 ${
                              schedule.isSpecial ? 'text-amber-600' : 'text-slate-700'
                            }`}>
                              {schedule.time}
                            </div>
                            
                            {schedule.company && (
                              <div className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-full">
                                {schedule.company}
                              </div>
                            )}
                            
                            {!schedule.company && (
                              <div className="text-xs text-slate-500 font-medium">
                                Horário regular
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Informações importantes */}
          <div className="mt-20 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 border border-blue-100 shadow-xl">
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4">
                  <i className="fas fa-info-circle text-2xl text-white"></i>
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  Informações Importantes
                </h3>
                <p className="text-gray-600">
                  Tudo que você precisa saber sobre o transporte público
                </p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-ticket-alt text-green-600"></i>
                    </div>
                    <h4 className="font-bold text-gray-800">Passagens</h4>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mr-2 mt-1 text-sm"></i>
                      <span>Adquira no terminal ou com o motorista</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mr-2 mt-1 text-sm"></i>
                      <span>Valor: <strong>R$ 5,50</strong></span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-green-500 mr-2 mt-1 text-sm"></i>
                      <span>Desconto para estudantes e idosos</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-clock text-amber-600"></i>
                    </div>
                    <h4 className="font-bold text-gray-800">Horários</h4>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-exclamation-triangle text-amber-500 mr-2 mt-1 text-sm"></i>
                      <span>Sujeitos a alterações</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-exclamation-triangle text-amber-500 mr-2 mt-1 text-sm"></i>
                      <span>Chegue com 10 min de antecedência</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-exclamation-triangle text-amber-500 mr-2 mt-1 text-sm"></i>
                      <span>Consulte sempre a empresa</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <i className="fas fa-star text-blue-600"></i>
                    </div>
                    <h4 className="font-bold text-gray-800">VIAÇÃO REAL</h4>
                  </div>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <i className="fas fa-star text-amber-500 mr-2 mt-1 text-sm"></i>
                      <span>Horários destacados em <strong className="text-amber-600">dourado</strong></span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-star text-amber-500 mr-2 mt-1 text-sm"></i>
                      <span>Serviço diferenciado</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-star text-amber-500 mr-2 mt-1 text-sm"></i>
                      <span>Maior conforto e pontualidade</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action */}
          <div className="mt-20 text-center">
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl p-12 text-white relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-black opacity-10"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-6 backdrop-blur-sm">
                  <i className="fas fa-question-circle text-3xl text-white"></i>
                </div>
                
                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                  Precisa de mais informações?
                </h3>
                <p className="text-white text-opacity-90 mb-8 text-lg max-w-2xl mx-auto">
                  Nossa equipe está pronta para esclarecer suas dúvidas sobre transporte público, 
                  horários e rotas disponíveis em nossa região.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <a 
                    href="/contato" 
                    className="inline-flex items-center bg-white text-indigo-600 font-bold py-4 px-8 rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <i className="fas fa-envelope mr-3"></i>
                    Fale Conosco
                  </a>
                  
                  <a 
                    href="tel:+5544999999999" 
                    className="inline-flex items-center bg-transparent border-2 border-white text-white font-bold py-4 px-8 rounded-2xl hover:bg-white hover:text-indigo-600 transition-all duration-300 transform hover:scale-105"
                  >
                    <i className="fas fa-phone mr-3"></i>
                    (44) 9999-9999
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TransportePage;
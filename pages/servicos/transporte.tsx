import React from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

interface BusSchedule {
  route: string;
  icon: string;
  schedules: {
    time: string;
    days: string;
    notes?: string;
  }[];
}

const TransportePage: React.FC = () => {
  const busSchedules: BusSchedule[] = [
    {
      route: "Umuarama → Maria Helena",
      icon: "city",
      schedules: [
        { time: "06:30", days: "Segunda a Sexta" },
        { time: "12:00", days: "Segunda a Sexta" },
        { time: "17:30", days: "Segunda a Sexta" },
        { time: "08:00", days: "Sábados", notes: "Horário especial" }
      ]
    },
    {
      route: "Maria Helena → Umuarama",
      icon: "city",
      schedules: [
        { time: "07:30", days: "Segunda a Sexta" },
        { time: "13:00", days: "Segunda a Sexta" },
        { time: "18:30", days: "Segunda a Sexta" },
        { time: "09:00", days: "Sábados", notes: "Horário especial" }
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

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-12">
        <div className="container mx-auto px-4">
          {/* Header da página com gradiente */}
          <div className="text-center mb-16">
            <div className="inline-block p-4 rounded-full bg-blue-100 mb-6">
              <i className="fas fa-bus text-4xl text-blue-600"></i>
            </div>
            <h1 className="text-5xl font-bold text-gray-800 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-800">
              Transporte Público
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Consulte os horários de ônibus entre Maria Helena e Umuarama.
              Planeje sua viagem com antecedência e viaje com tranquilidade.
            </p>
          </div>

          {/* Lista de horários com cards modernos */}
          <div className="grid gap-12">
            {busSchedules.map((route, routeIndex) => (
              <div key={routeIndex} className="bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-[1.02] transition-transform duration-300">
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <i className={`fas fa-${route.icon}`}></i>
                    {route.route}
                  </h2>
                </div>
                
                <div className="p-8">
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {route.schedules.map((schedule, scheduleIndex) => (
                      <div 
                        key={scheduleIndex} 
                        className="bg-gray-50 rounded-xl p-6 hover:bg-blue-50 transition-colors duration-300 border border-gray-100"
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="text-3xl font-bold text-blue-600 mb-3">{schedule.time}</div>
                          <div className="text-gray-600 font-medium mb-2">{schedule.days}</div>
                          {schedule.notes && (
                            <div className="text-sm text-blue-500 mt-2 flex items-center">
                              <i className="fas fa-info-circle mr-2"></i>
                              {schedule.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Informações adicionais com design moderno */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg bg-opacity-90">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                <i className="fas fa-info-circle text-blue-600 mr-3"></i>
                Informações Importantes
              </h3>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-ticket-alt text-blue-600 mr-3"></i>
                  Passagens
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  As passagens podem ser adquiridas diretamente com o motorista 
                  ou na rodoviária. Recomendamos chegar com 15 minutos de antecedência 
                  para garantir seu embarque.
                </p>
              </div>
              <div className="p-6 rounded-xl bg-blue-50 border border-blue-100">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="fas fa-calendar-alt text-blue-600 mr-3"></i>
                  Observações
                </h4>
                <p className="text-gray-600 leading-relaxed">
                  Os horários podem sofrer alterações em feriados ou datas especiais. 
                  Não há serviço de ônibus aos domingos. Consulte a empresa de transporte 
                  para confirmação em datas específicas.
                </p>
              </div>
            </div>
          </div>

          {/* Call to action moderno */}
          <div className="mt-16 text-center">
            <p className="text-xl text-gray-600 mb-6">
              Precisa de mais informações sobre o transporte público?
            </p>
            <a 
              href="/contato" 
              className="inline-flex items-center px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-envelope mr-3"></i>
              Fale Conosco
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default TransportePage;
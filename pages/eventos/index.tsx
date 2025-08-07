import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'
import Header from '../../components/Header'
import Nav from '../../components/Nav'
import Footer from '../../components/Footer'
import BannerAd from '../../components/BannerAd'

interface Event {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  price: string
  category: string
  icon: string
  gradient: string
  tag?: string
  tagColor?: string
  isFeatured: boolean
}

// Função para obter a próxima terça-feira
const getNextTuesday = () => {
  const today = new Date();
  const daysUntilTuesday = (2 - today.getDay() + 7) % 7;
  const nextTuesday = new Date(today);
  nextTuesday.setDate(today.getDate() + (daysUntilTuesday === 0 ? 7 : daysUntilTuesday));
  return nextTuesday;
};

const nextTuesday = getNextTuesday();
const nextTuesdayFormatted = `${nextTuesday.getDate()} ${nextTuesday.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}`;

const mockEvents: Event[] = [
  {
    id: 0,
    title: "Feira do Produtor",
    description: "Produtos frescos direto do campo. Frutas, verduras, legumes e produtos artesanais dos produtores locais. Toda terça-feira na Praça Central.",
    date: nextTuesdayFormatted,
    time: "06:00 - 12:00",
    location: "Praça Central - Maria Helena",
    price: "Gratuito",
    category: "Feira",
    icon: "fas fa-seedling",
    gradient: "from-green-500 to-emerald-400",
    tag: "Toda Terça",
    tagColor: "text-green-600",
    isFeatured: true
  },
  {
    id: 1,
    title: "Festival de Música",
    description: "Festival com bandas locais na praça central. Traga sua família e amigos para uma noite de música e diversão.",
    date: "15 JUN",
    time: "19:00 - 23:00",
    location: "Praça Central - Maria Helena",
    price: "Gratuito",
    category: "Música",
    icon: "fas fa-music",
    gradient: "from-purple-500 to-pink-500",
    tag: "Destaque",
    tagColor: "text-purple-600",
    isFeatured: true
  },
  {
    id: 2,
    title: "Feira Gastronômica",
    description: "Degustação dos melhores pratos da região com chefs locais. Uma experiência gastronômica imperdível.",
    date: "16 JUN",
    time: "10:00 - 22:00",
    location: "Av. Principal - Centro",
    price: "R$ 10,00",
    category: "Gastronomia",
    icon: "fas fa-utensils",
    gradient: "from-blue-500 to-teal-400",
    tag: "Popular",
    tagColor: "text-blue-600",
    isFeatured: true
  },
  {
    id: 3,
    title: "Corrida da Saúde",
    description: "5km e 10km com premiação para os vencedores. Evento beneficente para o hospital municipal.",
    date: "18 JUN",
    time: "07:00 - 12:00",
    location: "Parque Municipal",
    price: "Inscrições",
    category: "Esporte",
    icon: "fas fa-running",
    gradient: "from-orange-500 to-yellow-400",
    tag: "Novo",
    tagColor: "text-orange-600",
    isFeatured: true
  },
  {
    id: 4,
    title: "Feira de Artesanato",
    description: "Produtos artesanais feitos por moradores locais.",
    date: "20 JUN",
    time: "09:00 - 18:00",
    location: "Centro Cultural",
    price: "Gratuito",
    category: "Artesanato",
    icon: "fas fa-leaf",
    gradient: "from-green-500 to-emerald-400",
    isFeatured: false
  },
  {
    id: 5,
    title: "Peça Teatral",
    description: "\"O Auto da Compadecida\" pelo grupo local.",
    date: "22 JUN",
    time: "20:00 - 22:00",
    location: "Teatro Municipal",
    price: "R$ 15,00",
    category: "Teatro",
    icon: "fas fa-theater-masks",
    gradient: "from-red-500 to-pink-400",
    isFeatured: false
  },
  {
    id: 6,
    title: "Feira do Livro",
    description: "Lançamentos e descontos em livros de diversos gêneros.",
    date: "25 JUN",
    time: "10:00 - 20:00",
    location: "Biblioteca Municipal",
    price: "Gratuito",
    category: "Literatura",
    icon: "fas fa-book",
    gradient: "from-blue-600 to-indigo-400",
    isFeatured: false
  },
  {
    id: 7,
    title: "Torneio de Xadrez",
    description: "Para todas as idades e níveis de habilidade.",
    date: "28 JUN",
    time: "14:00 - 18:00",
    location: "Clube de Xadrez",
    price: "R$ 5,00",
    category: "Jogos",
    icon: "fas fa-chess",
    gradient: "from-yellow-500 to-amber-400",
    isFeatured: false
  }
]

const filterOptions = [
  'Todos',
  'Próximos 7 dias',
  'Este mês',
  'Gratuitos',
  'Culturais',
  'Esportivos',
  'Feiras'
]

export default function Eventos() {
  const [selectedFilter, setSelectedFilter] = useState('Todos')
  const [filteredEvents, setFilteredEvents] = useState(mockEvents)

  const handleFilter = (filter: string) => {
    setSelectedFilter(filter)
    
    let filtered = mockEvents
    
    switch (filter) {
      case 'Gratuitos':
        filtered = mockEvents.filter(event => event.price === 'Gratuito')
        break
      case 'Culturais':
        filtered = mockEvents.filter(event => 
          ['Música', 'Teatro', 'Literatura', 'Artesanato'].includes(event.category)
        )
        break
      case 'Esportivos':
        filtered = mockEvents.filter(event => event.category === 'Esporte')
        break
      case 'Feiras':
        filtered = mockEvents.filter(event => event.category === 'Feira')
        break
      default:
        filtered = mockEvents
    }
    
    setFilteredEvents(filtered)
  }

  const featuredEvents = filteredEvents.filter(event => event.isFeatured)
  const regularEvents = filteredEvents.filter(event => !event.isFeatured)

  const calendarDays = [
    { day: 28, isCurrentMonth: false },
    { day: 29, isCurrentMonth: false },
    { day: 30, isCurrentMonth: false },
    { day: 31, isCurrentMonth: false },
    { day: 1, isCurrentMonth: true },
    { day: 2, isCurrentMonth: true },
    { day: 3, isCurrentMonth: true },
    { day: 4, isCurrentMonth: true },
    { day: 5, isCurrentMonth: true },
    { day: 6, isCurrentMonth: true },
    { day: 7, isCurrentMonth: true },
    { day: 8, isCurrentMonth: true },
    { day: 9, isCurrentMonth: true },
    { day: 10, isCurrentMonth: true },
    { day: 11, isCurrentMonth: true },
    { day: 12, isCurrentMonth: true },
    { day: 13, isCurrentMonth: true },
    { day: 14, isCurrentMonth: true },
    { day: 15, isCurrentMonth: true, hasEvent: true },
    { day: 16, isCurrentMonth: true, hasEvent: true },
    { day: 17, isCurrentMonth: true },
    { day: 18, isCurrentMonth: true, hasEvent: true },
    { day: 19, isCurrentMonth: true },
    { day: 20, isCurrentMonth: true, hasEvent: true },
    { day: 21, isCurrentMonth: true },
    { day: 22, isCurrentMonth: true, hasEvent: true },
    { day: 23, isCurrentMonth: true },
    { day: 24, isCurrentMonth: true },
    { day: 25, isCurrentMonth: true, hasEvent: true },
    { day: 26, isCurrentMonth: true },
    { day: 27, isCurrentMonth: true },
    { day: 28, isCurrentMonth: true, hasEvent: true },
    { day: 29, isCurrentMonth: true },
    { day: 30, isCurrentMonth: true }
  ]

  return (
    <>
      <Head>
        <title>Eventos - Portal Maria Helena</title>
        <meta name="description" content="Confira os próximos eventos em Maria Helena. Festivais, shows, feiras e muito mais!" />
      </Head>

      <Header />
      <Nav />

      {/* Events Page */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold">Agenda de Eventos</h1>
              <p className="text-gray-600">Confira os próximos eventos em Maria Helena</p>
            </div>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-2">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition">
                  <i className="fas fa-calendar-plus mr-2"></i> Adicionar Evento
                </button>
                <div className="relative">
                  <select 
                    className="appearance-none bg-gray-100 border border-gray-300 rounded-full py-2 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    value={selectedFilter}
                    onChange={(e) => handleFilter(e.target.value)}
                  >
                    {filterOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <i className="fas fa-chevron-down"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advertising Space */}
          <BannerAd 
            position="content"
            className="w-full h-32 rounded-lg mb-8"
            title="ESPAÇO PUBLICITÁRIO - EVENTOS"
          />

          {/* Featured Events */}
          {featuredEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Eventos em Destaque</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden event-card border border-gray-100">
                    <div className={`relative h-48 bg-gradient-to-r ${event.gradient} flex items-center justify-center`}>
                      {event.tag && (
                        <div className={`event-tag ${event.tagColor}`}>{event.tag}</div>
                      )}
                      <i className={`${event.icon} text-white text-5xl`}></i>
                    </div>
                    <div className="p-5">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-xl">{event.title}</h3>
                        <div className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-1 rounded">
                          {event.price}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{event.description}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <i className="fas fa-map-marker-alt mr-2"></i>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="event-date mr-3">
                            <div className="text-xl font-bold">{event.date.split(' ')[0]}</div>
                            <div className="text-xs">{event.date.split(' ')[1]}</div>
                          </div>
                          <div>
                            <div className="font-medium">{event.time}</div>
                            <div className="text-xs text-gray-500">{event.category}</div>
                          </div>
                        </div>
                        <Link href={`/eventos/${event.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                          Detalhes
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Events */}
          {regularEvents.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Todos os Eventos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {regularEvents.map(event => (
                  <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden event-card">
                    <div className={`relative h-32 bg-gradient-to-r ${event.gradient} flex items-center justify-center`}>
                      <i className={`${event.icon} text-white text-3xl`}></i>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-base mb-1">{event.title}</h3>
                      <p className="text-gray-600 text-xs mb-2">{event.description}</p>
                      <div className="flex justify-between items-center text-xs">
                        <div>
                          <div className="text-gray-500">
                            <i className="far fa-calendar-alt mr-1"></i> {event.date}
                          </div>
                          <div className="text-gray-500">
                            <i className="far fa-clock mr-1"></i> {event.time}
                          </div>
                        </div>
                        <Link href={`/eventos/${event.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                          + Info
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event Calendar */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Calendário de Eventos</h2>
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg">Junho 2023</h3>
                <div className="flex space-x-2">
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <button className="p-2 rounded-full hover:bg-gray-100">
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className="text-center font-medium text-gray-500">{day}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => (
                    <div 
                      key={index} 
                      className={`h-12 flex items-center justify-center relative ${
                        !day.isCurrentMonth 
                          ? 'text-gray-400' 
                          : day.hasEvent 
                            ? 'bg-indigo-100 rounded-full text-indigo-600 font-bold' 
                            : ''
                      }`}
                    >
                      {day.day}
                      {day.hasEvent && (
                        <span className="absolute bottom-1 w-1 h-1 bg-indigo-600 rounded-full"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}
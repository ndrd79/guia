import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../../components/Header';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  forecast: {
    date: string;
    temp_max: number;
    temp_min: number;
    description: string;
    icon: string;
  }[];
}

const ClimaPage: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState(0);

  const cities = [
    { name: 'Maria Helena', lat: -23.5505, lon: -53.2119 },
    { name: 'Umuarama', lat: -23.7663, lon: -53.3250 },
    { name: 'Nova Olímpia', lat: -23.4833, lon: -53.2833 },
    { name: 'Douradina', lat: -23.4167, lon: -53.3833 },
    { name: 'Ivaté', lat: -23.5833, lon: -53.3167 }
  ];

  const getWeatherIcon = (iconCode: string) => {
    const iconMap: { [key: string]: string } = {
      '01d': '☀️', '01n': '🌙',
      '02d': '⛅', '02n': '☁️',
      '03d': '☁️', '03n': '☁️',
      '04d': '☁️', '04n': '☁️',
      '09d': '🌧️', '09n': '🌧️',
      '10d': '🌦️', '10n': '🌧️',
      '11d': '⛈️', '11n': '⛈️',
      '13d': '❄️', '13n': '❄️',
      '50d': '🌫️', '50n': '🌫️'
    };
    return iconMap[iconCode] || '🌤️';
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
      
      if (!API_KEY) {
        throw new Error('API Key não configurada');
      }

      const weatherPromises = cities.map(async (city) => {
        // Dados atuais
        const currentResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        const currentData = await currentResponse.json();

        // Previsão de 5 dias
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        const forecastData = await forecastResponse.json();

        // Processar previsão (pegar um por dia)
        const dailyForecast = forecastData.list
          .filter((_: any, index: number) => index % 8 === 0)
          .slice(0, 5)
          .map((item: any) => ({
            date: new Date(item.dt * 1000).toLocaleDateString('pt-BR', { 
              weekday: 'short', 
              day: '2-digit', 
              month: '2-digit' 
            }),
            temp_max: Math.round(item.main.temp_max),
            temp_min: Math.round(item.main.temp_min),
            description: item.weather[0].description,
            icon: item.weather[0].icon
          }));

        return {
          city: city.name,
          temperature: Math.round(currentData.main.temp),
          description: currentData.weather[0].description,
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6), // m/s para km/h
          icon: currentData.weather[0].icon,
          forecast: dailyForecast
        };
      });

      const results = await Promise.all(weatherPromises);
      setWeatherData(results);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados do clima:', err);
      setError('Erro ao carregar dados do clima. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  if (loading) {
    return (
      <>
        <Head>
          <title>Previsão do Tempo - Portal Maria Helena</title>
          <meta name="description" content="Previsão do tempo completa para Maria Helena e região" />
        </Head>
        <Header />
        <Nav />
        <main className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-xl">Carregando dados do clima...</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Previsão do Tempo - Portal Maria Helena</title>
          <meta name="description" content="Previsão do tempo completa para Maria Helena e região" />
        </Head>
        <Header />
        <Nav />
        <main className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4">Erro ao Carregar Dados</h2>
              <p className="text-lg mb-6">{error}</p>
              <button 
                onClick={fetchWeatherData}
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const currentWeather = weatherData[selectedCity];

  return (
    <>
      <Head>
        <title>Previsão do Tempo - Portal Maria Helena</title>
        <meta name="description" content="Previsão do tempo completa para Maria Helena, Umuarama, Nova Olímpia, Douradina e Ivaté" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header />
      <Nav />

      <main className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 py-8">
        <div className="container mx-auto px-4">
          {/* Header da página */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              🌤️ Previsão do Tempo
            </h1>
            <p className="text-xl text-blue-100">
              Condições climáticas para Maria Helena e região
            </p>
          </div>

          {/* Seletor de cidades */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {weatherData.map((weather, index) => (
              <button
                key={index}
                onClick={() => setSelectedCity(index)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedCity === index
                    ? 'bg-white text-blue-600 shadow-lg'
                    : 'bg-blue-500 text-white hover:bg-blue-400'
                }`}
              >
                {weather.city}
              </button>
            ))}
          </div>

          {currentWeather && (
            <>
              {/* Card principal do clima atual */}
              <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
                <div className="text-center">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    {currentWeather.city}
                  </h2>
                  <div className="text-8xl mb-4">
                    {getWeatherIcon(currentWeather.icon)}
                  </div>
                  <div className="text-6xl font-bold text-gray-800 mb-2">
                    {currentWeather.temperature}°C
                  </div>
                  <p className="text-xl text-gray-600 capitalize mb-6">
                    {currentWeather.description}
                  </p>
                  
                  {/* Informações adicionais */}
                  <div className="grid grid-cols-2 gap-6 max-w-md mx-auto">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-blue-600 text-2xl mb-2">💧</div>
                      <div className="text-sm text-gray-600">Umidade</div>
                      <div className="text-xl font-bold text-gray-800">
                        {currentWeather.humidity}%
                      </div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-blue-600 text-2xl mb-2">💨</div>
                      <div className="text-sm text-gray-600">Vento</div>
                      <div className="text-xl font-bold text-gray-800">
                        {currentWeather.windSpeed} km/h
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Previsão de 5 dias */}
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                  📅 Previsão dos Próximos Dias
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {currentWeather.forecast.map((day, index) => (
                    <div key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center">
                      <div className="text-sm font-semibold text-gray-600 mb-2">
                        {day.date}
                      </div>
                      <div className="text-3xl mb-2">
                        {getWeatherIcon(day.icon)}
                      </div>
                      <div className="text-lg font-bold text-gray-800">
                        {day.temp_max}°
                      </div>
                      <div className="text-sm text-gray-600">
                        {day.temp_min}°
                      </div>
                      <div className="text-xs text-gray-500 mt-2 capitalize">
                        {day.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Botão de atualização */}
          <div className="text-center mt-8">
            <button 
              onClick={fetchWeatherData}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
            >
              🔄 Atualizar Dados
            </button>
          </div>

          {/* Informações adicionais */}
          <div className="mt-8 bg-white/10 rounded-lg p-6 text-white text-center">
            <h4 className="text-lg font-semibold mb-2">ℹ️ Informações</h4>
            <p className="text-blue-100">
              Dados fornecidos pela OpenWeatherMap • Atualizado a cada hora
            </p>
            <p className="text-blue-100 text-sm mt-2">
              Última atualização: {new Date().toLocaleString('pt-BR')}
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default ClimaPage;
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

const WeatherSlider: React.FC = () => {
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cities = [
    { name: 'Maria Helena', lat: -23.5505, lon: -53.2119 },
    { name: 'Umuarama', lat: -23.7663, lon: -53.3250 },
    { name: 'Nova Olímpia', lat: -23.4833, lon: -53.2833 },
    { name: 'Douradina', lat: -23.2833, lon: -53.3833 },
    { name: 'Ivaté', lat: -23.6167, lon: -53.6167 }
  ];

  const getWeatherIcon = (description: string): string => {
    const desc = description.toLowerCase();
    if (desc.includes('clear') || desc.includes('limpo')) return '☀️';
    if (desc.includes('cloud') || desc.includes('nuvem')) return '☁️';
    if (desc.includes('rain') || desc.includes('chuva')) return '🌧️';
    if (desc.includes('storm') || desc.includes('tempestade')) return '⛈️';
    if (desc.includes('snow') || desc.includes('neve')) return '❄️';
    if (desc.includes('mist') || desc.includes('névoa')) return '🌫️';
    return '🌤️';
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'd3ef9852b52357500adbce61ec2e3a0e';
      
      const promises = cities.map(async (city) => {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=pt_br`
        );
        
        if (!response.ok) {
          throw new Error(`Erro ao buscar dados para ${city.name}`);
        }
        
        const data = await response.json();
        
        return {
          city: city.name,
          temperature: Math.round(data.main.temp),
          description: data.weather[0].description,
          icon: getWeatherIcon(data.weather[0].description),
          humidity: data.main.humidity,
          windSpeed: Math.round(data.wind.speed * 3.6) // Convert m/s to km/h
        };
      });
      
      const results = await Promise.all(promises);
      setWeatherData(results);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados do clima:', err);
      setError('Erro ao carregar dados do clima');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  useEffect(() => {
    if (weatherData.length > 0) {
      const interval = setInterval(() => {
        setCurrentCityIndex((prevIndex) => 
          (prevIndex + 1) % weatherData.length
        );
      }, 4000); // Troca a cada 4 segundos

      return () => clearInterval(interval);
    }
  }, [weatherData.length]);

  if (loading) {
    return (
      <div className="bg-indigo-50 rounded-xl p-6 text-center min-h-[200px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-indigo-600">Carregando clima...</span>
      </div>
    );
  }

  if (error || weatherData.length === 0) {
    return (
      <Link href="/servicos/clima" className="block bg-indigo-50 rounded-xl p-6 text-center hover:bg-indigo-100 transition">
        <div className="bg-indigo-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
          <i className="fas fa-cloud-sun text-indigo-600 text-3xl"></i>
        </div>
        <h3 className="font-bold text-lg mb-2">Previsão do Tempo</h3>
        <p className="text-gray-600 text-sm mb-4">Condições climáticas atuais</p>
        <span className="text-indigo-600 font-medium text-sm">
          Acessar <i className="fas fa-arrow-right ml-1"></i>
        </span>
      </Link>
    );
  }

  const currentWeather = weatherData[currentCityIndex];

  return (
    <Link href="/servicos/clima" className="block bg-indigo-50 rounded-xl p-6 text-center hover:bg-indigo-100 transition">
      <div className="bg-indigo-100 w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4">
        <span className="text-indigo-600 text-3xl">{currentWeather.icon}</span>
      </div>
      <h3 className="font-bold text-lg mb-2">Previsão do Tempo</h3>
      <div className="mb-2">
        <p className="text-indigo-600 font-medium">{currentWeather.city}</p>
        <p className="text-2xl font-bold text-indigo-700 my-1">{currentWeather.temperature}°C</p>
        <p className="text-gray-600 text-sm capitalize mb-3">{currentWeather.description}</p>
      </div>
      
      {/* Indicadores de slide */}
      <div className="flex justify-center space-x-2 mb-3">
        {weatherData.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentCityIndex ? 'bg-indigo-600' : 'bg-indigo-200'
            }`}
          />
        ))}
      </div>
      
      <span className="text-indigo-600 font-medium text-sm">
        Acessar <i className="fas fa-arrow-right ml-1"></i>
      </span>
    </Link>
  );
};

export default WeatherSlider;
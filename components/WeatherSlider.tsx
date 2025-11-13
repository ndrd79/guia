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
    if (desc.includes('fog') || desc.includes('neblina')) return '🌫️';
    return '🌤️';
  };

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'd3ef9852b52357500adbce61ec2e3a0e';
      
      // Fetch one city at a time to avoid timeout issues
      const results: WeatherData[] = [];
      
      for (const city of cities) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
          
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric&lang=pt_br`,
            { signal: controller.signal }
          );
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            console.warn(`Erro ao buscar dados para ${city.name}`);
            continue; // Skip this city and continue with others
          }
          
          const data = await response.json();
          
          results.push({
            city: city.name,
            temperature: Math.round(data.main.temp),
            description: data.weather[0].description,
            icon: getWeatherIcon(data.weather[0].description),
            humidity: data.main.humidity,
            windSpeed: Math.round(data.wind.speed * 3.6) // Convert m/s to km/h
          });
        } catch (cityError) {
          console.warn(`Falha ao buscar dados para ${city.name}:`, cityError);
          // Continue with next city
        }
      }
      
      if (results.length === 0) {
        // Fallback to mock data if all API calls fail
        setWeatherData([
          { city: 'Maria Helena', temperature: 25, description: 'céu limpo', icon: '☀️', humidity: 65, windSpeed: 10 },
          { city: 'Umuarama', temperature: 24, description: 'poucas nuvens', icon: '🌤️', humidity: 70, windSpeed: 12 }
        ]);
        setError('Dados do clima offline');
      } else {
        setWeatherData(results);
        setError(null);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do clima:', err);
      setError('Erro ao carregar dados do clima');
      
      // Fallback to mock data
      setWeatherData([
        { city: 'Maria Helena', temperature: 25, description: 'céu limpo', icon: '☀️', humidity: 65, windSpeed: 10 },
        { city: 'Umuarama', temperature: 24, description: 'poucas nuvens', icon: '🌤️', humidity: 70, windSpeed: 12 }
      ]);
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
      <div className="bg-indigo-50 rounded-xl p-6 text-center min-h-[200px] flex items-center justify-center">
        <div className="text-indigo-600">
          <div className="text-2xl mb-2">🌤️</div>
          <p className="text-sm">{error || 'Dados do clima indisponíveis'}</p>
          <p className="text-xs mt-1 opacity-75">Tente novamente mais tarde</p>
        </div>
      </div>
    );
  }

  const currentWeather = weatherData[currentCityIndex];

  return (
    <div className="bg-indigo-50 rounded-xl p-6 min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-indigo-900">Clima</h3>
        <Link href="/servicos" className="text-indigo-600 hover:text-indigo-800 text-sm">
          Ver mais
        </Link>
      </div>
      
      <div className="text-center">
        <div className="text-4xl mb-2">{currentWeather.icon}</div>
        <h4 className="text-xl font-bold text-indigo-900 mb-1">{currentWeather.city}</h4>
        <div className="text-3xl font-bold text-indigo-700 mb-2">{currentWeather.temperature}°C</div>
        <p className="text-indigo-600 capitalize mb-3">{currentWeather.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <div className="text-indigo-500 mb-1">💧</div>
            <div className="font-semibold text-indigo-900">{currentWeather.humidity}%</div>
            <div className="text-indigo-600 text-xs">Umidade</div>
          </div>
          <div className="bg-white rounded-lg p-3">
            <div className="text-indigo-500 mb-1">💨</div>
            <div className="font-semibold text-indigo-900">{currentWeather.windSpeed} km/h</div>
            <div className="text-indigo-600 text-xs">Vento</div>
          </div>
        </div>
      </div>
      
      {weatherData.length > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {weatherData.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCityIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentCityIndex ? 'bg-indigo-600' : 'bg-indigo-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WeatherSlider;
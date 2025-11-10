import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface DecorationProps {
  type: string;
  style: React.CSSProperties;
}

const Decoration: React.FC<DecorationProps> = ({ type, style }) => {
  const getDecorationIcon = (type: string) => {
    switch (type) {
      case 'hearts': return '❤️';
      case 'snowflakes': return '❄️';
      case 'bats': return '🦇';
      case 'stars': return '⭐';
      case 'flowers': return '🌸';
      case 'pumpkins': return '🎃';
      default: return '';
    }
  };

  return (
    <div 
      className="fixed pointer-events-none z-10 text-2xl animate-bounce"
      style={style}
    >
      {getDecorationIcon(type)}
    </div>
  );
};

const SeasonalDecorations: React.FC = () => {
  const [activeTheme, setActiveTheme] = useState<any>(null);
  const [decorations, setDecorations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const fetchedRef = useRef(false);

  // Garantir renderização consistente entre servidor e cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Cache do tema para evitar consultas desnecessárias
  const getCachedTheme = useCallback(() => {
    if (!isClient) return null;
    
    try {
      const cached = sessionStorage.getItem('seasonalTheme');
      const cacheTime = sessionStorage.getItem('seasonalThemeTime');
      
      if (cached && cacheTime) {
        const now = Date.now();
        const cacheAge = now - parseInt(cacheTime);
        // Cache válido por 5 minutos
        if (cacheAge < 5 * 60 * 1000) {
          return JSON.parse(cached);
        }
      }
    } catch (error) {
      console.warn('Erro ao acessar sessionStorage:', error);
    }
    return null;
  }, [isClient]);

  const setCachedTheme = useCallback((theme: any) => {
    if (!isClient) return;
    
    try {
      sessionStorage.setItem('seasonalTheme', JSON.stringify(theme));
      sessionStorage.setItem('seasonalThemeTime', Date.now().toString());
    } catch (error) {
      console.warn('Erro ao salvar no sessionStorage:', error);
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    // Primeiro tenta usar o cache
    const cachedTheme = getCachedTheme();
    if (cachedTheme) {
      setActiveTheme(cachedTheme);
      setLoading(false);
      return;
    }
    
    // Evitar chamadas duplicadas em modo Strict do React
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    
    // Se não há cache, busca do servidor
    fetchActiveTheme();
  }, [isClient, getCachedTheme]);

  useEffect(() => {
    if (activeTheme?.decoration_type && activeTheme.decoration_type !== 'none') {
      generateDecorations();
    } else {
      setDecorations([]);
    }
  }, [activeTheme]);

  const fetchActiveTheme = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await supabase
        .from('seasonal_themes')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      if (fetchError) {
        setError(fetchError.message);
        return;
      }
      
      const theme = data || null;
      setActiveTheme(theme);
      setCachedTheme(theme);
    } catch (err) {
      setError('Erro inesperado ao carregar tema');
    } finally {
      setLoading(false);
    }
  };

  const generateDecorations = useCallback(() => {
    const newDecorations = [];
    const count = 6; // Reduzido de 8 para 6 para melhor performance
    
    for (let i = 0; i < count; i++) {
      newDecorations.push({
        id: i,
        style: {
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 2}s`
        }
      });
    }
    
    setDecorations(newDecorations);
  }, []);

  if (loading) {
    return null;
  }

  if (error) {
    return null;
  }

  if (!activeTheme || activeTheme.decoration_type === 'none') {
    return null;
  }

  return (
    <>
      {decorations.map((decoration) => (
        <Decoration
          key={decoration.id}
          type={activeTheme.decoration_type}
          style={decoration.style}
        />
      ))}
    </>
  );
};

export default SeasonalDecorations;
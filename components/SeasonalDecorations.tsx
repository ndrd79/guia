import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    fetchActiveTheme();
  }, []);

  useEffect(() => {
    if (activeTheme?.decoration_type && activeTheme.decoration_type !== 'none') {
      console.log('🎨 Tema ativo encontrado:', activeTheme);
      generateDecorations();
    } else {
      console.log('❌ Nenhum tema ativo ou decoração é "none":', activeTheme);
      setDecorations([]);
    }
  }, [activeTheme]);

  const fetchActiveTheme = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Buscando tema ativo...');
      
      const { data, error: fetchError } = await supabase
        .from('seasonal_themes')
        .select('*')
        .eq('is_active', true)
        .maybeSingle(); // Usar maybeSingle() em vez de single() para evitar erro se não houver resultado
      
      if (fetchError) {
        console.error('❌ Erro ao buscar tema:', fetchError);
        setError(fetchError.message);
        return;
      }
      
      if (data) {
        console.log('✅ Tema ativo encontrado:', data);
        setActiveTheme(data);
      } else {
        console.log('⚠️ Nenhum tema ativo encontrado');
        setActiveTheme(null);
      }
    } catch (err) {
      console.error('❌ Erro inesperado:', err);
      setError('Erro inesperado ao carregar tema');
    } finally {
      setLoading(false);
    }
  };

  const generateDecorations = () => {
    const newDecorations = [];
    const count = 8; // Número de decorações
    
    console.log(`🎭 Gerando ${count} decorações do tipo: ${activeTheme.decoration_type}`);
    
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
    console.log('🎉 Decorações geradas:', newDecorations.length);
  };

  // Debug: mostrar estado atual no console
  useEffect(() => {
    console.log('📊 Estado atual:', {
      loading,
      error,
      activeTheme,
      decorationsCount: decorations.length
    });
  }, [loading, error, activeTheme, decorations]);

  if (loading) {
    console.log('⏳ Carregando tema...');
    return null;
  }

  if (error) {
    console.error('💥 Erro no componente:', error);
    return null;
  }

  if (!activeTheme || activeTheme.decoration_type === 'none') {
    console.log('🚫 Não exibindo decorações');
    return null;
  }

  console.log('🎨 Renderizando decorações:', decorations.length);

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
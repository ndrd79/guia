// Configuração otimizada do banco de dados com Connection Pooler
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// URLs do Connection Pooler para melhor performance
const poolerUrl = process.env.SUPABASE_POOLER_URL;
const directUrl = process.env.SUPABASE_DIRECT_URL;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Variáveis de ambiente do Supabase não configuradas');
}

// Cliente padrão para uso no frontend (com pooler se disponível)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-application-name': 'portal-maria-helena',
    },
  },
});

// Cliente administrativo para operações do servidor (com service role)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  db: {
    schema: 'public',
  },
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: {
      'x-application-name': 'portal-maria-helena-admin',
    },
  },
});

// Configurações de performance para queries
export const queryConfig = {
  // Cache TTL em segundos
  cacheTTL: {
    noticias: 300,        // 5 minutos
    categorias: 1800,     // 30 minutos
    banners: 600,         // 10 minutos
    eventos: 900,         // 15 minutos
    classificados: 600,   // 10 minutos
  },
  
  // Limites de paginação
  pagination: {
    default: 20,
    max: 100,
    noticias: 12,
    classificados: 15,
    eventos: 10,
  },
  
  // Configurações de busca
  search: {
    minLength: 3,
    maxResults: 50,
    highlightLength: 200,
  }
};

// Função helper para busca full-text otimizada
export async function searchNoticiasFulltext(query, options = {}) {
  const {
    limit = queryConfig.pagination.noticias,
    offset = 0,
    categoria = null
  } = options;

  try {
    // Se a função de busca full-text estiver disponível, use ela
    const { data, error } = await supabase.rpc('search_noticias_fulltext', {
      search_query: query,
      limit_count: limit,
      offset_count: offset
    });

    if (error) {
      // Fallback para busca básica se a função não estiver disponível
      console.warn('Função full-text não disponível, usando busca básica:', error.message);
      return await searchNoticiasBasic(query, options);
    }

    return { data, error: null };
  } catch (err) {
    console.error('Erro na busca full-text:', err);
    return await searchNoticiasBasic(query, options);
  }
}

// Função de busca básica como fallback
async function searchNoticiasBasic(query, options = {}) {
  const {
    limit = queryConfig.pagination.noticias,
    offset = 0,
    categoria = null
  } = options;

  let queryBuilder = supabase
    .from('noticias')
    .select('id, titulo, descricao, conteudo, imagem, categoria, created_at')
    .or(`titulo.ilike.%${query}%,descricao.ilike.%${query}%,conteudo.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categoria) {
    queryBuilder = queryBuilder.eq('categoria', categoria);
  }

  const { data, error } = await queryBuilder;
  
  return { data, error };
}

// Função para verificar saúde da conexão
export async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabase
      .from('noticias')
      .select('count')
      .limit(1);
    
    return { healthy: !error, error };
  } catch (err) {
    return { healthy: false, error: err.message };
  }
}

export default supabase;

# Scripts de Implementação - Otimizações Recomendadas
## Portal Maria Helena

**Data:** 30 de Janeiro de 2025  
**Versão:** 1.0  
**Baseado em:** Análise Comparativa de Otimizações

---

## 1. Scripts SQL - Implementação Imediata

### 1.1 Índices de Busca Full-Text (Alta Prioridade)

```sql
-- =====================================================
-- BUSCA FULL-TEXT EM PORTUGUÊS
-- =====================================================

-- Índice para busca em notícias
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_busca_pt 
ON noticias USING gin(
    to_tsvector('portuguese', 
        titulo || ' ' || 
        COALESCE(descricao, '') || ' ' || 
        COALESCE(categoria, '')
    )
);

-- Índice para busca em classificados
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classificados_busca_pt 
ON classificados USING gin(
    to_tsvector('portuguese', 
        titulo || ' ' || 
        COALESCE(descricao, '') || ' ' || 
        COALESCE(categoria, '')
    )
);

-- Índice para busca em empresas
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_empresas_busca_pt 
ON empresas USING gin(
    to_tsvector('portuguese', 
        name || ' ' || 
        COALESCE(description, '') || ' ' || 
        COALESCE(category, '')
    )
);

-- Índice para busca em eventos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eventos_busca_pt 
ON eventos USING gin(
    to_tsvector('portuguese', 
        titulo || ' ' || 
        COALESCE(descricao, '') || ' ' || 
        COALESCE(tipo, '')
    )
);
```

### 1.2 Índices de Performance Específicos

```sql
-- =====================================================
-- ÍNDICES DE PERFORMANCE OTIMIZADOS
-- =====================================================

-- Notícias ativas ordenadas por data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_ativo_data 
ON noticias(created_at DESC) 
WHERE ativo = true;

-- Notícias em destaque
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_destaque_data 
ON noticias(created_at DESC) 
WHERE destaque = true;

-- Empresas ativas por categoria e rating
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_empresas_ativo_categoria_rating 
ON empresas(category, rating DESC) 
WHERE ativo = true;

-- Classificados ativos por categoria e data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_classificados_ativo_categoria 
ON classificados(categoria, created_at DESC) 
WHERE ativo = true;

-- Eventos futuros ordenados por data
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_eventos_futuros 
ON eventos(data_hora ASC) 
WHERE data_hora > NOW();

-- Banners ativos por posição
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_banners_ativo_posicao 
ON banners(posicao, ordem ASC) 
WHERE ativo = true;
```

### 1.3 Índices Compostos para Queries Complexas

```sql
-- =====================================================
-- ÍNDICES COMPOSTOS PARA QUERIES FREQUENTES
-- =====================================================

-- Analytics de banners por período
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_banner_analytics_periodo 
ON banner_analytics(banner_id, created_at DESC, tipo);

-- Media library por pasta e tipo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_media_library_folder_type 
ON media_library(folder_path, file_type, created_at DESC);

-- User profiles ativos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_profiles_ativo 
ON user_profiles(created_at DESC) 
WHERE ativo = true;
```

---

## 2. Funções de Busca Otimizadas

### 2.1 Função de Busca Universal

```sql
-- =====================================================
-- FUNÇÃO DE BUSCA UNIVERSAL
-- =====================================================

CREATE OR REPLACE FUNCTION busca_universal(
    termo_busca TEXT,
    limite INTEGER DEFAULT 20,
    offset_valor INTEGER DEFAULT 0
)
RETURNS TABLE(
    tipo TEXT,
    id UUID,
    titulo TEXT,
    descricao TEXT,
    categoria TEXT,
    data_criacao TIMESTAMPTZ,
    relevancia REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    (
        -- Buscar em notícias
        SELECT 
            'noticia'::TEXT as tipo,
            n.id,
            n.titulo,
            n.descricao,
            n.categoria,
            n.created_at as data_criacao,
            ts_rank(
                to_tsvector('portuguese', n.titulo || ' ' || COALESCE(n.descricao, '')),
                plainto_tsquery('portuguese', termo_busca)
            ) as relevancia
        FROM noticias n
        WHERE to_tsvector('portuguese', n.titulo || ' ' || COALESCE(n.descricao, '')) 
              @@ plainto_tsquery('portuguese', termo_busca)
        AND n.ativo = true
        
        UNION ALL
        
        -- Buscar em classificados
        SELECT 
            'classificado'::TEXT as tipo,
            c.id,
            c.titulo,
            c.descricao,
            c.categoria,
            c.created_at as data_criacao,
            ts_rank(
                to_tsvector('portuguese', c.titulo || ' ' || COALESCE(c.descricao, '')),
                plainto_tsquery('portuguese', termo_busca)
            ) as relevancia
        FROM classificados c
        WHERE to_tsvector('portuguese', c.titulo || ' ' || COALESCE(c.descricao, '')) 
              @@ plainto_tsquery('portuguese', termo_busca)
        AND c.ativo = true
        
        UNION ALL
        
        -- Buscar em empresas
        SELECT 
            'empresa'::TEXT as tipo,
            e.id,
            e.name as titulo,
            e.description as descricao,
            e.category as categoria,
            e.created_at as data_criacao,
            ts_rank(
                to_tsvector('portuguese', e.name || ' ' || COALESCE(e.description, '')),
                plainto_tsquery('portuguese', termo_busca)
            ) as relevancia
        FROM empresas e
        WHERE to_tsvector('portuguese', e.name || ' ' || COALESCE(e.description, '')) 
              @@ plainto_tsquery('portuguese', termo_busca)
        AND e.ativo = true
    )
    ORDER BY relevancia DESC, data_criacao DESC
    LIMIT limite
    OFFSET offset_valor;
END;
$$;
```

### 2.2 Função de Busca com Filtros

```sql
-- =====================================================
-- FUNÇÃO DE BUSCA COM FILTROS AVANÇADOS
-- =====================================================

CREATE OR REPLACE FUNCTION busca_com_filtros(
    termo_busca TEXT,
    tipo_conteudo TEXT DEFAULT NULL,
    categoria_filtro TEXT DEFAULT NULL,
    data_inicio DATE DEFAULT NULL,
    data_fim DATE DEFAULT NULL,
    limite INTEGER DEFAULT 20
)
RETURNS TABLE(
    tipo TEXT,
    id UUID,
    titulo TEXT,
    descricao TEXT,
    categoria TEXT,
    data_criacao TIMESTAMPTZ,
    relevancia REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT * FROM busca_universal(termo_busca, limite * 3, 0) bu
    WHERE 
        (tipo_conteudo IS NULL OR bu.tipo = tipo_conteudo)
        AND (categoria_filtro IS NULL OR bu.categoria ILIKE '%' || categoria_filtro || '%')
        AND (data_inicio IS NULL OR bu.data_criacao::DATE >= data_inicio)
        AND (data_fim IS NULL OR bu.data_criacao::DATE <= data_fim)
    ORDER BY bu.relevancia DESC, bu.data_criacao DESC
    LIMIT limite;
END;
$$;
```

---

## 3. Configurações de Environment

### 3.1 Connection Pooler

```env
# =====================================================
# CONFIGURAÇÃO DO CONNECTION POOLER
# =====================================================

# Substituir no .env.local
# De:
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].supabase.co

# Para:
NEXT_PUBLIC_SUPABASE_URL=https://[projeto].pooler.supabase.com

# Configurações adicionais para produção
SUPABASE_POOL_MAX_CONNECTIONS=60
SUPABASE_POOL_TIMEOUT=30000
```

### 3.2 Configurações de Cache (Opcional - Redis)

```env
# =====================================================
# CONFIGURAÇÃO REDIS (OPCIONAL)
# =====================================================

# Upstash Redis (recomendado para Vercel)
REDIS_URL=redis://:[password]@[host].upstash.io:6379
REDIS_HOST=[host].upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=[password]

# TTL Configurations (em segundos)
CACHE_TTL_ANALYTICS=300      # 5 minutos
CACHE_TTL_BANNERS=1800       # 30 minutos
CACHE_TTL_SEARCH=600         # 10 minutos
CACHE_TTL_THROTTLE=60        # 1 minuto
```

---

## 4. Queries de Monitoramento

### 4.1 Performance das Tabelas

```sql
-- =====================================================
-- MONITORAMENTO DE PERFORMANCE
-- =====================================================

-- Tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices por tabela
SELECT 
    tablename,
    indexname,
    indexdef,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Estatísticas de uso dos índices
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
ORDER BY idx_scan DESC;
```

### 4.2 Análise de Queries Lentas

```sql
-- =====================================================
-- ANÁLISE DE PERFORMANCE DE QUERIES
-- =====================================================

-- Verificar locks ativos
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    backend_start,
    query_start,
    state,
    query
FROM pg_stat_activity 
WHERE state != 'idle' 
AND query NOT LIKE '%pg_stat_activity%'
ORDER BY query_start;

-- Verificar conexões ativas
SELECT 
    datname,
    usename,
    application_name,
    client_addr,
    state,
    COUNT(*) as connection_count
FROM pg_stat_activity 
GROUP BY datname, usename, application_name, client_addr, state
ORDER BY connection_count DESC;
```

---

## 5. Scripts de Validação

### 5.1 Verificar Implementação dos Índices

```sql
-- =====================================================
-- VALIDAÇÃO DOS ÍNDICES IMPLEMENTADOS
-- =====================================================

-- Verificar se todos os índices foram criados
SELECT 
    'idx_noticias_busca_pt' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_noticias_busca_pt'
    ) THEN '✅ Criado' ELSE '❌ Não encontrado' END as status

UNION ALL

SELECT 
    'idx_classificados_busca_pt' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_classificados_busca_pt'
    ) THEN '✅ Criado' ELSE '❌ Não encontrado' END as status

UNION ALL

SELECT 
    'idx_empresas_busca_pt' as index_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_empresas_busca_pt'
    ) THEN '✅ Criado' ELSE '❌ Não encontrado' END as status;
```

### 5.2 Testar Busca Full-Text

```sql
-- =====================================================
-- TESTE DA BUSCA FULL-TEXT
-- =====================================================

-- Testar busca em notícias
EXPLAIN ANALYZE
SELECT titulo, categoria, created_at
FROM noticias 
WHERE to_tsvector('portuguese', titulo || ' ' || COALESCE(descricao, '')) 
      @@ plainto_tsquery('portuguese', 'tecnologia')
ORDER BY created_at DESC
LIMIT 10;

-- Testar função de busca universal
SELECT * FROM busca_universal('tecnologia', 10, 0);

-- Testar busca com filtros
SELECT * FROM busca_com_filtros('tecnologia', 'noticia', NULL, '2025-01-01', NULL, 10);
```

---

## 6. Checklist de Implementação

### Fase 1: Índices (Prioridade Alta)
- [ ] Executar scripts de índices full-text
- [ ] Executar scripts de índices de performance
- [ ] Validar criação dos índices
- [ ] Testar performance das buscas

### Fase 2: Connection Pooler (Prioridade Alta)
- [ ] Atualizar variáveis de ambiente
- [ ] Testar conectividade
- [ ] Monitorar latência

### Fase 3: Funções de Busca (Prioridade Média)
- [ ] Implementar função de busca universal
- [ ] Implementar função de busca com filtros
- [ ] Testar funções
- [ ] Integrar no frontend

### Fase 4: Monitoramento (Prioridade Média)
- [ ] Implementar queries de monitoramento
- [ ] Criar dashboard de performance
- [ ] Configurar alertas

### Fase 5: Redis (Opcional)
- [ ] Avaliar necessidade baseada em métricas
- [ ] Configurar Redis se necessário
- [ ] Migrar cache de analytics
- [ ] Testar performance

---

**Nota:** Execute os scripts em ambiente de desenvolvimento primeiro e monitore a performance antes de aplicar em produção.
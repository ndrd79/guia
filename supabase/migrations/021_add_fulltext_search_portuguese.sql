-- =====================================================
-- IMPLEMENTAÇÃO DE BUSCA FULL-TEXT EM PORTUGUÊS
-- =====================================================
-- Data: 2024-12-23
-- Descrição: Adiciona busca semântica em português para notícias
-- Benefícios: Melhoria significativa na experiência de busca

-- =====================================================
-- 1. CRIAR ÍNDICE GIN PARA BUSCA FULL-TEXT EM PORTUGUÊS
-- =====================================================

-- Criar índice GIN para busca full-text em português na tabela notícias
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_fulltext_pt 
ON noticias USING gin(
    to_tsvector('portuguese', 
        COALESCE(titulo, '') || ' ' || 
        COALESCE(descricao, '') || ' ' || 
        COALESCE(conteudo, '')
    )
);

-- Comentário explicativo
COMMENT ON INDEX idx_noticias_fulltext_pt IS 'Índice GIN para busca full-text em português nas notícias (título, descrição e conteúdo)';

-- =====================================================
-- 2. CRIAR FUNÇÃO PARA BUSCA OTIMIZADA
-- =====================================================

-- Função para busca full-text otimizada
CREATE OR REPLACE FUNCTION search_noticias_fulltext(
    search_query TEXT,
    limit_count INTEGER DEFAULT 20,
    offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    titulo VARCHAR,
    descricao TEXT,
    conteudo TEXT,
    imagem TEXT,
    categoria VARCHAR,
    created_at TIMESTAMPTZ,
    rank REAL
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        n.id,
        n.titulo,
        n.descricao,
        n.conteudo,
        n.imagem,
        n.categoria,
        n.created_at,
        ts_rank(
            to_tsvector('portuguese', 
                COALESCE(n.titulo, '') || ' ' || 
                COALESCE(n.descricao, '') || ' ' || 
                COALESCE(n.conteudo, '')
            ),
            plainto_tsquery('portuguese', search_query)
        ) as rank
    FROM noticias n
    WHERE to_tsvector('portuguese', 
        COALESCE(n.titulo, '') || ' ' || 
        COALESCE(n.descricao, '') || ' ' || 
        COALESCE(n.conteudo, '')
    ) @@ plainto_tsquery('portuguese', search_query)
    ORDER BY rank DESC, n.created_at DESC
    LIMIT limit_count
    OFFSET offset_count;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION search_noticias_fulltext IS 'Função otimizada para busca full-text em português nas notícias (título, descrição e conteúdo) com ranking por relevância';

-- =====================================================
-- 3. CRIAR ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índice para categoria + data (queries frequentes)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_categoria_data 
ON noticias(categoria, created_at DESC) 
WHERE categoria IS NOT NULL;

-- Índice para notícias em destaque
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_destaque_data 
ON noticias(destaque, created_at DESC) 
WHERE destaque = true;

-- Índice para status + data (se existir campo status)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_status_data 
-- ON noticias(status, created_at DESC) 
-- WHERE status = 'publicado';

-- =====================================================
-- 4. OTIMIZAR CONSULTAS EXISTENTES
-- =====================================================

-- Índice composto para paginação eficiente
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_noticias_pagination 
ON noticias(created_at DESC, id);

-- =====================================================
-- 5. CONFIGURAÇÕES DE PERFORMANCE
-- =====================================================

-- Atualizar estatísticas da tabela para otimizar o planner
ANALYZE noticias;

-- =====================================================
-- 6. EXEMPLOS DE USO
-- =====================================================

-- Exemplo 1: Busca simples
-- SELECT * FROM search_noticias_fulltext('tecnologia inovação');

-- Exemplo 2: Busca com paginação
-- SELECT * FROM search_noticias_fulltext('maria helena', 10, 0);

-- Exemplo 3: Busca direta com ranking
-- SELECT titulo, rank 
-- FROM search_noticias_fulltext('economia local') 
-- ORDER BY rank DESC;

-- =====================================================
-- 7. VERIFICAÇÃO DA IMPLEMENTAÇÃO
-- =====================================================

-- Verificar se os índices foram criados
DO $$
BEGIN
    -- Verificar índice full-text
    IF EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_noticias_fulltext_pt'
    ) THEN
        RAISE NOTICE '✅ Índice full-text português criado com sucesso';
    ELSE
        RAISE NOTICE '❌ Erro: Índice full-text não foi criado';
    END IF;
    
    -- Verificar função
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'search_noticias_fulltext'
    ) THEN
        RAISE NOTICE '✅ Função de busca criada com sucesso';
    ELSE
        RAISE NOTICE '❌ Erro: Função de busca não foi criada';
    END IF;
    
    RAISE NOTICE 'Migration 021 - Busca Full-Text em Português concluída!';
END;
$$;
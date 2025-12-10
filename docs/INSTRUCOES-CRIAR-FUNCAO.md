# 🚀 INSTRUÇÕES PARA CRIAR A FUNÇÃO SEARCH_NOTICIAS_FULLTEXT

## ❌ Problema Atual
A função `search_noticias_fulltext` ainda não foi criada no banco de dados Supabase.

## ✅ Solução

### 1. Acesse o Supabase Dashboard
Abra o link: https://supabase.com/dashboard/project/mlkpnapnijdbskaimquj/sql

### 2. Cole e Execute o SQL Abaixo

```sql
-- =====================================================
-- CRIAR FUNÇÃO PARA BUSCA FULL-TEXT EM PORTUGUÊS
-- =====================================================

CREATE OR REPLACE FUNCTION search_noticias_fulltext(
    search_term TEXT,
    limit_count INTEGER DEFAULT 20
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
            plainto_tsquery('portuguese', search_term)
        ) as rank
    FROM noticias n
    WHERE to_tsvector('portuguese', 
        COALESCE(n.titulo, '') || ' ' || 
        COALESCE(n.descricao, '') || ' ' || 
        COALESCE(n.conteudo, '')
    ) @@ plainto_tsquery('portuguese', search_term)
    ORDER BY rank DESC, n.created_at DESC
    LIMIT limit_count;
END;
$$;

-- =====================================================
-- CRIAR ÍNDICE PARA MELHOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_noticias_fulltext_pt 
ON noticias USING gin(
    to_tsvector('portuguese', 
        COALESCE(titulo, '') || ' ' || 
        COALESCE(descricao, '') || ' ' || 
        COALESCE(conteudo, '')
    )
);

-- =====================================================
-- TESTAR A FUNÇÃO
-- =====================================================

SELECT * FROM search_noticias_fulltext('maria helena', 5);
```

### 3. Após Executar

Execute o teste para verificar se funcionou:
```bash
node test-simple.js
```

### 4. Resultado Esperado

Você deve ver:
```
✅ Função search_noticias_fulltext funcionando!
📊 Busca por "maria helena" retornou X resultados
```

## 🎯 Por que Fazer Manualmente?

O Supabase não permite execução de comandos DDL (CREATE FUNCTION, CREATE INDEX) através do cliente JavaScript por questões de segurança. Por isso, precisamos executar diretamente no SQL Editor do Dashboard.

## 📞 Precisa de Ajuda?

Após executar o SQL no Dashboard, execute `node test-simple.js` novamente. Se ainda houver problemas, me avise!
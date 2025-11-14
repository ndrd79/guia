-- Migration para adicionar slug às notícias que não têm
-- e corrigir possíveis duplicatas

-- Atualizar notícias que não têm slug com um slug simples baseado no ID
UPDATE noticias 
SET slug = 'noticia-' || id
WHERE slug IS NULL OR slug = '';

-- Verificar notícias atualizadas
SELECT 
  id,
  titulo,
  slug,
  workflow_status
FROM noticias 
WHERE workflow_status = 'published' 
ORDER BY created_at DESC 
LIMIT 10;
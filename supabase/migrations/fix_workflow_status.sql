-- Migration para corrigir notícias que não têm workflow_status definido
-- Isso resolve o problema de notícias não aparecerem nas páginas públicas

-- Atualizar notícias que têm workflow_status NULL para 'published'
UPDATE noticias 
SET workflow_status = 'published' 
WHERE workflow_status IS NULL;

-- Atualizar notícias que têm workflow_status vazio para 'published'
UPDATE noticias 
SET workflow_status = 'published' 
WHERE workflow_status = '';

-- Verificar quantas notícias foram atualizadas
SELECT 
  COUNT(*) as total_noticias,
  COUNT(CASE WHEN workflow_status = 'published' THEN 1 END) as publicadas,
  COUNT(CASE WHEN workflow_status = 'draft' THEN 1 END) as rascunhos,
  COUNT(CASE WHEN workflow_status IS NULL THEN 1 END) as sem_status
FROM noticias;
-- Script para verificar e corrigir banners com imagens quebradas

-- Desativar banners com imagens problemáticas
UPDATE banners 
SET ativo = false,
    updated_at = NOW()
WHERE imagem LIKE '%1755636329303-aj82lf-mae-png.png%'
   OR imagem LIKE '%images.unsplash.com/photo-1556742049-0cfed4f6a45d%';

-- Verificar banners ativos restantes
SELECT 
    id,
    nome,
    posicao,
    imagem,
    ativo
FROM banners 
WHERE ativo = true
ORDER BY posicao, created_at
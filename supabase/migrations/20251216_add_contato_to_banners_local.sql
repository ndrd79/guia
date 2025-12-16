-- Migration: Atualizar constraint do campo 'local' para incluir 'contato'
-- Data: 2025-12-16
-- Problema: Wizard de banner não consegue criar banners para página de contato

-- Remover constraint antigo
ALTER TABLE banners DROP CONSTRAINT IF EXISTS banners_local_check;

-- Criar novo constraint com 'contato' incluído
ALTER TABLE banners ADD CONSTRAINT banners_local_check 
    CHECK (local IN ('geral', 'home', 'guia_comercial', 'noticias', 'eventos', 'classificados', 'contato'));

-- Atualizar comentário
COMMENT ON COLUMN banners.local IS 'Local onde o banner será exibido: geral, home, guia_comercial, noticias, eventos, classificados, contato';

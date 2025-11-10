-- Migration: Add 'local' column to 'banners' table
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS local VARCHAR(50) DEFAULT 'geral' CHECK (local IN ('geral', 'home', 'guia_comercial', 'noticias', 'eventos', 'classificados'));

-- Adicionar comentário para documentação
COMMENT ON COLUMN banners.local IS 'Local onde o banner será exibido: geral, home, guia_comercial, noticias, eventos, classificados';

-- Criar índice para melhorar performance nas buscas
CREATE INDEX IF NOT EXISTS idx_banners_local_posicao ON banners(local, posicao, ativo);
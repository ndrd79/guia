-- Migration: Add 'tempo_exibicao' column to 'banners' table
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS tempo_exibicao INTEGER DEFAULT 5 CHECK (tempo_exibicao > 0);

-- Adicionar comentário para documentação
COMMENT ON COLUMN banners.tempo_exibicao IS 'Tempo de exibição do banner em segundos (mínimo 1 segundo)';
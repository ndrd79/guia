-- Migração para adicionar dimensões aos banners
-- Execute este script no Supabase SQL Editor

-- Adicionar colunas de largura e altura na tabela banners
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS largura INTEGER DEFAULT 400,
ADD COLUMN IF NOT EXISTS altura INTEGER DEFAULT 200;

-- Atualizar banners existentes com dimensões padrão (caso não tenham)
UPDATE banners 
SET largura = 400, altura = 200 
WHERE largura IS NULL OR altura IS NULL;

-- Comentário sobre as dimensões
COMMENT ON COLUMN banners.largura IS 'Largura do banner em pixels (50-2000px)';
COMMENT ON COLUMN banners.altura IS 'Altura do banner em pixels (50-1000px)';

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'banners' 
AND column_name IN ('largura', 'altura');
-- Adicionar campos de crédito da foto e fonte da notícia
ALTER TABLE public.noticias 
ADD COLUMN IF NOT EXISTS credito_foto VARCHAR(255),
ADD COLUMN IF NOT EXISTS fonte VARCHAR(500);
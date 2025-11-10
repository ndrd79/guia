-- Migração para adicionar campos de ordenação e métricas aos banners
-- Execute este script no Supabase SQL Editor

-- Adicionar coluna de ordem/prioridade
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Adicionar colunas de métricas
ALTER TABLE banners 
ADD COLUMN IF NOT EXISTS clicks INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS impressions INTEGER DEFAULT 0;

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_banners_ordem ON banners(ordem);
CREATE INDEX IF NOT EXISTS idx_banners_clicks ON banners(clicks);
CREATE INDEX IF NOT EXISTS idx_banners_views ON banners(views);
CREATE INDEX IF NOT EXISTS idx_banners_impressions ON banners(impressions);

-- Comentários de documentação
COMMENT ON COLUMN banners.ordem IS 'Prioridade de exibição (menor aparece primeiro)';
COMMENT ON COLUMN banners.clicks IS 'Total de cliques registrados para o banner';
COMMENT ON COLUMN banners.views IS 'Total de visualizações do banner (legado)';
COMMENT ON COLUMN banners.impressions IS 'Total de impressões do banner (preferível)';

-- Sincronizar valores iniciais: se views existir e impressions for zero, copiar
UPDATE banners SET impressions = views WHERE impressions = 0 AND views IS NOT NULL;
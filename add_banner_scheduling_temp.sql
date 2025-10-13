-- Adicionar campos de agendamento na tabela banners
-- Permite definir período de exibição automática dos banners

ALTER TABLE banners 
ADD COLUMN data_inicio TIMESTAMPTZ NULL,
ADD COLUMN data_fim TIMESTAMPTZ NULL;

-- Comentários para documentar os campos
COMMENT ON COLUMN banners.data_inicio IS 'Data e hora de início da exibição do banner (opcional)';
COMMENT ON COLUMN banners.data_fim IS 'Data e hora de fim da exibição do banner (opcional)';

-- Índices para melhorar performance das consultas de agendamento
CREATE INDEX idx_banners_data_inicio ON banners(data_inicio) WHERE data_inicio IS NOT NULL;
CREATE INDEX idx_banners_data_fim ON banners(data_fim) WHERE data_fim IS NOT NULL;
CREATE INDEX idx_banners_agendamento ON banners(ativo, data_inicio, data_fim) WHERE ativo = true;

-- Constraint para garantir que data_fim seja posterior a data_inicio
ALTER TABLE banners 
ADD CONSTRAINT chk_banner_periodo_valido 
CHECK (data_fim IS NULL OR data_inicio IS NULL OR data_fim > data_inicio);
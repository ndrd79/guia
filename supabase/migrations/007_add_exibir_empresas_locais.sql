-- Adicionar campo para controlar visibilidade na página empresas-locais
ALTER TABLE empresas 
ADD COLUMN exibir_em_empresas_locais BOOLEAN DEFAULT false;

-- Comentário explicativo
COMMENT ON COLUMN empresas.exibir_em_empresas_locais IS 'Controla se a empresa aparece na página /empresas-locais';

-- Criar índice para melhor performance nas consultas
CREATE INDEX idx_empresas_exibir_locais ON empresas(exibir_em_empresas_locais) WHERE exibir_em_empresas_locais = true;

-- Atualizar empresas existentes para aparecerem na página (opcional - pode ser removido se preferir começar com todas ocultas)
UPDATE empresas 
SET exibir_em_empresas_locais = true 
WHERE ativo = true AND plan_type = 'basic';
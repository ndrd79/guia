-- Migração para adicionar sistema de planos premium
-- Data: 2024-01-XX
-- Descrição: Adiciona campos plan_type e premium_expires_at na tabela empresas

-- Criar enum para tipos de plano
CREATE TYPE plan_type_enum AS ENUM ('basic', 'premium');

-- Adicionar colunas na tabela empresas
ALTER TABLE empresas 
ADD COLUMN plan_type plan_type_enum DEFAULT 'basic' NOT NULL,
ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para otimizar consultas
CREATE INDEX idx_empresas_plan_type ON empresas(plan_type);
CREATE INDEX idx_empresas_premium_expires ON empresas(premium_expires_at) WHERE premium_expires_at IS NOT NULL;
CREATE INDEX idx_empresas_category_plan ON empresas(category, plan_type);

-- Comentários para documentação
COMMENT ON COLUMN empresas.plan_type IS 'Tipo de plano da empresa: basic (listagem por categoria) ou premium (página individual)';
COMMENT ON COLUMN empresas.premium_expires_at IS 'Data de expiração do plano premium. NULL para planos básicos ou premium sem expiração';

-- Função para verificar se o plano premium expirou
CREATE OR REPLACE FUNCTION check_premium_expired()
RETURNS TRIGGER AS $$
BEGIN
    -- Se o plano é premium e a data de expiração passou, mudar para básico
    IF NEW.plan_type = 'premium' 
       AND NEW.premium_expires_at IS NOT NULL 
       AND NEW.premium_expires_at < NOW() THEN
        NEW.plan_type = 'basic';
        NEW.premium_expires_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para verificar expiração automaticamente
CREATE TRIGGER trigger_check_premium_expired
    BEFORE UPDATE ON empresas
    FOR EACH ROW
    EXECUTE FUNCTION check_premium_expired();

-- Função para expirar planos premium automaticamente (para ser executada periodicamente)
CREATE OR REPLACE FUNCTION expire_premium_plans()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    UPDATE empresas 
    SET plan_type = 'basic', 
        premium_expires_at = NULL
    WHERE plan_type = 'premium' 
      AND premium_expires_at IS NOT NULL 
      AND premium_expires_at < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Comentário na função
COMMENT ON FUNCTION expire_premium_plans() IS 'Função para expirar planos premium automaticamente. Retorna o número de empresas que tiveram o plano expirado.';

-- Atualizar estatísticas da tabela
ANALYZE empresas;
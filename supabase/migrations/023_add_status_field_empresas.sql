-- Migração para adicionar campo status na tabela empresas
-- Data: 2024-01-XX
-- Descrição: Adiciona campo status para controle de moderação de empresas vindas do Google Forms

-- Criar enum para status de moderação
CREATE TYPE empresa_status_enum AS ENUM ('pending', 'approved', 'rejected');

-- Adicionar coluna status na tabela empresas
ALTER TABLE empresas 
ADD COLUMN status empresa_status_enum DEFAULT 'approved' NOT NULL;

-- Adicionar campos específicos para integração com Google Forms
ALTER TABLE empresas 
ADD COLUMN whatsapp VARCHAR(20),
ADD COLUMN horario_funcionamento_dias VARCHAR(100),
ADD COLUMN horario_funcionamento_horario VARCHAR(100),
ADD COLUMN facebook VARCHAR(255),
ADD COLUMN instagram VARCHAR(255),
ADD COLUMN maps TEXT,
ADD COLUMN user_source VARCHAR(50),
ADD COLUMN cidade VARCHAR(100),
ADD COLUMN form_submission_id VARCHAR(255),
ADD COLUMN submitted_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para otimizar consultas
CREATE INDEX idx_empresas_status ON empresas(status);
CREATE INDEX idx_empresas_status_created ON empresas(status, created_at DESC);
CREATE INDEX idx_empresas_cidade ON empresas(cidade);
CREATE INDEX idx_empresas_user_source ON empresas(user_source);
CREATE INDEX idx_empresas_submitted_at ON empresas(submitted_at DESC);

-- Comentários para documentação
COMMENT ON COLUMN empresas.status IS 'Status de moderação: pending (aguardando aprovação), approved (aprovada), rejected (rejeitada)';
COMMENT ON COLUMN empresas.whatsapp IS 'Número do WhatsApp da empresa';
COMMENT ON COLUMN empresas.horario_funcionamento_dias IS 'Dias de funcionamento (ex: Seg a Sáb)';
COMMENT ON COLUMN empresas.horario_funcionamento_horario IS 'Horário de funcionamento (ex: 8h às 18h)';
COMMENT ON COLUMN empresas.facebook IS 'Username do Facebook';
COMMENT ON COLUMN empresas.instagram IS 'Username do Instagram';
COMMENT ON COLUMN empresas.maps IS 'Link do Google Maps';
COMMENT ON COLUMN empresas.user_source IS 'Fonte do usuário que cadastrou (noita, whitevision)';
COMMENT ON COLUMN empresas.cidade IS 'Cidade da empresa (Itaperuçu, Rio Branco do Sul)';
COMMENT ON COLUMN empresas.form_submission_id IS 'ID único da submissão do Google Forms';
COMMENT ON COLUMN empresas.submitted_at IS 'Data e hora da submissão do formulário';

-- Atualizar política RLS para considerar status
DROP POLICY IF EXISTS "Empresas ativas são visíveis publicamente" ON empresas;

-- Nova política que considera tanto ativo quanto status aprovado
CREATE POLICY "Empresas aprovadas e ativas são visíveis publicamente" ON empresas
    FOR SELECT USING (ativo = true AND status = 'approved');

-- Política para admins verem todas as empresas
CREATE POLICY "Admins podem ver todas as empresas" ON empresas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Política para admins gerenciarem empresas
CREATE POLICY "Admins podem gerenciar empresas" ON empresas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Função para aprovar empresa
CREATE OR REPLACE FUNCTION approve_empresa(empresa_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE empresas 
    SET status = 'approved', 
        updated_at = NOW()
    WHERE id = empresa_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para rejeitar empresa
CREATE OR REPLACE FUNCTION reject_empresa(empresa_id UUID, reason TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
    UPDATE empresas 
    SET status = 'rejected', 
        updated_at = NOW()
    WHERE id = empresa_id;
    
    -- Aqui poderia adicionar log do motivo da rejeição se necessário
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verificar se as colunas foram adicionadas
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND column_name IN ('status', 'whatsapp', 'horario_funcionamento_dias', 'horario_funcionamento_horario', 'facebook', 'instagram', 'maps', 'user_source', 'cidade', 'form_submission_id', 'submitted_at');

-- Verificar distribuição de status
SELECT 
    status,
    COUNT(*) as total
FROM empresas 
GROUP BY status
ORDER BY status;
-- Migração para Sistema de Planos Premium
-- Adiciona campos plan_type e premium_expires_at na tabela empresas

-- Criar enum para tipos de plano
CREATE TYPE plan_type_enum AS ENUM ('basic', 'premium');

-- Adicionar campos na tabela empresas
ALTER TABLE empresas 
ADD COLUMN plan_type plan_type_enum DEFAULT 'basic' NOT NULL,
ADD COLUMN premium_expires_at TIMESTAMP WITH TIME ZONE;

-- Criar índices para performance
CREATE INDEX idx_empresas_plan_type ON empresas(plan_type);
CREATE INDEX idx_empresas_premium_expires ON empresas(premium_expires_at) WHERE plan_type = 'premium';
CREATE INDEX idx_empresas_category_plan ON empresas(category, plan_type);

-- Criar tabela de histórico de planos
CREATE TABLE plan_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    empresa_id UUID REFERENCES empresas(id) ON DELETE CASCADE,
    old_plan_type plan_type_enum,
    new_plan_type plan_type_enum NOT NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    changed_by VARCHAR(255),
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para histórico
CREATE INDEX idx_plan_history_empresa_id ON plan_history(empresa_id);
CREATE INDEX idx_plan_history_changed_at ON plan_history(changed_at DESC);

-- Função para migração automática de planos expirados
CREATE OR REPLACE FUNCTION migrate_expired_premium_plans()
RETURNS void AS $$
BEGIN
    -- Inserir no histórico antes de atualizar
    INSERT INTO plan_history (empresa_id, old_plan_type, new_plan_type, reason)
    SELECT id, 'premium', 'basic', 'Automatic migration - plan expired'
    FROM empresas 
    WHERE plan_type = 'premium' 
    AND premium_expires_at < NOW();
    
    -- Atualizar empresas premium expiradas para básico
    UPDATE empresas 
    SET plan_type = 'basic',
        premium_expires_at = NULL,
        updated_at = NOW()
    WHERE plan_type = 'premium' 
    AND premium_expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se plano premium está ativo
CREATE OR REPLACE FUNCTION is_premium_active(empresa_id UUID)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM empresas 
        WHERE id = empresa_id 
        AND plan_type = 'premium' 
        AND (premium_expires_at IS NULL OR premium_expires_at > NOW())
    );
END;
$$ LANGUAGE plpgsql;

-- Trigger para executar migração automática (executar manualmente quando necessário)
CREATE OR REPLACE FUNCTION trigger_plan_migration()
RETURNS trigger AS $$
BEGIN
    PERFORM migrate_expired_premium_plans();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Políticas RLS para planos (verificar se já existem antes de criar)
DO $$
BEGIN
    -- Verificar se a política já existe antes de criar
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'empresas' 
        AND policyname = 'Public can view active empresas'
    ) THEN
        CREATE POLICY "Public can view active empresas" ON empresas
            FOR SELECT USING (ativo = true);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'empresas' 
        AND policyname = 'Admins can manage all empresas'
    ) THEN
        CREATE POLICY "Admins can manage all empresas" ON empresas
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM auth.users 
                    WHERE auth.users.id = auth.uid() 
                    AND auth.users.email LIKE '%@admin.%'
                )
            );
    END IF;
END $$;

-- Política para histórico de planos (apenas admins)
ALTER TABLE plan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view plan history" ON plan_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.email LIKE '%@admin.%'
        )
    );

-- Grants para roles
GRANT SELECT ON empresas TO anon;
GRANT ALL PRIVILEGES ON empresas TO authenticated;
GRANT SELECT ON plan_history TO authenticated;

-- Verificar se as colunas foram adicionadas
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'empresas' 
AND column_name IN ('plan_type', 'premium_expires_at');

-- Verificar distribuição de planos
SELECT 
    plan_type,
    COUNT(*) as total,
    COUNT(CASE WHEN premium_expires_at > NOW() THEN 1 END) as premium_ativo,
    COUNT(CASE WHEN premium_expires_at <= NOW() THEN 1 END) as premium_expirado
FROM empresas 
GROUP BY plan_type;

-- Dados iniciais para teste (apenas se não existirem empresas)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM empresas LIMIT 1) THEN
        INSERT INTO empresas (name, description, category, plan_type, premium_expires_at, ativo) VALUES
        ('Empresa Premium Teste', 'Empresa com plano premium ativo para testes', 'Tecnologia', 'premium', NOW() + INTERVAL '30 days', true),
        ('Empresa Básica Teste', 'Empresa com plano básico para testes', 'Comércio', 'basic', NULL, true);
    END IF;
END $$;
-- Adicionar campo role na tabela user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator'));

-- Atualizar política RLS para banner_settings para usar campo role correto
DROP POLICY IF EXISTS "Permitir gerenciamento de configurações para admins" ON banner_settings;
CREATE POLICY "Permitir gerenciamento de configurações para admins" ON banner_settings
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Atualizar políticas RLS das tabelas de banners para usar campo role
DROP POLICY IF EXISTS "Permitir gerenciamento completo para administradores" ON banner_slots;
CREATE POLICY "Permitir gerenciamento completo para administradores" ON banner_slots
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "Permitir gerenciamento de templates para admins" ON banner_templates;
CREATE POLICY "Permitir gerenciamento de templates para admins" ON banner_templates
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM user_profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- Criar índice para melhorar performance das queries com role
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- Atualizar comentário do campo role
COMMENT ON COLUMN user_profiles.role IS 'Função do usuário: user, admin, ou moderator';
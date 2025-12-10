-- SQL para resolver o problema de acesso administrativo
-- Execute este código no SQL Editor do Supabase

-- 1. Verificar se a tabela profiles existe e sua estrutura
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles';

-- 2. Verificar se o usuário existe na tabela profiles
SELECT id, email, role, created_at, updated_at 
FROM profiles 
WHERE id = '2b1f63f0-192e-4818-8f9f-6f9713b05780';

-- 3. Se a tabela não existir, criar com estrutura correta
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Atualizar ou inserir o perfil do usuário como admin
INSERT INTO profiles (id, email, role, updated_at) 
VALUES ('2b1f63f0-192e-4818-8f9f-6f9713b05780', 'admin@portal.com', 'admin', NOW())
ON CONFLICT (id) DO UPDATE SET 
    role = 'admin',
    email = 'admin@portal.com',
    updated_at = NOW();

-- 5. Verificar políticas de segurança (RLS)
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- 6. Criar políticas de segurança necessárias
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados lerem seus próprios perfis
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Política para usuários autenticados atualizarem seus próprios perfis
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política para admins gerenciarem todos os perfis (opcional)
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- 7. Verificar se a atualização funcionou
SELECT id, email, role 
FROM profiles 
WHERE id = '2b1f63f0-192e-4818-8f9f-6f9713b05780';

-- 8. Conceder permissões básicas para anon e authenticated
GRANT SELECT ON profiles TO anon;
GRANT SELECT, UPDATE ON profiles TO authenticated;

-- 9. Mensagem de sucesso
SELECT '✅ Configuração completa! Usuário agora é administrador.' as status;
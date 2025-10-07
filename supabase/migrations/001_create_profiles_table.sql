-- Criar tabela de perfis de usuário
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários vejam apenas seu próprio perfil
CREATE POLICY "Usuários podem ver apenas seu próprio perfil" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para permitir que usuários atualizem apenas seu próprio perfil
CREATE POLICY "Usuários podem atualizar apenas seu próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para permitir inserção de novos perfis
CREATE POLICY "Permitir inserção de perfis" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Função para criar perfil automaticamente quando um usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir perfil admin para o usuário existente (se existir)
INSERT INTO profiles (id, email, role)
SELECT id, email, 'admin'
FROM auth.users
WHERE email = 'admin@portal.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin';
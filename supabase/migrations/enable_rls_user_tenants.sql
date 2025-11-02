-- Habilitar RLS na tabela user_tenants
-- Esta tabela tem políticas RLS mas o RLS não está habilitado

ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

-- Verificar se RLS foi habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_tenants' AND schemaname = 'public';
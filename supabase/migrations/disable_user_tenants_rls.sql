-- Desabilitar RLS temporariamente para user_tenants para resolver recursão

-- Desabilitar RLS na tabela user_tenants
ALTER TABLE public.user_tenants DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas da tabela user_tenants
DROP POLICY IF EXISTS "user_tenants_select_policy" ON public.user_tenants;
DROP POLICY IF EXISTS "Allow authenticated users to view tenant relationships" ON public.user_tenants;
DROP POLICY IF EXISTS "Users can view their own tenant relationships" ON public.user_tenants;
DROP POLICY IF EXISTS "Users can manage their own tenant relationships" ON public.user_tenants;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_tenants;

-- Comentário explicativo
COMMENT ON TABLE public.user_tenants IS 'RLS temporariamente desabilitado para resolver recursão infinita';
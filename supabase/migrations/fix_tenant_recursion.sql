-- Corrigir recursão infinita nas políticas RLS

-- Primeiro, desabilitar RLS temporariamente para limpar políticas problemáticas
ALTER TABLE public.user_tenants DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas existentes de user_tenants
DROP POLICY IF EXISTS "Allow authenticated users to view tenant relationships" ON public.user_tenants;
DROP POLICY IF EXISTS "Users can view their own tenant relationships" ON public.user_tenants;
DROP POLICY IF EXISTS "Users can manage their own tenant relationships" ON public.user_tenants;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_tenants;

-- Reabilitar RLS
ALTER TABLE public.user_tenants ENABLE ROW LEVEL SECURITY;

-- Criar política simples sem recursão para user_tenants
CREATE POLICY "user_tenants_select_policy" ON public.user_tenants 
FOR SELECT USING (
  auth.uid() = user_id OR 
  auth.role() = 'service_role'
);

-- Remover e recriar políticas para notícias sem dependência de tenant
DROP POLICY IF EXISTS "Allow public read access" ON public.noticias;

-- Política para notícias que permite leitura pública de notícias publicadas
CREATE POLICY "Allow public read access" ON public.noticias 
FOR SELECT USING (
  workflow_status = 'published' OR 
  auth.role() = 'service_role'
);

-- Política para empresas (manter simples)
DROP POLICY IF EXISTS "Allow public read access" ON public.empresas;
CREATE POLICY "Allow public read access" ON public.empresas 
FOR SELECT USING (true);

-- Política para classificados
DROP POLICY IF EXISTS "Allow public read access" ON public.classificados;
CREATE POLICY "Allow public read access" ON public.classificados 
FOR SELECT USING (true);

-- Política para eventos
DROP POLICY IF EXISTS "Allow public read access" ON public.eventos;
CREATE POLICY "Allow public read access" ON public.eventos 
FOR SELECT USING (true);

-- Política para banners
DROP POLICY IF EXISTS "Allow public read access" ON public.banners;
CREATE POLICY "Allow public read access" ON public.banners 
FOR SELECT USING (true);
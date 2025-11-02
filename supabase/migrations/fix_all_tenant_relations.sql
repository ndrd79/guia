-- Corrigir todas as tabelas que têm relação com tenants para evitar recursão

-- Desabilitar RLS temporariamente em tenants também
ALTER TABLE public.tenants DISABLE ROW LEVEL SECURITY;

-- Remover todas as políticas de tenants
DROP POLICY IF EXISTS "Allow public read access" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their own tenants" ON public.tenants;
DROP POLICY IF EXISTS "Users can manage their own tenants" ON public.tenants;

-- Criar políticas simples para todas as tabelas principais sem verificação de tenant

-- Banners - acesso público
DROP POLICY IF EXISTS "Allow public read access" ON public.banners;
CREATE POLICY "Allow public read access" ON public.banners 
FOR SELECT USING (ativo = true);

-- Notícias - acesso público para publicadas
DROP POLICY IF EXISTS "Allow public read access" ON public.noticias;
CREATE POLICY "Allow public read access" ON public.noticias 
FOR SELECT USING (workflow_status = 'published');

-- Empresas - acesso público
DROP POLICY IF EXISTS "Allow public read access" ON public.empresas;
CREATE POLICY "Allow public read access" ON public.empresas 
FOR SELECT USING (true);

-- Classificados - acesso público
DROP POLICY IF EXISTS "Allow public read access" ON public.classificados;
CREATE POLICY "Allow public read access" ON public.classificados 
FOR SELECT USING (true);

-- Eventos - acesso público
DROP POLICY IF EXISTS "Allow public read access" ON public.eventos;
CREATE POLICY "Allow public read access" ON public.eventos 
FOR SELECT USING (true);

-- Comentários para documentar
COMMENT ON TABLE public.tenants IS 'RLS temporariamente desabilitado para resolver recursão infinita';
COMMENT ON TABLE public.user_tenants IS 'RLS temporariamente desabilitado para resolver recursão infinita';
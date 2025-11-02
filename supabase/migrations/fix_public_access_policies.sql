-- Corrigir políticas RLS para permitir acesso público de leitura

-- Remover políticas existentes que podem estar causando recursão
DROP POLICY IF EXISTS "Allow public read access" ON public.empresas;
DROP POLICY IF EXISTS "Allow public read access" ON public.noticias;
DROP POLICY IF EXISTS "Allow public read access" ON public.classificados;
DROP POLICY IF EXISTS "Allow public read access" ON public.eventos;
DROP POLICY IF EXISTS "Allow public read access" ON public.banners;

-- Verificar e corrigir políticas problemáticas em user_tenants
DROP POLICY IF EXISTS "Users can view their own tenant relationships" ON public.user_tenants;
DROP POLICY IF EXISTS "Users can manage their own tenant relationships" ON public.user_tenants;

-- Criar políticas simples e diretas para leitura pública
CREATE POLICY "Allow public read access" ON public.empresas 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.noticias 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.classificados 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.eventos 
FOR SELECT USING (true);

CREATE POLICY "Allow public read access" ON public.banners 
FOR SELECT USING (true);

-- Criar política simples para user_tenants sem recursão
CREATE POLICY "Allow authenticated users to view tenant relationships" ON public.user_tenants 
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Comentários para documentar as mudanças
COMMENT ON POLICY "Allow public read access" ON public.empresas IS 'Permite leitura pública de empresas';
COMMENT ON POLICY "Allow public read access" ON public.noticias IS 'Permite leitura pública de notícias';
COMMENT ON POLICY "Allow public read access" ON public.classificados IS 'Permite leitura pública de classificados';
COMMENT ON POLICY "Allow public read access" ON public.eventos IS 'Permite leitura pública de eventos';
COMMENT ON POLICY "Allow public read access" ON public.banners IS 'Permite leitura pública de banners';
COMMENT ON POLICY "Allow authenticated users to view tenant relationships" ON public.user_tenants IS 'Permite usuários autenticados verem suas próprias relações de tenant';
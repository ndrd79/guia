-- Migração para corrigir problema de RLS na tabela banner_analytics
-- Problema: Políticas RLS existem mas RLS não está habilitado

-- 1. Habilitar Row Level Security na tabela banner_analytics
ALTER TABLE public.banner_analytics ENABLE ROW LEVEL SECURITY;

-- 2. Adicionar comentário sobre a correção
COMMENT ON TABLE public.banner_analytics IS 'Tabela para armazenar eventos de analytics dos banners (impressões e cliques) - RLS habilitado';

-- 3. Verificar políticas existentes (estas queries são apenas para documentação)
-- As políticas "Permitir inserção de analytics" e "Permitir leitura para admins" já existem

-- 4. Criar políticas adicionais se necessário para garantir segurança completa

-- Política para permitir inserção de analytics (anônimos e autenticados)
-- Esta política permite que o sistema registre analytics de qualquer usuário
DROP POLICY IF EXISTS "Permitir inserção de analytics" ON public.banner_analytics;
CREATE POLICY "Permitir inserção de analytics" ON public.banner_analytics
    FOR INSERT 
    TO public, anon, authenticated
    WITH CHECK (true);

-- Política para permitir leitura apenas para admins
-- Esta política garante que apenas usuários com role admin possam ler os dados
DROP POLICY IF EXISTS "Permitir leitura para admins" ON public.banner_analytics;
CREATE POLICY "Permitir leitura para admins" ON public.banner_analytics
    FOR SELECT 
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'super_admin'
        )
    );

-- 5. Criar índices para performance das políticas
CREATE INDEX IF NOT EXISTS idx_banner_analytics_banner_id ON public.banner_analytics(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_created_at ON public.banner_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_tipo ON public.banner_analytics(tipo);

-- 6. Queries de verificação (para executar após a migração)
-- SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE tablename = 'banner_analytics';
-- SELECT policyname, cmd, roles FROM pg_policies WHERE schemaname = 'public' AND tablename = 'banner_analytics';
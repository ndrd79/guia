-- =====================================================
-- CORREÇÃO CRÍTICA DE SEGURANÇA RLS
-- =====================================================
-- Este script corrige vulnerabilidades críticas de segurança
-- habilitando RLS e criando políticas apropriadas para tabelas expostas
-- 
-- PROBLEMA: Tabelas públicas sem RLS permitem acesso total via API
-- SOLUÇÃO: Habilitar RLS + Políticas de segurança apropriadas
-- =====================================================

-- 1. HABILITAR RLS NAS TABELAS VULNERÁVEIS
-- =====================================================

-- Habilitar RLS na tabela workflow_comments
ALTER TABLE public.workflow_comments ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela news_versions  
ALTER TABLE public.news_versions ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela news_activity_log
ALTER TABLE public.news_activity_log ENABLE ROW LEVEL SECURITY;

-- Habilitar RLS na tabela news_analytics
ALTER TABLE public.news_analytics ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS RLS PARA WORKFLOW_COMMENTS
-- =====================================================
-- Acesso restrito apenas para usuários autenticados

-- Política de leitura: apenas usuários autenticados
CREATE POLICY "workflow_comments_select_policy" ON public.workflow_comments
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política de inserção: apenas usuários autenticados
CREATE POLICY "workflow_comments_insert_policy" ON public.workflow_comments
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política de atualização: apenas usuários autenticados
CREATE POLICY "workflow_comments_update_policy" ON public.workflow_comments
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política de exclusão: apenas usuários autenticados
CREATE POLICY "workflow_comments_delete_policy" ON public.workflow_comments
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 3. POLÍTICAS RLS PARA NEWS_VERSIONS
-- =====================================================
-- Acesso restrito apenas para usuários autenticados

-- Política de leitura: apenas usuários autenticados
CREATE POLICY "news_versions_select_policy" ON public.news_versions
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política de inserção: apenas usuários autenticados
CREATE POLICY "news_versions_insert_policy" ON public.news_versions
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política de atualização: apenas usuários autenticados
CREATE POLICY "news_versions_update_policy" ON public.news_versions
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política de exclusão: apenas usuários autenticados
CREATE POLICY "news_versions_delete_policy" ON public.news_versions
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 4. POLÍTICAS RLS PARA NEWS_ACTIVITY_LOG
-- =====================================================
-- Acesso restrito apenas para usuários autenticados

-- Política de leitura: apenas usuários autenticados
CREATE POLICY "news_activity_log_select_policy" ON public.news_activity_log
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Política de inserção: apenas usuários autenticados
CREATE POLICY "news_activity_log_insert_policy" ON public.news_activity_log
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política de atualização: apenas usuários autenticados
CREATE POLICY "news_activity_log_update_policy" ON public.news_activity_log
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política de exclusão: apenas usuários autenticados
CREATE POLICY "news_activity_log_delete_policy" ON public.news_activity_log
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- 5. POLÍTICAS RLS PARA NEWS_ANALYTICS
-- =====================================================
-- Leitura pública permitida, escrita apenas para autenticados

-- Política de leitura: acesso público para analytics
CREATE POLICY "news_analytics_select_policy" ON public.news_analytics
    FOR SELECT 
    USING (true); -- Permite leitura pública para analytics

-- Política de inserção: apenas usuários autenticados
CREATE POLICY "news_analytics_insert_policy" ON public.news_analytics
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política de atualização: apenas usuários autenticados
CREATE POLICY "news_analytics_update_policy" ON public.news_analytics
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política de exclusão: apenas usuários autenticados
CREATE POLICY "news_analytics_delete_policy" ON public.news_analytics
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- FIM DO SCRIPT DE CORREÇÃO DE SEGURANÇA RLS
-- =====================================================
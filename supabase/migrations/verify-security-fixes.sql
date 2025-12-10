-- =====================================================
-- SCRIPT DE VERIFICAÇÃO DE SEGURANÇA
-- =====================================================
-- Data: 30/01/2025
-- Descrição: Verifica se todas as correções de segurança foram aplicadas
-- =====================================================

-- 1. VERIFICAR FUNÇÕES COM SEARCH_PATH CORRIGIDO
-- =====================================================
SELECT 
    '🔍 VERIFICAÇÃO DE FUNÇÕES' as categoria,
    proname as function_name,
    CASE 
        WHEN 'search_path=''' = ANY(proconfig) THEN '✅ CORRIGIDO'
        ELSE '❌ VULNERÁVEL'
    END as status,
    CASE 
        WHEN 'search_path=''' = ANY(proconfig) THEN 'search_path definido como vazio'
        ELSE 'search_path não definido - VULNERÁVEL'
    END as detalhes
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND proname IN (
    'update_banner_video_analytics_updated_at',
    'update_video_ads_updated_at', 
    'get_video_ad_analytics_summary',
    'update_updated_at_column',
    'get_active_video_ads'
)
ORDER BY proname;

-- 2. VERIFICAR RLS HABILITADO NAS TABELAS CRÍTICAS
-- =====================================================
SELECT 
    '🛡️ VERIFICAÇÃO DE RLS' as categoria,
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ATIVO'
        ELSE '❌ RLS INATIVO'
    END as rls_status,
    CASE 
        WHEN rowsecurity THEN 'Tabela protegida por RLS'
        ELSE 'Tabela SEM proteção RLS - VULNERÁVEL'
    END as detalhes
FROM pg_tables t
JOIN pg_class c ON c.relname = t.tablename
WHERE schemaname = 'public'
AND tablename IN ('banners', 'banner_positions', 'noticias', 'empresas', 'classificados', 'eventos')
ORDER BY tablename;

-- 3. VERIFICAR POLÍTICAS RLS EXISTENTES
-- =====================================================
SELECT 
    '📋 POLÍTICAS RLS' as categoria,
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN cmd = 'ALL' THEN '🔓 TODAS OPERAÇÕES'
        WHEN cmd = 'SELECT' THEN '👁️ LEITURA'
        WHEN cmd = 'INSERT' THEN '➕ INSERÇÃO'
        WHEN cmd = 'UPDATE' THEN '✏️ ATUALIZAÇÃO'
        WHEN cmd = 'DELETE' THEN '🗑️ EXCLUSÃO'
    END as operacao,
    CASE 
        WHEN permissive = 'PERMISSIVE' THEN '✅ PERMISSIVA'
        ELSE '🚫 RESTRITIVA'
    END as tipo
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. RESUMO GERAL DE SEGURANÇA
-- =====================================================
WITH security_summary AS (
    -- Contar funções corrigidas
    SELECT 
        COUNT(*) as total_functions,
        COUNT(*) FILTER (WHERE 'search_path=''' = ANY(proconfig)) as fixed_functions
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public' 
    AND proname IN (
        'update_banner_video_analytics_updated_at',
        'update_video_ads_updated_at', 
        'get_video_ad_analytics_summary',
        'update_updated_at_column',
        'get_active_video_ads'
    )
),
rls_summary AS (
    -- Contar tabelas com RLS
    SELECT 
        COUNT(*) as total_tables,
        COUNT(*) FILTER (WHERE rowsecurity) as rls_enabled_tables
    FROM pg_tables t
    JOIN pg_class c ON c.relname = t.tablename
    WHERE schemaname = 'public'
    AND tablename IN ('banners', 'banner_positions', 'noticias', 'empresas', 'classificados', 'eventos')
)
SELECT 
    '📊 RESUMO DE SEGURANÇA' as categoria,
    CONCAT(
        '🔧 Funções: ', s.fixed_functions, '/', s.total_functions, ' corrigidas | ',
        '🛡️ RLS: ', r.rls_enabled_tables, '/', r.total_tables, ' tabelas protegidas'
    ) as status_geral,
    CASE 
        WHEN s.fixed_functions = s.total_functions AND r.rls_enabled_tables = r.total_tables 
        THEN '✅ TODAS AS CORREÇÕES APLICADAS'
        ELSE '⚠️ CORREÇÕES PENDENTES'
    END as resultado,
    CASE 
        WHEN s.fixed_functions = s.total_functions AND r.rls_enabled_tables = r.total_tables 
        THEN 'Sistema seguro - pronto para produção'
        ELSE 'Verificar correções pendentes'
    END as detalhes
FROM security_summary s
CROSS JOIN rls_summary r;

-- 5. VERIFICAR VERSÃO DO POSTGRESQL
-- =====================================================
SELECT 
    '🐘 VERSÃO POSTGRESQL' as categoria,
    version() as versao_atual,
    CASE 
        WHEN version() LIKE '%17.4.1%' THEN '⚠️ VERSÃO COM PATCHES PENDENTES'
        ELSE '✅ VERSÃO ATUALIZADA'
    END as status,
    'Verificar painel Supabase para upgrade disponível' as acao_recomendada;

-- =====================================================
-- INSTRUÇÕES PARA EXECUÇÃO
-- =====================================================
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Verifique se todos os status mostram ✅
-- 3. Se houver ❌, revise as migrações aplicadas
-- 4. Para configurações de Auth, acesse o painel web
-- =====================================================
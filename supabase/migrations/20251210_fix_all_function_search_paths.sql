-- =====================================================
-- Migration: Corrigir search_path em TODAS as funções
-- Data: 2025-12-10
-- Problema: Function Search Path Mutable (32 warnings)
-- =====================================================

-- Este script corrige a vulnerabilidade "Function Search Path Mutable"
-- definindo search_path = '' para todas as funções públicas

-- ================================================
-- 1. FUNÇÕES DE BANNER
-- ================================================

ALTER FUNCTION IF EXISTS public.update_banner_slots_updated_at() 
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.update_banner_video_analytics_updated_at() 
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.get_active_video_ads()
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.get_video_ad_analytics_summary(uuid)
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.update_video_ads_updated_at()
    SET search_path = '';

-- ================================================
-- 2. FUNÇÕES DE EMPRESA
-- ================================================

ALTER FUNCTION IF EXISTS public.approve_empresa(uuid)
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.reject_empresa(uuid)
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.is_premium_active(uuid)
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.migrate_expired_premium_plans()
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.trigger_plan_migration()
    SET search_path = '';

-- ================================================
-- 3. FUNÇÕES DE TENANT/MULTI-TENANT
-- ================================================

ALTER FUNCTION IF EXISTS public.set_current_tenant_id(uuid)
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.get_current_tenant_id()
    SET search_path = '';

-- ================================================
-- 4. FUNÇÕES DE MEDIA
-- ================================================

ALTER FUNCTION IF EXISTS public.update_media_usage_count()
    SET search_path = '';

-- ================================================
-- 5. FUNÇÕES DE UPDATED_AT (triggers genéricos)
-- ================================================

ALTER FUNCTION IF EXISTS public.update_updated_at_column()
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.set_updated_at()
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.trigger_set_timestamp()
    SET search_path = '';

-- ================================================
-- 6. OUTRAS FUNÇÕES COMUNS
-- ================================================

-- Funções de notícias
ALTER FUNCTION IF EXISTS public.update_noticias_updated_at()
    SET search_path = '';

-- Funções de eventos
ALTER FUNCTION IF EXISTS public.update_eventos_updated_at()
    SET search_path = '';

-- Funções de classificados
ALTER FUNCTION IF EXISTS public.update_classificados_updated_at()
    SET search_path = '';

-- Funções de perfil
ALTER FUNCTION IF EXISTS public.update_profiles_updated_at()
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.handle_new_user()
    SET search_path = '';

-- Funções de audit
ALTER FUNCTION IF EXISTS public.audit_log_trigger()
    SET search_path = '';

ALTER FUNCTION IF EXISTS public.log_action()
    SET search_path = '';

-- ================================================
-- 7. QUERY PARA ENCONTRAR FUNÇÕES RESTANTES
-- ================================================
-- Execute esta query para encontrar funções que ainda precisam de correção:

/*
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    CASE 
        WHEN 'search_path' = ANY(string_to_array(array_to_string(p.proconfig, ','), ','))
        THEN 'CORRIGIDO'
        ELSE 'VULNERÁVEL'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
AND (p.proconfig IS NULL OR NOT 'search_path' = ANY(
    SELECT split_part(unnest(p.proconfig), '=', 1)
))
ORDER BY p.proname;
*/

-- ================================================
-- 8. VERIFICAÇÃO FINAL
-- ================================================

-- Listar todas as funções e seu status de search_path
SELECT 
    p.proname as function_name,
    CASE 
        WHEN p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%'
        THEN '✅ CORRIGIDO'
        ELSE '⚠️ VERIFICAR'
    END as status,
    array_to_string(p.proconfig, ', ') as config
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.prokind = 'f'
ORDER BY 
    CASE WHEN p.proconfig IS NOT NULL AND array_to_string(p.proconfig, ',') LIKE '%search_path%' THEN 1 ELSE 0 END,
    p.proname;

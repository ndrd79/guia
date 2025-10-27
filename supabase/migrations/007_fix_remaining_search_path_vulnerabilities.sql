-- =====================================================
-- CORREÇÃO DAS 5 FUNÇÕES COM SEARCH_PATH VULNERÁVEL
-- =====================================================
-- Data: 30/01/2025
-- Descrição: Corrige as 5 funções específicas identificadas no Security Advisor
-- Referência: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
-- 
-- FUNÇÕES CORRIGIDAS:
-- 1. update_banner_video_analytics_updated_at
-- 2. update_video_ads_updated_at  
-- 3. get_video_ad_analytics_summary
-- 4. update_updated_at_column (se ainda não corrigida)
-- 5. get_active_video_ads
-- =====================================================

-- 1. CORRIGIR update_banner_video_analytics_updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_banner_video_analytics_updated_at()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CORRIGIR update_video_ads_updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_video_ads_updated_at()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. CORRIGIR get_video_ad_analytics_summary
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_video_ad_analytics_summary(
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE(
    total_views BIGINT,
    total_clicks BIGINT,
    total_impressions BIGINT,
    click_through_rate NUMERIC,
    top_performing_ad_id UUID,
    top_performing_ad_title TEXT,
    daily_stats JSON
) 
SET search_path = ''
AS $$
DECLARE
    v_start_date DATE;
    v_end_date DATE;
BEGIN
    -- Definir período padrão se não fornecido (últimos 30 dias)
    v_start_date := COALESCE(p_start_date, CURRENT_DATE - INTERVAL '30 days');
    v_end_date := COALESCE(p_end_date, CURRENT_DATE);
    
    RETURN QUERY
    WITH analytics_summary AS (
        SELECT 
            COALESCE(SUM(va.views), 0) as total_views,
            COALESCE(SUM(va.clicks), 0) as total_clicks,
            COALESCE(SUM(va.impressions), 0) as total_impressions,
            CASE 
                WHEN SUM(va.impressions) > 0 
                THEN ROUND((SUM(va.clicks)::NUMERIC / SUM(va.impressions)::NUMERIC) * 100, 2)
                ELSE 0
            END as ctr
        FROM public.video_ad_analytics va
        WHERE va.date BETWEEN v_start_date AND v_end_date
    ),
    top_ad AS (
        SELECT 
            vads.id,
            vads.title,
            SUM(va.views + va.clicks) as total_engagement
        FROM public.video_ads vads
        LEFT JOIN public.video_ad_analytics va ON vads.id = va.video_ad_id
        WHERE va.date BETWEEN v_start_date AND v_end_date
        GROUP BY vads.id, vads.title
        ORDER BY total_engagement DESC
        LIMIT 1
    ),
    daily_data AS (
        SELECT 
            JSON_AGG(
                JSON_BUILD_OBJECT(
                    'date', va.date,
                    'views', COALESCE(SUM(va.views), 0),
                    'clicks', COALESCE(SUM(va.clicks), 0),
                    'impressions', COALESCE(SUM(va.impressions), 0)
                ) ORDER BY va.date
            ) as daily_stats
        FROM public.video_ad_analytics va
        WHERE va.date BETWEEN v_start_date AND v_end_date
        GROUP BY va.date
    )
    SELECT 
        s.total_views,
        s.total_clicks,
        s.total_impressions,
        s.ctr,
        t.id,
        t.title,
        COALESCE(d.daily_stats, '[]'::JSON)
    FROM analytics_summary s
    CROSS JOIN top_ad t
    CROSS JOIN daily_data d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. GARANTIR QUE update_updated_at_column ESTÁ CORRIGIDA
-- =====================================================
-- Esta função pode já ter sido corrigida na migração anterior
-- Vamos garantir que está com search_path definido
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CORRIGIR get_active_video_ads
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_active_video_ads(
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE(
    id UUID,
    title TEXT,
    description TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    target_url TEXT,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN,
    priority INTEGER,
    created_at TIMESTAMP WITH TIME ZONE
) 
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        va.id,
        va.title,
        va.description,
        va.video_url,
        va.thumbnail_url,
        va.target_url,
        va.start_date,
        va.end_date,
        va.is_active,
        va.priority,
        va.created_at
    FROM public.video_ads va
    WHERE va.is_active = true
    AND (va.start_date IS NULL OR va.start_date <= NOW())
    AND (va.end_date IS NULL OR va.end_date >= NOW())
    ORDER BY va.priority DESC, va.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAÇÕES DE SEGURANÇA
-- =====================================================

-- Verificar se todas as funções vulneráveis foram corrigidas
DO $$
DECLARE
    func_record RECORD;
    missing_functions TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Verificar cada função específica mencionada no Security Advisor
    FOR func_record IN 
        SELECT unnest(ARRAY[
            'update_banner_video_analytics_updated_at',
            'update_video_ads_updated_at',
            'get_video_ad_analytics_summary', 
            'update_updated_at_column',
            'get_active_video_ads'
        ]) as func_name
    LOOP
        -- Verificar se a função existe e tem search_path definido
        IF NOT EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' 
            AND p.proname = func_record.func_name
            AND 'search_path=''' = ANY(p.proconfig)
        ) THEN
            missing_functions := array_append(missing_functions, func_record.func_name);
        END IF;
    END LOOP;
    
    -- Reportar resultado
    IF array_length(missing_functions, 1) > 0 THEN
        RAISE NOTICE 'ATENÇÃO: As seguintes funções ainda precisam ser corrigidas: %', array_to_string(missing_functions, ', ');
    ELSE
        RAISE NOTICE 'SUCESSO: Todas as 5 funções vulneráveis foram corrigidas com search_path definido!';
    END IF;
END;
$$;

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON FUNCTION public.update_banner_video_analytics_updated_at() IS 'Trigger para atualizar updated_at em banner_video_analytics - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.update_video_ads_updated_at() IS 'Trigger para atualizar updated_at em video_ads - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.get_video_ad_analytics_summary(DATE, DATE) IS 'Função para obter resumo de analytics de vídeo ads - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Função genérica para atualizar updated_at - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.get_active_video_ads(INTEGER) IS 'Função para obter vídeo ads ativos - CORRIGIDA: search_path definido';

-- =====================================================
-- IMPORTANTE: AÇÕES PÓS-MIGRAÇÃO
-- =====================================================
-- 1. Executar: SELECT * FROM pg_proc WHERE proname IN ('update_banner_video_analytics_updated_at', 'update_video_ads_updated_at', 'get_video_ad_analytics_summary', 'update_updated_at_column', 'get_active_video_ads') AND 'search_path=''' = ANY(proconfig);
-- 2. Verificar Security Advisor novamente para confirmar que os 5 alertas foram resolvidos
-- 3. Testar as funções para garantir funcionamento correto
-- 4. Monitorar logs para detectar possíveis erros
-- =====================================================
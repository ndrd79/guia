-- =====================================================
-- CORREÇÃO DE VULNERABILIDADES DE SEARCH_PATH
-- =====================================================
-- Data: 30/01/2025
-- Descrição: Corrige vulnerabilidades de search_path mutável em funções
-- Referência: https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
-- 
-- PROBLEMA: Funções sem search_path explícito podem ser exploradas por usuários maliciosos
-- SOLUÇÃO: Adicionar SET search_path = '' e qualificar todas as referências com schema
-- =====================================================

-- 1. CORRIGIR FUNÇÃO update_storage_stats
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_storage_stats()
RETURNS void 
SET search_path = ''
AS $$
BEGIN
    -- Limpar estatísticas antigas (mais de 24 horas)
    DELETE FROM public.storage_stats WHERE recorded_at < NOW() - INTERVAL '24 hours';
    
    -- Inserir estatísticas atuais para notícias
    INSERT INTO public.storage_stats (category, file_count, total_size_mb)
    SELECT 
        'noticias' as category,
        COUNT(*) as file_count,
        COALESCE(SUM(LENGTH(imagem)::bigint) / 1024 / 1024, 0) as total_size_mb
    FROM public.noticias 
    WHERE imagem IS NOT NULL AND imagem != '';
    
    -- Inserir estatísticas atuais para empresas
    INSERT INTO public.storage_stats (category, file_count, total_size_mb)
    SELECT 
        'empresas' as category,
        COUNT(*) as file_count,
        COALESCE(SUM(LENGTH(image)::bigint) / 1024 / 1024, 0) as total_size_mb
    FROM public.empresas 
    WHERE image IS NOT NULL AND image != '';
    
    INSERT INTO public.storage_stats (category, file_count, total_size_mb)
    SELECT 
        'banners' as category,
        COUNT(*) as file_count,
        COALESCE(SUM(LENGTH(imagem)::bigint) / 1024 / 1024, 0) as total_size_mb
    FROM public.banners 
    WHERE imagem IS NOT NULL AND imagem != '';
    
    -- Verificar limites e criar alertas se necessário
    INSERT INTO public.storage_alerts (alert_type, level, message)
    SELECT 
        'storage_limit' as alert_type,
        CASE 
            WHEN total_size > 800 THEN 'critical'
            WHEN total_size > 600 THEN 'warning'
            ELSE 'info'
        END as level,
        'Uso de armazenamento: ' || total_size || 'MB de 1GB disponível' as message
    FROM (
        SELECT SUM(total_size_mb) as total_size
        FROM public.storage_stats 
        WHERE recorded_at > NOW() - INTERVAL '1 hour'
    ) stats
    WHERE NOT EXISTS (
        SELECT 1 FROM public.storage_alerts 
        WHERE alert_type = 'storage_limit' 
        AND resolved = FALSE 
        AND created_at > NOW() - INTERVAL '1 hour'
    );
    
    -- Verificar crescimento anormal
    INSERT INTO public.storage_alerts (alert_type, level, message)
    SELECT 
        'abnormal_growth' as alert_type,
        'warning' as level,
        'Crescimento anormal detectado: +' || growth_mb || 'MB nas últimas 24h' as message
    FROM (
        SELECT 
            COALESCE(current_stats.total_size - previous_stats.total_size, 0) as growth_mb
        FROM (
            SELECT SUM(total_size_mb) as total_size
            FROM public.storage_stats 
            WHERE recorded_at > NOW() - INTERVAL '1 hour'
        ) current_stats
        LEFT JOIN (
            SELECT SUM(total_size_mb) as total_size
            FROM public.storage_stats 
            WHERE recorded_at BETWEEN NOW() - INTERVAL '25 hours' AND NOW() - INTERVAL '23 hours'
        ) previous_stats ON true
    ) growth_check
    WHERE growth_mb > 100 -- Alerta se crescimento > 100MB em 24h
    AND NOT EXISTS (
        SELECT 1 FROM public.storage_alerts 
        WHERE alert_type = 'abnormal_growth' 
        AND resolved = FALSE 
        AND created_at > NOW() - INTERVAL '24 hours'
    );
    
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 2. CORRIGIR FUNÇÃO trigger_update_storage_stats
-- =====================================================
CREATE OR REPLACE FUNCTION public.trigger_update_storage_stats()
RETURNS trigger 
SET search_path = ''
AS $$
BEGIN
    PERFORM public.update_storage_stats();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 3. CORRIGIR FUNÇÃO update_updated_at_column
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. CORRIGIR FUNÇÃO cleanup_old_data
-- =====================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_data()
RETURNS TABLE(
    category TEXT,
    files_removed INTEGER,
    space_freed_mb INTEGER
) 
SET search_path = ''
AS $$
BEGIN
    -- Limpar backups antigos (mais de 30 dias)
    DELETE FROM public.backup_jobs 
    WHERE created_at < NOW() - INTERVAL '30 days' 
    AND status IN ('completed', 'failed');
    
    -- Limpar logs antigos (mais de 7 dias)
    DELETE FROM public.backup_logs 
    WHERE created_at < NOW() - INTERVAL '7 days';
    
    -- Limpar alertas resolvidos antigos (mais de 15 dias)
    DELETE FROM public.storage_alerts 
    WHERE resolved = TRUE 
    AND resolved_at < NOW() - INTERVAL '15 days';
    
    -- Retornar estatísticas de limpeza
    RETURN QUERY
    SELECT 
        'cleanup_completed'::TEXT as category,
        0 as files_removed,
        0 as space_freed_mb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. CORRIGIR FUNÇÃO handle_new_user
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 6. CRIAR FUNÇÃO update_seasonal_themes_updated_at (se não existir)
-- =====================================================
-- Nota: Esta função não foi encontrada no código, mas está listada no Security Advisor
-- Vamos criá-la caso seja necessária para triggers futuros
CREATE OR REPLACE FUNCTION public.update_seasonal_themes_updated_at()
RETURNS TRIGGER 
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- VERIFICAÇÕES DE SEGURANÇA
-- =====================================================

-- Verificar se todas as funções foram atualizadas com search_path
SELECT 
    proname as function_name,
    proconfig as search_path_config
FROM pg_proc 
WHERE proname IN (
    'update_storage_stats',
    'trigger_update_storage_stats', 
    'update_updated_at_column',
    'update_seasonal_themes_updated_at',
    'cleanup_old_data',
    'handle_new_user'
)
AND pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- =====================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================
COMMENT ON FUNCTION public.update_storage_stats() IS 'Função para calcular estatísticas de armazenamento - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.trigger_update_storage_stats() IS 'Trigger para atualizar estatísticas - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.update_updated_at_column() IS 'Função para atualizar campo updated_at - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.cleanup_old_data() IS 'Função para limpeza de dados antigos - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.handle_new_user() IS 'Função para criar perfil de novo usuário - CORRIGIDA: search_path definido';
COMMENT ON FUNCTION public.update_seasonal_themes_updated_at() IS 'Função para atualizar updated_at em seasonal_themes - CRIADA: search_path definido';

-- =====================================================
-- IMPORTANTE: AÇÕES PÓS-MIGRAÇÃO
-- =====================================================
-- 1. Executar novamente o Security Advisor para verificar se as vulnerabilidades foram corrigidas
-- 2. Testar todas as funções para garantir que ainda funcionam corretamente
-- 3. Verificar se os triggers ainda estão funcionando
-- 4. Monitorar logs para detectar possíveis erros
-- =====================================================
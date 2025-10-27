-- =====================================================
-- Migração 013: Otimização de Performance RLS - Sexta Rodada
-- Tabelas de Backup e Storage
-- =====================================================
-- Data: 2024-12-19
-- Objetivo: Resolver 6 alertas de performance RLS para tabelas de backup e storage
-- Problema: Políticas RLS re-avaliando auth.uid() para cada linha
-- Solução: Substituir auth.uid() por (select auth.uid())
-- =====================================================

-- Início da transação
BEGIN;

-- =====================================================
-- 1. TABELA: backup_jobs (2 políticas)
-- =====================================================

-- Remover política existente: "Admins podem gerenciar backup jobs"
DROP POLICY IF EXISTS "Admins podem gerenciar backup jobs" ON public.backup_jobs;

-- Recriar política otimizada: "Admins podem gerenciar backup jobs"
CREATE POLICY "Admins podem gerenciar backup jobs" ON public.backup_jobs
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "Backup jobs visíveis para admins"
DROP POLICY IF EXISTS "Backup jobs visíveis para admins" ON public.backup_jobs;

-- Recriar política otimizada: "Backup jobs visíveis para admins"
CREATE POLICY "Backup jobs visíveis para admins" ON public.backup_jobs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 2. TABELA: backup_files (1 política)
-- =====================================================

-- Remover política existente: "Backup files visíveis para admins"
DROP POLICY IF EXISTS "Backup files visíveis para admins" ON public.backup_files;

-- Recriar política otimizada: "Backup files visíveis para admins"
CREATE POLICY "Backup files visíveis para admins" ON public.backup_files
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 3. TABELA: backup_logs (1 política)
-- =====================================================

-- Remover política existente: "Backup logs visíveis para admins"
DROP POLICY IF EXISTS "Backup logs visíveis para admins" ON public.backup_logs;

-- Recriar política otimizada: "Backup logs visíveis para admins"
CREATE POLICY "Backup logs visíveis para admins" ON public.backup_logs
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- =====================================================
-- 4. TABELA: storage_stats (2 políticas)
-- =====================================================

-- Remover política existente: "Admins podem inserir storage stats"
DROP POLICY IF EXISTS "Admins podem inserir storage stats" ON public.storage_stats;

-- Recriar política otimizada: "Admins podem inserir storage stats"
CREATE POLICY "Admins podem inserir storage stats" ON public.storage_stats
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- Remover política existente: "Storage stats visíveis para admins"
DROP POLICY IF EXISTS "Storage stats visíveis para admins" ON public.storage_stats;

-- Recriar política otimizada: "Storage stats visíveis para admins"
CREATE POLICY "Storage stats visíveis para admins" ON public.storage_stats
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = (select auth.uid()) 
            AND role = 'admin'
        )
    );

-- =====================================================
-- VERIFICAÇÃO DE INTEGRIDADE
-- =====================================================

-- Verificar se todas as 6 políticas foram criadas corretamente
DO $$
DECLARE
    policy_count INTEGER;
BEGIN
    -- Contar políticas otimizadas (devem ser 6)
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename IN ('backup_jobs', 'backup_files', 'backup_logs', 'storage_stats')
    AND policyname IN (
        'Admins podem gerenciar backup jobs',
        'Backup jobs visíveis para admins',
        'Backup files visíveis para admins',
        'Backup logs visíveis para admins',
        'Admins podem inserir storage stats',
        'Storage stats visíveis para admins'
    );
    
    IF policy_count = 6 THEN
        RAISE NOTICE 'SUCESSO: Todas as 6 políticas RLS de backup/storage foram otimizadas com sucesso!';
        RAISE NOTICE 'Políticas otimizadas: backup_jobs (2), backup_files (1), backup_logs (1), storage_stats (2)';
        RAISE NOTICE 'Total de alertas RLS resolvidos: 36 (30 anteriores + 6 novos)';
    ELSE
        RAISE EXCEPTION 'ERRO: Esperadas 6 políticas, encontradas %', policy_count;
    END IF;
END $$;

-- Finalizar transação
COMMIT;

-- =====================================================
-- RESUMO DA MIGRAÇÃO 013
-- =====================================================
-- ✅ backup_jobs: 2 políticas otimizadas
-- ✅ backup_files: 1 política otimizada  
-- ✅ backup_logs: 1 política otimizada
-- ✅ storage_stats: 2 políticas otimizadas
-- ✅ Total: 6 políticas RLS otimizadas
-- ✅ Performance: Eliminação de re-avaliação de auth.uid()
-- ✅ Escalabilidade: Consultas otimizadas para grandes volumes
-- =====================================================
-- =====================================================
-- Migration: Habilitar RLS na tabela banner_templates
-- Data: 2025-12-10
-- Problema: Políticas RLS existem mas RLS não está habilitado
-- =====================================================

-- 1. Habilitar RLS na tabela banner_templates
ALTER TABLE public.banner_templates ENABLE ROW LEVEL SECURITY;

-- 2. Verificar se a política já existe, se não, criar políticas adequadas
-- Política para leitura pública (todos podem ver templates)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'banner_templates' 
        AND policyname = 'Permitir leitura publica de templates'
    ) THEN
        CREATE POLICY "Permitir leitura publica de templates"
            ON public.banner_templates
            FOR SELECT
            TO public
            USING (true);
    END IF;
END $$;

-- Política para admins gerenciarem templates (INSERT, UPDATE, DELETE)
-- Nota: A política "Permitir gerenciamento de templates para admins" já deve existir
-- Vamos garantir que ela está correta
DO $$
BEGIN
    -- Verificar se existe a política de admin
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'banner_templates' 
        AND policyname = 'Permitir gerenciamento de templates para admins'
    ) THEN
        -- Criar política para admins
        CREATE POLICY "Permitir gerenciamento de templates para admins"
            ON public.banner_templates
            FOR ALL
            TO authenticated
            USING (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            )
            WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.profiles
                    WHERE profiles.id = auth.uid()
                    AND profiles.role = 'admin'
                )
            );
    END IF;
END $$;

-- 3. Verificar status final
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'banner_templates';

-- 4. Listar políticas da tabela
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'banner_templates';

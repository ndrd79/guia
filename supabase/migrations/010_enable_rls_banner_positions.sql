-- Migração crítica de segurança: Habilitar RLS na tabela banner_positions
-- Data: 2024-12-22
-- Prioridade: CRÍTICA - Corrige vulnerabilidade de segurança

-- 1. Habilitar Row Level Security na tabela banner_positions
ALTER TABLE public.banner_positions ENABLE ROW LEVEL SECURITY;

-- 2. Criar política para leitura pública (SELECT)
-- Permite que qualquer pessoa visualize as posições de banner
CREATE POLICY "banner_positions_select_policy" ON public.banner_positions
    FOR SELECT
    USING (true);

-- 3. Criar política para inserção (INSERT) - apenas usuários autenticados
CREATE POLICY "banner_positions_insert_policy" ON public.banner_positions
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 4. Criar política para atualização (UPDATE) - apenas administradores
CREATE POLICY "banner_positions_update_policy" ON public.banner_positions
    FOR UPDATE
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 5. Criar política para exclusão (DELETE) - apenas administradores
CREATE POLICY "banner_positions_delete_policy" ON public.banner_positions
    FOR DELETE
    USING (
        auth.role() = 'authenticated'
        AND EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- 6. Comentários para documentação
COMMENT ON POLICY "banner_positions_select_policy" ON public.banner_positions IS 
'Permite leitura pública das posições de banner para exibição no frontend';

COMMENT ON POLICY "banner_positions_insert_policy" ON public.banner_positions IS 
'Permite inserção apenas para administradores autenticados';

COMMENT ON POLICY "banner_positions_update_policy" ON public.banner_positions IS 
'Permite atualização apenas para administradores autenticados';

COMMENT ON POLICY "banner_positions_delete_policy" ON public.banner_positions IS 
'Permite exclusão apenas para administradores autenticados';

-- 7. Verificação de segurança
-- Esta query deve retornar true se RLS estiver habilitado
DO $$
BEGIN
    IF NOT (SELECT relrowsecurity FROM pg_class WHERE relname = 'banner_positions') THEN
        RAISE EXCEPTION 'ERRO: RLS não foi habilitado corretamente na tabela banner_positions';
    END IF;
    
    RAISE NOTICE 'SUCESSO: RLS habilitado e políticas criadas para banner_positions';
END $$;
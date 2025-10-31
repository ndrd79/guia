-- Corrigir políticas RLS da tabela plan_history para evitar consultas à tabela auth.users

-- Remover política existente que pode estar causando problemas
DROP POLICY IF EXISTS "Admins can view plan history" ON public.plan_history;

-- Criar política mais simples que não depende de consultas à tabela auth.users
CREATE POLICY "authenticated_read_plan_history" ON public.plan_history
    FOR SELECT 
    USING (auth.role() = 'authenticated');

-- Garantir que a tabela tenha RLS habilitado
ALTER TABLE public.plan_history ENABLE ROW LEVEL SECURITY;

-- Grants para garantir permissões adequadas
GRANT SELECT ON public.plan_history TO authenticated;
GRANT ALL PRIVILEGES ON public.plan_history TO service_role;
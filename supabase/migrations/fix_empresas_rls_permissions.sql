-- Corrigir políticas RLS da tabela empresas para evitar consultas à tabela auth.users
-- Isso resolve o erro "permission denied for table users"

-- Primeiro, remover políticas existentes que podem estar causando problemas
DROP POLICY IF EXISTS "Admins can manage all empresas" ON public.empresas;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar empresas" ON public.empresas;
DROP POLICY IF EXISTS "Empresas ativas são visíveis publicamente" ON public.empresas;
DROP POLICY IF EXISTS "Public can view active empresas" ON public.empresas;

-- Criar políticas mais simples que não dependem de consultas à tabela auth.users

-- Política 1: Permitir leitura pública de empresas ativas
CREATE POLICY "public_read_active_empresas" ON public.empresas
    FOR SELECT 
    USING (ativo = true);

-- Política 2: Permitir todas as operações para usuários autenticados
-- Usando apenas auth.uid() e auth.role() que não requerem acesso à tabela auth.users
CREATE POLICY "authenticated_manage_empresas" ON public.empresas
    FOR ALL 
    USING (auth.role() = 'authenticated');

-- Política 3: Permitir inserção para usuários autenticados
CREATE POLICY "authenticated_insert_empresas" ON public.empresas
    FOR INSERT 
    WITH CHECK (auth.role() = 'authenticated');

-- Política 4: Permitir atualização para usuários autenticados
CREATE POLICY "authenticated_update_empresas" ON public.empresas
    FOR UPDATE 
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Política 5: Permitir exclusão para usuários autenticados
CREATE POLICY "authenticated_delete_empresas" ON public.empresas
    FOR DELETE 
    USING (auth.role() = 'authenticated');

-- Garantir que a tabela tenha RLS habilitado
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

-- Grants para garantir permissões adequadas
GRANT SELECT ON public.empresas TO anon;
GRANT ALL PRIVILEGES ON public.empresas TO authenticated;
GRANT ALL PRIVILEGES ON public.empresas TO service_role;
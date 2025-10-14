-- Política 1: Permitir leitura pública de empresas ativas
CREATE POLICY "Empresas ativas são visíveis publicamente" ON public.empresas
    FOR SELECT 
    USING (ativo = true);

-- Política 2: Permitir todas as operações para usuários autenticados
CREATE POLICY "Usuários autenticados podem gerenciar empresas" ON public.empresas
    FOR ALL 
    USING (auth.role() = 'authenticated');

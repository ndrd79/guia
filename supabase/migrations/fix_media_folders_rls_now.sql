-- Correção de Segurança RLS: Habilitar RLS na tabela media_folders
-- Data: 2025-01-20
-- Problema: Tabela possui políticas RLS mas RLS não está habilitado

-- 1. Habilitar RLS na tabela media_folders
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;

-- 2. Adicionar comentário para documentar a correção
COMMENT ON TABLE public.media_folders IS 'Organização em pastas da biblioteca de mídia - RLS habilitado para segurança';

-- 3. Verificar e recriar políticas se necessário
-- As políticas já existem, mas vamos garantir que estão corretas:

-- Política: Usuários autenticados podem criar pastas
DROP POLICY IF EXISTS "Usuários autenticados podem criar pastas" ON public.media_folders;
CREATE POLICY "Usuários autenticados podem criar pastas" 
ON public.media_folders 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL);

-- Política: Usuários autenticados podem ver pastas
DROP POLICY IF EXISTS "Usuários autenticados podem ver pastas" ON public.media_folders;
CREATE POLICY "Usuários autenticados podem ver pastas" 
ON public.media_folders 
FOR SELECT 
TO authenticated 
USING (true);

-- Política: Usuários podem atualizar próprias pastas
DROP POLICY IF EXISTS "Usuários podem atualizar próprias pastas" ON public.media_folders;
CREATE POLICY "Usuários podem atualizar próprias pastas" 
ON public.media_folders 
FOR UPDATE 
TO authenticated 
USING (created_by = auth.uid() OR updated_by = auth.uid())
WITH CHECK (created_by = auth.uid() OR updated_by = auth.uid());

-- Política: Usuários podem deletar próprias pastas
DROP POLICY IF EXISTS "Usuários podem deletar próprias pastas" ON public.media_folders;
CREATE POLICY "Usuários podem deletar próprias pastas" 
ON public.media_folders 
FOR DELETE 
TO authenticated 
USING (created_by = auth.uid() OR updated_by = auth.uid());

-- 4. Criar índices para performance das políticas RLS
CREATE INDEX IF NOT EXISTS idx_media_folders_created_by ON public.media_folders(created_by);
CREATE INDEX IF NOT EXISTS idx_media_folders_updated_by ON public.media_folders(updated_by);
CREATE INDEX IF NOT EXISTS idx_media_folders_path ON public.media_folders(path);
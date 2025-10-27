-- Criação da tabela media_library para biblioteca de mídia avançada
-- Esta migração adiciona funcionalidades similares ao WordPress Media Library

-- Criar tabela principal da biblioteca de mídia
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'document', 'audio'
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    description TEXT,
    folder_path VARCHAR(500) DEFAULT '/',
    tags TEXT[], -- Array de tags para organização
    metadata JSONB DEFAULT '{}', -- Metadados adicionais (EXIF, etc.)
    thumbnail_url TEXT,
    optimized_url TEXT, -- URL da versão otimizada (WebP)
    usage_count INTEGER DEFAULT 0,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para rastrear uso de mídia
CREATE TABLE IF NOT EXISTS public.media_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    media_id UUID REFERENCES public.media_library(id) ON DELETE CASCADE,
    used_in_table VARCHAR(100) NOT NULL, -- 'banners', 'noticias', 'empresas', etc.
    used_in_id UUID NOT NULL,
    used_in_field VARCHAR(100) NOT NULL, -- 'image_url', 'logo_url', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para pastas/organização
CREATE TABLE IF NOT EXISTS public.media_folders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    path VARCHAR(500) NOT NULL UNIQUE,
    parent_path VARCHAR(500),
    description TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_media_library_file_type ON public.media_library(file_type);
CREATE INDEX IF NOT EXISTS idx_media_library_folder_path ON public.media_library(folder_path);
CREATE INDEX IF NOT EXISTS idx_media_library_created_at ON public.media_library(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_library_filename ON public.media_library(filename);
CREATE INDEX IF NOT EXISTS idx_media_library_tags ON public.media_library USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_media_usage_media_id ON public.media_usage(media_id);
CREATE INDEX IF NOT EXISTS idx_media_usage_used_in ON public.media_usage(used_in_table, used_in_id);
CREATE INDEX IF NOT EXISTS idx_media_folders_path ON public.media_folders(path);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_media_library_updated_at 
    BEFORE UPDATE ON public.media_library 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_media_folders_updated_at 
    BEFORE UPDATE ON public.media_folders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) Policies
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_folders ENABLE ROW LEVEL SECURITY;

-- Políticas para media_library
CREATE POLICY "Usuários autenticados podem ver mídia" ON public.media_library
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir mídia" ON public.media_library
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar própria mídia" ON public.media_library
    FOR UPDATE USING (auth.uid() = uploaded_by OR auth.role() = 'service_role');

CREATE POLICY "Usuários podem deletar própria mídia" ON public.media_library
    FOR DELETE USING (auth.uid() = uploaded_by OR auth.role() = 'service_role');

-- Políticas para media_usage
CREATE POLICY "Usuários autenticados podem ver uso de mídia" ON public.media_usage
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem inserir uso de mídia" ON public.media_usage
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem atualizar uso de mídia" ON public.media_usage
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem deletar uso de mídia" ON public.media_usage
    FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas para media_folders
CREATE POLICY "Usuários autenticados podem ver pastas" ON public.media_folders
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários autenticados podem criar pastas" ON public.media_folders
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem atualizar próprias pastas" ON public.media_folders
    FOR UPDATE USING (auth.uid() = created_by OR auth.role() = 'service_role');

CREATE POLICY "Usuários podem deletar próprias pastas" ON public.media_folders
    FOR DELETE USING (auth.uid() = created_by OR auth.role() = 'service_role');

-- Permissões para roles
GRANT ALL PRIVILEGES ON public.media_library TO authenticated;
GRANT ALL PRIVILEGES ON public.media_usage TO authenticated;
GRANT ALL PRIVILEGES ON public.media_folders TO authenticated;

GRANT SELECT ON public.media_library TO anon;
GRANT SELECT ON public.media_usage TO anon;
GRANT SELECT ON public.media_folders TO anon;

-- Função para atualizar contador de uso
CREATE OR REPLACE FUNCTION update_media_usage_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.media_library 
        SET usage_count = usage_count + 1 
        WHERE id = NEW.media_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.media_library 
        SET usage_count = GREATEST(usage_count - 1, 0) 
        WHERE id = OLD.media_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contador automaticamente
CREATE TRIGGER media_usage_count_trigger
    AFTER INSERT OR DELETE ON public.media_usage
    FOR EACH ROW EXECUTE FUNCTION update_media_usage_count();

-- Inserir pasta raiz padrão
INSERT INTO public.media_folders (name, path, description) 
VALUES ('Root', '/', 'Pasta raiz da biblioteca de mídia')
ON CONFLICT (path) DO NOTHING;

-- Comentário da migração
COMMENT ON TABLE public.media_library IS 'Biblioteca de mídia avançada - similar ao WordPress Media Library';
COMMENT ON TABLE public.media_usage IS 'Rastreamento de uso de arquivos de mídia';
COMMENT ON TABLE public.media_folders IS 'Organização em pastas da biblioteca de mídia';
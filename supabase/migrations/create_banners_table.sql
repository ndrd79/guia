-- Script completo para criar a tabela banners no Supabase
-- Execute este script no Supabase SQL Editor

-- Criar a tabela banners se não existir
CREATE TABLE IF NOT EXISTS banners (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    posicao VARCHAR(100) NOT NULL,
    imagem TEXT NOT NULL,
    link TEXT,
    largura INTEGER DEFAULT 400,
    altura INTEGER DEFAULT 200,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_banners_posicao ON banners(posicao);
CREATE INDEX IF NOT EXISTS idx_banners_ativo ON banners(ativo);
CREATE INDEX IF NOT EXISTS idx_banners_created_at ON banners(created_at);

-- Política para permitir leitura pública de banners ativos
CREATE POLICY "Banners ativos são visíveis publicamente" ON banners
    FOR SELECT USING (ativo = true);

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Usuários autenticados podem gerenciar banners" ON banners
    FOR ALL USING (auth.role() = 'authenticated');

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_banners_updated_at 
    BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir alguns banners de exemplo (opcional)
INSERT INTO banners (nome, posicao, imagem, link, largura, altura, ativo) VALUES
('Banner Header Principal', 'Header Superior', '/images/placeholder-banner-728x90.svg', 'https://exemplo.com', 728, 90, true),
('Banner Hero Homepage', 'Banner Principal', '/images/placeholder-banner-600x300.svg', 'https://exemplo.com', 600, 300, true),
('Banner Empresas Topo', 'Empresas Destaque - Topo', '/images/placeholder-banner-800x200.svg', 'https://exemplo.com', 800, 200, true)
ON CONFLICT (id) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'banners' 
ORDER BY ordinal_position;

-- Verificar se há banners na tabela
SELECT COUNT(*) as total_banners FROM banners;

-- Mostrar banners ativos
SELECT id, nome, posicao, largura, altura, ativo, created_at 
FROM banners 
WHERE ativo = true 
ORDER BY created_at DESC;
-- Estrutura das tabelas para o Portal Maria Helena
-- Execute estes comandos no SQL Editor do Supabase

-- Tabela de Notícias
CREATE TABLE IF NOT EXISTS noticias (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  data DATE NOT NULL,
  imagem TEXT,
  descricao TEXT,
  conteudo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Classificados
CREATE TABLE IF NOT EXISTS classificados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2),
  imagem TEXT,
  localizacao VARCHAR(255),
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  local VARCHAR(255),
  imagem TEXT,
  descricao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de banners publicitários
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

-- Políticas de segurança (RLS - Row Level Security)
-- Habilitar RLS nas tabelas
ALTER TABLE noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE classificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso apenas a usuários autenticados
-- Notícias
CREATE POLICY "Permitir leitura pública de notícias" ON noticias
  FOR SELECT USING (true);

CREATE POLICY "Permitir CRUD para usuários autenticados" ON noticias
  FOR ALL USING (auth.role() = 'authenticated');

-- Classificados
CREATE POLICY "Permitir leitura pública de classificados" ON classificados
  FOR SELECT USING (true);

CREATE POLICY "Permitir CRUD para usuários autenticados" ON classificados
  FOR ALL USING (auth.role() = 'authenticated');

-- Eventos
CREATE POLICY "Permitir leitura pública de eventos" ON eventos
  FOR SELECT USING (true);

CREATE POLICY "Permitir CRUD para usuários autenticados" ON eventos
  FOR ALL USING (auth.role() = 'authenticated');

-- Banners
CREATE POLICY "Permitir leitura pública de banners" ON banners
  FOR SELECT USING (true);

CREATE POLICY "Permitir CRUD para usuários autenticados" ON banners
  FOR ALL USING (auth.role() = 'authenticated');

-- Criar buckets no Storage (execute no SQL Editor)
-- Bucket para notícias
INSERT INTO storage.buckets (id, name, public)
VALUES ('noticias', 'noticias', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para classificados
INSERT INTO storage.buckets (id, name, public)
VALUES ('classificados', 'classificados', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para eventos
INSERT INTO storage.buckets (id, name, public)
VALUES ('eventos', 'eventos', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket para banners
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de Storage
-- Permitir upload para usuários autenticados
CREATE POLICY "Permitir upload para usuários autenticados" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Permitir leitura pública
CREATE POLICY "Permitir leitura pública" ON storage.objects
  FOR SELECT USING (true);

-- Permitir atualização e exclusão para usuários autenticados
CREATE POLICY "Permitir atualização para usuários autenticados" ON storage.objects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir exclusão para usuários autenticados" ON storage.objects
  FOR DELETE USING (auth.role() = 'authenticated');

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_noticias_data ON noticias(data DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON noticias(categoria);
CREATE INDEX IF NOT EXISTS idx_classificados_categoria ON classificados(categoria);
CREATE INDEX IF NOT EXISTS idx_eventos_data_hora ON eventos(data_hora DESC);
CREATE INDEX IF NOT EXISTS idx_banners_posicao ON banners(posicao);
CREATE INDEX IF NOT EXISTS idx_banners_ativo ON banners(ativo);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_noticias_updated_at BEFORE UPDATE ON noticias
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classificados_updated_at BEFORE UPDATE ON classificados
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eventos_updated_at BEFORE UPDATE ON eventos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_banners_updated_at BEFORE UPDATE ON banners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
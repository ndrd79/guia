-- Script para criar a tabela empresas no Supabase
-- Execute este script no Supabase SQL Editor

-- Criar a tabela empresas se não existir
CREATE TABLE IF NOT EXISTS empresas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0.0,
    reviews INTEGER DEFAULT 0,
    location VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    website VARCHAR(255),
    address TEXT,
    image TEXT,
    featured BOOLEAN DEFAULT false,
    is_new BOOLEAN DEFAULT false,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_empresas_featured ON empresas(featured, ativo);
CREATE INDEX IF NOT EXISTS idx_empresas_category ON empresas(category);
CREATE INDEX IF NOT EXISTS idx_empresas_rating ON empresas(rating DESC);
CREATE INDEX IF NOT EXISTS idx_empresas_created_at ON empresas(created_at DESC);

-- Política para permitir leitura pública de empresas ativas
CREATE POLICY "Empresas ativas são visíveis publicamente" ON empresas
    FOR SELECT USING (ativo = true);

-- Política para permitir todas as operações para usuários autenticados
CREATE POLICY "Usuários autenticados podem gerenciar empresas" ON empresas
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
CREATE TRIGGER update_empresas_updated_at 
    BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas empresas de exemplo
INSERT INTO empresas (name, description, category, rating, reviews, location, phone, email, website, address, image, featured, is_new, ativo) VALUES
('Restaurante Sabor da Terra', 'Culinária regional com ingredientes frescos e ambiente aconchegante.', 'Restaurante', 4.8, 127, 'Centro', '(11) 3456-7890', 'contato@sabordaterra.com.br', 'www.sabordaterra.com.br', 'Rua das Flores, 123 - Centro', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80', true, false, true),
('Auto Mecânica Silva', 'Serviços automotivos especializados com mais de 20 anos de experiência.', 'Automotivo', 4.6, 89, 'Zona Industrial', '(11) 2345-6789', 'contato@mecanicasilva.com.br', 'www.mecanicasilva.com.br', 'Av. Industrial, 456 - Zona Industrial', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80', true, false, true),
('Farmácia Central', 'Medicamentos, produtos de higiene e atendimento farmacêutico especializado.', 'Saúde', 4.7, 156, 'Centro', '(11) 4567-8901', 'contato@farmaciacentral.com.br', 'www.farmaciacentral.com.br', 'Rua da Saúde, 789 - Centro', 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80', true, false, true),
('Padaria Pão Dourado', 'Pães frescos, doces caseiros e café da manhã completo.', 'Alimentação', 4.5, 203, 'Bairro São José', '(11) 5678-9012', 'contato@paodourado.com.br', 'www.paodourado.com.br', 'Rua do Pão, 321 - Bairro São José', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80', true, false, true),
('Salão Beleza & Estilo', 'Cortes modernos, tratamentos capilares e serviços de beleza completos.', 'Beleza', 4.9, 98, 'Centro', '(11) 6789-0123', 'contato@belezaestilo.com.br', 'www.belezaestilo.com.br', 'Rua da Beleza, 654 - Centro', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80', true, true, true),
('MH Cell', 'Assistência técnica especializada em smartphones e tablets com garantia.', 'Tecnologia', 4.9, 245, 'Centro', '(11) 7890-1234', 'contato@mhcell.com.br', 'www.mhcell.com.br', 'Rua da Tecnologia, 987 - Centro', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80', true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Verificar se a tabela foi criada corretamente
SELECT 
    table_name,
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'empresas' 
ORDER BY ordinal_position;

-- Verificar se há empresas na tabela
SELECT COUNT(*) as total_empresas FROM empresas;

-- Mostrar empresas em destaque
SELECT id, name, category, rating, location, featured, is_new, ativo, created_at 
FROM empresas 
WHERE ativo = true AND featured = true
ORDER BY created_at DESC;
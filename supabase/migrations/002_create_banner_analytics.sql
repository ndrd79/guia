-- Criar tabela para analytics de banners
CREATE TABLE IF NOT EXISTS banner_analytics (
    id BIGSERIAL PRIMARY KEY,
    banner_id UUID NOT NULL REFERENCES banners(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('impressao', 'clique')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(255),
    
    -- Índices para performance
    CONSTRAINT valid_tipo CHECK (tipo IN ('impressao', 'clique'))
);

-- Criar índices para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_banner_analytics_banner_id ON banner_analytics(banner_id);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_tipo ON banner_analytics(tipo);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_created_at ON banner_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_banner_analytics_banner_tipo ON banner_analytics(banner_id, tipo);

-- Criar índice composto para consultas de estatísticas
CREATE INDEX IF NOT EXISTS idx_banner_analytics_stats ON banner_analytics(banner_id, tipo, created_at);

-- Habilitar RLS (Row Level Security)
ALTER TABLE banner_analytics ENABLE ROW LEVEL SECURITY;

-- Política para permitir inserção de analytics (público pode registrar eventos)
CREATE POLICY "Permitir inserção de analytics" ON banner_analytics
    FOR INSERT 
    WITH CHECK (true);

-- Política para permitir leitura apenas para usuários autenticados (admin)
CREATE POLICY "Permitir leitura para admins" ON banner_analytics
    FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Comentários para documentação
COMMENT ON TABLE banner_analytics IS 'Tabela para armazenar eventos de analytics dos banners (impressões e cliques)';
COMMENT ON COLUMN banner_analytics.banner_id IS 'ID do banner que gerou o evento';
COMMENT ON COLUMN banner_analytics.tipo IS 'Tipo do evento: impressao ou clique';
COMMENT ON COLUMN banner_analytics.ip_address IS 'Endereço IP do usuário (para evitar duplicatas)';
COMMENT ON COLUMN banner_analytics.user_agent IS 'User agent do navegador';
COMMENT ON COLUMN banner_analytics.session_id IS 'ID da sessão para agrupar eventos do mesmo usuário';
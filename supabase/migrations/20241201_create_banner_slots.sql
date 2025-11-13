-- Tabela banner_slots: Sistema flexível para gerenciar posições de banners
-- Permite criar novas posições em 2 minutos via painel admin

CREATE TABLE banner_slots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    
    -- Template e configurações
    template_id UUID REFERENCES banner_templates(id) ON DELETE RESTRICT,
    default_config JSONB DEFAULT '{}',
    
    -- Dimensões responsivas
    desktop_width INTEGER DEFAULT 0,
    desktop_height INTEGER DEFAULT 0,
    mobile_width INTEGER DEFAULT 0,
    mobile_height INTEGER DEFAULT 0,
    
    -- Páginas onde o banner aparece
    pages TEXT[] DEFAULT ARRAY['*'], -- ['home', 'noticias', 'eventos']
    location VARCHAR(50), -- 'header', 'sidebar', 'footer', 'content', 'popup'
    
    -- Configurações de exibição
    max_banners INTEGER DEFAULT 1,
    rotation_time INTEGER DEFAULT 5000, -- milissegundos
    priority INTEGER DEFAULT 1,
    
    -- Controle de status
    is_active BOOLEAN DEFAULT true,
    show_on_mobile BOOLEAN DEFAULT true,
    show_on_desktop BOOLEAN DEFAULT true,
    
    -- Analytics e tracking
    analytics_enabled BOOLEAN DEFAULT true,
    custom_analytics_config JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_banner_slots_slug ON banner_slots(slug);
CREATE INDEX idx_banner_slots_template ON banner_slots(template_id);
CREATE INDEX idx_banner_slots_active ON banner_slots(is_active, show_on_mobile, show_on_desktop);
CREATE INDEX idx_banner_slots_pages ON banner_slots USING GIN(pages);
CREATE INDEX idx_banner_slots_location ON banner_slots(location);

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_banner_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para updated_at
CREATE TRIGGER trg_banner_slots_updated_at
    BEFORE UPDATE ON banner_slots
    FOR EACH ROW
    EXECUTE FUNCTION update_banner_slots_updated_at();

-- Função auxiliar para verificar se slot está disponível na página
CREATE OR REPLACE FUNCTION is_slot_available_on_page(slot_slug TEXT, target_page TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM banner_slots 
        WHERE slug = slot_slug 
        AND is_active = true
        AND (pages @> ARRAY[target_page] OR pages @> ARRAY['*'])
    );
END;
$$ LANGUAGE plpgsql;

-- Inserir slots padrão (migração das 17 posições existentes)
INSERT INTO banner_slots (name, slug, description, template_id, desktop_width, desktop_height, mobile_width, mobile_height, pages, location, max_banners, rotation_time, priority) VALUES
('Hero Carousel Principal', 'hero-carousel', 'Carrossel principal na home', (SELECT id FROM banner_templates WHERE component_type = 'carousel' LIMIT 1), 1200, 400, 400, 200, ARRAY['home'], 'header', 5, 5000, 1),
('Header Superior', 'header-top', 'Banner horizontal no topo do site', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 1200, 90, 400, 100, ARRAY['*'], 'header', 1, 0, 2),
('Sidebar Direita Superior', 'sidebar-top-right', 'Banner na sidebar direita superior', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 300, 250, 300, 200, ARRAY['home', 'noticias', 'eventos'], 'sidebar', 1, 0, 3),
('Sidebar Direita Meio', 'sidebar-middle-right', 'Banner no meio da sidebar direita', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 300, 250, 300, 200, ARRAY['home', 'noticias', 'eventos'], 'sidebar', 1, 0, 4),
('Entre Conteúdo Notícias', 'between-news-content', 'Banner entre matérias de notícias', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 800, 150, 400, 120, ARRAY['noticias'], 'content', 1, 0, 5),
('Footer Banner', 'footer-banner', 'Banner horizontal no footer', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 1200, 200, 400, 150, ARRAY['*'], 'footer', 1, 0, 6),
('Pop-up Banner', 'popup-banner', 'Banner pop-up modal', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 600, 400, 300, 250, ARRAY['home'], 'popup', 1, 0, 7),
('Newsletter Inline', 'newsletter-inline', 'Banner inline para newsletter', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 800, 100, 400, 80, ARRAY['home', 'noticias'], 'content', 1, 0, 8),
('Grid Duplo Sidebar', 'grid-double-sidebar', 'Dois banners lado a lado na sidebar', (SELECT id FROM banner_templates WHERE component_type = 'grid' LIMIT 1), 300, 250, 300, 200, ARRAY['home', 'noticias'], 'sidebar', 2, 0, 9),
('Grid Triplo Conteúdo', 'grid-triple-content', 'Três banners em grid no conteúdo', (SELECT id FROM banner_templates WHERE component_type = 'grid' LIMIT 1), 800, 400, 400, 200, ARRAY['home', 'noticias'], 'content', 3, 0, 10),
('Video Player Banner', 'video-player', 'Player de vídeo com banner', (SELECT id FROM banner_templates WHERE component_type = 'video' LIMIT 1), 800, 450, 400, 225, ARRAY['home', 'noticias'], 'content', 1, 0, 11),
('Sticky Footer', 'sticky-footer', 'Banner fixo no footer', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 1200, 60, 400, 60, ARRAY['*'], 'footer', 1, 0, 12),
('Interstitial Mobile', 'interstitial-mobile', 'Banner full screen mobile', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 400, 800, 400, 600, ARRAY['home', 'noticias'], 'popup', 1, 0, 13),
('Before Header', 'before-header', 'Banner antes do header', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 1200, 60, 400, 60, ARRAY['*'], 'header', 1, 0, 14),
('After Content', 'after-content', 'Banner após conteúdo', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 800, 150, 400, 120, ARRAY['noticias', 'eventos'], 'content', 1, 0, 15),
('Left Sidebar', 'left-sidebar', 'Banner na sidebar esquerda', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 300, 250, 300, 200, ARRAY['home', 'noticias'], 'sidebar', 1, 0, 16),
('Right Rail', 'right-rail', 'Barra lateral direita fixa', (SELECT id FROM banner_templates WHERE component_type = 'static' LIMIT 1), 300, 600, 300, 400, ARRAY['home', 'noticias'], 'sidebar', 1, 0, 17);

-- Permissões
GRANT SELECT ON banner_slots TO anon;
GRANT ALL ON banner_slots TO authenticated;
GRANT ALL ON banner_slots TO service_role;

-- RLS Policies
ALTER TABLE banner_slots ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública de slots ativos
CREATE POLICY "Permitir leitura pública de slots ativos" ON banner_slots
    FOR SELECT USING (is_active = true);

-- Permitir gerenciamento completo para administradores
CREATE POLICY "Permitir gerenciamento completo para administradores" ON banner_slots
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Permitir leitura de todos os slots para usuários autenticados
CREATE POLICY "Permitir leitura de todos os slots para usuários autenticados" ON banner_slots
    FOR SELECT USING (auth.role() = 'authenticated');
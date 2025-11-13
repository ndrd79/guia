-- Tabela de Posições de Banners
-- Define onde os banners aparecem no site e qual template usam

CREATE TABLE IF NOT EXISTS banner_positions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  template_id UUID REFERENCES banner_templates(id) ON DELETE RESTRICT,
  pages JSONB DEFAULT '["*"]', -- ["home", "noticias"] ou ["*"] para todas
  location VARCHAR(200), -- Descrição da localização ou seletor CSS
  description TEXT,
  priority INTEGER DEFAULT 0, -- Ordem de carregamento
  max_banners INTEGER DEFAULT 1, -- Máximo de banners permitidos
  config JSONB DEFAULT '{}', -- Config específica da posição
  
  -- Configurações de exibição
  is_active BOOLEAN DEFAULT true,
  show_on_mobile BOOLEAN DEFAULT true,
  show_on_tablet BOOLEAN DEFAULT true,
  show_on_desktop BOOLEAN DEFAULT true,
  
  -- Restrições de horário (opcional)
  time_restrictions JSONB DEFAULT '{}', -- {"start_time": "06:00", "end_time": "23:00", "days": [1,2,3,4,5,6,0]}
  
  -- Metadados
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_banner_positions_template ON banner_positions(template_id);
CREATE INDEX idx_banner_positions_active ON banner_positions(is_active);
CREATE INDEX idx_banner_positions_pages ON banner_positions USING GIN(pages);
CREATE INDEX idx_banner_positions_slug ON banner_positions(slug);
CREATE INDEX idx_banner_positions_priority ON banner_positions(priority DESC);

-- Posições padrão do sistema (migração das 17 posições existentes)
INSERT INTO banner_positions (name, slug, template_id, pages, location, description, priority, max_banners, config) VALUES
('Hero Carousel', 'hero-carousel', 
  (SELECT id FROM banner_templates WHERE component_type = 'carousel' LIMIT 1),
  '["home"]', 
  'home', 
  'Banner principal rotativo na homepage', 
  100, 4, 
  '{"interval": 5, "auto_rotate": true}'
),
('Header Superior', 'header-superior',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["*"]',
  'header-top',
  'Banner horizontal no topo do site',
  90, 1,
  '{"full_width": true}'
),
('Header Inferior', 'header-inferior',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["*"]',
  'header-bottom',
  'Banner horizontal abaixo do header',
  85, 1,
  '{"full_width": true}'
),
('Sidebar Direita Superior', 'sidebar-direita-superior',
  (SELECT id FROM banner_templates WHERE name = 'Sidebar Vertical' LIMIT 1),
  '["noticias", "eventos", "empresas"]',
  'sidebar-right-top',
  'Banner vertical no topo da sidebar direita',
  80, 1,
  '{"sticky": true}'
),
('Sidebar Direita Inferior', 'sidebar-direita-inferior',
  (SELECT id FROM banner_templates WHERE name = 'Sidebar Vertical' LIMIT 1),
  '["noticias", "eventos", "empresas"]',
  'sidebar-right-bottom',
  'Banner vertical no rodapé da sidebar direita',
  75, 1,
  '{"sticky": false}'
),
('Sidebar Esquerda Superior', 'sidebar-esquerda-superior',
  (SELECT id FROM banner_templates WHERE name = 'Sidebar Vertical' LIMIT 1),
  '["noticias", "eventos"]',
  'sidebar-left-top',
  'Banner vertical no topo da sidebar esquerda',
  70, 1,
  '{"sticky": true}'
),
('Sidebar Esquerda Inferior', 'sidebar-esquerda-inferior',
  (SELECT id FROM banner_templates WHERE name = 'Sidebar Vertical' LIMIT 1),
  '["noticias", "eventos"]',
  'sidebar-left-bottom',
  'Banner vertical no rodapé da sidebar esquerda',
  65, 1,
  '{"sticky": false}'
),
('Entre Conteúdo Notícias', 'entre-conteudo-noticias',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["noticias"]',
  'content-middle',
  'Banner entre matérias de notícias',
  60, 2,
  '{"inline": true}'
),
('Entre Conteúdo Eventos', 'entre-conteudo-eventos',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["eventos"]',
  'content-middle',
  'Banner entre listagem de eventos',
  55, 2,
  '{"inline": true}'
),
('Banner Principal Serviços', 'banner-principal-servicos',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["home"]',
  'services-main',
  'Banner principal na seção de serviços',
  50, 1,
  '{}'
),
('Banner Secundário Serviços', 'banner-secundario-servicos',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["home"]',
  'services-secondary',
  'Banner secundário na seção de serviços',
  45, 1,
  '{}'
),
('Footer Banner', 'footer-banner',
  (SELECT id FROM banner_templates WHERE name = 'Footer Horizontal' LIMIT 1),
  '["*"]',
  'footer',
  'Banner horizontal no rodapé do site',
  40, 2,
  '{"full_width": true}'
),
('Newsletter Inline', 'newsletter-inline',
  (SELECT id FROM banner_templates WHERE name = 'Newsletter Inline' LIMIT 1),
  '["noticias", "eventos"]',
  'newsletter-inline',
  'Banner inline dentro de conteúdo de newsletter',
  35, 1,
  '{"inline": true}'
),
('Pop-up Banner', 'popup-banner',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["home", "noticias"]',
  'popup',
  'Banner em modal pop-up',
  30, 1,
  '{"modal": true, "delay": 5}'
),
('Banner Login', 'banner-login',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["login"]',
  'login-page',
  'Banner na página de login',
  25, 1,
  '{}'
),
('Banner Cadastro', 'banner-cadastro',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["cadastro"]',
  'register-page',
  'Banner na página de cadastro',
  20, 1,
  '{}'
),
('Banner 404', 'banner-404',
  (SELECT id FROM banner_templates WHERE name = 'Banner Estático' LIMIT 1),
  '["404"]',
  'error-page',
  'Banner na página de erro 404',
  15, 1,
  '{}'
);

-- Permissões
GRANT SELECT ON banner_positions TO anon;
GRANT ALL ON banner_positions TO authenticated;
GRANT SELECT ON banner_positions TO service_role;

-- RLS (Row Level Security)
ALTER TABLE banner_positions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Permitir leitura pública de posições ativas" ON banner_positions
  FOR SELECT USING (is_active = true);

CREATE POLICY "Permitir gerenciamento completo para administradores" ON banner_positions
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Permitir leitura de todas as posições para usuários autenticados" ON banner_positions
  FOR SELECT USING (auth.role() = 'authenticated');
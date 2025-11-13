-- Tabela de Templates de Banners (Factory Pattern)
-- Templates reutilizáveis que definem comportamento e layout

CREATE TABLE IF NOT EXISTS banner_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  component_type VARCHAR(50) NOT NULL CHECK (component_type IN ('carousel', 'static', 'grid', 'video', 'custom')),
  default_config JSONB DEFAULT '{}',
  responsive_rules JSONB DEFAULT '{}',
  analytics_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_banner_templates_active ON banner_templates(is_active);
CREATE INDEX idx_banner_templates_component ON banner_templates(component_type);

-- Templates Padrão do Sistema
INSERT INTO banner_templates (name, component_type, default_config, responsive_rules, description) VALUES
('Carousel Padrão', 'carousel', 
  '{"interval": 5, "max_banners": 4, "indicators": true, "auto_rotate": true, "transition": "slide"}',
  '{"desktop": {"width": 1170, "height": 330}, "tablet": {"width": 768, "height": 250}, "mobile": {"width": 375, "height": 200}}',
  'Carrossel automático com até 4 banners e indicadores'
),
('Banner Estático', 'static',
  '{"clickable": true, "lazy_load": true, "show_border": false}',
  '{"desktop": {"width": 300, "height": 600}, "tablet": {"width": 250, "height": 500}, "mobile": {"width": 300, "height": 250}}',
  'Banner único estático com lazy loading'
),
('Grid Duplo', 'grid',
  '{"columns": 2, "gap": 16, "max_banners": 6, "aspect_ratio": "16:9"}',
  '{"desktop": {"width": 800, "height": 400}, "tablet": {"width": 600, "height": 300}, "mobile": {"width": 350, "height": 200}}',
  'Layout em grade com 2 colunas responsivas'
),
('Grid Triplo', 'grid',
  '{"columns": 3, "gap": 12, "max_banners": 9, "aspect_ratio": "4:3"}',
  '{"desktop": {"width": 900, "height": 300}, "tablet": {"width": 600, "height": 200}, "mobile": {"width": 350, "height": 150}}',
  'Layout em grade com 3 colunas responsivas'
),
('Hero Principal', 'carousel',
  '{"interval": 6, "max_banners": 1, "indicators": false, "auto_rotate": false, "fullscreen": true}',
  '{"desktop": {"width": 1920, "height": 600}, "tablet": {"width": 1024, "height": 400}, "mobile": {"width": 375, "height": 250}}',
  'Banner hero full-width para página inicial'
),
('Sidebar Vertical', 'static',
  '{"clickable": true, "lazy_load": true, "sticky": true}',
  '{"desktop": {"width": 300, "height": 600}, "tablet": {"width": 250, "height": 400}, "mobile": {"width": 300, "height": 250}}',
  'Banner vertical para sidebars com sticky option'
),
('Footer Horizontal', 'static',
  '{"clickable": true, "lazy_load": true, "full_width": true}',
  '{"desktop": {"width": 1170, "height": 100}, "tablet": {"width": 768, "height": 80}, "mobile": {"width": 375, "height": 60}}',
  'Banner horizontal para footer full-width'
),
('Newsletter Inline', 'static',
  '{"clickable": true, "lazy_load": true, "inline": true}',
  '{"desktop": {"width": 728, "height": 90}, "tablet": {"width": 468, "height": 60}, "mobile": {"width": 320, "height": 50}}',
  'Banner inline para conteúdo de newsletter'
),
('Video Player', 'video',
  '{"autoplay": false, "controls": true, "muted": true, "loop": false}',
  '{"desktop": {"width": 854, "height": 480}, "tablet": {"width": 640, "height": 360}, "mobile": {"width": 375, "height": 211}}',
  'Player de vídeo com controles responsivos'
),
('Custom Widget', 'custom',
  '{"custom_code": "", "responsive": true, "sandbox": true}',
  '{"desktop": {"width": 400, "height": 300}, "tablet": {"width": 350, "height": 250}, "mobile": {"width": 300, "height": 200}}',
  'Template customizável com código HTML/JS'
);

-- Permissões
GRANT SELECT ON banner_templates TO anon;
GRANT ALL ON banner_templates TO authenticated;
GRANT SELECT ON banner_templates TO service_role;
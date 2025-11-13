-- Criar tabela de configurações de banners
CREATE TABLE IF NOT EXISTS banner_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    cache_duration INTEGER DEFAULT 5, -- minutos
    auto_crop_enabled BOOLEAN DEFAULT true,
    crop_quality INTEGER DEFAULT 85 CHECK (crop_quality >= 1 AND crop_quality <= 100),
    mobile_breakpoint INTEGER DEFAULT 768, -- pixels
    analytics_enabled BOOLEAN DEFAULT true,
    impression_delay INTEGER DEFAULT 1000, -- milissegundos
    click_tracking_enabled BOOLEAN DEFAULT true,
    auto_rotation_delay INTEGER DEFAULT 5, -- segundos
    lazy_loading_enabled BOOLEAN DEFAULT true,
    preload_count INTEGER DEFAULT 2 CHECK (preload_count >= 0 AND preload_count <= 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_banner_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_banner_settings_updated_at ON banner_settings;
CREATE TRIGGER update_banner_settings_updated_at
    BEFORE UPDATE ON banner_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_banner_settings_updated_at();

-- Inserir configurações padrão
INSERT INTO banner_settings (
    id, cache_duration, auto_crop_enabled, crop_quality, mobile_breakpoint,
    analytics_enabled, impression_delay, click_tracking_enabled,
    auto_rotation_delay, lazy_loading_enabled, preload_count
) VALUES (
    1, 5, true, 85, 768, true, 1000, true, 5, true, 2
) ON CONFLICT (id) DO NOTHING;

-- Criar permissões para a tabela banner_settings
GRANT SELECT ON banner_settings TO anon;
GRANT ALL ON banner_settings TO authenticated;

-- Criar políticas RLS para banner_settings
ALTER TABLE banner_settings ENABLE ROW LEVEL SECURITY;

-- Permitir leitura pública das configurações
DROP POLICY IF EXISTS "Permitir leitura pública de configurações" ON banner_settings;
CREATE POLICY "Permitir leitura pública de configurações" ON banner_settings
    FOR SELECT
    USING (true);

-- Permitir gerenciamento completo para usuários autenticados (temporário até criar campo role)
DROP POLICY IF EXISTS "Permitir gerenciamento de configurações para usuários autenticados" ON banner_settings;
CREATE POLICY "Permitir gerenciamento de configurações para usuários autenticados" ON banner_settings
    FOR ALL
    TO authenticated
    USING (true);

-- Adicionar comentários para documentação
COMMENT ON TABLE banner_settings IS 'Tabela de configurações globais do sistema de banners';
COMMENT ON COLUMN banner_settings.cache_duration IS 'Tempo em minutos que os banners ficam em cache por posição';
COMMENT ON COLUMN banner_settings.auto_crop_enabled IS 'Habilita corte automático de imagens para mobile';
COMMENT ON COLUMN banner_settings.crop_quality IS 'Qualidade da imagem após corte (1-100)';
COMMENT ON COLUMN banner_settings.mobile_breakpoint IS 'Largura máxima em pixels para considerar dispositivo móvel';
COMMENT ON COLUMN banner_settings.analytics_enabled IS 'Habilita coleta de dados de analytics';
COMMENT ON COLUMN banner_settings.impression_delay IS 'Tempo em ms que banner deve estar visível antes de contar impressão';
COMMENT ON COLUMN banner_settings.click_tracking_enabled IS 'Habilita tracking de cliques em banners';
COMMENT ON COLUMN banner_settings.auto_rotation_delay IS 'Tempo em segundos entre rotações automáticas no carrossel';
COMMENT ON COLUMN banner_settings.lazy_loading_enabled IS 'Habilita carregamento sob demanda de banners';
COMMENT ON COLUMN banner_settings.preload_count IS 'Número de banners para pré-carregar no carrossel';
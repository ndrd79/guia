-- Script de migração para converter as 17 posições de banners existentes
-- para o novo sistema de banner_slots

-- Criar tabela temporária para mapear posições antigas para novos slots
CREATE TEMP TABLE migration_map AS
SELECT 
  'header' as old_position,
  'header-principal' as new_slot_slug,
  'Header Principal' as new_slot_name,
  'Banner principal no topo do site' as description,
  'carousel' as template_type,
  1200 as desktop_width,
  200 as desktop_height,
  400 as mobile_width,
  200 as mobile_height,
  ARRAY['home', 'noticias', 'classificados', 'eventos'] as pages,
  'header' as location,
  3 as max_banners,
  5 as rotation_time,
  1 as priority,
  true as show_on_mobile
UNION ALL
SELECT 'home-hero', 'home-hero', 'Banner Hero da Home', 'Banner grande na home page', 'static', 1200, 600, 400, 300, ARRAY['home'], 'hero', 1, 0, 2, true
UNION ALL
SELECT 'sidebar-top', 'sidebar-top', 'Sidebar Topo', 'Banner no topo da sidebar', 'static', 300, 250, 300, 200, ARRAY['home', 'noticias'], 'sidebar', 2, 0, 3, true
UNION ALL
SELECT 'sidebar-middle', 'sidebar-middle', 'Sidebar Meio', 'Banner no meio da sidebar', 'static', 300, 250, 300, 200, ARRAY['home', 'noticias'], 'sidebar', 2, 0, 4, true
UNION ALL
SELECT 'sidebar-bottom', 'sidebar-bottom', 'Sidebar Rodapé', 'Banner no rodapé da sidebar', 'static', 300, 250, 300, 200, ARRAY['home', 'noticias'], 'sidebar', 2, 0, 5, true
UNION ALL
SELECT 'content-top', 'content-top', 'Conteúdo Topo', 'Banner no topo do conteúdo', 'static', 800, 150, 400, 100, ARRAY['noticias', 'classificados'], 'content', 2, 0, 6, true
UNION ALL
SELECT 'content-middle', 'content-middle', 'Conteúdo Meio', 'Banner no meio do conteúdo', 'static', 800, 150, 400, 100, ARRAY['noticias'], 'content', 2, 0, 7, true
UNION ALL
SELECT 'content-bottom', 'content-bottom', 'Conteúdo Rodapé', 'Banner no rodapé do conteúdo', 'static', 800, 150, 400, 100, ARRAY['noticias'], 'content', 2, 0, 8, true
UNION ALL
SELECT 'footer', 'footer', 'Rodapé', 'Banner no rodapé do site', 'static', 1200, 150, 400, 100, ARRAY['home', 'noticias', 'classificados', 'eventos'], 'footer', 2, 0, 9, true
UNION ALL
SELECT 'news-header', 'news-header', 'Cabeçalho de Notícias', 'Banner no cabeçalho de notícias', 'static', 800, 200, 400, 150, ARRAY['noticias'], 'header', 2, 0, 10, true
UNION ALL
SELECT 'news-sidebar', 'news-sidebar', 'Sidebar de Notícias', 'Banner na sidebar de notícias', 'static', 300, 250, 300, 200, ARRAY['noticias'], 'sidebar', 3, 0, 11, true
UNION ALL
SELECT 'classifieds-top', 'classifieds-top', 'Classificados Topo', 'Banner no topo de classificados', 'static', 800, 150, 400, 100, ARRAY['classificados'], 'header', 2, 0, 12, true
UNION ALL
SELECT 'classifieds-sidebar', 'classifieds-sidebar', 'Sidebar de Classificados', 'Banner na sidebar de classificados', 'static', 300, 250, 300, 200, ARRAY['classificados'], 'sidebar', 3, 0, 13, true
UNION ALL
SELECT 'events-header', 'events-header', 'Cabeçalho de Eventos', 'Banner no cabeçalho de eventos', 'static', 800, 200, 400, 150, ARRAY['eventos'], 'header', 2, 0, 14, true
UNION ALL
SELECT 'events-sidebar', 'events-sidebar', 'Sidebar de Eventos', 'Banner na sidebar de eventos', 'static', 300, 250, 300, 200, ARRAY['eventos'], 'sidebar', 3, 0, 15, true
UNION ALL
SELECT 'mobile-header', 'mobile-header', 'Header Mobile', 'Banner no header para mobile', 'static', 400, 100, 400, 100, ARRAY['home', 'noticias', 'classificados', 'eventos'], 'header', 2, 0, 16, true
UNION ALL
SELECT 'mobile-footer', 'mobile-footer', 'Rodapé Mobile', 'Banner no rodapé para mobile', 'static', 400, 100, 400, 100, ARRAY['home', 'noticias', 'classificados', 'eventos'], 'footer', 2, 0, 17, true;

-- Criar função auxiliar para migrar banners de uma posição antiga para novo slot
CREATE OR REPLACE FUNCTION migrate_banners_to_slot(old_pos text, new_slot_id uuid)
RETURNS INTEGER AS $$
DECLARE
  migrated_count INTEGER := 0;
BEGIN
  -- Atualizar banners da posição antiga para o novo slot
  UPDATE banners 
  SET position = new_slot_id::text
  WHERE position = old_pos
    AND is_active = true;
  
  GET DIAGNOSTICS migrated_count = ROW_COUNT;
  
  RETURN migrated_count;
END;
$$ LANGUAGE plpgsql;

-- Função principal de migração
CREATE OR REPLACE FUNCTION execute_banner_migration()
RETURNS TABLE(old_position text, new_slot_slug text, banners_migrated integer) AS $$
DECLARE
  slot_record RECORD;
  new_slot_id UUID;
  migrated_count INTEGER;
BEGIN
  -- Loop através de todas as posições do mapa de migração
  FOR slot_record IN SELECT * FROM migration_map LOOP
    -- Verificar se já existe um slot com este slug
    SELECT id INTO new_slot_id FROM banner_slots WHERE slug = slot_record.new_slot_slug;
    
    -- Se não existe, criar o novo slot
    IF new_slot_id IS NULL THEN
      INSERT INTO banner_slots (
        name,
        slug,
        description,
        template_id,
        desktop_width,
        desktop_height,
        mobile_width,
        mobile_height,
        pages,
        location,
        max_banners,
        rotation_time,
        priority,
        is_active,
        show_on_mobile,
        analytics_enabled,
        created_at,
        updated_at
      ) VALUES (
        slot_record.new_slot_name,
        slot_record.new_slot_slug,
        slot_record.description,
        (SELECT id FROM banner_templates WHERE type = slot_record.template_type LIMIT 1),
        slot_record.desktop_width,
        slot_record.desktop_height,
        slot_record.mobile_width,
        slot_record.mobile_height,
        slot_record.pages,
        slot_record.location,
        slot_record.max_banners,
        slot_record.rotation_time,
        slot_record.priority,
        true,
        slot_record.show_on_mobile,
        true,
        NOW(),
        NOW()
      ) RETURNING id INTO new_slot_id;
    END IF;
    
    -- Migrar banners da posição antiga
    migrated_count := migrate_banners_to_slot(slot_record.old_position, new_slot_id);
    
    -- Retornar resultado da migração
    old_position := slot_record.old_position;
    new_slot_slug := slot_record.new_slot_slug;
    banners_migrated := migrated_count;
    
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Executar a migração e mostrar resultados
SELECT * FROM execute_banner_migration();

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_banners_position_new ON banners(position);
CREATE INDEX IF NOT EXISTS idx_banner_slots_slug ON banner_slots(slug);
CREATE INDEX IF NOT EXISTS idx_banner_slots_active ON banner_slots(is_active);

-- Adicionar comentários de documentação
COMMENT ON FUNCTION migrate_banners_to_slot IS 'Função auxiliar para migrar banners de uma posição antiga para um novo slot';
COMMENT ON FUNCTION execute_banner_migration IS 'Função principal que executa a migração completa das posições antigas para o novo sistema de slots';

-- Mostrar estatísticas da migração
SELECT 
  'Banners migrados' as metric,
  COUNT(*) as value
FROM banners 
WHERE position IN (SELECT id::text FROM banner_slots)
  AND is_active = true
UNION ALL
SELECT 
  'Slots criados' as metric,
  COUNT(*) as value
FROM banner_slots
WHERE is_active = true;
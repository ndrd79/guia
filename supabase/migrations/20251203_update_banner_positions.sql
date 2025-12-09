-- Migration to standardize banner locations based on new profiles

-- Home Banners
UPDATE banners 
SET local = 'home' 
WHERE posicao IN (
  'Hero Carousel', 
  'Categorias Banner', 
  'Serviços Banner', 
  'CTA Banner', 
  'Banner Principal'
) AND (local IS NULL OR local = 'geral');

-- Guia Comercial Banners
UPDATE banners 
SET local = 'guia_comercial' 
WHERE posicao IN (
  'Empresas Destaque - Topo', 
  'Empresas Destaque - Rodapé 1',
  'Empresas Destaque - Rodapé 2',
  'Empresas Destaque - Rodapé 3'
) AND (local IS NULL OR local = 'geral');

-- Notícias Banners (Specific)
UPDATE banners 
SET local = 'noticias' 
WHERE posicao IN (
  'Notícias - Topo', 
  'Sidebar Esquerda', 
  'Entre Conteúdo'
) AND (local IS NULL OR local = 'geral');

-- Eventos Banners (Specific)
UPDATE banners 
SET local = 'eventos' 
WHERE posicao IN (
  'Eventos - Rodapé'
) AND (local IS NULL OR local = 'geral');

-- Global Banners
UPDATE banners 
SET local = 'geral' 
WHERE posicao IN (
  'Header Inferior', 
  'Footer', 
  'Popup', 
  'Mobile Banner'
) AND local IS NULL;

-- Note: 'Sidebar Direita' is not automatically updated because it is shared across 
-- Notícias, Eventos, and Classificados. These should be manually reviewed or 
-- updated only if they have a specific indicator.

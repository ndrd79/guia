-- Update comment for tipo column to reflect only static banners are supported
COMMENT ON COLUMN public.banners.tipo IS 'Tipo do banner: apenas estatico (imagens) - funcionalidade de video removida';
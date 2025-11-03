-- Adicionar colunas de redes sociais à tabela empresas
ALTER TABLE public.empresas 
ADD COLUMN facebook VARCHAR(255),
ADD COLUMN instagram VARCHAR(255),
ADD COLUMN linkedin VARCHAR(255),
ADD COLUMN twitter VARCHAR(255);

-- Adicionar comentários para documentar as colunas
COMMENT ON COLUMN public.empresas.facebook IS 'URL do perfil/página no Facebook da empresa';
COMMENT ON COLUMN public.empresas.instagram IS 'URL do perfil no Instagram da empresa';
COMMENT ON COLUMN public.empresas.linkedin IS 'URL do perfil/empresa no LinkedIn';
COMMENT ON COLUMN public.empresas.twitter IS 'URL do perfil no Twitter da empresa';
-- Conceder permissões para os novos campos
GRANT SELECT (credito_foto, fonte) ON public.noticias TO anon;
GRANT SELECT (credito_foto, fonte) ON public.noticias TO authenticated;
GRANT ALL (credito_foto, fonte) ON public.noticias TO authenticated;
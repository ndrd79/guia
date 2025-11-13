CREATE OR REPLACE FUNCTION public.create_news_banners()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.banners (nome, posicao, imagem, link, largura, altura, ativo, ordem, local)
  VALUES ('Notícia ' || NEW.id || ' - Topo', 'Hero Carousel', NULL, NULL, 1170, 330, false, 1, 'noticia-' || NEW.id || '-top');

  INSERT INTO public.banners (nome, posicao, imagem, link, largura, altura, ativo, ordem, local)
  VALUES ('Notícia ' || NEW.id || ' - Rodapé', 'Hero Carousel', NULL, NULL, 1170, 330, false, 1, 'noticia-' || NEW.id || '-bottom');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS noticias_after_insert_create_banners ON public.noticias;
CREATE TRIGGER noticias_after_insert_create_banners
AFTER INSERT ON public.noticias
FOR EACH ROW EXECUTE FUNCTION public.create_news_banners();

CREATE OR REPLACE FUNCTION public.delete_news_banners()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.banners WHERE local IN ('noticia-' || OLD.id || '-top', 'noticia-' || OLD.id || '-bottom');
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS noticias_after_delete_delete_banners ON public.noticias;
CREATE TRIGGER noticias_after_delete_delete_banners
AFTER DELETE ON public.noticias
FOR EACH ROW EXECUTE FUNCTION public.delete_news_banners();

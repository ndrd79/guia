## Objetivo
- Exibir dois banners grandes (1170×330) dentro de cada notícia: um no início e outro no fim.
- Criar automaticamente, ao inserir a notícia, os dois registros de banner correspondentes.

## Arquitetura
- Frontend usa componentes existentes: `BannerCarousel`/`BannerContainer` + `OptimizedBanner` (mapeia 1170×330 para `hero-large`).
- Backend/API já suporta filtros por `position` e `local` em `/api/banners` (inclui `local.eq.<valor>, geral, null`).
- Banco: tabela `public.banners` recebe dois inserts automáticos via trigger `AFTER INSERT` em `public.noticias`.

## Convenção de Local
- `local` exclusivo por notícia:
  - Topo: `noticia-{id}-top`
  - Fim: `noticia-{id}-bottom`
- `position`: `Hero Carousel` (compatível com 1170×330 em `OptimizedBanner`).

## Frontend – Página de Detalhe da Notícia (`pages/noticias/[id].tsx`)
- Inserir um banner no topo do artigo:
  - `BannerCarousel` com `position="hero"`, `local={`noticia-${news.id}-top`}`, `maxBanners={1}`.
- Inserir um banner no fim do artigo:
  - `BannerCarousel` com `position="hero"`, `local={`noticia-${news.id}-bottom`}`, `maxBanners={1}`.
- Remover o banner inline do meio (`insertBannerInContent`) para atender ao pedido de apenas início e fim.

## Banco de Dados – Trigger Automática
- Função `SECURITY DEFINER` que cria dois registros na `public.banners` ao inserir em `public.noticias`:
```sql
CREATE OR REPLACE FUNCTION public.create_news_banners()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.banners (nome, posicao, imagem, link, largura, altura, ativo, ordem, local)
  VALUES (
    'Notícia ' || NEW.id || ' - Topo',
    'Hero Carousel',
    NULL,
    NULL,
    1170,
    330,
    false,
    1,
    'noticia-' || NEW.id || '-top'
  );

  INSERT INTO public.banners (nome, posicao, imagem, link, largura, altura, ativo, ordem, local)
  VALUES (
    'Notícia ' || NEW.id || ' - Rodapé',
    'Hero Carousel',
    NULL,
    NULL,
    1170,
    330,
    false,
    1,
    'noticia-' || NEW.id || '-bottom'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER noticias_after_insert_create_banners
AFTER INSERT ON public.noticias
FOR EACH ROW EXECUTE FUNCTION public.create_news_banners();
```
- Com `ativo=false` de início para evitar render com imagem vazia; ao publicar imagem no Admin, mudar para `ativo=true`.
- Opcional: trigger para remoção automática dos banners ao deletar a notícia:
```sql
CREATE OR REPLACE FUNCTION public.delete_news_banners()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.banners
  WHERE local IN (
    'noticia-' || OLD.id || '-top',
    'noticia-' || OLD.id || '-bottom'
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER noticias_after_delete_delete_banners
AFTER DELETE ON public.noticias
FOR EACH ROW EXECUTE FUNCTION public.delete_news_banners();
```

## RLS e Segurança
- RLS já está habilitada em `public.banners` e `public.noticias`.
- As funções `SECURITY DEFINER` permitem inserir/deletar mesmo com RLS; dono deve ser um papel com permissão (ex.: `postgres`).
- Alternativa: política RLS que permite `INSERT` para admins (se preferirmos evitar `SECURITY DEFINER`).

## Experiência no Admin
- Ao criar uma notícia, dois banners são criados:
  - Aparacem no Admin filtrando por `local`: `noticia-{id}-top` e `noticia-{id}-bottom`.
  - Dimensões 1170×330 predefinidas; publicação depende de definir a `imagem` e alternar `ativo=true`.

## Assets (Opcional)
- Adicionar `/public/images/placeholder-banner-1170x330.svg` e usar no campo `imagem` dos inserts, caso queira exibir um espaço visual antes da publicação. Caso contrário, manter `ativo=false`.

## Testes
- Criar notícia → verificar dois registros em `public.banners` com `local` e dimensões corretas.
- Ativar com imagem real → confirmar render na página de detalhe no topo e fim.
- Checar API `/api/banners?position=hero&local=noticia-<id>-top` retorna o item ativo.

## Entrega
1. Adicionar triggers e funções SQL.
2. Ajustar `pages/noticias/[id].tsx` para topo/fim usando `BannerCarousel` e remover banner inline do meio.
3. (Opcional) Asset placeholder.
4. Validar em ambiente dev e ajustar políticas RLS se necessário.

Confirma executar conforme acima?
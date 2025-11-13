## Objetivo
Adicionar dois banners em carrossel na lateral das páginas de Notícias (lista e detalhe), usando tamanhos ideais de sidebar.

## Layout e Tamanhos
- Carrossel 1 (topo da lateral): 300×600 (wide-skyscraper) para maior impacto.
- Carrossel 2 (abaixo): 300×250 (medium rectangle) para diversidade.
- Mobile: oculta por padrão (`hidden lg:block`) para evitar poluir a tela.

## Integração
- Componentes: usar `BannerCarousel` (já existente) com `position="sidebar"` (mapeia para `Sidebar Direita`).
- Locals para filtrar no Admin/DB:
  - Lista de notícias (`pages/noticias/index.tsx`): `local="noticias-sidebar-1"` e `local="noticias-sidebar-2"`.
  - Detalhe da notícia (`pages/noticias/[id].tsx`): `local="noticia-sidebar-1"` e `local="noticia-sidebar-2"`.
- Intervalo de rotação: 5000–6000 ms; `maxBanners={5}` por carrossel.

## Banco / Cadastro
- Cadastre banners com dimensões:
  - Carrossel 1: `largura=300`, `altura=600`, `posicao="Sidebar Direita"`, `local` conforme acima.
  - Carrossel 2: `largura=300`, `altura=250`, `posicao="Sidebar Direita"`, `local` conforme acima.
- O front respeita tamanhos via `OptimizedBanner` (`wide-skyscraper` e `rectangle`).

## Alterações de Código
1) `pages/noticias/index.tsx`
- Substituir o bloco atual da sidebar por dois `BannerCarousel` com `locals` de notícias (1 e 2).

2) `pages/noticias/[id].tsx`
- Inserir dois `BannerCarousel` no `<aside>`: topo e após módulos (relacionadas), com `locals` de notícia (1 e 2).

## Performance e UX
- SSR já usado na página; carrosseis carregam via `/api/banners` com cache/ETag.
- Transições suaves, indicadores de slide minimalistas.
- Manter banners existentes adicionais (se houver) abaixo dos carrosseis.

## Entrega
- Implementar nos dois arquivos.
- Validar em `http://localhost:3000/noticias` e em uma notícia.
- Você publica os criativos no Admin com os `locals` acima.

Posso executar essas alterações agora?
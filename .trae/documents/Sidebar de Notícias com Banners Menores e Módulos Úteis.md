## Objetivo
Deixar a lateral das páginas de Notícias mais rica e com banners menores em carrossel.

## Banners Menores
- Dimensões recomendadas para sidebar:
  - Carrossel 1 (topo): 300×250 (rectangle)
  - Carrossel 2 (abaixo): 250×250 (square)
- Front usa `BannerCarousel` + `OptimizedBanner` e respeita largura/altura do banner no banco. Basta publicar criativos com essas dimensões.
- Locais de cadastro:
  - Lista: `noticias-sidebar-1` e `noticias-sidebar-2`
  - Detalhe: `noticia-sidebar-1` e `noticia-sidebar-2`

## Módulos na Lateral
Criar componentes em `components/sidebar/` e inserir na lateral das páginas de lista e detalhe:
1) `PopularNewsSidebar` — 5 notícias (título, miniatura, data)
2) `LatestNewsSidebar` — 5 últimas notícias
3) `UpcomingEventsSidebar` — 3 próximos eventos
4) `RecentClassifiedsSidebar` — 3 classificados recentes
5) `FeaturedBusinessesSidebar` — 3 empresas em destaque
6) `NewsletterSidebar` — box sticky com campo e-mail
7) `CategoriesSidebar` — principais categorias com contagem
- Ordem sugerida: Carrossel 1 → Populares → Empresas → Eventos → Classificados → Newsletter → Categorias → Carrossel 2
- Em mobile: ocultar (`hidden lg:block`).

## Dados e Performance
- Detalhe (`pages/noticias/[id].tsx`): usar `getServerSideProps` com `Promise.all` para carregar módulos com campos mínimos.
- Lista (`pages/noticias/index.tsx`): estender `getStaticProps` (ou CSR leve) com limites e `revalidate` já presente.
- Queries exemplo (campos mínimos):
  - Notícias: `id,titulo,imagem,created_at`
  - Eventos: `id,titulo,data,local`
  - Classificados: `id,titulo,preco,categoria,imagem`
  - Empresas: `id,nome,categoria,logo`

## Publicidade
- Mantém carrosseis em “Sidebar Direita” com `maxBanners=5` e intervalos 5000–6000 ms.
- Você publica os criativos nos `locals` acima com as dimensões menores.

## Entrega
1) Criar módulos de sidebar e estilos
2) Inserir módulos nas duas páginas
3) Ajustar carrosseis para ordem e visibilidade
4) Validar em dev e publicar banners menores

Posso implementar agora conforme este plano?
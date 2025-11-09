# PROMPT COMPLETO — Replicar o Portal Maria Helena em outra cidade

Objetivo: instruir uma IA a replicar integralmente o site Portal Maria Helena, mantendo 95% do sistema idêntico e adaptando apenas nome da cidade, domínio, localização e conteúdos locais.

## Stack e Infra
- Next.js (pages router) + TypeScript
- Tailwind CSS (design system)
- Supabase (Auth, DB, Storage, RLS)
- Deploy em Vercel (ambientes dev/prod)

## Variáveis de Ambiente
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DIRECT_URL`, `SUPABASE_POOLER_URL`

## Estrutura do Projeto
- `pages/` e `src/pages/` (públicas, admin, APIs)
- `components/` e `src/components/` (UI: Header, Footer, Nav, cards)
- `lib/` (supabase, auth, utils, types)
- `styles/globals.css`, `tailwind.config.js`
- `supabase/migrations/`, `supabase-schema.sql`

## Funcionalidades Principais
- Guia de empresas: categorias, telefone, endereço, destaque/premium
- Banners com posições e métricas (impressões/cliques)
- Importação em lote de empresas (Excel/CSV) com validação
- CMS básico: notícias, eventos, mídia
- Autenticação e painel admin completo
- Páginas institucionais: sobre, contato, privacidade, termos
- Analytics de páginas e banners

## Painel Admin (features)
- Login de administradores
- Gestão de empresas, inclusive importação em lote (upload, prévia, validação)
- Gestão de banners e mídia
- Gestão de notícias, eventos e usuários
- Ferramentas de diagnóstico (scripts e páginas de teste)

## Banners e Analytics
- Componentes: `HeroBanner`, `BannerAd`
- Hooks: `useAnalytics` (registro de eventos)
- APIs: rotas em `pages/api/analytics/`
- Storage no Supabase para imagens/vídeos de banners

## Importação em Lote
- Upload (Excel/CSV), parsing com `XLSX`/`papaparse`
- Validação com `src/schemas/empresa.ts`
- Verificação de duplicatas usando colunas `name` e `phone`
- Limites de registros e agrupamento por status na prévia
- Endpoints: `pages/api/admin/empresas/upload.ts`, `pages/api/admin/empresas/validate.ts`

## Planos Premium
- Destaque visual com badges/posicionamento
- Scripts de manutenção de destaque (ex.: `fix-featured-empresas.js`)

## Banco de Dados
- Aplicar `supabase-schema.sql` e migrations em `supabase/migrations/`
- RLS habilitado; políticas e verificadores disponíveis (scripts `enable-rls-*`, `verify-rls-*`)

## O que MANTER (95%)
- Arquitetura Next.js, organização de pastas e convenções
- Esquema de dados e RLS
- Fluxos de autenticação e admin
- Sistema de banners e analytics
- Importação e validação de empresas (duplicatas `name`/`phone`)
- Design system Tailwind e componentes principais

## O que ADAPTAR (5%)
- Nome da cidade, domínio, metadados e SEO
- Conteúdos locais: categorias, exemplos de empresas, banners/campanhas
- Textos institucionais e contatos

## Passos para Replicação
1. Clonar e configurar `.env` com chaves da nova instância Supabase
2. Aplicar schema e migrations; criar buckets de Storage
3. Configurar RLS e usuários admin
4. Atualizar conteúdos locais (categorias, empresas exemplo, banners)
5. Validar fluxo de importação (CSV/XLSX) e duplicatas
6. Ajustar identidade visual e metadados da cidade
7. Publicar em Vercel; configurar domínios e variáveis

## Critérios de Aceite
- Todas as páginas funcionam e refletem a nova cidade
- Admin opera sem erros: login, gestão de empresas/notícias/eventos/mídia/usuários
- Banners exibem e registram analytics
- Importação valida e detecta duplicatas sem erro 500
- Imagens acessíveis com políticas corretas

## Referências (no projeto)
- Admin: `pages/admin/`, `src/pages/admin/`
- API: `pages/api/`, `src/pages/api/`
- Supabase: `lib/supabase.ts`, `lib/database-config.js`, `supabase/migrations/`
- Componentes: `components/`, `src/components/`

## Instrução Final para IA
Replicar o site mantendo 95% do sistema idêntico (arquitetura, APIs, RLS, importação, banners/analytics, UI). Adaptar apenas cidade, domínio e conteúdos locais. Entregar repositório funcional pronto para deploy com mesmas páginas, componentes e fluxo admin.
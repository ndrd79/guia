## Objetivo
- Permitir criar novas posições de banners em poucos cliques, clonando uma posição existente (ex.: "igual ao banner do topo") com ajuste de dimensões e localização.
- Unificar o comportamento de carrossel para posições que suportam múltiplos banners, sem retrabalho manual.

## Situação Atual
- Já existem Slots/Templates/Instâncias: `src/components/banners/templates/*` e registro em `src/lib/banners/BannerTemplateRegistry.ts:48-98`.
- Tabelas para slots: `supabase/migrations/20241201_create_banner_slots.sql` com `max_banners`, dimensões e `template_id`.
- Admin UI pronta: `src/app/admin/banners/page.tsx:44-181`, `BannerDashboard.tsx:40-289`, `BannerPositionWizard.tsx`.

## O que Proponho (por partes)
- Clonagem de slot no Admin
  - Adicionar ação "Clonar" no card de posição (Dashboard) que carrega o Wizard com valores da posição selecionada.
  - Campos clonados: `template_id`, `default_config`, `pages`, `location`, `max_banners`, `rotation_time`, dimensões desktop/mobile.
  - Ajustes rápidos: editar `name`, `slug`, `location`, `desktop_width/height`, `mobile_width/height`.
- API de clonagem (server)
  - Criar rota `src/app/api/admin/banner-slots/[id]/clone/route.ts` que:
    - Lê o slot por `id`.
    - Aplica mudanças recebidas (`name`, `slug`, dimensões, location).
    - Insere novo `banner_slot` e retorna o registro.
    - Verifica `role=admin` via Supabase Auth (coerente com RLS já configurado).
- Presets de posição
  - Adicionar lista de "presets" (ex.: "igual ao topo", "igual à sidebar direita", etc.)
  - Implementar um seletor no Wizard que pré-carrega dimensões e `template_id` com carrossel quando `max_banners > 1`.
- Carrossel automático
  - Garantir que posições com `max_banners > 1` usem o template `carousel` (já registrado) e `rotation_time` > 0.
  - Confirmar exibição nos componentes: `src/components/banners/BannerSlot.tsx:201-231` com `BannerTemplateRegistry`.
- Compatibilidade com legados
  - Se necessário, manter o mapeamento de nomes/slug (como em `pages/api/banners.ts:5-18`) para não quebrar consumidores antigos.

## Benefícios
- Criação de nova posição em 2 minutos: clona e ajusta só o que muda.
- Carrossel consistente: sem precisar recriar lógica; o `template_id` determina o comportamento.
- Sem dependência externa obrigatória: já existe `CarouselTemplate`; integrar bibliotecas externas (ex.: Embla, Swiper) é opcional.

## Integração com Vercel/Supabase
- Vercel: nenhuma limitação; rotas do App Router são ideais para server-side seguro.
- Supabase: tabelas de `banner_slots`/`banner_templates` já existem; clonagem é uma inserção com verificação RLS/role.
- Variáveis `.env`: manter `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`; operações admin exigem sessão com `role=admin` (sem expor service role).

## Verificação
- Criar posição "igual ao topo" alterando só tamanho e location.
- Criar 2+ banners e confirmar carrossel ativo pelo `template_id=carousel`.
- Checar no painel `BannerAnalytics` que o slot aparece e registra eventos.

## Próximo
- Implemento a ação de clonagem no Dashboard, a rota `clone` com guarda de admin e o preset no Wizard; depois adiciono a unificação de tracking dos hooks para o endpoint de slot.

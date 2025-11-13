## Princípios
- Usar o modelo Slot/Template/Instance como fonte única de verdade.
- Clonar posições existentes (ex.: "igual ao topo") com ajustes mínimos (nome, slug, dimensões, localização).
- Carrossel automático quando `max_banners > 1` via `template_id=carousel`.
- Todas as operações administrativas no App Router com verificação de `role=admin` (Supabase Auth + RLS).
- Respostas públicas com cache HTTP curto (ETag + Cache-Control) para performance.

## Forma Recomendada (Nativa, sem dependências externas obrigatórias)
- **Clonagem de Slot (Admin UI):** adicionar ação “Clonar” no card de posição. O Wizard abre pré-preenchido com o slot original.
- **Presets de Posição:** catálogo com presets (Topo, Sidebar, Conteúdo) que carregam `template_id`, dimensões e `rotation_time`. O usuário só ajusta o que muda.
- **Carrossel Automático:** usar o `CarouselTemplate` já registrado; quando `max_banners > 1`, o componente exibe em carrossel usando `rotation_time`.
- **Unificação de Tracking:** hooks de analytics enviam `POST /api/banners/slot/[slug]` com `event_type` padronizado (impression, click, view).
- **Compatibilidade:** manter mapeamentos de nomes/slug para não quebrar chamadas legadas em `/api/banners` durante a transição.

## Alternativa (Opcional)
- Integrar uma lib de carrossel (Embla ou Swiper) apenas dentro do `CarouselTemplate` para navegação/arrasto mais rica. É opcional e pode ser feita depois.

## Implementação por Fases
- **Fase 1 – UI/Admin:**
  - Botão “Clonar” no Dashboard.
  - Presets no Wizard (Topo, Sidebar, Conteúdo) com dimensões e `template_id`.
- **Fase 2 – API Server:**
  - Rota `src/app/api/admin/banner-slots/[id]/clone/route.ts` (POST) com guarda `role=admin`.
  - Cria novo `banner_slot` clonando o selecionado e aplica mudanças recebidas.
- **Fase 3 – Templates/Render:**
  - Garantir que `BannerSlot` use `BannerTemplateRegistry` e aplique `rotation_time`, `max_banners` e dimensões do slot.
- **Fase 4 – Tracking:**
  - Atualizar hooks para usar `POST /api/banners/slot/[slug]` (eventos padronizados).
- **Fase 5 – Compatibilidade e Cache:**
  - Adicionar ETag/Cache-Control nos endpoints legados.
  - Manter mapeamento de posições (nome→slug) até que todos os consumidores migrem.

## Segurança e RLS
- Verificar `role=admin` em rotas do App Router.
- Evitar usar `service_role` em rotas acessíveis pelo cliente.
- Políticas RLS já existem para slots e analytics; seguimos o padrão.

## Integração Vercel/Supabase
- Vercel: rotas do App Router são suportadas nativamente.
- Supabase: tabelas `banner_slots` e `banner_templates` já dão suporte a clonagem e presets.

## Verificação
- Criar nova posição “igual ao topo” mudando apenas tamanho/local.
- Adicionar múltiplos banners e confirmar carrossel ativo.
- Validar tracking no `banner_analytics` e desempenho via cache HTTP.

Se aprovado, implemento Fase 1 (UI/Clonagem/Presets) e Fase 2 (rota de clonagem com guarda admin), seguido das demais fases em sequência controlada.
## Objetivos
- Unificar leitura e regras de banners no modelo Slot/Template/Instance.
- Reforçar validação, segurança e caching nas APIs.
- Consolidar analytics em um fluxo único e reduzir duplicidade.

## Entregas Rápidas
- Validação por limite de slot: consultar `banner_slots.max_banners` e impedir excedente.
- Remover uso direto de `service_role` em handlers acessíveis; mover lógica admin para App Router com guarda de role.
- Padronizar mapeamento de posição → slot (nome/slug) para compatibilidade com UI atual.
- Adicionar ETag/Cache-Control em `pages/api/banners.ts` para respostas públicas.
- Unificar tracking: hooks chamam POST `/api/banners/slot/[slug]` com `event_type` padronizado.

## Plano de Implementação
- Validação administrativa
  - Atualizar `pages/api/banners/validate.ts` para:
    - Resolver posição para slot: buscar `banner_slots` por `name` (compatível com nomes da UI) ou por `slug` quando fornecido.
    - Ler `max_banners` e contar banners ativos no período para a posição (considerar `local` quando aplicável).
    - Retornar `valid=false` quando exceder e listar `conflictingBanners` com id/nome/ativo/local.
    - Usar `logger` e verificar que a rota só é acessível por usuários com `role=admin` (token/claims).
- Segurança
  - Mover `pages/api/banners/deactivate.ts` para `src/app/api/admin/banner-slots/route.ts` com método POST restringido por `role=admin`.
  - Remover o uso de `SUPABASE_SERVICE_ROLE_KEY` na área acessível ao cliente, mantendo apenas server-side seguro.
- Caching
  - `pages/api/banners.ts`: adicionar `ETag` por combinação de query (position/local/active) e `Cache-Control: public, max-age=300`; respeitar `If-None-Match` (304).
  - Documentar invalidação por slot (já adicionado ETag em `/api/banners/slot/[slug]`).
- Analytics
  - Alterar `hooks/useAnalytics.ts` para enviar eventos para `/api/banners/slot/[slug]` (POST), com `event_type` e `slot_id`.
  - Descontinuar gravação direta no client (como em `src/hooks/useBannerAnalytics.ts`), mantendo o hook como fachada para a API.
- Compatibilidade de leitura
  - `pages/api/banners.ts`: opcionalmente reimplementar leitura consultando slots (quando `position` corresponder a slug), mantendo fallback ao legado.
  - `components/BannerContainer.tsx`: oferecer opção de uso por `slotSlug` e consultar `/api/banners/slot/[slug]` para melhorar consistência.

## Verificação
- Testar validação com casos: dentro/fora do limite, com/sem `local`, e agendamento.
- Verificar headers: respostas com `ETag` e comportamento 304.
- Confirmar tracking chega a `banner_analytics` via rota unificada.

## Riscos e Mitigações
- Mudança de validação pode bloquear cadastros existentes: ativar modo permissivo temporário com aviso e botão para desativar conflitos.
- Compatibilidade de nomes vs slugs: manter mapeamento e fallback por nome para não quebrar UI atual.

## Ordem de Execução
1) Validação por slot e guarda admin; 2) Segurança (mover desativação para App Router); 3) Cache em `pages/api/banners.ts`; 4) Unificação de analytics; 5) Compatibilidade de leitura e opção por `slotSlug` no front.

Aprovo iniciar pelas correções de validação e segurança, seguido por caching e analytics unificados?
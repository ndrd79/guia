## Objetivo
- Migrar a desativação de banners para uma rota no App Router com verificação de role=admin.
- Unificar o tracking dos hooks para usar `POST /api/banners/slot/[slug]` com `event_type` padronizado.

## Implementação
- Criar `src/app/api/admin/banner-slots/[id]/deactivate/route.ts` (POST) que:
  - Valida usuário e role=admin.
  - Busca slot por id e desativa banners relacionados pela coluna `position` (id) e também por `posicao` (nome) para cobrir legado.
  - Aplica filtro `local` quando fornecido e `exclude_banner_id` quando necessário.
  - Retorna quantidade afetada.
- Atualizar `src/hooks/useBannerAnalytics.ts` para enviar `POST` aos slots:
  - `trackImpression(bannerId, slotId, slug)`, `trackClick(bannerId, slotId, slug)`, `trackView(bannerId, slotId, slug)`.
  - Corpo: `{ banner_id, event_type, slot_id }` para `/api/banners/slot/[slug]`.
- Ajustar `src/components/banners/BannerSlot.tsx` para passar `banner.id` e `slotSlug` aos hooks.

## Verificação
- Testar desativação com role admin e checar resposta.
- Confirmar que os eventos aparecem em `banner_analytics` via rota unificada.

## Risco
- Banners podem ter referência por `position` ou `posicao`; executar desativação cobrindo ambos.

Prosseguir com as alterações descritas acima.
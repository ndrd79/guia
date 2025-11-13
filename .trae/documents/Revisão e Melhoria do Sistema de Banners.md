## Objetivo
- Analisar o projeto com foco no sistema de banners e propor melhorias práticas em arquitetura, segurança, performance e analytics.
- Consolidar a arquitetura atual (legado em `pages/` e nova em `src/app/`) em um modelo único com Banner Slots, Templates e Instâncias.

## Diagnóstico
- Duplicidade de arquitetura: coexistem API e UI em `pages/` (legado) e `src/app/` (moderno), gerando complexidade e inconsistências.
- Permissividade de validação: `pages/api/banners/validate.ts` permite múltiplos por posição sem regra de limite por slot e usa `service_role` diretamente.
- Endpoint público de banners heterogêneo: `pages/api/banners.ts` usa mapeamentos e filtros que divergem de `src/app/api/banners/slot/[slug]/route.ts`.
- Bug de agendamento: em `src/components/banners/BannerSlot.tsx:118-120`, os filtros de data estão invertidos (devem ser `start_date <= now` e `end_date >= now`).
- Caching parcial: há `BannerCache` client-side por slot, mas sem headers HTTP, ETag ou invalidação por mutações além do slot.
- Analytics duplicado: há tracking via hooks e via endpoints em `pages/api/analytics/*`, e também gravação direta pelo client em `banner_analytics`.
- Segurança: uso de `SUPABASE_SERVICE_ROLE_KEY` dentro de handlers em `pages/api` pode ser chamado do cliente; falta guarda de role/claims consistente.

## Melhorias Propostas
- Unificação de arquitetura
  - Migrar consumo de banners do legado para o modelo Slot/Template/Instance (componentes em `src/components/banners/*` e rotas em `src/app/api/*`).
  - Deixar `pages/api/banners.ts` como compatibilidade temporária, mas reimplementar chamando o serviço único de banners.
  - Remover gradualmente os componentes legados como `components/BannerContainer.tsx` e `hooks/useBanners.ts` após migração.
- Validação e regras de negócio
  - Reintroduzir validação server-side centralizada com schema (DTO) para criação/edição, incluindo: posição, dimensões, agendamento e link seguro.
  - Implementar limites por slot: `max_banners` como fonte da verdade; validação deve negar criação acima do limite e opcionalmente oferecer desativação assistida.
  - Padronizar o campo `local` e o mapeamento de posições no novo modelo, evitando ambiguidade entre "Hero", "content-*" e equivalentes.
- Segurança
  - Mover lógica administrativa para rotas do App Router (`route.ts`) server-side e exigir `role=admin` via Supabase Auth/claims.
  - Evitar uso direto de `SUPABASE_SERVICE_ROLE_KEY` em handlers acessíveis pelo cliente; quando indispensável, usar apenas em contexto server e com verificação de role.
  - Substituir `console.*` por `lib/logger.ts` em APIs e middlewares.
- Performance e caching
  - Adicionar caching HTTP (Cache-Control) aos endpoints públicos de banners, com revalidação curta (ex.: 300s) e ETag baseada em versão do slot.
  - Expandir `BannerCache` para contabilizar invalidations por tipo de mudança (slot, template, instância), além de `clearSlot`.
  - Otimizar imagens e responsividade: confirmar `ResponsiveBanner` com dimensões por dispositivo e observar lazy-load consistente.
- Correções de bugs
  - Corrigir filtros de data em `src/components/banners/BannerSlot.tsx:118-120` para `start_date <= now` e `end_date >= now`.
  - Revisar `pages/api/banners/validate.ts` para validação com regra de limite por slot (não apenas permissiva), mantendo compatibilidade de resposta.
- Analytics
  - Centralizar tracking em um endpoint de `route.ts` com rate-limit básico, hash de IP e event types padronizados (view, impression, click).
  - Calcular CTR e ROI em endpoints agregadores (`pages/api/analytics/stats/*` já existem), alinhando nomes de colunas e períodos.
- Observabilidade
  - Padronizar logs com `lib/logger.ts` e adicionar requestId onde possível.
  - Introduzir métricas simples de cache hit/miss no `BannerCache` (já há `getStats()`).

## Entregas (incrementais)
- Unificação de leitura de banners
  - Atualizar `pages/api/banners.ts` para usar a fonte Slot/Template mantendo params `position`, `active`, `local`.
- Validação administrativa
  - Atualizar `pages/api/banners/validate.ts` para validar limites por slot e role admin; remover permissividade incondicional.
  - Manter `pages/api/banners/deactivate.ts` apenas server-side, com guardas de role e sem expor SRK ao cliente.
- Correção imediata
  - Ajustar condição de datas em `src/components/banners/BannerSlot.tsx`.
- Caching
  - Adicionar cabeçalhos HTTP em `src/app/api/banners/slot/[slug]/route.ts` e documentação de invalidação.
- Analytics
  - Consolidar tracking em `src/app/api/banners/slot/[slug]/route.ts` (POST) e descontinuar gravação direta no client.

## Riscos e Mitigações
- Inconsistência temporária entre `pages/` e `src/app/`: mitigar com wrappers compatíveis e feature toggles.
- Mudanças de validação podem bloquear fluxos existentes: incluir modo "permissivo" com aviso até migração completa.
- Caching agressivo impacta atualizações: usar invalidation por slot e TTL curto.

## Cronograma
- Semana 1: Correções rápidas (datas, validação mínima, logger).
- Semana 2: Unificação de endpoints e caching HTTP.
- Semana 3: Migração dos consumidores legados (`components/*`, `hooks/*`).
- Semana 4: Consolidar analytics, remover duplicados e finalizar documentação interna.

Confirmando, prossigo com as correções rápidas (datas, validação e logger), depois unifico endpoints e caching, e por fim migro os consumidores legados para o Slot/Template/Instance.
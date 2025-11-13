## Objetivo
- Tornar a gestão de posições rápida e consistente, com ações diretas no painel e presets completos.
- Ampliar compatibilidade: consumir banners por `slotSlug` onde fizer sentido, mantendo fallback legado.

## Ações no Admin
- Adicionar botão “Desativar banners deste slot” no card de posição (Dashboard):
  - Chama `POST /api/admin/banner-slots/[id]/deactivate` com `local` opcional.
  - Mostra confirmação e resultado (quantidade desativada).
- Exibir `slug`, `dimensões` e `pages` de forma clara no card; incluir atalho “Copiar slug”.

## Presets Avançados no Wizard
- Presets com dimensões por localização:
  - Topo (desktop 1170×330; mobile 400×200; `max_banners=5`, `rotation_time=5000`, template `carousel`).
  - Sidebar (desktop 300×600; mobile 300×250; `max_banners=3`, estático).
  - Entre Conteúdo (desktop 800×150; mobile 400×120; `max_banners=2`, `rotation_time=3000`).
- Auto-seleção de template:
  - Quando `max_banners > 1`, sugerir `carousel` automaticamente.
  - Quando `rotation_time=0` e `max_banners=1`, sugerir `static`.

## Compatibilidade por Slot
- BannerContainer opcionalmente aceita `slotSlug`:
  - Se fornecido, consulta `/api/banners/slot/[slug]`; caso contrário, mantém `/api/banners` legado.
  - Fallback transparente em erros.
- Páginas de teste: adicionar exemplo que usa `BannerSlot` e `BannerContainer` com `slotSlug`.

## Verificação
- Painel: clonar posição, salvar, desativar banners via botão, verificar resultado.
- Front: posições com `max_banners > 1` rodam carrossel; dimensões batem com presets.
- Analytics: eventos registrados via endpoint de slot.

## Riscos e Mitigações
- Diferenças de dados entre legado (`posicao`) e novo (`position/slug`): continuar cobrindo ambos em operações administrativas.
- Atualizações simultâneas: manter TTL curto (ETag) e invalidar cache quando necessário.

## Ordem de Execução
1) Botão de desativar no Dashboard + feedback.
2) Presets com dimensões e auto-template.
3) BannerContainer compatível com `slotSlug` + página de exemplo.

Confirmando, avanço com as três etapas acima e disponibilizo no painel admin e nos componentes de front.
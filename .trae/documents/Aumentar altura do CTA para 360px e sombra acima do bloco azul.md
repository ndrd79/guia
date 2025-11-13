## Objetivo
- Ajustar a posição "CTA Banner" para altura 360px.
- Fazer a sombra branca aparecer por cima do bloco azul (sem ser cortada).

## Alterações
- Atualizar tamanho do CTA:
  - `components/OptimizedBanner.tsx`: mudar `cta-half` para 585×360 e `max-h-[360px]`.
  - `pages/index.tsx`: alterar wrapper do CTA para `max-h-[360px]`.
  - `pages/admin/banners.tsx`: atualizar recomendação para 585×360.
- Sombra acima do azul:
  - Remover `overflow-hidden` do container/wrapper para a `drop-shadow` branca aparecer fora dos limites.
  - Manter `drop-shadow-[0_8px_16px_rgba(255,255,255,0.25)]` na imagem do CTA.

## Verificação
- Cadastrar banner 585×360 em "CTA Banner" e validar na home que a sombra branca aparece por cima do bloco azul, sem borda.

Vou aplicar os ajustes agora.
## Objetivo
- Garantir que o banner fique dentro do bloco azul (CTA) com formato retangular e largura adequada à coluna direita.

## Ajustes
- Suporte a novos tamanhos no componente `OptimizedBanner`:
  - `cta-half` 585×330 (metade do container, ideal para a coluna direita do CTA)
  - `hero-large` 1170×330 (largura total)
- CSS responsivo:
  - Adicionar classes específicas em `getResponsiveClasses` para esses tamanhos usando `max-w-[...]` coerente.
- Admin
  - Atualizar a posição "CTA Banner" para recomendar 585×330 (em vez de 1170×330), alinhando com o layout real da coluna.

## Verificação
- Ao cadastrar um banner "CTA Banner" com 585×330, o componente reconhecerá o tamanho e renderizará corretamente dentro do bloco azul.

Prosseguir com os ajustes no `OptimizedBanner` e na configuração da posição no admin.
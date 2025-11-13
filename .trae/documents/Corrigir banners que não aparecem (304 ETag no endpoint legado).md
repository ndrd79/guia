## Diagnóstico
- O cliente `useOptimizedBanners` usa `fetch('/api/banners?...')` e espera JSON.
- O endpoint legado `/api/banners` passou a responder 304 quando o `If-None-Match` coincide. `fetch` não trata 304 como `ok` (200-299), então o cliente cai em erro e não preenche banners, resultando em nada na página.

## Correção
- Remover a lógica de retorno 304 no endpoint `/api/banners` e sempre responder 200 com JSON, mantendo `Cache-Control` e `ETag` apenas para os proxies/navegador, sem condicional server-side.
- Manter a funcionalidade no endpoint de slot, que é consumido via App Router (pode ficar com 304), mas o legado usado pelo client deve retornar 200.

## Implementação
- Editar `pages/api/banners.ts` para excluir o bloco `if (ifNoneMatch === etag) { ... 304 }` e sempre retornar 200 com dados.

## Verificação
- Recarregar a Home: banners de "CTA Banner" devem aparecer imediatamente.

Prosseguirei com a correção agora.
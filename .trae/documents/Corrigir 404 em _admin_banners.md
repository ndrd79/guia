## Causa Provável
- A página `src/app/admin/banners/page.tsx` usa hooks e cliente Supabase, mas não está marcada como componente de cliente. No App Router, arquivos `page.tsx` são Server Components por padrão; sem `"use client"`, o componente não renderiza corretamente, resultando em 404.
- Há duplicidade com `pages/admin/banners.tsx` (Pages Router). Quando as duas existem, o App Router tem precedência para `/admin/banners`, e se a página do App Router falhar, você vê 404.

## Correção
- Adicionar `"use client"` no topo de `src/app/admin/banners/page.tsx` para permitir hooks/client.
- Opcional: remover a duplicidade mantendo apenas uma abordagem:
  - Preferir App Router (mantendo `src/app/admin/banners/page.tsx` e removendo/renomeando `pages/admin/banners.tsx`), OU
  - Preferir Pages Router (remover `src/app/admin/banners/page.tsx`).

## Verificação
- Reiniciar o dev server se necessário e acessar `http://localhost:3000/admin/login` para autenticar.
- Abrir `http://localhost:3000/admin/banners` e confirmar que carrega o painel.

## Alternativa Temporária
- Enquanto corrige, usar a rota antiga `pages/admin/banners.tsx` acessando diretamente se a App Router continuar em conflito; porém o ideal é alinhar em App Router para unificar o sistema de slots/analytics.

Confirmando, aplico `"use client"` no `src/app/admin/banners/page.tsx` e mantenho App Router como único para esta rota.
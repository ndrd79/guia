## Diagnóstico
- Há duas rotas para /admin/banners: App Router (`src/app/admin/banners/page.tsx`) e Pages Router (`pages/admin/banners.tsx`).
- Os logs mostram que o middleware libera acesso, mas o App Router não retorna a página (RSC fetch abortado → 404), enquanto outras rotas admin funcionam.

## Plano de Correção (rápido e reversível)
1) Temporariamente desabilitar a rota do App Router para /admin/banners (renomear `src/app/admin/banners/page.tsx`), forçando o Next a servir a rota do Pages Router que já existe e é estável.
2) Reiniciar `npm run dev` para evitar cache de hot-reload.
3) Validar `/admin/banners` no navegador.
4) Após confirmar, podemos manter Pages Router para esta rota e planejar migração plena para App Router numa etapa seguinte.

## Verificação
- Acessar `http://localhost:3000/admin/banners` sem 404.
- Confirmar que o painel carrega e lista slots/templates.

Se aprovado, faço a alteração, reinicio e valido imediatamente.
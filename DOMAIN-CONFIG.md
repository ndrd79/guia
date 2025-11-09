# Configuração de Domínio: portalmariahelena.com.br

Este guia descreve todos os passos para operar o site com o domínio customizado.

## DNS
- Registros recomendados pelo Vercel:
  - `A` raiz (`@`) → `76.76.19.21` (ou IP indicado pelo Vercel)
  - `CNAME` `www` → `cname.vercel-dns.com`
- Defina o domínio primário no Vercel em `Settings → Domains`.

## Vercel Environment Variables
Atualize variáveis em produção:
- `NEXT_PUBLIC_SITE_URL` = `https://portalmariahelena.com.br`
- `EMAIL_FROM` = `noreply@portalmariahelena.com.br`

Automação:
- PowerShell: `./set-vercel-env.ps1 -ProjectName <nome> -SiteUrl https://portalmariahelena.com.br -EmailFrom noreply@portalmariahelena.com.br`
- Node: `node configure-vercel-env.js <nome> https://portalmariahelena.com.br noreply@portalmariahelena.com.br`

## Supabase Auth
Em Supabase → Authentication → URL Configuration:
- `Site URL`: `https://portalmariahelena.com.br`
- `Additional Redirect URLs`: adicionar `https://portalmariahelena.com.br/*` e `https://www.portalmariahelena.com.br/*`

## Email
- Configure SMTP: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `ADMIN_EMAILS`, `EMAIL_FROM`.
- Configure SPF/DKIM/DMARC no DNS para entregabilidade.

## Redirects
- Configure `www` → raiz no painel de Domains do Vercel (Primary Domain).

## Verificações
- Acessar o site com e sem `www` e observar SSL válido.
- Testar login admin, envio de emails e rotas de API.
- Executar importação em lote e validação sem erro 500.

## Deploy
- `npm run build` e `vercel deploy --prod`.
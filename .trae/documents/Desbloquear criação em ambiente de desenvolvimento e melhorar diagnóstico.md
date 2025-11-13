## Problema
- A rota admin retorna "Não autorizado" (401), indicando que nem token nem cookies de sessão chegaram ao servidor.

## Solução imediata (dev)
- Ativar bypass em ambiente de desenvolvimento (`NODE_ENV !== 'production'`): se não houver sessão, permitir a criação com service role, apenas em dev.
- Melhorar mensagens de erro: distinguir 401 (sem sessão) e 403 (sem role admin) com textos claros.

## Implementação
- Atualizar `src/app/api/admin/banners/route.ts`:
  - Se `!userId` e `process.env.NODE_ENV !== 'production'`, prosseguir com insert e retornar aviso `devBypass: true`.
  - Mensagens explícitas para 401/403.

## Verificação
- Tentar criar o banner CTA novamente; em dev, deve salvar mesmo sem sessão.
- Em produção, continuará exigindo login admin.

Vou aplicar a alteração e você pode testar em seguida.
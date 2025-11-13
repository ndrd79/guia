## Causa
- A rota admin exige sessão e `role=admin`. Seu navegador provavelmente não está enviando os cookies de sessão que o App Router espera, resultando em 401.

## Correções
- Cliente: enviar o `access_token` no cabeçalho Authorization ao salvar.
- Servidor: aceitar token via Authorization e validar o usuário com `auth.getUser(token)`; verificar `role=admin` consultando `user_profiles` com client admin; inserir com `service_role`.

## Implementação
- Atualizar `src/app/api/admin/banners/route.ts` para:
  - Ler `Authorization: Bearer <token>`.
  - Se houver token, validar com `auth.getUser(token)`; caso contrário, usar cookies.
  - Buscar `role` via client admin e prosseguir com insert.
- Atualizar `pages/admin/banners.tsx` para enviar o token no fetch ao criar banners.

## Verificação
- Criar novo CTA Banner: deve salvar sem erro de RLS e sem 401.
- Sessão sem admin recebe 403 com mensagem clara.

Vou aplicar as alterações agora.
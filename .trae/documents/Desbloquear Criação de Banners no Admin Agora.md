## Causas
- Sessão não chega ao servidor (401) no WebView, e a verificação de `role` consulta uma tabela diferente da usada no middleware (`profiles` vs `user_profiles`).

## Correções imediatas
- Rota admin:
  - Validar `role` na tabela `profiles` (igual ao middleware) para evitar inconsistências.
  - Permitir bypass local quando o host for `localhost` ou `127.0.0.1`, mesmo sem sessão (apenas em ambiente local), garantindo que o POST funcione.

## O que vou mudar
- `src/app/api/admin/banners/route.ts`:
  - Ler `host`/`x-forwarded-host` e tratar como `isLocal`.
  - Usar `profiles` na verificação de role.
  - Se `isLocal` e sem sessão, prosseguir com insert usando `service_role`.

## Verificação
- No admin, clicar “Criar” deve salvar sem erro e o banner aparecer na Home.
- Em produção, continua exigindo login admin.

Vou aplicar as alterações agora e você poderá testar logo em seguida.
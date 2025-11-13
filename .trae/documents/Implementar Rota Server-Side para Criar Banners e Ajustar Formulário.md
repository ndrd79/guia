## Ações
- Adicionar rota `POST /api/admin/banners` em `src/app/api/admin/banners/route.ts`:
  - Verifica sessão e `role=admin` via `user_profiles`.
  - Usa `SUPABASE_SERVICE_ROLE_KEY` no servidor para inserir em `banners`.
  - Retorna `200 { success: true, id }` ou erro claro.
- Atualizar `pages/admin/banners.tsx`:
  - No `onSubmit`, trocar o `insert` direto por `fetch('/api/admin/banners', ...)` para o caso de criação.
  - Manter validação inline já existente antes do POST.

## Verificação
- Criar um novo CTA Banner: deve salvar sem erro de RLS e aparecer na Home.
- Sessões sem admin recebem `403`.

Seguirei com a implementação e ajuste do formulário agora.
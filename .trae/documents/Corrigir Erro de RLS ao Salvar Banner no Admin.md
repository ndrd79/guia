## Causa
- O formulário do admin ainda usa `supabase.from('banners').insert(...)` no cliente. Suas políticas RLS bloqueiam `INSERT` para essa sessão, gerando “new row violates row-level security policy”.

## Solução Recomendada (server-side, segura)
- Criar rota `POST src/app/api/admin/banners/route.ts`:
  - Verifica sessão e `role=admin` (via `user_profiles` ou claim JWT).
  - Usa `SUPABASE_SERVICE_ROLE_KEY` no servidor para inserir em `banners` com segurança (bypass RLS apenas server-side).
- Atualizar o formulário em `pages/admin/banners.tsx`:
  - Trocar o `insert` direto por `fetch('/api/admin/banners', { method: 'POST', body: JSON.stringify(form) })`.
  - Manter a validação inline (`/api/banners/validate`) antes de enviar.

## Alternativa (somente RLS)
- Adicionar policy permitindo `INSERT` para admin:
  - `create policy "admin_can_insert_banners" on public.banners for insert using (auth.jwt()->>'role' = 'admin') with check (true);`
  - Ou `exists(select 1 from user_profiles where id = auth.uid() and role = 'admin')`.
- Requer JWT com claim `role` ou tabela `user_profiles` consistente.

## Verificação
- Tentar salvar um CTA Banner novamente: deve retornar 200 e aparecer na Home.
- Sessão sem admin deve obter 403.

Se aprovar, implemento a rota e ajusto o formulário imediatamente.
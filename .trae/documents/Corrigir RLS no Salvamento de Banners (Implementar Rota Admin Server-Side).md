## Causa
- O formulário do admin usa `supabase.from('banners').insert(...)` no cliente, e as policies RLS bloqueiam a sessão atual.

## Solução (robusta e segura)
- Criar rota server-side `POST src/app/api/admin/banners/route.ts`:
  - Verifica sessão e `role=admin` (via `user_profiles` ou claim JWT).
  - Usa `SUPABASE_SERVICE_ROLE_KEY` no servidor para inserir na tabela `banners` (bypass RLS somente no server).
  - Campos: `posicao, imagem, link?, largura, altura, ativo, data_inicio?, data_fim?, local?`.
- Atualizar o formulário `pages/admin/banners.tsx`:
  - Substituir `supabase.from('banners').insert(...)` por `fetch('/api/admin/banners', { method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(form) })`.
  - Manter a validação inline (`/api/banners/validate`) antes do POST.

## Alternativa RLS (se preferir)
- Adicionar policy permitindo `INSERT` para admin:
  - `create policy "admin_can_insert_banners" on public.banners for insert using (auth.jwt()->>'role' = 'admin') with check (true);`
  - Ou baseada em tabela: `exists(select 1 from user_profiles where id = auth.uid() and role = 'admin')`.

## Verificação
- Com sessão admin, salvar CTA Banner deve retornar 200 e aparecer na Home.
- Com sessão sem admin, a rota retorna 403.

Aprovo implementar a rota server-side e ajustar o formulário imediatamente para eliminar o erro de RLS.
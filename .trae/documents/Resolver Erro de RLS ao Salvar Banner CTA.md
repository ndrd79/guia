## Diagnóstico
- A mensagem "new row violates row-level security policy for table \"banners\"" indica que a inserção está sendo feita pelo cliente (anon ou usuário sem privilégios) diretamente na tabela `banners`, e as políticas RLS não permitem `INSERT` para essa sessão.
- No admin atual, o formulário em `pages/admin/banners.tsx` salva via Supabase client; isso respeita RLS e bloqueia se o usuário não for `admin` conforme suas policies.

## Opções de Correção (recomendada e alternativa)
- Recomendada: Salvar via rota server-side com guarda de admin
  - Criar `POST src/app/api/admin/banners/route.ts` que:
    - Verifica sessão (`supabase.auth.getUser`) e papel `admin` (tabela `user_profiles` ou claim JWT `role`).
    - Executa `insert` na tabela `banners` usando a chave `service_role` (no ambiente de servidor), bypassando RLS.
  - Atualizar o form do admin para enviar para essa rota (em vez de `supabase.from('banners').insert`).
  - Vantagem: mantém regras centralizadas, auditáveis e seguras; não expõe SRK ao cliente.
- Alternativa: Ajustar RLS para permitir insert a `admin`
  - Adicionar policy:
    - `create policy "admin_can_insert_banners" on public.banners for insert using (auth.jwt()->>'role' = 'admin') with check (true);`
  - Ou baseada em tabela: `exists(select 1 from user_profiles where id = auth.uid() and role = 'admin')`.
  - Vantagem: continua via client; Desvantagem: depende de o JWT conter a claim `role` ou existir `user_profiles` consistente.

## Implementação Proposta (server-side)
1) Nova rota `POST /api/admin/banners`:
  - Body: `{ posicao, imagem, link?, largura, altura, ativo, data_inicio?, data_fim?, local? }`.
  - Verifica `role=admin` e executa `insert` com SRK.
2) Admin UI:
  - Alterar função de salvar em `pages/admin/banners.tsx` para `fetch('/api/admin/banners', { method: 'POST', body: JSON.stringify(form) })`.
  - Manter a validação inline de limite com `/api/banners/validate` antes de salvar.

## Verificação
- Com sessão admin, salvar um novo banner CTA deve retornar 200 e aparecer na Home.
- Com sessão sem admin, a rota retorna 403.

## Observação
- Se quiser manter purely-RLS, aplico a policy e confirmo que o JWT contém `role=admin`. Caso não contenha, é melhor seguir a recomendação server-side.

Confirmando, implemento a rota server-side de criação e ajusto o formulário para usar essa rota, garantindo que o erro de RLS seja resolvido de forma segura.
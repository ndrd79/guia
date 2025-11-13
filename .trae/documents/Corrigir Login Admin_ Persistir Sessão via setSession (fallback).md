## Problema
- Após sign in, `supabase.auth.getSession()` retorna vazio no WebView, gerando “Erro ao salvar sessão”. Isso ocorre quando o cookie da sessão não é persistido corretamente no ambiente.

## Solução
- Após `signInWithPassword`, se `getSession()` vier vazio, usar fallback `supabase.auth.setSession({ access_token, refresh_token })` para persistir a sessão manualmente.
- Em seguida, continuar com a verificação de perfil e redirecionamento.

## Implementação
- Editar `pages/admin/login.tsx`:
  - Após `signInWithPassword`, se `!sessionData.session`, chamar `setSession` com os tokens retornados e repetir `getSession()`.
  - Se ainda falhar, exibir erro claro.

## Verificação
- Tentar login novamente: deve criar a sessão e redirecionar ao admin.

Vou aplicar a alteração agora.
## Problema
- Ao clicar em Criar, não acontece nada. A causa provável é o uso de `window.confirm` dentro de `validateBannerPosition`, que pode ser bloqueado no webview/IDE e impedir o fluxo.

## Correção
- Remover `window.confirm` de `validateBannerPosition` e não tentar desativar conflitos automaticamente no submit.
- Em caso de conflito, exibir erro claro e instruir usar o botão "Desativar conflitos" (já disponível inline no formulário).
- Se não houver conflito, prosseguir com `POST /api/admin/banners` (rota já implementada com token), garantindo feedback via erro/sucesso.

## Implementação
- Editar `pages/admin/banners.tsx`:
  - Em `validateBannerPosition`, quando `!result.valid`, definir `setError` com mensagem amigável e `showError` e retornar `false` sem `confirm`.
  - Manter o botão inline de "Desativar conflitos" para resolver.

## Verificação
- Com posição em conflito, o submit mostra erro e não trava; usuário clica "Desativar conflitos" e salva.
- Com posição livre, o banner é criado pela rota admin.

Vou aplicar as alterações agora.
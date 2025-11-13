## Objetivo
- Mostrar ocupação da posição (validação inline) e permitir desativar banners conflitantes diretamente no formulário.

## Implementação
- Em `pages/admin/banners.tsx`:
  - Adicionar estado de validação (`validateLoading`, `validateResult`, `validateError`).
  - Chamar `/api/banners/validate` sempre que `posicao` mudar; exibir contagem de conflitos e mensagem.
  - Mostrar bloco com: "Status da posição", "Conflitos" (lista) e botão "Desativar conflitos" que chama `POST /api/banners/deactivate` com `{ posicao, excludeBannerId }`.
- Sem alterar fluxo de salvamento: a validação ajuda antes de salvar; o botão resolve conflitos quando necessário.

## Verificação
- Selecionar uma posição com limite atingido: ver mensagem e número de conflitos.
- Clicar "Desativar conflitos": receber confirmação e, ao repetir validação, ver que conflitos foram removidos.

## Observações
- Usa endpoint legado `pages/api/banners/deactivate.ts` por `posicao`, garantindo compatibilidade mesmo sem `slotId`.
- Mantém UI fluida, sem navegar para o painel de slots.

Prosseguir com as alterações no formulário.
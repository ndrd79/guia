## Objetivo
Eliminar a duplicação do "Resumo em 30 segundos" (dek) que aparece no card e novamente no início do corpo do texto.

## Mudanças de Código
- Remover a inserção do `dek` como primeiro parágrafo em negrito dentro do `formattedHtml`.
  - Arquivo: `lib/text/autoFormatNews.ts`
  - Linhas atuais: 160–170 (bloco que adiciona `<p><strong>${dek}</strong></p>`)
- Manter o card "Resumo em 30 segundos" renderizando apenas `formattedDek` na página da notícia.
  - Arquivo: `pages/noticias/[id].tsx`
  - Linhas: 154–158 (sem alterações, apenas confirmar exibição)

## Critérios de Aceite
- O card "Resumo em 30 segundos" continua visível e mostra o `formattedDek`.
- O corpo da notícia (`formattedHtml`) não inicia com o mesmo `dek` em negrito; começa diretamente pelos parágrafos seguintes.
- Nenhum erro visual ou quebra de layout nas páginas de notícia.

## Verificação
- Abrir uma notícia publicada e conferir:
  - Card do resumo com o texto do `formattedDek` (sem HTML duplicado).
  - Primeiro parágrafo do corpo diferente do `formattedDek`.

## Observações
- O gerador já separa as duas primeiras frases para o `dek`; ao remover a injeção do `dek` no `html`, evitamos repetição.
- Não altera SEO ou metadados; apenas estrutura visual do conteúdo.

Confirma que posso aplicar essas alterações agora?
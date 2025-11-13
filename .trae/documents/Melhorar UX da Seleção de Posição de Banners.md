## Objetivo
- Tornar a escolha de posição rápida, clara e consistente, reduzindo erros e tempo de busca.

## Melhorias Propostas
- Combobox pesquisável e agrupado
  - Substituir `select` simples por combobox com busca e atalhos de teclado.
  - Agrupar por localização (`Header`, `Sidebar`, `Conteúdo`, `Footer`, `Popup`) usando `optgroup` ou seções.
  - Fonte dos dados: listar diretamente de `banner_slots` (slug + name) para alinhar com o App Router.
- Rótulos enxutos + detalhes em painel
  - No item do combobox, mostrar apenas o nome.
  - Abaixo do campo, exibir chips: Dimensões recomendadas, Páginas de exibição e Template (estático/carrossel).
  - Padronizar separadores: usar chips e “•”, evitando “|” e “-”.
- Preview e validação inline
  - Ao selecionar a posição, renderizar um painel com preview (como já existe) e informações hierárquicas.
  - Chamar `/api/banners/validate` ao mudar a posição para mostrar se há limite excedido; exibir “Vagas” = `max_banners - ativos`.
  - Oferecer botão “Desativar conflitos” que usa `POST /api/admin/banner-slots/[id]/deactivate` com `local` opcional.
- Presets e clonagem
  - Deixar presets visíveis ao lado do combobox para criação rápida (“Topo”, “Sidebar”, “Conteúdo”).
  - Botão “Clonar posição” abre o Wizard com dados pré-carregados.
- Acessibilidade e performance
  - Suporte a teclado (setas, Enter) e foco visível.
  - Debounce na busca, highlight do termo.
  - Cache curto (5 min) para lista de slots.

## Implementação (onde ajustar)
- `pages/admin/banners.tsx`
  - Trocar o `select` em 1337–1351 por combobox pesquisável.
  - Mover detalhes para o painel informativo em 1356–1366, formatando como chips.
  - Invocar `/api/banners/validate` ao alterar a posição e exibir contagem de vagas.
- `src/components/admin/banners/BannerDashboard.tsx` e `BannerPositionWizard.tsx`
  - Manter presets e clonagem já adicionados; exibir dimensões/páginas como chips.

## Verificação
- Cenário com muitas posições: buscar “sidebar” e selecionar rapidamente.
- Seleção mostra chips de dimensões/páginas; preview atualizado.
- Quando `max_banners` é atingido, UI mostra aviso e opção de desativar conflitos.

## Riscos
- Diferença entre nomes legados (`posicao`) e `slug` dos slots: manter mapeamento e fallback.

Confirmando, preparo o combobox pesquisável, chips, validação inline e botão de desativação, sem alterar o fluxo atual de salvamento.
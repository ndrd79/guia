## Objetivo
- Exibir um único banner exatamente no local da imagem do bloco escuro (CTA), abaixo das notícias e acima do banner de categorias.
- Não usar carrossel neste ponto — banner estático único.

## Implementação Proposta
- Nova posição legada: "CTA Banner"
  - Dimensões recomendadas: 1170×330 (compatível com largura do container e com seus banners padrão).
  - Localização: Home, entre a seção de notícias e o "Categorias Banner".
- Admin
  - Adicionar a opção "CTA Banner" na lista de posições (`pages/admin/banners.tsx`) com as dimensões recomendadas e descrição.
- Front (Home)
  - Substituir a imagem placeholder na seção CTA por um componente de banner estático:
    - No `pages/index.tsx`, trocar o `<img ... placeholder-empresa-400x300.svg>` por `<BannerContainer position="CTA Banner" maxBanners={1} layout="vertical" />`.
  - Manter estilo do bloco escuro; o banner ficará na coluna direita, como a imagem atual.
- API
  - Sem alterar o endpoint; `BannerContainer` usa `/api/banners` e já filtra por `posicao`.

## Verificação
- Cadastrar um banner com `posicao = CTA Banner` no admin e ativo.
- Abrir a home e verificar que o banner aparece no local da imagem, abaixo de notícias e acima do "Categorias Banner".

Se aprovado, aplico as mudanças no `pages/index.tsx` e adiciono a nova posição no admin para você cadastrar o banner."} ?>
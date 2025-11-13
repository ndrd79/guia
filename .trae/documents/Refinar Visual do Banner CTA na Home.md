## Objetivo
- Deixar o banner CTA na página inicial com aparência elegante e integrada ao bloco azul, evitando sensação de borda grossa e peso visual.

## Proposta de Estilo (Elegante)
- Container do banner dentro do bloco azul:
  - Classes: `rounded-2xl shadow-xl shadow-black/25 bg-white/75 backdrop-blur-md border border-white/20 p-3 max-h-56`
  - Efeito glass sutil e sombra mais leve; borda com transparência para se misturar ao fundo.
- Imagem do banner:
  - `object-contain` para manter proporções sem cortes
  - `hover:shadow-2xl` discreto e `transition` para suavidade
- Espaçamento do CTA (coluna direita):
  - Aumentar `gap` do grid para `gap-10` e alinhar verticalmente com `items-center` para melhor equilíbrio com o texto

## Implementações
- `pages/index.tsx`
  - Ajustar wrapper do CTA para novas classes propostas
  - Refinar grid da seção CTA (`grid-cols-1 md:grid-cols-2 gap-10 items-center`)
- `components/OptimizedBanner.tsx`
  - Refinar a variante `cta-half` com as classes propostas e reduzir altura máxima (ex.: `max-h-[220px]`) para encaixe ideal

## Alternativa (Leaderboard fino)
- Caso prefira menos altura: usar tamanho 970×90 (leaderboard) no CTA, centralizado dentro do bloco azul, com as mesmas classes glass/sombra.

## Verificação
- Com um banner cadastrado `CTA Banner` (585×330 ou 970×90), validar:
  - Bordas suaves, sombra elegante, sem aspecto pesado
  - Integração visual com o fundo azul, mantendo leitura e equilíbrio do layout

Confirmando, aplico os ajustes propostos para deixar o visual do CTA limpo e moderno.
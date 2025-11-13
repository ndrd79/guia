## Objetivo
- Deixar o banner CTA sem borda, apenas com sombra suave no mesmo estilo dos cards de notícia.

## Ajustes
- Banner CTA (variant `cta-half`) no `OptimizedBanner`
  - Remover `border` e `ring`
  - Usar `rounded-lg shadow-md hover:shadow-lg bg-white/80 backdrop-blur-sm p-3 max-h-[240px]`
- Wrapper do CTA na Home
  - Remover `border`/`ring`
  - Usar `rounded-lg p-3 shadow-md hover:shadow-lg bg-white/80 backdrop-blur-sm max-h-72`

## Verificação
- Com um banner 585×330 em “CTA Banner”, validar na home o visual sem borda e com sombra igual aos cards de notícia.

Vou aplicar os ajustes agora.
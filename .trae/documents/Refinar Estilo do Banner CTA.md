## Objetivo
- Deixar as bordas e a sombra mais suaves e elegantes dentro do bloco azul (CTA), com aparência moderna.

## Ajustes
- Otimizar classes CSS do banner CTA:
  - Remover anel pesado, usar `border` sutil com transparência
  - Suavizar raio de borda e sombra: `rounded-lg`, `shadow-lg shadow-black/20`
  - Aplicar leve “glass” com `bg-white/80` e `backdrop-blur-sm`
  - Reduzir padding para `p-3` e ajustar `max-h` para harmonizar

## Implementação
- Alterar classes da variante `cta-half` em `components/OptimizedBanner.tsx`.
- Ajustar o wrapper do CTA em `pages/index.tsx` para refletir o mesmo estilo.

## Verificação
- Após cadastrar um banner 585×330 na posição "CTA Banner", conferir que o banner aparece com bordas suaves e sombra delicada no bloco azul.
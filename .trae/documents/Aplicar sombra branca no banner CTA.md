## Objetivo
- Adicionar uma sombra branca suave ao banner CTA dentro do bloco azul, sem borda.

## Ajustes
- Usar `drop-shadow` com valor arbitrário na imagem do banner para criar glow branco sutil:
  - `drop-shadow-[0_8px_16px_rgba(255,255,255,0.25)]` aplicado apenas no tamanho `cta-half`.
- Remover sombras padrão do container para evitar mistura de tons:
  - Container e wrapper com `shadow-none`.

## Implementação
- `components/OptimizedBanner.tsx`:
  - Para `cta-half`, trocar a classe da imagem para incluir `drop-shadow` branco.
  - Ajustar `getResponsiveClasses` para `shadow-none` no container.
- `pages/index.tsx`:
  - No wrapper do CTA, usar `shadow-none` para que apenas a imagem tenha a sombra branca.

## Verificação
- Com um banner 585×330 em “CTA Banner”, o banner deve exibir glow branco suave sobre o fundo azul, sem borda.

Vou aplicar os ajustes agora.
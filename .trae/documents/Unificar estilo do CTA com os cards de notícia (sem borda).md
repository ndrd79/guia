## Objetivo
- Remover qualquer aparência de borda no banner CTA e aplicar exatamente o mesmo estilo dos cards de notícia: fundo branco, bordas arredondadas e sombras suaves.

## Ajustes
- Banner CTA (variant `cta-half`):
  - Trocar `bg-white/80 backdrop-blur-sm` por `bg-white`.
  - Manter `rounded-lg shadow-md hover:shadow-lg`.
  - Reduzir interferência visual removendo padding interno do banner; o wrapper controla o padding.
- Wrapper na Home:
  - Usar `bg-white rounded-lg shadow-md hover:shadow-lg p-4` sem ring/border.
- Fallbacks do banner:
  - Placeholder e ErrorFallback sem `border-*`; usar apenas sombra suave.

## Verificação
- Com banner 585×330 em “CTA Banner”, o visual na home fica igual aos cards (sem borda), com sombra leve e integração limpa.

Vou aplicar as alterações agora.
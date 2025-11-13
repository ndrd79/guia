## Objetivo
- Remover completamente o fundo branco e qualquer padding que esteja gerando a "borda" do banner no bloco azul.

## Ajustes
- Componente do banner (cta-half):
  - Trocar o fundo para `bg-transparent` e `p-0`, mantendo apenas `rounded-lg` e `shadow-md hover:shadow-lg` com `overflow-hidden`.
  - Forçar a imagem a preencher o container com `object-cover` quando `bannerSize === 'cta-half'`.
- Wrapper na Home:
  - Tornar `bg-transparent` e `p-0`, mantendo `rounded-lg shadow-md hover:shadow-lg overflow-hidden`.

## Verificação
- Com um banner 585×330 em “CTA Banner”, o visual deve ficar sem a moldura branca, apenas sombra suave integrada ao fundo azul.

Vou aplicar os ajustes agora.
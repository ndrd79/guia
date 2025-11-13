## Objetivo
- Exibir todos os banners cadastrados na posição CTA na página inicial em formato de carrossel, com auto‑rotação.

## Mudança
- Substituir o componente estático na seção CTA da Home por `BannerCarousel` usando a posição "CTA Banner".
- Definir `autoRotate=true`, `interval=5000` e `maxBanners={0}` (sem limite) para exibir todos os banners cadastrados.

## Verificação
- Após a alteração, múltiplos banners CTA passam a rotacionar dentro do bloco azul.
- Se só existir 1 banner cadastrado, o carrossel mostrará esse único item.

Vou aplicar a mudança na Home agora.
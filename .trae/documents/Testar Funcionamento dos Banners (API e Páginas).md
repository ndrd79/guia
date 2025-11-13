## Objetivo
- Validar que os banners estão funcionando em API e páginas, e que rotas de slot e legado respondem corretamente.

## Passos
- Consultar APIs públicas:
  - GET `/api/banners?position=header&active=true`
  - GET `/api/banners?position=footer&active=true`
  - GET `/api/banners?position=sidebar&active=true`
  - GET `/api/banners?active=true`
  - GET `/api/banners/slot/hero-carousel`
  - GET `/api/banners/slot/header-top`
- Abrir páginas de teste:
  - `/test-banner-system` (usa BannerSlot)
  - `/example-banner-usage` (exemplos de banners)

## Verificação
- Respostas 200 e JSON com `success` ou `slot/banners` quando aplicável.
- Páginas renderizam sem 404, mostrando banners conforme posições e templates.

Vou executar as chamadas e abrir as páginas para checar os resultados.
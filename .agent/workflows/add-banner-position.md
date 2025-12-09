---
description: How to add new banner positions to the system
---

# Adding New Banner Positions

The banner system uses a centralized catalog to define available positions. To add a new position:

1.  **Open `lib/banners/catalog.ts`**.
2.  **Add a new entry** to the `bannerCatalog` array.
3.  **Required Fields**:
    *   `id`: A unique identifier (e.g., `blog_sidebar`).
    *   `nome`: The technical name stored in the database (e.g., `Sidebar Direita`).
    *   `label`: The user-friendly name displayed in the dropdown (e.g., `Sidebar (Blog)`).
    *   `local`: The page context (e.g., `blog`). Use `geral` for global banners.
    *   `larguraRecomendada` & `alturaRecomendada`: Dimensions in pixels.
    *   `paginas`: Array of page names where it appears (for documentation).

## Example

```typescript
{ 
  id: 'blog_sidebar', 
  nome: 'Sidebar Direita', 
  label: 'Sidebar (Blog)', 
  local: 'blog', 
  descricao: 'Barra lateral na página do blog', 
  larguraRecomendada: 300, 
  alturaRecomendada: 600, 
  paginas: ['Blog'] 
}
```

## Important Notes

*   **Do not change the `id` of existing entries**, as this is used for UI selection state.
*   **`nome` + `local`** combination is what is stored in the database. You can have multiple entries with the same `nome` as long as they have different `local` values (or different `id`s/labels for UI distinction).

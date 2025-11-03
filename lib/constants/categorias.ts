// Categorias válidas para empresas
export const CATEGORIAS_VALIDAS = [
  'Restaurante',
  'Automotivo', 
  'Saúde',
  'Alimentação',
  'Beleza',
  'Tecnologia',
  'Comércio',
  'Serviços',
  'Educação',
  'Imóveis'
] as const;

// Tipo TypeScript para as categorias
export type CategoriaValida = typeof CATEGORIAS_VALIDAS[number];

// Função para verificar se uma categoria é válida
export const isCategoriaValida = (categoria: string): boolean => {
  return CATEGORIAS_VALIDAS.includes(categoria as CategoriaValida);
};

// Função para normalizar categoria (trim e case-insensitive)
export const normalizarCategoria = (categoria: string): string => {
  return categoria.trim();
};

// Função para verificar categoria com normalização
export const isCategoriaValidaNormalizada = (categoria: string): boolean => {
  const categoriaNormalizada = normalizarCategoria(categoria);
  return CATEGORIAS_VALIDAS.some(cat => 
    cat.toLowerCase() === categoriaNormalizada.toLowerCase()
  );
};

// Função para obter a categoria válida exata (com case correto)
export const obterCategoriaValida = (categoria: string): string | null => {
  const categoriaNormalizada = normalizarCategoria(categoria);
  const categoriaEncontrada = CATEGORIAS_VALIDAS.find(cat => 
    cat.toLowerCase() === categoriaNormalizada.toLowerCase()
  );
  return categoriaEncontrada || null;
};
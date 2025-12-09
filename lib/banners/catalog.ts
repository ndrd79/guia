export interface BannerModelOption {
  id: string // Identificador único para a UI
  nome: string // Valor salvo no banco (pode ser repetido)
  label?: string // Nome exibido na UI
  local?: string // Local automático
  descricao?: string
  larguraRecomendada?: number
  alturaRecomendada?: number
  paginas?: string[]
  preview?: string
}

export const bannerCatalog: BannerModelOption[] = [
  // Home
  { id: 'home_hero', nome: 'Hero Carousel', label: 'Hero Carousel (Home)', local: 'home', descricao: 'Carrossel grande no topo da página inicial', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23eef2ff"/><rect x="10" y="10" width="200" height="50" rx="6" fill="%23c7d2fe"/><text x="12" y="25" font-size="10" fill="%233256eb">Hero</text></svg>' },
  { id: 'home_categorias', nome: 'Categorias Banner', label: 'Faixa Categorias (Home)', local: 'home', descricao: 'Faixa acima da seção de categorias', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'] },
  { id: 'home_servicos', nome: 'Serviços Banner', label: 'Faixa Serviços (Home)', local: 'home', descricao: 'Faixa abaixo dos Serviços Úteis', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'] },
  { id: 'home_cta', nome: 'CTA Banner', label: 'CTA Promocional (Home)', local: 'home', descricao: 'Faixa na coluna direita do bloco escuro', larguraRecomendada: 585, alturaRecomendada: 360, paginas: ['Página Inicial'] },
  { id: 'home_principal', nome: 'Banner Principal', label: 'Destaque Lateral (Home)', local: 'home', descricao: 'Destaque à direita do carrossel principal', larguraRecomendada: 400, alturaRecomendada: 300, paginas: ['Página Inicial'] },
  { id: 'home_empresas_topo', nome: 'Empresas Destaque - Topo', local: 'home', descricao: 'Acima de Empresas em Destaque', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Página Inicial'] },
  { id: 'home_empresas_rodap1', nome: 'Empresas Destaque - Rodapé 1', local: 'home', descricao: 'Após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial'] },
  { id: 'home_empresas_rodap2', nome: 'Empresas Destaque - Rodapé 2', local: 'home', descricao: 'Segunda faixa após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial'] },
  { id: 'home_empresas_rodap3', nome: 'Empresas Destaque - Rodapé 3', local: 'home', descricao: 'Terceira faixa após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial'] },

  // Guia Comercial
  { id: 'guia_topo', nome: 'Empresas Destaque - Topo', label: 'Topo Lista (Guia)', local: 'guia_comercial', descricao: 'Acima da lista de empresas', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Guia Comercial'] },
  { id: 'guia_rodape', nome: 'Empresas Destaque - Rodapé 1', label: 'Rodapé Lista 1 (Guia)', local: 'guia_comercial', descricao: 'Abaixo da lista de empresas', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Guia Comercial'] },
  { id: 'guia_sidebar', nome: 'Sidebar Direita', label: 'Sidebar (Guia)', local: 'guia_comercial', descricao: 'Barra lateral direita no Guia', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Guia Comercial'] },

  // Notícias
  { id: 'noticias_topo', nome: 'Notícias - Topo', label: 'Topo Notícias', local: 'noticias', descricao: 'Faixa acima da listagem de notícias', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Notícias'] },
  { id: 'noticias_sidebar_dir', nome: 'Sidebar Direita', label: 'Sidebar (Notícias)', local: 'noticias', descricao: 'Barra lateral direita nas notícias', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Notícias'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23f0fdf4"/><rect x="200" y="10" width="10" height="60" fill="%2322c55e"/></svg>' },
  { id: 'noticias_sidebar_esq', nome: 'Sidebar Esquerda', label: 'Sidebar Esq (Notícias)', local: 'noticias', descricao: 'Barra lateral esquerda nas notícias', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Notícias'] },
  { id: 'noticias_entre', nome: 'Entre Conteúdo', label: 'Entre Notícias', local: 'noticias', descricao: 'Entre blocos de notícias', larguraRecomendada: 336, alturaRecomendada: 280, paginas: ['Notícias'] },

  // Eventos
  { id: 'eventos_rodape', nome: 'Eventos - Rodapé', label: 'Rodapé Eventos', local: 'eventos', descricao: 'Faixa após a seção de eventos', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Eventos'] },
  { id: 'eventos_sidebar', nome: 'Sidebar Direita', label: 'Sidebar (Eventos)', local: 'eventos', descricao: 'Barra lateral direita nos eventos', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Eventos'] },
  { id: 'eventos_entre', nome: 'Entre Conteúdo', label: 'Entre Eventos', local: 'eventos', descricao: 'Faixa entre a lista de eventos', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Eventos'] },

  // Classificados
  { id: 'classificados_sidebar', nome: 'Sidebar Direita', label: 'Sidebar (Classificados)', local: 'classificados', descricao: 'Barra lateral direita nos classificados', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Classificados'] },

  // Globais
  { id: 'geral_header', nome: 'Header Inferior', local: 'geral', descricao: 'Logo abaixo do menu principal (Todas as páginas)', larguraRecomendada: 970, alturaRecomendada: 90, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><rect width="220" height="60" fill="%23eff6ff"/><rect x="0" y="0" width="220" height="10" fill="%2393c5fd"/></svg>' },
  { id: 'geral_footer', nome: 'Footer', local: 'geral', descricao: 'Posicionado no rodapé (Todas as páginas)', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><rect width="220" height="60" fill="%23f5f5f4"/><rect x="0" y="50" width="220" height="10" fill="%239ca3af"/></svg>' },
  { id: 'geral_popup', nome: 'Popup', local: 'geral', descricao: 'Janela modal sobreposta (Todas as páginas)', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23fff1f2"/><rect x="80" y="25" width="60" height="30" rx="4" fill="%23fda4af"/></svg>' },
  { id: 'geral_mobile', nome: 'Mobile Banner', local: 'geral', descricao: 'Faixa otimizada para mobile (Todas as páginas)', larguraRecomendada: 320, alturaRecomendada: 50, paginas: ['Todas as páginas'] },
]

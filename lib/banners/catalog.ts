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
  // =====================================================
  // HOME
  // =====================================================
  { id: 'home_hero', nome: 'Hero Carousel', label: 'Hero Carousel (Home)', local: 'home', descricao: 'Carrossel grande no topo da página inicial', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Página Inicial'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23eef2ff"/><rect x="10" y="10" width="200" height="50" rx="6" fill="%23c7d2fe"/><text x="12" y="25" font-size="10" fill="%233256eb">Hero</text></svg>' },
  { id: 'home_categorias', nome: 'Categorias Banner', label: 'Faixa Categorias (Home)', local: 'home', descricao: 'Faixa acima da seção de categorias', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Página Inicial'] },
  { id: 'home_servicos', nome: 'Serviços Banner', label: 'Faixa Serviços (Home)', local: 'home', descricao: 'Faixa abaixo dos Serviços Úteis', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Página Inicial'] },
  { id: 'home_cta', nome: 'CTA Banner', label: 'CTA Promocional (Home)', local: 'home', descricao: 'Faixa na coluna direita do bloco escuro', larguraRecomendada: 585, alturaRecomendada: 360, paginas: ['Página Inicial'] },
  { id: 'home_principal', nome: 'Banner Principal', label: 'Destaque Lateral (Home)', local: 'home', descricao: 'Destaque à direita do carrossel principal', larguraRecomendada: 400, alturaRecomendada: 300, paginas: ['Página Inicial'] },

  // =====================================================
  // NOTÍCIAS - Lista
  // =====================================================
  { id: 'noticias_banner_topo', nome: 'Banner Grande - Topo', label: 'Banner Topo (Notícias)', local: 'noticias', descricao: 'Banner grande no topo da lista de notícias', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Notícias'] },
  { id: 'noticias_banner_meio', nome: 'Banner Grande - Meio', label: 'Banner Meio (Notícias)', local: 'noticias', descricao: 'Banner grande no meio da lista de notícias', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Notícias'] },
  { id: 'noticias_banner_final', nome: 'Banner Grande - Final', label: 'Banner Final (Notícias)', local: 'noticias', descricao: 'Banner discreto antes do footer', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Notícias'] },
  { id: 'noticias_sidebar_dir', nome: 'Sidebar Direita', label: 'Sidebar (Notícias)', local: 'noticias', descricao: 'Barra lateral direita nas notícias', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Notícias'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23f0fdf4"/><rect x="200" y="10" width="10" height="60" fill="%2322c55e"/></svg>' },

  // =====================================================
  // GUIA COMERCIAL
  // =====================================================
  { id: 'guia_banner_topo', nome: 'Banner Grande - Topo', label: 'Banner Topo (Guia)', local: 'guia_comercial', descricao: 'Banner grande no topo do Guia Comercial', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Guia Comercial'] },
  { id: 'guia_banner_meio', nome: 'Banner Grande - Meio', label: 'Banner Meio (Guia)', local: 'guia_comercial', descricao: 'Banner grande no meio do Guia Comercial', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Guia Comercial'] },
  { id: 'guia_banner_final', nome: 'Banner Grande - Final', label: 'Banner Final (Guia)', local: 'guia_comercial', descricao: 'Banner discreto antes do footer', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Guia Comercial'] },
  { id: 'guia_sidebar', nome: 'Sidebar Direita', label: 'Sidebar (Guia)', local: 'guia_comercial', descricao: 'Barra lateral direita no Guia', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Guia Comercial'] },

  // =====================================================
  // EMPRESA INDIVIDUAL
  // =====================================================
  { id: 'empresa_banner_topo', nome: 'Empresa - Topo', label: 'Banner Topo (Empresa)', local: 'guia_comercial', descricao: 'Banner no topo da página da empresa', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Empresa'] },
  { id: 'empresa_banner_meio', nome: 'Empresa - Meio', label: 'Banner Meio (Empresa)', local: 'guia_comercial', descricao: 'Banner no meio da página da empresa', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Empresa'] },
  { id: 'empresa_banner_final', nome: 'Empresa - Rodapé', label: 'Banner Final (Empresa)', local: 'guia_comercial', descricao: 'Banner no final da página da empresa', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Empresa'] },

  // =====================================================
  // EVENTOS
  // =====================================================
  { id: 'eventos_banner_topo', nome: 'Banner Grande - Topo', label: 'Banner Topo (Eventos)', local: 'eventos', descricao: 'Banner grande no topo da página de Eventos', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Eventos'] },
  { id: 'eventos_banner_meio', nome: 'Banner Grande - Meio', label: 'Banner Meio (Eventos)', local: 'eventos', descricao: 'Banner grande no meio da página de Eventos', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Eventos'] },
  { id: 'eventos_banner_final', nome: 'Banner Grande - Final', label: 'Banner Final (Eventos)', local: 'eventos', descricao: 'Banner discreto antes do footer', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Eventos'] },
  { id: 'eventos_sidebar', nome: 'Sidebar Direita', label: 'Sidebar (Eventos)', local: 'eventos', descricao: 'Barra lateral direita nos eventos', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Eventos'] },

  // =====================================================
  // FEIRA DO PRODUTOR
  // =====================================================
  { id: 'feira_banner_topo', nome: 'Banner Grande - Topo', label: 'Banner Topo (Feira)', local: 'eventos', descricao: 'Banner grande no topo da Feira do Produtor', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Feira do Produtor'] },
  { id: 'feira_banner_meio', nome: 'Banner Grande - Meio', label: 'Banner Meio (Feira)', local: 'eventos', descricao: 'Banner grande no meio da Feira do Produtor', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Feira do Produtor'] },
  { id: 'feira_banner_final', nome: 'Banner Grande - Final', label: 'Banner Final (Feira)', local: 'eventos', descricao: 'Banner discreto antes do footer', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Feira do Produtor'] },

  // =====================================================
  // CLASSIFICADOS
  // =====================================================
  { id: 'classificados_banner_topo', nome: 'Banner Grande - Topo', label: 'Banner Topo (Classificados)', local: 'classificados', descricao: 'Banner grande no topo dos Classificados', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Classificados'] },
  { id: 'classificados_banner_meio', nome: 'Banner Grande - Meio', label: 'Banner Meio (Classificados)', local: 'classificados', descricao: 'Banner grande no meio dos Classificados', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Classificados'] },
  { id: 'classificados_banner_final', nome: 'Banner Grande - Final', label: 'Banner Final (Classificados)', local: 'classificados', descricao: 'Banner discreto antes do footer', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Classificados'] },
  { id: 'classificados_sidebar', nome: 'Sidebar Direita', label: 'Sidebar (Classificados)', local: 'classificados', descricao: 'Barra lateral direita nos classificados', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Classificados'] },

  // =====================================================
  // CONTATO
  // =====================================================
  { id: 'contato_banner_topo', nome: 'Banner Grande - Topo', label: 'Banner Topo (Contato)', local: 'contato', descricao: 'Banner no topo da página de Contato', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Contato'] },
  { id: 'contato_banner_meio', nome: 'Banner Grande - Meio', label: 'Banner Meio (Contato)', local: 'contato', descricao: 'Banner no meio da página de Contato', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Contato'] },
  { id: 'contato_banner_final', nome: 'Banner Grande - Final', label: 'Banner Final (Contato)', local: 'contato', descricao: 'Banner grande antes do footer', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Contato'] },

  // =====================================================
  // SERVIÇOS
  // =====================================================
  { id: 'servicos_banner_topo', nome: 'Banner Grande - Topo', label: 'Banner Topo (Serviços)', local: 'geral', descricao: 'Banner no topo da página de Serviços', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Serviços'] },
  { id: 'servicos_banner_meio', nome: 'Banner Grande - Meio', label: 'Banner Meio (Serviços)', local: 'geral', descricao: 'Banner no meio da página de Serviços', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Serviços'] },
  { id: 'servicos_banner_final', nome: 'Banner Grande - Final', label: 'Banner Final (Serviços)', local: 'geral', descricao: 'Banner discreto antes do footer', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Serviços'] },

  // =====================================================
  // GLOBAIS (Todas as páginas)
  // =====================================================
  { id: 'geral_header', nome: 'Header Inferior', local: 'geral', descricao: 'Logo abaixo do menu principal (Todas as páginas)', larguraRecomendada: 970, alturaRecomendada: 90, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><rect width="220" height="60" fill="%23eff6ff"/><rect x="0" y="0" width="220" height="10" fill="%2393c5fd"/></svg>' },
  { id: 'geral_footer', nome: 'Footer', local: 'geral', descricao: 'Posicionado no rodapé (Todas as páginas)', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><rect width="220" height="60" fill="%23f5f5f4"/><rect x="0" y="50" width="220" height="10" fill="%239ca3af"/></svg>' },
  { id: 'geral_popup', nome: 'Popup', local: 'geral', descricao: 'Janela modal sobreposta (Todas as páginas)', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23fff1f2"/><rect x="80" y="25" width="60" height="30" rx="4" fill="%23fda4af"/></svg>' },
  { id: 'geral_mobile', nome: 'Mobile Banner', local: 'geral', descricao: 'Faixa otimizada para mobile (Todas as páginas)', larguraRecomendada: 320, alturaRecomendada: 100, paginas: ['Todas as páginas'] },
]


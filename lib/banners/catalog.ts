export interface BannerModelOption {
  nome: string
  descricao?: string
  larguraRecomendada?: number
  alturaRecomendada?: number
  paginas?: string[]
  preview?: string
}

export const bannerCatalog: BannerModelOption[] = [
  { nome: 'Hero Carousel', descricao: 'Carrossel grande no topo da página inicial', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23eef2ff"/><rect x="10" y="10" width="200" height="50" rx="6" fill="%23c7d2fe"/><text x="12" y="25" font-size="10" fill="%233256eb">Hero</text></svg>' },
  { nome: 'Categorias Banner', descricao: 'Faixa acima da seção de categorias', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'] },
  { nome: 'Serviços Banner', descricao: 'Faixa abaixo dos Serviços Úteis', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'] },
  { nome: 'CTA Banner', descricao: 'Faixa na coluna direita do bloco escuro', larguraRecomendada: 585, alturaRecomendada: 360, paginas: ['Página Inicial'] },
  { nome: 'Header Inferior', descricao: 'Logo abaixo do menu principal', larguraRecomendada: 970, alturaRecomendada: 90, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><rect width="220" height="60" fill="%23eff6ff"/><rect x="0" y="0" width="220" height="10" fill="%2393c5fd"/></svg>' },
  { nome: 'Banner Principal', descricao: 'Destaque à direita do carrossel principal', larguraRecomendada: 400, alturaRecomendada: 300, paginas: ['Página Inicial'] },
  { nome: 'Empresas Destaque - Topo', descricao: 'Acima de Empresas em Destaque', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Empresas Destaque - Rodapé 1', descricao: 'Após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Empresas Destaque - Rodapé 2', descricao: 'Segunda faixa após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Eventos - Rodapé', descricao: 'Faixa após a seção de eventos', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Página Inicial', 'Eventos'] },
  { nome: 'Sidebar Direita', descricao: 'Barra lateral direita', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Notícias', 'Eventos', 'Classificados'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23f0fdf4"/><rect x="200" y="10" width="10" height="60" fill="%2322c55e"/></svg>' },
  { nome: 'Sidebar Esquerda', descricao: 'Barra lateral esquerda', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Notícias', 'Eventos', 'Classificados'] },
  { nome: 'Entre Conteúdo', descricao: 'Entre blocos de conteúdo', larguraRecomendada: 336, alturaRecomendada: 280, paginas: ['Notícias', 'Eventos', 'Classificados'] },
  { nome: 'Footer', descricao: 'Posicionado no rodapé', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="60"><rect width="220" height="60" fill="%23f5f5f4"/><rect x="0" y="50" width="220" height="10" fill="%239ca3af"/></svg>' },
  { nome: 'Popup', descricao: 'Janela modal sobreposta ao conteúdo', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Todas as páginas'], preview: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="220" height="80"><rect width="220" height="80" fill="%23fff1f2"/><rect x="80" y="25" width="60" height="30" rx="4" fill="%23fda4af"/></svg>' },
  { nome: 'Mobile Banner', descricao: 'Faixa otimizada para mobile', larguraRecomendada: 320, alturaRecomendada: 50, paginas: ['Todas as páginas'] },
  { nome: 'Empresas Destaque - Rodapé 3', descricao: 'Terceira faixa após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Notícias - Topo', descricao: 'Faixa acima da listagem de notícias', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Notícias'] },
]

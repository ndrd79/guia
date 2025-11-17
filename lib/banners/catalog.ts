export interface BannerModelOption {
  nome: string
  descricao?: string
  larguraRecomendada?: number
  alturaRecomendada?: number
  paginas?: string[]
}

export const bannerCatalog: BannerModelOption[] = [
  { nome: 'Hero Carousel', descricao: 'Carrossel grande no topo da página inicial', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'] },
  { nome: 'Categorias Banner', descricao: 'Faixa acima da seção de categorias', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'] },
  { nome: 'Serviços Banner', descricao: 'Faixa abaixo dos Serviços Úteis', larguraRecomendada: 1170, alturaRecomendada: 330, paginas: ['Página Inicial'] },
  { nome: 'CTA Banner', descricao: 'Faixa na coluna direita do bloco escuro', larguraRecomendada: 585, alturaRecomendada: 360, paginas: ['Página Inicial'] },
  { nome: 'Header Inferior', descricao: 'Logo abaixo do menu principal', larguraRecomendada: 970, alturaRecomendada: 90, paginas: ['Todas as páginas'] },
  { nome: 'Banner Principal', descricao: 'Destaque à direita do carrossel principal', larguraRecomendada: 400, alturaRecomendada: 300, paginas: ['Página Inicial'] },
  { nome: 'Empresas Destaque - Topo', descricao: 'Acima de Empresas em Destaque', larguraRecomendada: 970, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Empresas Destaque - Rodapé 1', descricao: 'Após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Empresas Destaque - Rodapé 2', descricao: 'Segunda faixa após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Eventos - Rodapé', descricao: 'Faixa após a seção de eventos', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Página Inicial', 'Eventos'] },
  { nome: 'Sidebar Direita', descricao: 'Barra lateral direita', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Notícias', 'Eventos', 'Classificados'] },
  { nome: 'Sidebar Esquerda', descricao: 'Barra lateral esquerda', larguraRecomendada: 300, alturaRecomendada: 600, paginas: ['Notícias', 'Eventos', 'Classificados'] },
  { nome: 'Entre Conteúdo', descricao: 'Entre blocos de conteúdo', larguraRecomendada: 336, alturaRecomendada: 280, paginas: ['Notícias', 'Eventos', 'Classificados'] },
  { nome: 'Footer', descricao: 'Posicionado no rodapé', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Todas as páginas'] },
  { nome: 'Popup', descricao: 'Janela modal sobreposta ao conteúdo', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Todas as páginas'] },
  { nome: 'Mobile Banner', descricao: 'Faixa otimizada para mobile', larguraRecomendada: 320, alturaRecomendada: 50, paginas: ['Todas as páginas'] },
  { nome: 'Empresas Destaque - Rodapé 3', descricao: 'Terceira faixa após Empresas em Destaque', larguraRecomendada: 300, alturaRecomendada: 250, paginas: ['Página Inicial', 'Guia Comercial'] },
  { nome: 'Notícias - Topo', descricao: 'Faixa acima da listagem de notícias', larguraRecomendada: 728, alturaRecomendada: 90, paginas: ['Notícias'] },
]
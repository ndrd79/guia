/**
 * TypeScript Types - Template Portal
 * 
 * Este arquivo contém todas as interfaces e tipos TypeScript
 * usados no projeto. Importe conforme necessário.
 * 
 * @example
 * import { Noticia, Empresa, Banner } from '@/types'
 */

// ============================================
// ENTIDADES DO BANCO DE DADOS
// ============================================

/**
 * Perfil de usuário (tabela: profiles)
 */
export interface Profile {
    id: string;
    email: string;
    role: 'user' | 'admin' | 'editor';
    created_at: string;
    updated_at?: string;
}

/**
 * Notícia (tabela: noticias)
 */
export interface Noticia {
    id: string;
    titulo: string;
    descricao: string;
    conteudo?: string;
    imagem?: string;
    categoria: string;
    data: string;
    destaque: boolean;
    workflow_status: 'draft' | 'review' | 'published' | 'archived';
    autor?: string;
    tags?: string[];
    views?: number;
    created_at: string;
    updated_at?: string;
}

/**
 * Empresa do guia comercial (tabela: empresas)
 */
export interface Empresa {
    id: string;
    name: string;
    description?: string;
    category: string;
    subcategory?: string;
    rating: number;
    reviews: number;
    location: string;
    address?: string;
    phone?: string;
    whatsapp?: string;
    email?: string;
    website?: string;
    image?: string;
    gallery?: string[];
    featured: boolean;
    is_new: boolean;
    ativo: boolean;
    plan_type: 'free' | 'basic' | 'premium';
    premium_expires_at?: string;
    business_hours?: BusinessHours;
    social_media?: SocialMedia;
    created_at: string;
    updated_at?: string;
}

/**
 * Horário de funcionamento
 */
export interface BusinessHours {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
}

/**
 * Redes sociais
 */
export interface SocialMedia {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    tiktok?: string;
}

/**
 * Classificado (tabela: classificados)
 */
export interface Classificado {
    id: string;
    titulo: string;
    descricao: string;
    categoria: string;
    preco: number;
    preco_negociavel?: boolean;
    imagem?: string;
    galeria?: string[];
    localizacao: string;
    contato_nome?: string;
    contato_telefone?: string;
    contato_email?: string;
    contato_whatsapp?: string;
    ativo: boolean;
    destaque: boolean;
    visualizacoes?: number;
    user_id?: string;
    created_at: string;
    updated_at?: string;
}

/**
 * Evento (tabela: eventos)
 */
export interface Evento {
    id: string;
    titulo: string;
    descricao: string;
    conteudo?: string;
    data_inicio: string;
    data_fim?: string;
    horario?: string;
    local: string;
    endereco?: string;
    imagem?: string;
    categoria: string;
    preco?: number;
    gratuito: boolean;
    link_inscricao?: string;
    organizador?: string;
    destaque: boolean;
    ativo: boolean;
    created_at: string;
    updated_at?: string;
}

/**
 * Banner publicitário (tabela: banners)
 */
export interface Banner {
    id: string;
    nome: string;
    imagem: string;
    link?: string;
    posicao: BannerPosition;
    local: string;
    largura: number;
    altura: number;
    ordem: number;
    ativo: boolean;
    data_inicio?: string;
    data_fim?: string;
    impressoes?: number;
    cliques?: number;
    created_at: string;
    updated_at?: string;
}

/**
 * Posições de banner disponíveis
 */
export type BannerPosition =
    | 'Hero Carousel'
    | 'CTA Banner'
    | 'Categorias Banner'
    | 'Serviços Banner'
    | 'Sidebar Banner'
    | 'Footer Banner'
    | 'Content Banner'
    | string;

// ============================================
// TIPOS PARA FORMULÁRIOS
// ============================================

/**
 * Dados do formulário de notícia
 */
export interface NoticiaFormData {
    titulo: string;
    descricao: string;
    conteudo?: string;
    imagem?: string;
    categoria: string;
    destaque?: boolean;
    workflow_status?: string;
}

/**
 * Dados do formulário de empresa
 */
export interface EmpresaFormData {
    name: string;
    description?: string;
    category: string;
    location: string;
    phone?: string;
    email?: string;
    website?: string;
    image?: string;
    featured?: boolean;
    plan_type?: string;
}

/**
 * Dados do formulário de classificado
 */
export interface ClassificadoFormData {
    titulo: string;
    descricao: string;
    categoria: string;
    preco: number;
    imagem?: string;
    localizacao: string;
    contato_telefone?: string;
}

/**
 * Dados do formulário de evento
 */
export interface EventoFormData {
    titulo: string;
    descricao: string;
    data_inicio: string;
    data_fim?: string;
    local: string;
    imagem?: string;
    categoria: string;
    gratuito?: boolean;
    preco?: number;
}

/**
 * Dados do formulário de banner
 */
export interface BannerFormData {
    nome: string;
    imagem: string;
    link?: string;
    posicao: string;
    local: string;
    largura: number;
    altura: number;
    ordem?: number;
    ativo?: boolean;
    data_inicio?: string;
    data_fim?: string;
}

// ============================================
// TIPOS PARA COMPONENTES
// ============================================

/**
 * Props do NewsCard
 */
export interface NewsCardProps {
    id: string;
    title: string;
    excerpt: string;
    imageUrl?: string;
    category: string;
    publishedAt: string;
    featured?: boolean;
    tall?: boolean;
    className?: string;
}

/**
 * Props do BusinessCard
 */
export interface BusinessCardProps {
    id: string;
    name: string;
    description?: string;
    category: string;
    rating: number;
    reviews: number;
    location: string;
    image?: string;
    featured?: boolean;
    isNew?: boolean;
    planType?: string;
}

/**
 * Props do EventCard
 */
export interface EventCardProps {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    location: string;
    image?: string;
    category: string;
    isFree?: boolean;
    price?: number;
}

/**
 * Props do BannerCarousel
 */
export interface BannerCarouselProps {
    position: BannerPosition;
    local?: string;
    interval?: number;
    autoRotate?: boolean;
    maxBanners?: number;
    className?: string;
}

// ============================================
// TIPOS PARA API
// ============================================

/**
 * Resposta padrão da API
 */
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

/**
 * Resposta de listagem paginada
 */
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

/**
 * Parâmetros de busca/filtro
 */
export interface SearchParams {
    query?: string;
    category?: string;
    page?: number;
    limit?: number;
    orderBy?: string;
    order?: 'asc' | 'desc';
}

/**
 * Estatísticas de banner
 */
export interface BannerStats {
    impressoes: number;
    cliques: number;
    ctr: number;
}

// ============================================
// TIPOS PARA CONFIGURAÇÃO
// ============================================

/**
 * Configuração do site
 */
export interface SiteConfig {
    name: string;
    shortName: string;
    description: string;
    slogan: string;
    url: string;
    contact: ContactConfig;
    social: SocialConfig;
    seo: SeoConfig;
    theme: ThemeConfig;
    navigation: NavigationConfig;
    categories: CategoryConfig[];
    services: ServiceConfig[];
    features: FeaturesConfig;
}

export interface ContactConfig {
    phone: string;
    phoneFormatted: string;
    whatsapp: string;
    whatsappMessage: string;
    email: string;
    address: string;
    city: string;
    state: string;
    cep: string;
    businessHours: string;
}

export interface SocialConfig {
    facebook?: string;
    instagram?: string;
    youtube?: string;
    twitter?: string;
    linkedin?: string;
    tiktok?: string;
}

export interface SeoConfig {
    title: string;
    titleTemplate: string;
    defaultDescription: string;
    keywords: string[];
    ogImage: string;
    twitterHandle?: string;
}

export interface ThemeConfig {
    primaryColor: string;
    fontFamily: string;
    fontWeights: number[];
}

export interface NavigationConfig {
    mainMenu: NavItem[];
    footerLinks: {
        quickLinks: NavItem[];
        info: NavItem[];
    };
}

export interface NavItem {
    href: string;
    label: string;
    icon?: string;
}

export interface CategoryConfig {
    name: string;
    icon: string;
    slug: string;
}

export interface ServiceConfig {
    title: string;
    description: string;
    icon: string;
    href: string;
}

export interface FeaturesConfig {
    newsletter: boolean;
    weatherWidget: boolean;
    whatsappButton: boolean;
    cookieBanner: boolean;
    seasonalDecorations: boolean;
    newsTicker: boolean;
}

// ============================================
// TIPOS UTILITÁRIOS
// ============================================

/**
 * Torna todas as propriedades opcionais
 */
export type PartialEntity<T> = Partial<T>;

/**
 * Omite propriedades de uma entidade
 */
export type WithoutId<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>;

/**
 * Props de componente com children
 */
export interface WithChildren {
    children: React.ReactNode;
}

/**
 * Props de componente com className opcional
 */
export interface WithClassName {
    className?: string;
}

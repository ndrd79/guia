/**
 * Configuração Central do Site
 * 
 * COMO USAR:
 * Importe este arquivo onde precisar das configurações:
 * import { siteConfig } from '@/config/site.config'
 * 
 * Depois use: siteConfig.name, siteConfig.contact.phone, etc.
 */

export const siteConfig = {
    // ============================================
    // INFORMAÇÕES BÁSICAS DO SITE
    // ============================================
    name: "Portal Sua Cidade",
    shortName: "Sua Cidade",
    description: "O guia completo da sua cidade, conectando pessoas, negócios e oportunidades.",
    slogan: "Sua cidade em um só lugar",

    // URL do site (para SEO e links compartilháveis)
    url: "https://www.seusite.com.br",

    // ============================================
    // INFORMAÇÕES DE CONTATO
    // ============================================
    contact: {
        phone: "(XX) XXXXX-XXXX",
        phoneFormatted: "XX XXXXX-XXXX", // Para links tel:
        whatsapp: "55XXXXXXXXXXX", // Só números, com código do país
        whatsappMessage: "Olá! Vim pelo Portal Sua Cidade", // Mensagem padrão
        email: "contato@suacidade.com.br",
        address: "Rua Principal, 123 - Centro",
        city: "Sua Cidade",
        state: "PR",
        cep: "00000-000",
        businessHours: "Seg-Sex: 8h às 18h"
    },

    // ============================================
    // REDES SOCIAIS
    // ============================================
    social: {
        facebook: "https://facebook.com/suapagina",
        instagram: "https://instagram.com/suapagina",
        youtube: "",
        twitter: "",
        linkedin: "",
        tiktok: ""
    },

    // ============================================
    // CONFIGURAÇÕES DE SEO
    // ============================================
    seo: {
        title: "Portal Sua Cidade - Guia Comercial & Eventos",
        titleTemplate: "%s | Portal Sua Cidade",
        defaultDescription: "Portal oficial de Sua Cidade - Notícias, guia comercial, classificados e eventos. Conectando pessoas e negócios.",
        keywords: [
            "sua cidade",
            "guia comercial",
            "notícias",
            "classificados",
            "eventos",
            "empresas locais"
        ],
        ogImage: "/images/og-image.jpg",
        twitterHandle: "@suacidade"
    },

    // ============================================
    // CONFIGURAÇÕES DO TEMA
    // ============================================
    theme: {
        // Cor principal usada no meta theme-color
        primaryColor: "#4f46e5",

        // Fonte padrão (Google Fonts)
        fontFamily: "Poppins",
        fontWeights: [300, 400, 500, 600, 700]
    },

    // ============================================
    // CONFIGURAÇÕES DE NAVEGAÇÃO
    // ============================================
    navigation: {
        mainMenu: [
            { href: '/', label: 'Início' },
            { href: '/noticias', label: 'Notícias' },
            { href: '/guia', label: 'Guia Comercial' },
            { href: '/classificados', label: 'Classificados' },
            { href: '/eventos', label: 'Eventos' },
            { href: '/servicos', label: 'Serviços' },
            { href: '/contato', label: 'Contato' },
        ],
        footerLinks: {
            quickLinks: [
                { href: '/', label: 'Início' },
                { href: '/guia', label: 'Guia Comercial' },
                { href: '/classificados', label: 'Classificados' },
                { href: '/eventos', label: 'Eventos' },
                { href: '/servicos', label: 'Serviços' },
            ],
            info: [
                { href: '/sobre', label: 'Sobre Nós' },
                { href: '/anuncie', label: 'Anuncie Conosco' },
                { href: '/termos', label: 'Termos de Uso' },
                { href: '/privacidade', label: 'Política de Privacidade' },
                { href: '/contato', label: 'Fale Conosco' },
            ]
        }
    },

    // ============================================
    // CATEGORIAS DE EMPRESAS
    // ============================================
    categories: [
        { name: 'Restaurantes', icon: 'fas fa-utensils', slug: 'alimentacao' },
        { name: 'Hospedagem', icon: 'fas fa-bed', slug: 'hospedagem' },
        { name: 'Serviços', icon: 'fas fa-tools', slug: 'servicos' },
        { name: 'Comércio', icon: 'fas fa-shopping-bag', slug: 'comercio' },
        { name: 'Saúde', icon: 'fas fa-heartbeat', slug: 'saude' },
        { name: 'Educação', icon: 'fas fa-graduation-cap', slug: 'educacao' }
    ],

    // ============================================
    // SERVIÇOS ÚTEIS
    // ============================================
    services: [
        {
            title: 'Telefones Úteis',
            description: 'Contatos importantes da cidade',
            icon: 'fas fa-phone',
            href: '/servicos/telefones-uteis'
        },
        {
            title: 'Transporte Público',
            description: 'Horários e rotas dos ônibus',
            icon: 'fas fa-bus',
            href: '/servicos/transporte'
        },
        {
            title: 'Farmácias de Plantão',
            description: 'Plantões e horários especiais',
            icon: 'fas fa-pills',
            href: '/servicos/farmacias'
        }
    ],

    // ============================================
    // CONFIGURAÇÕES DE FEATURES (liga/desliga)
    // ============================================
    features: {
        newsletter: true,
        weatherWidget: true,
        whatsappButton: true,
        cookieBanner: true,
        seasonalDecorations: true,
        newsTicker: true
    }
}

// Tipo TypeScript para autocomplete
export type SiteConfig = typeof siteConfig

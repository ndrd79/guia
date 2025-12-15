/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            /**
             * CORES PERSONALIZÁVEIS
             * Para alterar as cores do site, modifique os valores abaixo.
             * Recomendação: Use https://uicolors.app para gerar paletas completas
             */
            colors: {
                // Cor primária (azul) - usada em botões, links
                primary: {
                    50: '#eff6ff',
                    100: '#dbeafe',
                    200: '#bfdbfe',
                    300: '#93c5fd',
                    400: '#60a5fa',
                    500: '#3b82f6',  // Cor principal
                    600: '#2563eb',  // Hover
                    700: '#1d4ed8',
                    800: '#1e40af',
                    900: '#1e3a8a',
                },
                // Cor de destaque (índigo) - usada em badges, ícones
                indigo: {
                    50: '#eef2ff',
                    100: '#e0e7ff',
                    200: '#c7d2fe',
                    300: '#a5b4fc',
                    400: '#818cf8',
                    500: '#6366f1',
                    600: '#4f46e5',  // Destaque principal
                    700: '#4338ca',
                    800: '#3730a3',
                    900: '#312e81',
                },
            },
            /**
             * FONTE PERSONALIZADA
             * Padrão: Poppins (Google Fonts)
             * Para mudar, altere também no _document.tsx ou globals.css
             */
            fontFamily: {
                sans: ['Poppins', 'sans-serif'],
            },
            /**
             * ANIMAÇÕES CUSTOMIZADAS
             */
            animation: {
                'pulse': 'pulse 2s infinite',
                'ticker': 'ticker 20s linear infinite',
                'slide': 'slide 8s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'fade-in-up': 'fadeInUp 0.6s ease-out',
            },
            keyframes: {
                pulse: {
                    '0%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(79, 70, 229, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(79, 70, 229, 0)' },
                },
                ticker: {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-100%)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                fadeInUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            /**
             * BREAKPOINTS (padrão Tailwind, mantido para referência)
             * sm: 640px
             * md: 768px
             * lg: 1024px
             * xl: 1280px
             * 2xl: 1536px
             */
        },
    },
    plugins: [],
}

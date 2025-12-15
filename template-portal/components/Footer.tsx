/**
 * Footer Component - Template
 * 
 * PERSONALIZAÇÕES NECESSÁRIAS:
 * 1. Use siteConfig para informações de contato
 * 2. Atualize links de redes sociais
 * 3. Modifique os links do rodapé conforme necessário
 */

import React, { useState } from 'react';
import Link from 'next/link';
import { siteConfig } from '../config/site.config';

const Footer: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [message, setMessage] = useState('');

    const handleNewsletterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsSubscribing(true);
        try {
            // TODO: Implementar lógica de inscrição na newsletter
            await new Promise(resolve => setTimeout(resolve, 1000));
            setMessage('Inscrição realizada com sucesso!');
            setEmail('');
        } catch (err) {
            setMessage('Erro ao realizar inscrição. Tente novamente.');
        } finally {
            setIsSubscribing(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    return (
        <>
            {/* Newsletter Section */}
            {siteConfig.features.newsletter && (
                <section className="py-12 gradient-bg text-white">
                    <div className="container mx-auto px-4 text-center">
                        <h2 className="text-3xl font-bold mb-4">
                            Receba as novidades no seu e-mail
                        </h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Cadastre-se e receba promoções, eventos e notícias importantes da sua cidade.
                        </p>

                        <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex">
                            <input
                                type="email"
                                placeholder="Seu melhor e-mail"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="flex-grow py-3 px-4 rounded-l-lg focus:outline-none text-gray-800"
                            />
                            <button
                                type="submit"
                                disabled={isSubscribing}
                                className="bg-indigo-900 hover:bg-indigo-800 py-3 px-6 rounded-r-lg font-medium transition disabled:opacity-50"
                            >
                                {isSubscribing ? 'Cadastrando...' : 'Cadastrar'}
                            </button>
                        </form>

                        {message && (
                            <p className="mt-4 text-sm">{message}</p>
                        )}
                    </div>
                </section>
            )}

            {/* Main Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

                        {/* Coluna 1: Sobre */}
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">
                                {siteConfig.name}
                            </h3>
                            <p className="mb-4">
                                {siteConfig.description}
                            </p>
                            <div className="flex space-x-4">
                                {siteConfig.social.facebook && (
                                    <a href={siteConfig.social.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                )}
                                {siteConfig.social.instagram && (
                                    <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                )}
                                {siteConfig.social.youtube && (
                                    <a href={siteConfig.social.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                                        <i className="fab fa-youtube"></i>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Coluna 2: Links Rápidos */}
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">Links Rápidos</h3>
                            <ul className="space-y-2">
                                {siteConfig.navigation.footerLinks.quickLinks.map((link, index) => (
                                    <li key={index}>
                                        <Link href={link.href} className="hover:text-white transition">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Coluna 3: Informações */}
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">Informações</h3>
                            <ul className="space-y-2">
                                {siteConfig.navigation.footerLinks.info.map((link, index) => (
                                    <li key={index}>
                                        <Link href={link.href} className="hover:text-white transition">
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Coluna 4: Contato */}
                        <div>
                            <h3 className="text-white font-bold text-lg mb-4">Contato</h3>
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <i className="fas fa-map-marker-alt mr-2"></i>
                                    {siteConfig.contact.address} - {siteConfig.contact.city} {siteConfig.contact.state}
                                </li>
                                <li className="flex items-center">
                                    <i className="fab fa-whatsapp mr-2"></i>
                                    {siteConfig.contact.phone}
                                </li>
                                <li className="flex items-center">
                                    <i className="fas fa-envelope mr-2"></i>
                                    {siteConfig.contact.email}
                                </li>
                                <li className="flex items-center">
                                    <i className="fas fa-clock mr-2"></i>
                                    {siteConfig.contact.businessHours}
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Copyright */}
                    <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="mb-4 md:mb-0">
                            &copy; {new Date().getFullYear()} {siteConfig.name}. Todos os direitos reservados.
                        </div>
                        <div className="flex space-x-6">
                            <Link href="/termos" className="hover:text-white transition">Termos de Serviço</Link>
                            <Link href="/privacidade" className="hover:text-white transition">Política de Privacidade</Link>
                            <Link href="/mapa-site" className="hover:text-white transition">Mapa do Site</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Floating WhatsApp Button */}
            {siteConfig.features.whatsappButton && siteConfig.contact.whatsapp && (
                <div className="fixed bottom-6 right-6 z-50">
                    <a
                        href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.contact.whatsappMessage)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-green-600 transition flex items-center justify-center"
                    >
                        <i className="fab fa-whatsapp text-2xl"></i>
                    </a>
                </div>
            )}
        </>
    );
};

export default Footer;

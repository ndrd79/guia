import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookieBannerProps {
  onAccept?: () => void;
  onReject?: () => void;
}

export default function CookieBanner({ onAccept, onReject }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já deu consentimento
    const cookieConsent = localStorage.getItem('cookieConsent');
    if (!cookieConsent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = async () => {
    setIsLoading(true);
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Habilita cookies de analytics e funcionalidades
    localStorage.setItem('analyticsEnabled', 'true');
    localStorage.setItem('marketingEnabled', 'true');
    
    setIsVisible(false);
    setIsLoading(false);
    
    if (onAccept) {
      onAccept();
    }
  };

  const handleReject = async () => {
    setIsLoading(true);
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Desabilita cookies não essenciais
    localStorage.setItem('analyticsEnabled', 'false');
    localStorage.setItem('marketingEnabled', 'false');
    
    setIsVisible(false);
    setIsLoading(false);
    
    if (onReject) {
      onReject();
    }
  };

  const handleCustomize = () => {
    // Redireciona para página de preferências de cookies
    window.location.href = '/cookies-preferencias';
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Nós usamos cookies
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Utilizamos cookies para melhorar a sua experiência no nosso site, 
                  personalizar publicidade e recomendar conteúdo relevante. 
                  Ao continuar navegando, você concorda com o uso de cookies conforme nossa{' '}
                  <Link href="/privacidade" className="text-blue-600 hover:text-blue-800 underline">
                    Política de Privacidade
                  </Link>.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
            <button
              onClick={handleCustomize}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Personalizar
            </button>
            
            <button
              onClick={handleReject}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Recusar
            </button>
            
            <button
              onClick={handleAccept}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Processando...' : 'Aceitar todos'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
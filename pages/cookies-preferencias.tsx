import { useState, useEffect } from 'react';
import { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functionality: boolean;
}

const CookiesPreferencias: NextPage = () => {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Sempre habilitado
    analytics: false,
    marketing: false,
    functionality: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Carrega preferências salvas
    const analyticsEnabled = localStorage.getItem('analyticsEnabled') === 'true';
    const marketingEnabled = localStorage.getItem('marketingEnabled') === 'true';
    const functionalityEnabled = localStorage.getItem('functionalityEnabled') === 'true';
    
    setPreferences({
      essential: true,
      analytics: analyticsEnabled,
      marketing: marketingEnabled,
      functionality: functionalityEnabled
    });
  }, []);

  const handlePreferenceChange = (type: keyof CookiePreferences, enabled: boolean) => {
    if (type === 'essential') return; // Não pode ser desabilitado
    
    setPreferences(prev => ({
      ...prev,
      [type]: enabled
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    // Salva preferências no localStorage
    localStorage.setItem('analyticsEnabled', preferences.analytics.toString());
    localStorage.setItem('marketingEnabled', preferences.marketing.toString());
    localStorage.setItem('functionalityEnabled', preferences.functionality.toString());
    localStorage.setItem('cookieConsent', 'customized');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    // Simula delay de salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSaving(false);
    setShowSuccess(true);
    
    // Remove mensagem de sucesso após 3 segundos
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAcceptAll = async () => {
    setPreferences({
      essential: true,
      analytics: true,
      marketing: true,
      functionality: true
    });
    
    localStorage.setItem('analyticsEnabled', 'true');
    localStorage.setItem('marketingEnabled', 'true');
    localStorage.setItem('functionalityEnabled', 'true');
    localStorage.setItem('cookieConsent', 'accepted');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRejectAll = async () => {
    setPreferences({
      essential: true,
      analytics: false,
      marketing: false,
      functionality: false
    });
    
    localStorage.setItem('analyticsEnabled', 'false');
    localStorage.setItem('marketingEnabled', 'false');
    localStorage.setItem('functionalityEnabled', 'false');
    localStorage.setItem('cookieConsent', 'rejected');
    localStorage.setItem('cookieConsentDate', new Date().toISOString());
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <Layout>
      <Head>
        <title>Preferências de Cookies - Guia Comercial</title>
        <meta name="description" content="Gerencie suas preferências de cookies no Guia Comercial" />
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Preferências de Cookies
              </h1>
              <p className="text-gray-600 leading-relaxed">
                Gerencie suas preferências de cookies. Você pode escolher quais tipos de cookies 
                deseja aceitar. Note que desabilitar alguns cookies pode afetar a funcionalidade do site.
              </p>
            </div>

            {showSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-800 font-medium">Preferências salvas com sucesso!</span>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Cookies Essenciais */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cookies Essenciais
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Estes cookies são necessários para o funcionamento básico do site e não podem ser desabilitados. 
                      Eles incluem cookies de sessão, autenticação e segurança.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Exemplos:</strong> Cookies de sessão, tokens de autenticação, preferências de idioma
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={true}
                        disabled={true}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 opacity-50 cursor-not-allowed"
                      />
                      <span className="ml-2 text-sm text-gray-500">Sempre ativo</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cookies de Analytics */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cookies de Analytics
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Estes cookies nos ajudam a entender como os visitantes interagem com o site, 
                      coletando informações de forma anônima para melhorar a experiência do usuário.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Exemplos:</strong> Google Analytics, métricas de performance, análise de tráfego
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.analytics}
                        onChange={(e) => handlePreferenceChange('analytics', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {preferences.analytics ? 'Habilitado' : 'Desabilitado'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cookies de Marketing */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cookies de Marketing
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Estes cookies são usados para personalizar anúncios e conteúdo com base em seus interesses 
                      e comportamento de navegação.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Exemplos:</strong> Publicidade direcionada, remarketing, redes sociais
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={(e) => handlePreferenceChange('marketing', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {preferences.marketing ? 'Habilitado' : 'Desabilitado'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Cookies de Funcionalidade */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Cookies de Funcionalidade
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      Estes cookies permitem que o site lembre de escolhas que você fez para fornecer 
                      funcionalidades aprimoradas e personalizadas.
                    </p>
                    <div className="text-xs text-gray-500">
                      <strong>Exemplos:</strong> Preferências de localização, empresas favoritas, configurações de exibição
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.functionality}
                        onChange={(e) => handlePreferenceChange('functionality', e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {preferences.functionality ? 'Habilitado' : 'Desabilitado'}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Aceitar Todos
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                  Rejeitar Todos
                </button>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Link href="/" className="px-6 py-2 text-center bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors">
                  Cancelar
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Preferências'}
                </button>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Para mais informações sobre como usamos cookies, consulte nossa{' '}
                <Link href="/privacidade" className="text-blue-600 hover:text-blue-800 underline">
                  Política de Privacidade
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CookiesPreferencias;
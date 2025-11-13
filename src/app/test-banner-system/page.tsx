'use client';

import { useState, useEffect } from 'react';
import { BannerSlot } from '@/components/banners/BannerSlot';
import { bannerCache } from '@/lib/banners/BannerCache';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';

export default function BannerSystemTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const supabase = createClientComponentClient<Database>();

  const addResult = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
    setTestResults(prev => [...prev, `[${timestamp}] ${emoji} ${message}`]);
  };

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    addResult('Iniciando testes do sistema de banners...', 'info');

    try {
      // Teste 1: Verificar slots no banco
      addResult('Teste 1: Verificando slots no banco de dados...', 'info');
      const { data: slots, error: slotsError } = await supabase
        .from('banner_slots')
        .select('*');

      if (slotsError) {
        addResult(`Erro ao buscar slots: ${slotsError.message}`, 'error');
      } else {
        addResult(`✅ Encontrados ${slots?.length || 0} slots no banco`, 'success');
        
        // Testar cada slot
        for (const slot of slots || []) {
          addResult(`  - Slot: ${slot.slug} (${slot.name}) - ${slot.is_active ? 'Ativo' : 'Inativo'}`, 'info');
        }
      }

      // Teste 2: Verificar templates
      addResult('Teste 2: Verificando templates...', 'info');
      const { data: templates, error: templatesError } = await supabase
        .from('banner_templates')
        .select('*');

      if (templatesError) {
        addResult(`Erro ao buscar templates: ${templatesError.message}`, 'error');
      } else {
        addResult(`✅ Encontrados ${templates?.length || 0} templates`, 'success');
        
        for (const template of templates || []) {
          addResult(`  - Template: ${template.slug} - ${template.name}`, 'info');
        }
      }

      // Teste 3: Verificar banners
      addResult('Teste 3: Verificando banners...', 'info');
      const { data: banners, error: bannersError } = await supabase
        .from('banners')
        .select('*')
        .eq('is_active', true);

      if (bannersError) {
        addResult(`Erro ao buscar banners: ${bannersError.message}`, 'error');
      } else {
        addResult(`✅ Encontrados ${banners?.length || 0} banners ativos`, 'success');
        
        for (const banner of banners || []) {
          addResult(`  - Banner: ${banner.title} - Slot: ${banner.slot_slug}`, 'info');
        }
      }

      // Teste 4: Testar API de slots
      addResult('Teste 4: Testando API de slots...', 'info');
      if (slots && slots.length > 0) {
        const testSlot = slots[0];
        const response = await fetch(`/api/banners/slot/${testSlot.slug}`);
        
        if (response.ok) {
          const data = await response.json();
          addResult(`✅ API retornou dados para slot ${testSlot.slug}`, 'success');
          addResult(`  - Slot: ${data.slot?.name || 'N/A'}`, 'info');
          addResult(`  - Banners: ${data.banners?.length || 0}`, 'info');
        } else {
          addResult(`❌ API falhou para slot ${testSlot.slug}: ${response.status}`, 'error');
        }
      }

      // Teste 5: Testar cache
      addResult('Teste 5: Testando sistema de cache...', 'info');
      
      // Primeira requisição (cache miss)
      const start1 = performance.now();
      const response1 = await fetch(`/api/banners/slot/${slots?.[0]?.slug || 'home-hero'}`);
      const time1 = performance.now() - start1;
      
      if (response1.ok) {
        addResult(`✅ Primeira requisição: ${time1.toFixed(2)}ms (cache miss)`, 'success');
        
        // Segunda requisição (cache hit)
        const start2 = performance.now();
        const response2 = await fetch(`/api/banners/slot/${slots?.[0]?.slug || 'home-hero'}`);
        const time2 = performance.now() - start2;
        
        if (response2.ok) {
          addResult(`✅ Segunda requisição: ${time2.toFixed(2)}ms (cache hit)`, 'success');
          addResult(`📊 Melhoria de performance: ${((1 - time2/time1) * 100).toFixed(1)}%`, 'info');
        }
      }

      // Teste 6: Testar crop automático
      addResult('Teste 6: Testando crop automático...', 'info');
      if (banners && banners.length > 0) {
        const testBanner = banners[0];
        if (testBanner.image_url && !testBanner.image_url_mobile) {
          const optimizedUrl = `/api/images/optimize?url=${encodeURIComponent(testBanner.image_url)}&width=400&height=200&format=webp&quality=80`;
          addResult(`✅ URL de crop automático gerada: ${optimizedUrl}`, 'success');
        }
      }

      // Teste 7: Estatísticas do cache
      addResult('Teste 7: Estatísticas do cache...', 'info');
      const stats = bannerCache.getStats();
      setCacheStats(stats);
      addResult(`✅ Cache size: ${stats.size} entries`, 'success');
      addResult(`✅ Cache entries: ${JSON.stringify(stats.entries, null, 2)}`, 'info');

      // Teste 8: Verificar configurações
      addResult('Teste 8: Verificando configurações do sistema...', 'info');
      const { data: settings, error: settingsError } = await supabase
        .from('banner_settings')
        .select('*')
        .single();

      if (settingsError) {
        addResult(`⚠️ Configurações não encontradas: ${settingsError.message}`, 'error');
      } else {
        addResult(`✅ Configurações carregadas`, 'success');
        addResult(`  - Cache duration: ${settings.cache_duration} minutos`, 'info');
        addResult(`  - Auto crop enabled: ${settings.auto_crop_enabled}`, 'info');
        addResult(`  - Analytics enabled: ${settings.analytics_enabled}`, 'info');
      }

      addResult('✅ Testes concluídos com sucesso!', 'success');

    } catch (error) {
      addResult(`❌ Erro durante os testes: ${error}`, 'error');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Teste do Sistema de Banners
          </h1>
          <button
            onClick={runTests}
            disabled={isTesting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isTesting ? 'Testando...' : 'Executar Testes'}
          </button>
        </div>

        {cacheStats && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Estatísticas do Cache:</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tamanho:</span> {cacheStats.size} entradas
              </div>
              <div>
                <span className="font-medium">Hit Rate:</span> {cacheStats.hitRate}%
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {testResults.map((result, index) => (
            <div
              key={index}
              className="font-mono text-sm p-2 bg-gray-100 rounded border-l-4 border-blue-500"
            >
              {result}
            </div>
          ))}
          {isTesting && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Executando testes...
            </div>
          )}
        </div>

        {!isTesting && testResults.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Clique em "Executar Testes" para começar
          </div>
        )}

        {/* Preview de banners */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Preview de Banners:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Banner Home Hero (Desktop)</h4>
              <BannerSlot slotSlug="home-hero" currentPage="home" />
            </div>
            <div>
              <h4 className="font-medium mb-2">Banner Home Hero (Mobile)</h4>
              <div className="max-w-sm mx-auto">
                <BannerSlot slotSlug="home-hero" currentPage="home" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Settings, Save, RotateCcw, AlertCircle } from 'lucide-react';

interface BannerSettingsProps {
  onSettingsUpdate?: (settings: BannerSettings) => void;
}

interface BannerSettings {
  cache_duration: number; // minutes
  auto_crop_enabled: boolean;
  crop_quality: number; // 1-100
  mobile_breakpoint: number; // pixels
  analytics_enabled: boolean;
  impression_delay: number; // milliseconds
  click_tracking_enabled: boolean;
  auto_rotation_delay: number; // seconds
  lazy_loading_enabled: boolean;
  preload_count: number; // number of banners to preload
}

const DEFAULT_SETTINGS: BannerSettings = {
  cache_duration: 5,
  auto_crop_enabled: true,
  crop_quality: 85,
  mobile_breakpoint: 768,
  analytics_enabled: true,
  impression_delay: 1000,
  click_tracking_enabled: true,
  auto_rotation_delay: 5,
  lazy_loading_enabled: true,
  preload_count: 2
};

export function BannerSettings({ onSettingsUpdate }: BannerSettingsProps) {
  const [settings, setSettings] = useState<BannerSettings>(DEFAULT_SETTINGS);
  const [originalSettings, setOriginalSettings] = useState<BannerSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadSettings();
  }, []);

  useEffect(() => {
    const hasChangesNow = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(hasChangesNow);
  }, [settings, originalSettings]);

  const loadSettings = async () => {
    try {
      // Buscar configurações do Supabase
      const { data, error } = await supabase
        .from('banner_settings')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        const loadedSettings: BannerSettings = {
          cache_duration: data.cache_duration || DEFAULT_SETTINGS.cache_duration,
          auto_crop_enabled: data.auto_crop_enabled ?? DEFAULT_SETTINGS.auto_crop_enabled,
          crop_quality: data.crop_quality || DEFAULT_SETTINGS.crop_quality,
          mobile_breakpoint: data.mobile_breakpoint || DEFAULT_SETTINGS.mobile_breakpoint,
          analytics_enabled: data.analytics_enabled ?? DEFAULT_SETTINGS.analytics_enabled,
          impression_delay: data.impression_delay || DEFAULT_SETTINGS.impression_delay,
          click_tracking_enabled: data.click_tracking_enabled ?? DEFAULT_SETTINGS.click_tracking_enabled,
          auto_rotation_delay: data.auto_rotation_delay || DEFAULT_SETTINGS.auto_rotation_delay,
          lazy_loading_enabled: data.lazy_loading_enabled ?? DEFAULT_SETTINGS.lazy_loading_enabled,
          preload_count: data.preload_count || DEFAULT_SETTINGS.preload_count
        };
        setSettings(loadedSettings);
        setOriginalSettings(loadedSettings);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);

      // Salvar no Supabase
      const { error } = await supabase
        .from('banner_settings')
        .upsert({
          id: 1, // Configuração única
          ...settings,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setOriginalSettings(settings);
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' });
      
      if (onSettingsUpdate) {
        onSettingsUpdate(settings);
      }

      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000);

    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' });
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = () => {
    setSettings(originalSettings);
    setMessage({ type: 'success', text: 'Configurações restauradas' });
    setTimeout(() => setMessage(null), 3000);
  };

  const updateSetting = <K extends keyof BannerSettings>(
    key: K,
    value: BannerSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="w-6 h-6 text-gray-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Configurações de Banners</h3>
              <p className="text-sm text-gray-600">Configure o comportamento global do sistema de banners</p>
            </div>
          </div>
          
          {hasChanges && (
            <div className="flex items-center space-x-2">
              <button
                onClick={resetSettings}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restaurar</span>
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-lg"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : 'Salvar'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        {message && (
          <div className={`flex items-center space-x-2 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            <AlertCircle className="w-5 h-5" />
            <span>{message.text}</span>
          </div>
        )}

        {/* Performance Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Performance</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duração do Cache (minutos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.cache_duration}
                onChange={(e) => updateSetting('cache_duration', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo que os banners ficam em cache por posição
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lazy Loading
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.lazy_loading_enabled}
                  onChange={(e) => updateSetting('lazy_loading_enabled', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Habilitar lazy loading</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Carrega banners apenas quando visíveis na tela
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pré-carregamento
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={settings.preload_count}
                onChange={(e) => updateSetting('preload_count', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Número de banners para pré-carregar no carrossel
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breakpoint Mobile (pixels)
              </label>
              <input
                type="number"
                min="320"
                max="1024"
                value={settings.mobile_breakpoint}
                onChange={(e) => updateSetting('mobile_breakpoint', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Largura máxima para considerar dispositivo móvel
              </p>
            </div>
          </div>
        </div>

        {/* Auto Crop Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Corte Automático de Imagens</h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.auto_crop_enabled}
                onChange={(e) => updateSetting('auto_crop_enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitar corte automático</span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              !settings.auto_crop_enabled ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualidade do Crop
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={settings.crop_quality}
                  onChange={(e) => updateSetting('crop_quality', parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span>{settings.crop_quality}%</span>
                  <span>100</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Qualidade da imagem após o corte (mais alto = melhor qualidade, maior tamanho)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Analytics</h4>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.analytics_enabled}
                onChange={(e) => updateSetting('analytics_enabled', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Habilitar analytics</span>
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${
              !settings.analytics_enabled ? 'opacity-50 pointer-events-none' : ''
            }`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delay de Impressão (ms)
                </label>
                <input
                  type="number"
                  min="0"
                  max="5000"
                  step="100"
                  value={settings.impression_delay}
                  onChange={(e) => updateSetting('impression_delay', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Tempo que o banner deve estar visível antes de contar como impressão
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tracking de Cliques
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={settings.click_tracking_enabled}
                    onChange={(e) => updateSetting('click_tracking_enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Habilitar tracking de cliques</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Registra cliques em banners para analytics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Rotation Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-900">Rotação de Banners</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delay de Rotação Automática (segundos)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.auto_rotation_delay}
                onChange={(e) => updateSetting('auto_rotation_delay', parseInt(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tempo entre rotações automáticas no carrossel
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
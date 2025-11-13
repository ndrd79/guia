import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { BannerDashboard } from '@/components/admin/banners/BannerDashboard';
import { BannerAnalytics } from '@/components/admin/banners/BannerAnalytics';
import { BannerSettings } from '@/components/admin/banners/BannerSettings';
import { Layout, BarChart3, Settings, Grid3x3 } from 'lucide-react';

interface BannerSlot {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  template_id: string | null;
  default_config: any;
  desktop_width: number;
  desktop_height: number;
  mobile_width: number;
  mobile_height: number;
  pages: string[];
  location: string;
  max_banners: number;
  rotation_time: number;
  priority: number;
  is_active: boolean;
  show_on_mobile: boolean;
  analytics_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface BannerTemplate {
  id: string;
  name: string;
  type: string;
  config: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

type TabType = 'positions' | 'analytics' | 'settings';

export default function BannerAdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('positions');
  const [slots, setSlots] = useState<BannerSlot[]>([]);
  const [templates, setTemplates] = useState<BannerTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Carregar slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('banner_slots')
        .select('*')
        .order('priority', { ascending: true });

      if (slotsError) throw slotsError;
      setSlots(slotsData || []);

      // Carregar templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('banner_templates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setError('Erro ao carregar dados do sistema de banners');
    } finally {
      setLoading(false);
    }
  };

  const handleSlotUpdate = async (updatedSlot: BannerSlot) => {
    try {
      const { error } = await supabase
        .from('banner_slots')
        .update({
          ...updatedSlot,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedSlot.id);

      if (error) throw error;

      // Atualizar estado local
      setSlots(prev => prev.map(slot => 
        slot.id === updatedSlot.id ? updatedSlot : slot
      ));

    } catch (error) {
      console.error('Erro ao atualizar slot:', error);
      alert('Erro ao atualizar posição do banner');
    }
  };

  const handleSlotCreate = async (newSlot: Omit<BannerSlot, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('banner_slots')
        .insert([{
          ...newSlot,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Atualizar estado local
      setSlots(prev => [...prev, data]);

    } catch (error) {
      console.error('Erro ao criar slot:', error);
      alert('Erro ao criar posição do banner');
    }
  };

  const handleSettingsUpdate = (settings: any) => {
    // Aqui você pode adicionar lógica para aplicar as configurações em tempo real
    console.log('Configurações atualizadas:', settings);
  };

  const tabs = [
    {
      id: 'positions' as TabType,
      name: 'Posições',
      icon: Grid3x3,
      component: (
        <BannerDashboard
          slots={slots}
          templates={templates}
          onSlotUpdate={handleSlotUpdate}
          onSlotCreate={handleSlotCreate}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'analytics' as TabType,
      name: 'Analytics',
      icon: BarChart3,
      component: (
        <BannerAnalytics
          slots={slots.map(slot => ({
            id: slot.id,
            name: slot.name,
            slug: slot.slug
          }))}
        />
      )
    },
    {
      id: 'settings' as TabType,
      name: 'Configurações',
      icon: Settings,
      component: (
        <BannerSettings
          onSettingsUpdate={handleSettingsUpdate}
        />
      )
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do sistema de banners...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 rounded-full p-4 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
            <Layout className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Sistema de Banners</h1>
                <p className="mt-1 text-sm text-gray-600">
                  Gerencie posições, templates e analytics do sistema de banners
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">{slots.length}</span> posições • 
                  <span className="font-medium">{templates.length}</span> templates
                </div>
                <button
                  onClick={loadData}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`
                    w-5 h-5 mr-2
                    ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}
                  `} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
}
"use client"

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { BannerPositionWizard } from './BannerPositionWizard';
import { BannerSlotCard } from './BannerSlotCard';
import { BannerAnalytics } from './BannerAnalytics';
import { Plus, Grid, BarChart3, Settings, RefreshCw } from 'lucide-react';
import { invalidateBannerCache } from '@/lib/banners/BannerCache';

interface BannerSlot {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  template_id: string;
  desktop_width: number;
  desktop_height: number;
  mobile_width: number;
  mobile_height: number;
  pages: string[];
  location: string | null;
  max_banners: number;
  rotation_time: number;
  priority: number;
  is_active: boolean;
  show_on_mobile: boolean;
  show_on_desktop: boolean;
  analytics_enabled: boolean;
  created_at: string;
  updated_at: string;
}

interface BannerTemplate {
  id: string;
  name: string;
  component_type: string;
  description: string | null;
}

interface BannerDashboardProps {
  slots?: BannerSlot[];
  templates?: BannerTemplate[];
  onSlotUpdate?: (updatedSlot: BannerSlot) => Promise<void>;
  onSlotCreate?: (
    newSlot: Omit<BannerSlot, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function BannerDashboard({
  slots: slotsProp,
  templates: templatesProp,
  onSlotUpdate,
  onSlotCreate,
  onRefresh,
}: BannerDashboardProps = {}) {
  const [slots, setSlots] = useState<BannerSlot[]>(slotsProp || []);
  const [templates, setTemplates] = useState<BannerTemplate[]>(templatesProp || []);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<BannerSlot | null>(null);
  const [wizardClone, setWizardClone] = useState(false);
  const [activeTab, setActiveTab] = useState<'slots' | 'analytics' | 'settings'>('slots');

  const supabase = createClientComponentClient<Database>();

  // Buscar dados apenas se não vierem via props
  useEffect(() => {
    if (!slotsProp || !templatesProp) {
      fetchData();
    }
  }, [slotsProp, templatesProp]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Buscar slots
      const { data: slotsData, error: slotsError } = await supabase
        .from('banner_slots')
        .select('*')
        .order('priority', { ascending: true });

      if (slotsError) throw slotsError;

      // Buscar templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('banner_templates')
        .select('id, name, component_type, description')
        .eq('is_active', true);

      if (templatesError) throw templatesError;

      setSlots(slotsData || []);
      setTemplates(templatesData || []);

    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async () => {
    // Se consumidor fornece callback, apenas abre wizard; persistência fica externa
    if (onSlotCreate) {
      setSelectedSlot(null);
      setShowWizard(true);
      setWizardClone(false);
      return;
    }
    setSelectedSlot(null);
    setShowWizard(true);
    setWizardClone(false);
  };

  const handleEditSlot = (slot: BannerSlot) => {
    setSelectedSlot(slot);
    setShowWizard(true);
    setWizardClone(false);
  };

  const handleCloneSlot = (slot: BannerSlot) => {
    setSelectedSlot(slot);
    setWizardClone(true);
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setShowWizard(false);
    setSelectedSlot(null);
    if (onRefresh) {
      onRefresh();
    } else {
      fetchData(); // Recarregar dados
    }
  };

  const handleToggleSlot = async (slotId: string, currentStatus: boolean) => {
    try {
      const slot = slots.find(s => s.id === slotId);
      if (!slot) return;

      const { error } = await supabase
        .from('banner_slots')
        .update({ is_active: !currentStatus })
        .eq('id', slotId);

      if (error) throw error;

      // Invalidar cache para este slot
      await invalidateBannerCache(slot.slug);

      // Atualizar estado local ou notificar consumidor
      const updated = { ...slot, is_active: !currentStatus };
      setSlots(prev => prev.map(s => (s.id === slotId ? updated : s)));
      if (onSlotUpdate) {
        await onSlotUpdate(updated);
      }

    } catch (error) {
      console.error('Erro ao alternar status:', error);
      alert('Erro ao alternar status do slot');
    }
  };

  const getLocationColor = (location: string) => {
    const colors: Record<string, string> = {
      'header': 'bg-blue-100 text-blue-800',
      'sidebar': 'bg-green-100 text-green-800',
      'content': 'bg-purple-100 text-purple-800',
      'footer': 'bg-gray-100 text-gray-800',
      'popup': 'bg-red-100 text-red-800'
    };
    return colors[location] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard de Banners</h1>
              <p className="text-gray-600 mt-1">Gerencie posições, templates e analytics</p>
            </div>
            <button
              onClick={handleCreateSlot}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Posição</span>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('slots')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'slots'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Grid className="w-4 h-4" />
                <span>Posições ({slots.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4" />
                <span>Configurações</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'slots' && (
          <div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-gray-900">{slots.length}</div>
                <div className="text-sm text-gray-600">Total de Posições</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-green-600">
                  {slots.filter(s => s.is_active).length}
                </div>
                <div className="text-sm text-gray-600">Posições Ativas</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-blue-600">
                  {templates.length}
                </div>
                <div className="text-sm text-gray-600">Templates Disponíveis</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-2xl font-bold text-purple-600">
                  {slots.filter(s => s.show_on_mobile).length}
                </div>
                <div className="text-sm text-gray-600">Mobile Ready</div>
              </div>
            </div>

            {/* Slots Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {slots.map(slot => (
                <BannerSlotCard
                  key={slot.id}
                  slot={slot}
                  template={templates.find(t => t.id === slot.template_id)}
                  onEdit={() => handleEditSlot(slot)}
                  onToggle={() => handleToggleSlot(slot.id, slot.is_active)}
                  onClone={() => handleCloneSlot(slot)}
                  locationColor={getLocationColor(slot.location || '')}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <BannerAnalytics slots={slots} />
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Configurações do Sistema</h3>
            <p className="text-gray-600">Configurações avançadas estarão disponíveis em breve.</p>
          </div>
        )}
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <BannerPositionWizard
          slot={selectedSlot}
          templates={templates}
          onClose={handleWizardClose}
          clone={wizardClone}
        />
      )}
    </div>
  );
}

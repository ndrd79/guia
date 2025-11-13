import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { X, Save, Eye, Smartphone, Monitor, RotateCcw, Settings } from 'lucide-react';

interface BannerPositionWizardProps {
  slot?: {
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
    default_config: any;
  };
  templates: Array<{
    id: string;
    name: string;
    component_type: string;
    description: string | null;
  }>;
  onClose: () => void;
  clone?: boolean;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  template_id: string;
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
  show_on_desktop: boolean;
  analytics_enabled: boolean;
}

export function BannerPositionWizard({ slot, templates, onClose, clone = false }: BannerPositionWizardProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [formData, setFormData] = useState<FormData>({
    name: slot?.name || '',
    slug: slot?.slug || '',
    description: slot?.description || '',
    template_id: slot?.template_id || '',
    desktop_width: slot?.desktop_width || 800,
    desktop_height: slot?.desktop_height || 400,
    mobile_width: slot?.mobile_width || 400,
    mobile_height: slot?.mobile_height || 200,
    pages: slot?.pages || ['home'],
    location: slot?.location || 'content',
    max_banners: slot?.max_banners || 1,
    rotation_time: slot?.rotation_time || 0,
    priority: slot?.priority || 1,
    is_active: slot?.is_active ?? true,
    show_on_mobile: slot?.show_on_mobile ?? true,
    show_on_desktop: slot?.show_on_desktop ?? true,
    analytics_enabled: slot?.analytics_enabled ?? true
  });

  const supabase = createClientComponentClient<Database>();

  const locations = [
    { value: 'header', label: 'Header/Cabeçalho', description: 'Topo do site' },
    { value: 'sidebar', label: 'Sidebar/Lateral', description: 'Barra lateral' },
    { value: 'content', label: 'Conteúdo', description: 'Dentro do conteúdo principal' },
    { value: 'footer', label: 'Footer/Rodapé', description: 'Rodapé do site' },
    { value: 'popup', label: 'Pop-up/Modal', description: 'Janela modal sobreposta' }
  ];

  const availablePages = [
    { value: 'home', label: 'Home/Página Inicial' },
    { value: 'noticias', label: 'Notícias' },
    { value: 'eventos', label: 'Eventos' },
    { value: 'empresas', label: 'Empresas' },
    { value: 'classificados', label: 'Classificados' },
    { value: '*', label: 'Todas as páginas' }
  ];

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: name ? generateSlug(name) : ''
    }));
  };

  const handlePagesChange = (page: string, checked: boolean) => {
    if (page === '*') {
      // Se selecionar "Todas as páginas", desmarcar as outras
      setFormData(prev => ({
        ...prev,
        pages: checked ? ['*'] : []
      }));
    } else {
      setFormData(prev => {
        const currentPages = prev.pages.filter(p => p !== '*');
        const newPages = checked 
          ? [...currentPages, page]
          : currentPages.filter(p => p !== page);
        
        return {
          ...prev,
          pages: newPages
        };
      });
    }
  };

  const validateStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() && formData.slug.trim() && formData.template_id;
      case 2:
        return formData.desktop_width > 0 && formData.desktop_height > 0 &&
               formData.mobile_width > 0 && formData.mobile_height > 0;
      case 3:
        return formData.pages.length > 0 && formData.location;
      default:
        return true;
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const dataToSave = {
        ...formData,
        default_config: {
          rotationTime: formData.rotation_time,
          maxBanners: formData.max_banners
        }
      };

      if (slot?.id && !clone) {
        // Atualizar slot existente
        const { error } = await supabase
          .from('banner_slots')
          .update(dataToSave)
          .eq('id', slot.id);

        if (error) throw error;
      } else {
        // Criar novo slot
        const { error } = await supabase
          .from('banner_slots')
          .insert([dataToSave]);

        if (error) throw error;
      }

      onClose();
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert('Erro ao salvar posição. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nome da Posição *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: Banner Meio da Página"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Slug (Identificador único) *
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          placeholder="ex: banner-meio-pagina"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Descreva o propósito desta posição..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Template *
        </label>
        <div className="grid grid-cols-1 gap-3">
          {templates.map(template => (
            <label
              key={template.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${
                formData.template_id === template.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="template"
                value={template.id}
                checked={formData.template_id === template.id}
                onChange={(e) => setFormData(prev => ({ ...prev, template_id: e.target.value }))}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{template.name}</div>
                <div className="text-sm text-gray-500">{template.description}</div>
                <div className="text-xs text-gray-400 mt-1">Tipo: {template.component_type}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3">
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              name: prev.name || 'Banner Topo Clonado',
              slug: prev.slug || generateSlug('banner-topo-clonado'),
              max_banners: 5,
              rotation_time: 5000
            }))}
            className="px-3 py-2 border border-gray-300 rounded"
          >Topo</button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              name: prev.name || 'Banner Sidebar Clonado',
              slug: prev.slug || generateSlug('banner-sidebar-clonado'),
              max_banners: 3,
              rotation_time: 0
            }))}
            className="px-3 py-2 border border-gray-300 rounded"
          >Sidebar</button>
          <button
            type="button"
            onClick={() => setFormData(prev => ({
              ...prev,
              name: prev.name || 'Banner Conteudo Clonado',
              slug: prev.slug || generateSlug('banner-conteudo-clonado'),
              max_banners: 2,
              rotation_time: 3000
            }))}
            className="px-3 py-2 border border-gray-300 rounded"
          >Conteúdo</button>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Largura Desktop (px)
          </label>
          <input
            type="number"
            value={formData.desktop_width}
            onChange={(e) => setFormData(prev => ({ ...prev, desktop_width: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Altura Desktop (px)
          </label>
          <input
            type="number"
            value={formData.desktop_height}
            onChange={(e) => setFormData(prev => ({ ...prev, desktop_height: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Largura Mobile (px)
          </label>
          <input
            type="number"
            value={formData.mobile_width}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile_width: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Altura Mobile (px)
          </label>
          <input
            type="number"
            value={formData.mobile_height}
            onChange={(e) => setFormData(prev => ({ ...prev, mobile_height: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900">Preview Responsivo</h4>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPreviewMode('desktop')}
              className={`p-2 rounded ${
                previewMode === 'desktop' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
              }`}
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode('mobile')}
              className={`p-2 rounded ${
                previewMode === 'mobile' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'
              }`}
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex justify-center">
          <div
            className={`border-2 border-dashed border-gray-300 bg-white rounded-lg flex items-center justify-center text-gray-500 ${
              previewMode === 'desktop' 
                ? 'w-64 h-32' 
                : 'w-24 h-16'
            }`}
            style={{
              width: previewMode === 'desktop' ? formData.desktop_width * 0.3 : formData.mobile_width * 0.3,
              height: previewMode === 'desktop' ? formData.desktop_height * 0.3 : formData.mobile_height * 0.3
            }}
          >
            <div className="text-center">
              <div className="text-lg font-medium">
                {formData.desktop_width} × {formData.desktop_height}
              </div>
              <div className="text-xs">
                {previewMode === 'desktop' ? 'Desktop' : 'Mobile'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Máximo de Banners
          </label>
          <input
            type="number"
            min="1"
            max="10"
            value={formData.max_banners}
            onChange={(e) => setFormData(prev => ({ ...prev, max_banners: parseInt(e.target.value) || 1 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tempo de Rotação (ms)
          </label>
          <input
            type="number"
            min="0"
            step="500"
            value={formData.rotation_time}
            onChange={(e) => setFormData(prev => ({ ...prev, rotation_time: parseInt(e.target.value) || 0 }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Localização *
        </label>
        <div className="space-y-2">
          {locations.map(location => (
            <label
              key={location.value}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                formData.location === location.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input
                type="radio"
                name="location"
                value={location.value}
                checked={formData.location === location.value}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="mr-3"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900">{location.label}</div>
                <div className="text-sm text-gray-500">{location.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Páginas de Exibição *
        </label>
        <div className="space-y-2">
          {availablePages.map(page => (
            <label
              key={page.value}
              className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={formData.pages.includes(page.value)}
                onChange={(e) => handlePagesChange(page.value, e.target.checked)}
                className="mr-3"
              />
              <span className="text-gray-700">{page.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Prioridade
        </label>
        <input
          type="number"
          min="1"
          max="100"
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          Número menor = maior prioridade (1 é a mais alta)
        </p>
      </div>

      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900">Configurações de Exibição</h4>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.show_on_desktop}
            onChange={(e) => setFormData(prev => ({ ...prev, show_on_desktop: e.target.checked }))}
            className="mr-3"
          />
          <span className="text-gray-700">Mostrar em Desktop</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.show_on_mobile}
            onChange={(e) => setFormData(prev => ({ ...prev, show_on_mobile: e.target.checked }))}
            className="mr-3"
          />
          <span className="text-gray-700">Mostrar em Mobile</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.analytics_enabled}
            onChange={(e) => setFormData(prev => ({ ...prev, analytics_enabled: e.target.checked }))}
            className="mr-3"
          />
          <span className="text-gray-700">Habilitar Analytics</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
            className="mr-3"
          />
          <span className="text-gray-700">Ativar posição</span>
        </label>
      </div>
    </div>
  );

  const steps = [
    { number: 1, title: 'Informações Básicas', component: renderStep1 },
    { number: 2, title: 'Dimensões & Layout', component: renderStep2 },
    { number: 3, title: 'Exibição & Páginas', component: renderStep3 }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {slot ? 'Editar Posição' : 'Criar Nova Posição'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Configure uma nova posição de banner em 2 minutos
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center">
            {steps.map((stepItem, index) => (
              <React.Fragment key={stepItem.number}>
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepItem.number
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step > stepItem.number ? '✓' : stepItem.number}
                  </div>
                  <div className="ml-2 text-sm font-medium text-gray-700">
                    {stepItem.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${
                    step > stepItem.number ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {steps[step - 1].component()}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50">
          <div>
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                ← Voltar
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancelar
            </button>
            
            {step < steps.length ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!validateStep(step)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próximo →
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Salvando...' : 'Salvar Posição'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Edit3, Eye, EyeOff, Settings, Monitor, Smartphone, RotateCcw } from 'lucide-react';

interface BannerSlotCardProps {
  slot: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
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
  };
  template?: {
    id: string;
    name: string;
    component_type: string;
  };
  onEdit: () => void;
  onToggle: () => void;
  onClone?: () => void;
  locationColor: string;
}

export function BannerSlotCard({ slot, template, onEdit, onToggle, onClone, locationColor }: BannerSlotCardProps) {
  const getTemplateIcon = (componentType: string) => {
    const icons = {
      'carousel': '🎠',
      'static': '🖼️',
      'grid': '⚏',
      'video': '🎬',
      'custom': '⚙️'
    };
    return icons[componentType as keyof typeof icons] || '📄';
  };

  const getPagesPreview = (pages: string[]) => {
    if (pages.includes('*')) return 'Todas as páginas';
    if (pages.length <= 2) return pages.join(', ');
    return `${pages.slice(0, 2).join(', ')} +${pages.length - 2}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border transition-all hover:shadow-md ${
      slot.is_active ? 'border-gray-200' : 'border-gray-300 opacity-60'
    }`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight">
            {slot.name}
          </h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={onEdit}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title="Editar posição"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {onClone && (
              <button
                onClick={onClone}
                className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                title="Clonar posição"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onToggle}
              className={`p-1 transition-colors ${
                slot.is_active 
                  ? 'text-green-600 hover:text-green-700' 
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              title={slot.is_active ? 'Desativar' : 'Ativar'}
            >
              {slot.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs">
          <span className={`px-2 py-1 rounded-full ${locationColor}`}>
            {slot.location || 'geral'}
          </span>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">
            {getTemplateIcon(template?.component_type || 'static')} {template?.name || 'Template'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {slot.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {slot.description}
          </p>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Páginas:</span>
            <span className="text-gray-700 font-medium">
              {getPagesPreview(slot.pages)}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Máx. banners:</span>
            <span className="text-gray-700 font-medium">
              {slot.max_banners}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Rotação:</span>
            <span className="text-gray-700 font-medium">
              {slot.rotation_time > 0 ? `${slot.rotation_time / 1000}s` : 'Estático'}
            </span>
          </div>

          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Prioridade:</span>
            <span className="text-gray-700 font-medium">
              {slot.priority}
            </span>
          </div>
        </div>

        {/* Device Support */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-1 text-xs ${
              slot.show_on_desktop ? 'text-green-600' : 'text-gray-400'
            }`}>
              <Monitor className="w-3 h-3" />
              <span>Desktop</span>
            </div>
            <div className={`flex items-center space-x-1 text-xs ${
              slot.show_on_mobile ? 'text-green-600' : 'text-gray-400'
            }`}>
              <Smartphone className="w-3 h-3" />
              <span>Mobile</span>
            </div>
          </div>

          {slot.analytics_enabled && (
            <div className="flex items-center space-x-1 text-xs text-blue-600">
              <Settings className="w-3 h-3" />
              <span>Analytics</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
        Criado em {formatDate(slot.created_at)}
      </div>
    </div>
  );
}

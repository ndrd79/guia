import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { BarChart3, TrendingUp, MousePointer, Eye, Calendar, Filter } from 'lucide-react';

interface BannerAnalyticsProps {
  slots: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

interface AnalyticsData {
  date: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

interface SlotAnalytics {
  slot_id: string;
  slot_name: string;
  impressions: number;
  clicks: number;
  ctr: number;
}

export function BannerAnalytics({ slots }: BannerAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [selectedSlot, setSelectedSlot] = useState<string>('all');
  const [analytics, setAnalytics] = useState<AnalyticsData[]>([]);
  const [slotAnalytics, setSlotAnalytics] = useState<SlotAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange, selectedSlot]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Calcular data inicial baseado no range
      const now = new Date();
      const startDate = new Date();
      
      switch (timeRange) {
        case '7d':
          startDate.setDate(now.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(now.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(now.getDate() - 90);
          break;
      }

      // Buscar analytics por dia
      let dailyQuery = supabase
        .from('banner_analytics')
        .select(`
          date:timestamp::date,
          event_type,
          count
        `)
        .gte('timestamp', startDate.toISOString())
        .in('event_type', ['impression', 'click'])
        .order('date', { ascending: true });

      if (selectedSlot !== 'all') {
        dailyQuery = dailyQuery.eq('slot_id', selectedSlot);
      }

      const { data: dailyData, error: dailyError } = await dailyQuery;

      if (dailyError) throw dailyError;

      // Processar dados diários
      const processedData: AnalyticsData[] = [];
      const dateMap = new Map<string, { impressions: number; clicks: number }>();

      dailyData?.forEach((row: any) => {
        const date = row.date as string;
        if (!dateMap.has(date)) {
          dateMap.set(date, { impressions: 0, clicks: 0 });
        }
        
        const data = dateMap.get(date)!;
        if (row.event_type === 'impression') {
          data.impressions = row.count;
        } else if (row.event_type === 'click') {
          data.clicks = row.count;
        }
      });

      dateMap.forEach((data, date) => {
        processedData.push({
          date,
          impressions: data.impressions,
          clicks: data.clicks,
          ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0
        });
      });

      setAnalytics(processedData);

      // Buscar analytics por slot
      let slotQuery = supabase
        .from('banner_analytics')
        .select(`
          slot_id,
          event_type,
          count
        `)
        .gte('timestamp', startDate.toISOString())
        .in('event_type', ['impression', 'click'])
        .order('slot_id');

      const { data: slotData, error: slotError } = await slotQuery;

      if (slotError) throw slotError;

      // Processar dados por slot
      const slotMap = new Map<string, { impressions: number; clicks: number }>();

      slotData?.forEach((row: any) => {
        const slotId = row.slot_id as string;
        if (!slotMap.has(slotId)) {
          slotMap.set(slotId, { impressions: 0, clicks: 0 });
        }
        
        const data = slotMap.get(slotId)!;
        if (row.event_type === 'impression') {
          data.impressions = row.count;
        } else if (row.event_type === 'click') {
          data.clicks = row.count;
        }
      });

      const processedSlotData: SlotAnalytics[] = [];
      slotMap.forEach((data, slotId) => {
        const slot = slots.find(s => s.id === slotId);
        if (slot) {
          processedSlotData.push({
            slot_id: slotId,
            slot_name: slot.name,
            impressions: data.impressions,
            clicks: data.clicks,
            ctr: data.impressions > 0 ? (data.clicks / data.impressions) * 100 : 0
          });
        }
      });

      setSlotAnalytics(processedSlotData);

    } catch (error) {
      console.error('Erro ao buscar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalImpressions = analytics.reduce((sum, day) => sum + day.impressions, 0);
  const totalClicks = analytics.reduce((sum, day) => sum + day.clicks, 0);
  const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
            <p className="text-sm text-gray-600">Configure os filtros para análise</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={selectedSlot}
                onChange={(e) => setSelectedSlot(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Todos os Slots</option>
                {slots.map(slot => (
                  <option key={slot.id} value={slot.id}>{slot.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Impressões</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalImpressions.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Cliques</p>
              <p className="text-3xl font-bold text-gray-900">
                {totalClicks.toLocaleString('pt-BR')}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <MousePointer className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Taxa de Clique (CTR)</p>
              <p className="text-3xl font-bold text-gray-900">
                {avgCTR.toFixed(2)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Desempenho Diário
          </h3>
          <div className="space-y-4">
            {analytics.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>{new Date(day.date).toLocaleDateString('pt-BR')}</span>
                    <span>{day.ctr.toFixed(1)}% CTR</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (day.impressions / Math.max(...analytics.map(d => d.impressions))) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Slot Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Desempenho por Posição
          </h3>
          <div className="space-y-4">
            {slotAnalytics.map((slot, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span className="font-medium">{slot.slot_name}</span>
                    <span>{slot.ctr.toFixed(1)}% CTR</span>
                  </div>
                  <div className="flex space-x-2 text-xs text-gray-500">
                    <span>{slot.impressions.toLocaleString('pt-BR')} impressões</span>
                    <span>•</span>
                    <span>{slot.clicks.toLocaleString('pt-BR')} cliques</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Banners */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Banners Mais Clicados
        </h3>
        <div className="text-center py-8">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Dados de banners individuais estarão disponíveis em breve.</p>
        </div>
      </div>
    </div>
  );
}
import { useMemo } from 'react'
import { Newspaper, Star, Calendar } from 'lucide-react'
import { startOfMonth, endOfMonth } from 'date-fns'
import StatCard from './StatCard'

interface NewsItem {
  id: string
  titulo: string
  categoria: string
  destaque: boolean
  created_at: string
}

interface StatsPanelProps {
  news: NewsItem[]
}

export default function StatsPanel({ news }: StatsPanelProps) {
  const stats = useMemo(() => {
    const total = news.length
    const featured = news.filter(item => item.destaque).length
    
    // Calculate news published this month
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    
    const thisMonth = news.filter(item => {
      const itemDate = new Date(item.created_at)
      return itemDate >= monthStart && itemDate <= monthEnd
    }).length

    return { total, featured, thisMonth }
  }, [news])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatCard
        title="Total de Notícias"
        value={stats.total}
        icon={<Newspaper size={24} />}
        color="blue"
        description="Todas as notícias no sistema"
      />
      
      <StatCard
        title="Notícias em Destaque"
        value={stats.featured}
        icon={<Star size={24} />}
        color="gold"
        description="Marcadas como destaque"
      />
      
      <StatCard
        title="Publicadas Este Mês"
        value={stats.thisMonth}
        icon={<Calendar size={24} />}
        color="green"
        description="Notícias do mês atual"
      />
    </div>
  )
}
import { useState, useEffect } from 'react'
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface RelativeDateProps {
  date: string | Date
  showTooltip?: boolean
  className?: string
}

export default function RelativeDate({ date, showTooltip = true, className = '' }: RelativeDateProps) {
  const [relativeTime, setRelativeTime] = useState('')
  const [fullDate, setFullDate] = useState('')

  useEffect(() => {
    const dateObj = new Date(date)
    
    // Format full date for tooltip
    const fullDateFormatted = format(dateObj, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    setFullDate(fullDateFormatted)

    // Format relative time
    const updateRelativeTime = () => {
      if (isToday(dateObj)) {
        const timeOnly = format(dateObj, 'HH:mm')
        setRelativeTime(`hoje às ${timeOnly}`)
      } else if (isYesterday(dateObj)) {
        const timeOnly = format(dateObj, 'HH:mm')
        setRelativeTime(`ontem às ${timeOnly}`)
      } else {
        const relative = formatDistanceToNow(dateObj, { 
          addSuffix: true, 
          locale: ptBR 
        })
        const shortDate = format(dateObj, 'dd/MM/yyyy')
        setRelativeTime(`${shortDate} (${relative})`)
      }
    }

    updateRelativeTime()

    // Update every minute for today's dates
    const interval = isToday(dateObj) ? setInterval(updateRelativeTime, 60000) : null

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [date])

  if (showTooltip) {
    return (
      <span 
        className={`cursor-help ${className}`}
        title={fullDate}
      >
        {relativeTime}
      </span>
    )
  }

  return (
    <span className={className}>
      {relativeTime}
    </span>
  )
}
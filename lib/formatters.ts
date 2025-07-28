// Utilitários para formatação consistente entre servidor e cliente
// Evita erros de hidratação causados por diferenças de localização

/**
 * Formata uma data de forma consistente entre servidor e cliente
 */
export function formatDate(date: string | Date, options?: {
  includeTime?: boolean
  short?: boolean
}): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }

    const day = dateObj.getDate().toString().padStart(2, '0')
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const year = dateObj.getFullYear()
    
    if (options?.short) {
      return `${day}/${month}`
    }
    
    let formatted = `${day}/${month}/${year}`
    
    if (options?.includeTime) {
      const hours = dateObj.getHours().toString().padStart(2, '0')
      const minutes = dateObj.getMinutes().toString().padStart(2, '0')
      formatted += ` às ${hours}:${minutes}`
    }
    
    return formatted
  } catch (error) {
    return 'Data inválida'
  }
}

/**
 * Formata um número como moeda brasileira de forma consistente
 */
export function formatCurrency(value: number): string {
  try {
    if (isNaN(value)) {
      return 'R$ 0,00'
    }
    
    // Formatação manual para evitar problemas de localização
    const formatted = value.toFixed(2).replace('.', ',')
    const parts = formatted.split(',')
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    
    return `R$ ${integerPart},${parts[1]}`
  } catch (error) {
    return 'R$ 0,00'
  }
}

/**
 * Formata um número com separadores de milhares
 */
export function formatNumber(value: number): string {
  try {
    if (isNaN(value)) {
      return '0'
    }
    
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  } catch (error) {
    return '0'
  }
}

/**
 * Formata data e hora para input datetime-local
 */
export function formatDateTimeLocal(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    const year = dateObj.getFullYear()
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const day = dateObj.getDate().toString().padStart(2, '0')
    const hours = dateObj.getHours().toString().padStart(2, '0')
    const minutes = dateObj.getMinutes().toString().padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    return ''
  }
}

/**
 * Formata data para input date
 */
export function formatDateInput(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    const year = dateObj.getFullYear()
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0')
    const day = dateObj.getDate().toString().padStart(2, '0')
    
    return `${year}-${month}-${day}`
  } catch (error) {
    return ''
  }
}
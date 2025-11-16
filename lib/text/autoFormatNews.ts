export type AutoFormatInput = {
  title?: string
  content: string
  category?: string
}

export type AutoFormatOutput = {
  title: string
  dek: string
  sections: { heading: string; body: string[] }[]
  bullets: string[]
  impact: string[]
  nextSteps: string[]
  html: string
}

const splitSentences = (text: string) => {
  // Preservar pontuação e dividir corretamente por frases
  const sentences = text
    .replace(/\s+/g, ' ') // Normalizar espaços
    .split(/(?<=[.!?])\s+/) // Dividir após pontuação final
    .map(s => s.trim())
    .filter(s => s.length > 5) // Ignorar fragmentos muito pequenos
    .filter((sentence, index, array) => {
      // Evitar duplicações mantendo apenas a primeira ocorrência
      const cleanSentence = sentence.toLowerCase().replace(/[^\w\s]/g, '')
      const isDuplicate = array.slice(0, index).some(prev => 
        prev.toLowerCase().replace(/[^\w\s]/g, '') === cleanSentence
      )
      return !isDuplicate
    })
  
  return sentences.length > 0 ? sentences : [text.trim()]
}

const splitParagraphs = (text: string) => {
  // Se não houver quebras de parágrafo claras, tratar o texto como um único bloco
  const hasParagraphBreaks = text.includes('\n\n') || text.includes('<p>')
  
  if (!hasParagraphBreaks) {
    // Para textos sem quebras, retornar como está
    return [text.trim()]
  }
  
  // Para textos com quebras, dividir normalmente
  const raw = text.split(/\n\s*\n|<\/?p>/i).map(t => t.trim()).filter(Boolean)
  const out: string[] = []
  const seen = new Set<string>()
  for (const p of raw) {
    const norm = p.replace(/\s+/g, ' ').trim()
    if (norm.length > 20) { // Ignorar parágrafos muito pequenos
      const key = norm.toLowerCase()
      if (!seen.has(key)) {
        seen.add(key)
        out.push(norm)
      }
    }
  }
  return out.length > 0 ? out : [text.trim()]
}

const makeDek = (text: string) => {
  const s = splitSentences(text)
  // Pegar apenas a primeira frase para evitar duplicação
  const firstSentence = s[0] || ''
  // Limitar tamanho e evitar que seja igual ao título
  return firstSentence.length > 200 ? firstSentence.substring(0, 200) + '...' : firstSentence
}

const chunk = <T,>(arr: T[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))

const headingFrom = (para: string, index: number) => {
  // Para o primeiro parágrafo, usar "Resumo" em vez de "Seção 1"
  if (index === 0) return 'Resumo'
  
  // Para outros parágrafos, não criar títulos automáticos
  return '' // Retornar vazio para não criar seções desnecessárias
}

const extractBullets = (paras: string[]) => {
  const b: string[] = []
  for (const p of paras) {
    const m = p.match(/(?:\b|\n)[•\-\d+\)]\s*([^\n]+)/g)
    if (m) m.forEach(x => b.push(x.replace(/^\s*[•\-\d+\)]\s*/, '').trim()))
  }
  return Array.from(new Set(b)).slice(0, 8)
}

const impactFor = (cat?: string) => {
  const items: string[] = []
  if (cat && /trânsito|infraestrutura|obras/i.test(cat)) items.push('Mudanças de circulação e prazos de obra na região')
  if (cat && /economia|negócios/i.test(cat)) items.push('Efeitos para comerciantes e serviços locais')
  items.push('O que muda para moradores e quando começa')
  return items.slice(0, 3)
}

const nextStepsDefault = ['Próximas etapas do órgão responsável', 'Como participar ou obter mais informações']

// Função para criar parágrafos bem estruturados e legíveis
function createReadableParagraphs(sentences: string[]): string[] {
  const paragraphs: string[] = []
  let currentParagraph: string[] = []
  
  for (let i = 0; i < sentences.length; i++) {
    currentParagraph.push(sentences[i])
    
    // Criar novo parágrafo a cada 3-5 frases ou após pontos de transição
    const shouldBreak = 
      currentParagraph.length >= 4 || // Tamanho ideal: 4 frases
      (currentParagraph.length >= 3 && i < sentences.length - 1 && sentences[i].includes('.')) || // 3 frases + ponto final
      (sentences[i].includes('"') && sentences[i].endsWith('.')) || // Após citações
      (sentences[i].includes('?') || sentences[i].includes('!')) // Após interrogação/exclamação
    
    if (shouldBreak && currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '))
      currentParagraph = []
    }
  }
  
  // Adicionar frases restantes
  if (currentParagraph.length > 0) {
    paragraphs.push(currentParagraph.join(' '))
  }
  
  return paragraphs
}

function cleanInputText(text: string): string {
  let t = text.trim()
  t = t.replace(/^Resumo(?:\s+em\s+30\s+segundos)?\s*[:\-]*\s*/i, '')
  t = t.replace(/^Seção\s+\d+\s*[:\-]*\s*/i, '')
  t = t.replace(/^\d+\.$/, '')
  return t
}

export function autoFormatNews(input: AutoFormatInput): AutoFormatOutput {
  const originalText = cleanInputText(input.content)
  const originalSentences = splitSentences(originalText)
  
  // Título: usar o fornecido ou primeira frase
  const title = input.title && input.title.trim().length > 6 ? input.title.trim() : (originalSentences[0] || 'Notícia')
  
  const dekSentences = originalSentences.slice(0, 2)
  const dek = dekSentences.join(' ').trim()
  
  // Criar parágrafos legíveis
  const readableParagraphs = createReadableParagraphs(originalSentences.slice(2)) // Pular frases usadas no dek
  
  // Se não houver parágrafos suficientes, usar o texto original como está
  if (readableParagraphs.length === 0) {
    readableParagraphs.push(originalText)
  }
  
  const bullets = extractBullets([originalText]) // Extrair do texto completo
  const impact = impactFor(input.category)
  const nextSteps = nextStepsDefault
  
  const htmlParts: string[] = []

  // Texto principal em parágrafos bem estruturados
  readableParagraphs.forEach((para, index) => {
    if (para.trim().length > 20) { // Apenas parágrafos com conteúdo significativo
      htmlParts.push(`<p>${para.trim()}</p>`)
      
      // Adicionar respiração visual entre parágrafos longos
      if (para.length > 200 && index < readableParagraphs.length - 1) {
        htmlParts.push('')
      }
    }
  })
  
  // Apenas bullets se realmente existirem e forem relevantes
  if (bullets.length > 0 && bullets.some(b => input.content.includes(b))) {
    htmlParts.push('<h3>Principais pontos</h3>')
    htmlParts.push('<ul>')
    bullets.slice(0, 5).forEach(b => htmlParts.push(`<li>${b}</li>`))
    htmlParts.push('</ul>')
  }
  
  // Criar sections para compatibilidade
  const sections = readableParagraphs.map((para, i) => ({
    heading: i === 0 ? 'Texto principal' : '',
    body: [para]
  }))
  
  const html = htmlParts.join('\n')
  return { title, dek, sections, bullets, impact, nextSteps, html }
}

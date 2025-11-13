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

const splitSentences = (text: string) => text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean)
const splitParagraphs = (text: string) => text.split(/\n\s*\n|<\/?p>/i).map(t => t.trim()).filter(Boolean)

const makeDek = (text: string) => {
  const s = splitSentences(text)
  const d = s.slice(0, 2).join(' ')
  return d.length > 160 ? s[0] : d
}

const chunk = <T,>(arr: T[], size: number) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size))

const headingFrom = (para: string, index: number) => {
  const s = splitSentences(para)[0] || para
  const h = s.replace(/[,.:;–-].*/, '').trim()
  if (!h || h.length < 4) return `Seção ${index + 1}`
  return h.length > 60 ? `Seção ${index + 1}` : h
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

export function autoFormatNews(input: AutoFormatInput): AutoFormatOutput {
  const paras = splitParagraphs(input.content)
  const title = input.title && input.title.trim().length > 6 ? input.title.trim() : (splitSentences(paras[0] || '')[0] || 'Notícia')
  const dek = makeDek(paras.join(' '))
  const blocks = chunk(paras.slice(1), 3)
  const sections = blocks.map((block, i) => ({ heading: headingFrom(block[0] || '', i), body: block }))
  const bullets = extractBullets(paras)
  const impact = impactFor(input.category)
  const nextSteps = nextStepsDefault
  const htmlParts: string[] = []
  htmlParts.push(`<p><strong>${dek}</strong></p>`) 
  sections.forEach(s => {
    htmlParts.push(`<h2>${s.heading}</h2>`) 
    s.body.forEach(p => htmlParts.push(`<p>${p}</p>`))
  })
  if (bullets.length) {
    htmlParts.push('<h2>Pontos-chave</h2>')
    htmlParts.push('<ul>')
    bullets.forEach(b => htmlParts.push(`<li>${b}</li>`))
    htmlParts.push('</ul>')
  }
  htmlParts.push('<h2>O que fica</h2>')
  htmlParts.push('<ul>')
  impact.forEach(b => htmlParts.push(`<li>${b}</li>`))
  htmlParts.push('</ul>')
  htmlParts.push('<h2>Próximos passos</h2>')
  htmlParts.push('<ul>')
  nextSteps.forEach(b => htmlParts.push(`<li>${b}</li>`))
  htmlParts.push('</ul>')
  const html = htmlParts.join('\n')
  return { title, dek, sections, bullets, impact, nextSteps, html }
}

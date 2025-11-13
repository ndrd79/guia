const ws = (t: string) => t.replace(/\s+/g, ' ').trim()
const sentences = (t: string) => ws(t).split(/(?<=[.!?])\s+/).filter(Boolean)
const paras = (t: string) => t.split(/\n\s*\n|<\/?p>/i).map(s => s.trim()).filter(Boolean)

const map: Record<string, string> = {
  'realizar': 'executar',
  'iniciar': 'começar',
  'iniciará': 'vai começar',
  'importante': 'significativo',
  'melhorias': 'aperfeiçoamentos',
  'obra': 'intervenção',
  'obras': 'intervenções',
  'prefeitura': 'Prefeitura',
  'secretaria': 'Secretaria',
  'programa': 'iniciativa',
  'revitalização': 'requalificação',
  'revitalizar': 'requalificar',
  'iluminação': 'iluminação pública',
  'calçadas': 'passeios',
  'prazo': 'período',
  'interdição': 'bloqueio',
  'parcial': 'parcialmente'
}

const replaceSyn = (t: string) => {
  let out = t
  for (const [k, v] of Object.entries(map)) {
    out = out.replace(new RegExp(`\\b${k}\\b`, 'gi'), (m) => {
      const cap = m[0] === m[0].toUpperCase()
      return cap ? v.charAt(0).toUpperCase() + v.slice(1) : v
    })
  }
  return out
}

const connectors = (t: string) => t
  .replace(/\bAlém disso\b/gi, 'Também')
  .replace(/\bNo entanto\b/gi, 'Por outro lado')
  .replace(/\bDessa forma\b/gi, 'Assim')

const passiveToActive = (t: string) => t
  .replace(/\bserá\s+(\w+)/gi, 'vai $1')
  .replace(/\bserão\s+(\w+)/gi, 'vão $1')
  .replace(/\bfoi\s+realizado\b/gi, 'aconteceu')
  .replace(/\bserá\s+realizado\b/gi, 'vai acontecer')

const shorten = (t: string) => sentences(t).map(s => s.length > 200 ? s.replace(/,\s+/g, '. ') : s).join(' ')

export function paraphraseTitle(title?: string, content?: string) {
  const base = title && title.trim().length > 6 ? title : (sentences(content || '')[0] || '')
  return connectors(replaceSyn(ws(base)))
}

export function paraphraseContent(text: string) {
  const ps = paras(text)
  const out = ps.map(p => shorten(connectors(passiveToActive(replaceSyn(p))))).join('\n\n')
  return out
}

export function paraphraseNews(input: { title?: string; content: string }) {
  const title = paraphraseTitle(input.title, input.content)
  const content = paraphraseContent(input.content)
  return { title, content }
}

import { NextApiRequest, NextApiResponse } from 'next'

interface RewriteRequest {
  title: string
  subtitle: string
  content: string
  options: {
    seoOptimization: boolean
    plagiarismPrevention: boolean
    tone: 'formal' | 'informal' | 'neutral'
    targetKeywords: string
    customInstructions?: string
  }
}

interface RewriteResponse {
  success: boolean
  rewrittenContent?: {
    title: string
    subtitle: string
    content: string
  }
  error?: string
}

// Função principal de simulação de reescrita com IA - VERSÃO CORRIGIDA
function simulateAIRewrite(request: RewriteRequest): { title: string; subtitle: string; content: string } {
  const { title, subtitle, content, options } = request
  const synonyms: Record<string, string[]> = {
    'anunciou': ['revelou', 'divulgou', 'comunicou', 'informou', 'declarou'],
    'governo': ['administração pública', 'poder executivo', 'gestão federal', 'autoridades'],
    'medidas': ['ações', 'iniciativas', 'estratégias', 'políticas', 'diretrizes'],
    'economia': ['setor econômico', 'mercado financeiro', 'cenário econômico', 'sistema financeiro'],
    'população': ['cidadãos', 'brasileiros', 'sociedade', 'comunidade', 'habitantes'],
    'empresa': ['companhia', 'corporação', 'organização', 'negócio', 'empreendimento'],
    'projeto': ['iniciativa', 'programa', 'plano', 'proposta', 'empreendimento'],
    'importante': ['relevante', 'significativo', 'fundamental', 'essencial', 'crucial'],
    'novo': ['recente', 'inédito', 'inovador', 'moderno', 'atual'],
    'grande': ['expressivo', 'considerável', 'substancial', 'amplo'],
    'cidade': ['município', 'localidade', 'urbe'],
    'prefeitura': ['administração municipal', 'gestão municipal', 'executivo local'],
    'bairro': ['região', 'zona', 'localidade'],
    'rua': ['via', 'logradouro', 'avenida'],
    'obra': ['intervenção', 'serviço', 'trabalho'],
    'trânsito': ['fluxo viário', 'circulação', 'mobilidade'],
    'interdição': ['bloqueio', 'restrição', 'suspensão'],
    'serviço': ['atendimento', 'prestação', 'trabalho'],
    'manutenção': ['reparo', 'ajuste', 'conservação'],
    'moradores': ['residentes', 'população local', 'habitantes'],
    'secretaria': ['pasta', 'departamento', 'órgão'],
    'saúde': ['setor de saúde', 'área da saúde'],
    'educação': ['ensino', 'rede de educação'],
    'segurança': ['proteção', 'ordem pública']
  }
  const replaceWithSynonyms = (text: string): string => {
    let out = text
    let count = 0
    const max = 8
    for (const [orig, alts] of Object.entries(synonyms)) {
      if (count >= max) break
      const rx = new RegExp(`\\b${orig}\\b`, 'gi')
      if (rx.test(out)) {
        const alt = alts[Math.floor(Math.random() * alts.length)]
        out = out.replace(rx, alt)
        count++
      }
    }
    return out
  }
  const splitSentences = (text: string): string[] => {
    return text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).map(s => s.trim()).filter(s => s.length > 3)
  }
  const rewriteSentence = (s: string, index: number): string => {
    let r = replaceWithSynonyms(s)
    if (index === 0 && !/^de acordo com/i.test(r)) {
      r = `De acordo com informações locais, ${r.charAt(0).toLowerCase()}${r.slice(1)}`
    }
    return r
  }
  let rewrittenTitle = title.trim()
  if (options.tone === 'informal') {
    rewrittenTitle = `Atualização: ${rewrittenTitle}`
  } else if (options.tone === 'formal') {
    rewrittenTitle = `Análise: ${rewrittenTitle}`
  } else {
    rewrittenTitle = `Resumo: ${rewrittenTitle}`
  }
  let rewrittenSubtitle = subtitle ? replaceWithSynonyms(subtitle) : ''
  if (!rewrittenSubtitle) {
    const snip = splitSentences(content)[0] || ''
    rewrittenSubtitle = snip.length > 120 ? `${snip.slice(0, 120)}...` : snip
  }
  if (rewrittenSubtitle && options.seoOptimization && !/impactos/i.test(rewrittenSubtitle)) {
    rewrittenSubtitle = `${rewrittenSubtitle} — entenda os impactos`
  }
  const sentences = splitSentences(content)
  let rewrittenContent = sentences.map(rewriteSentence).join(' ')
  if (options.customInstructions) {
    const instr = options.customInstructions.toLowerCase()
    if (/(maior|expandir)/i.test(instr) && !/marco importante/i.test(rewrittenContent)) {
      rewrittenContent += '\n\nEste desenvolvimento representa um marco importante para a comunidade.'
    }
    if (/(local|regional)/i.test(instr) && !/relevância local/i.test(rewrittenContent)) {
      rewrittenContent += '\n\nPara a região, o tema tem relevância local.'
    }
  }
  if (options.seoOptimization && options.targetKeywords) {
    const keywords = options.targetKeywords.split(',').map(k => k.trim()).filter(Boolean)
    if (keywords.length > 0) {
      rewrittenContent += `\n\nTemas: ${keywords.join(', ')}.`
    }
  }
  return { title: rewrittenTitle, subtitle: rewrittenSubtitle, content: rewrittenContent }
}

// Em produção, integrar com serviços de IA reais
async function callRealAI(request: RewriteRequest): Promise<{ title: string; subtitle: string; content: string }> {
  // Exemplo de integração com OpenAI (comentado para não fazer chamadas reais)
  /*
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
  
  const prompt = `
    Reescreva o seguinte conteúdo de notícia seguindo estas diretrizes:
    - Tom: ${request.options.tone}
    - Otimização SEO: ${request.options.seoOptimization ? 'Sim' : 'Não'}
    - Prevenção de plágio: ${request.options.plagiarismPrevention ? 'Sim' : 'Não'}
    - Palavras-chave: ${request.options.targetKeywords}
    - Instruções personalizadas: ${request.options.customInstructions || 'Nenhuma'}
    
    Título: ${request.title}
    Subtítulo: ${request.subtitle}
    Conteúdo: ${request.content}
    
    Retorne apenas o conteúdo reescrito em formato JSON com as chaves: title, subtitle, content
  `
  
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  })
  
  return JSON.parse(response.choices[0].message.content || '{}')
  */
  
  // Por enquanto, usar simulação
  return simulateAIRewrite(request)
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RewriteResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' })
  }

  try {
    const request: RewriteRequest = req.body

    // Validação básica
    if (!request.title || !request.content) {
      return res.status(400).json({ 
        success: false, 
        error: 'Título e conteúdo são obrigatórios' 
      })
    }

    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Usar simulação por enquanto
    const rewrittenContent = simulateAIRewrite(request)

    res.status(200).json({
      success: true,
      rewrittenContent
    })
  } catch (error) {
    console.error('Erro na reescrita:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    })
  }
}
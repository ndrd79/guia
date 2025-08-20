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

// Função principal de simulação de reescrita com IA
function simulateAIRewrite(request: RewriteRequest): { title: string; subtitle: string; content: string } {
  const { title, subtitle, content, options } = request
  
  // Sinônimos e variações para reescrita profunda
  const synonyms = {
    'anunciou': ['revelou', 'divulgou', 'comunicou', 'informou', 'declarou'],
    'governo': ['administração pública', 'poder executivo', 'gestão federal', 'autoridades'],
    'medidas': ['ações', 'iniciativas', 'estratégias', 'políticas', 'diretrizes'],
    'economia': ['setor econômico', 'mercado financeiro', 'cenário econômico', 'sistema financeiro'],
    'população': ['cidadãos', 'brasileiros', 'sociedade', 'comunidade', 'habitantes'],
    'empresa': ['companhia', 'corporação', 'organização', 'negócio', 'empreendimento'],
    'projeto': ['iniciativa', 'programa', 'plano', 'proposta', 'empreendimento'],
    'importante': ['relevante', 'significativo', 'fundamental', 'essencial', 'crucial'],
    'novo': ['recente', 'inédito', 'inovador', 'moderno', 'atual'],
    'grande': ['significativo', 'expressivo', 'considerável', 'substancial', 'amplo']
  }
  
  // Estruturas alternativas para reescrita
  const structures = {
    formal: {
      openings: [
        'De acordo com informações oficiais,',
        'Conforme divulgado recentemente,',
        'Segundo dados oficiais,',
        'Com base em comunicado oficial,'
      ],
      transitions: [
        'Além disso,', 'Por outro lado,', 'Nesse contexto,', 'Vale destacar que,'
      ]
    },
    informal: {
      openings: [
        'Você sabia que',
        'Acabou de sair:',
        'Novidade importante:',
        'Atenção pessoal:'
      ],
      transitions: [
        'E tem mais:', 'Olha só:', 'Mas não para por aí:', 'E aí que fica interessante:'
      ]
    },
    neutral: {
      openings: [
        'Informações recentes indicam que',
        'Dados atualizados mostram que',
        'Segundo levantamento,',
        'Conforme apurado,'
      ],
      transitions: [
        'Adicionalmente,', 'Em paralelo,', 'Simultaneamente,', 'Complementarmente,'
      ]
    }
  }
  
  // Função para substituir palavras por sinônimos
  function replaceWithSynonyms(text: string): string {
    let rewrittenText = text
    
    Object.entries(synonyms).forEach(([original, alternatives]) => {
      const regex = new RegExp(`\\b${original}\\b`, 'gi')
      if (regex.test(rewrittenText)) {
        const randomSynonym = alternatives[Math.floor(Math.random() * alternatives.length)]
        rewrittenText = rewrittenText.replace(regex, randomSynonym)
      }
    })
    
    return rewrittenText
  }
  
  // Função para reestruturar frases
  function restructureSentences(text: string): string {
    const sentences = text.split('. ')
    const restructured = sentences.map(sentence => {
      // Inverter ordem de algumas frases
      if (sentence.includes(',') && Math.random() > 0.5) {
        const parts = sentence.split(',')
        if (parts.length === 2) {
          return `${parts[1].trim()}, ${parts[0].trim()}`
        }
      }
      return sentence
    })
    
    return restructured.join('. ')
  }
  
  // Reescrita profunda do título
  let rewrittenTitle = replaceWithSynonyms(title)
  
  // Adicionar contexto local se palavras-chave incluem localização
  if (options.targetKeywords && options.targetKeywords.toLowerCase().includes('maria helena')) {
    rewrittenTitle = `Maria Helena: ${rewrittenTitle}`
  }
  
  // Modificar estrutura do título baseado no tom
  if (options.tone === 'informal') {
    rewrittenTitle = `${rewrittenTitle} - Confira os Detalhes!`
  } else if (options.tone === 'formal') {
    rewrittenTitle = `Análise: ${rewrittenTitle}`
  }
  
  // Reescrita profunda do subtítulo
  let rewrittenSubtitle = subtitle ? replaceWithSynonyms(subtitle) : ''
  if (rewrittenSubtitle && options.seoOptimization) {
    rewrittenSubtitle = `${rewrittenSubtitle} - Entenda os impactos e desdobramentos`
  }
  
  // Reescrita profunda do conteúdo
  let rewrittenContent = content
  
  // 1. Substituir palavras por sinônimos
  rewrittenContent = replaceWithSynonyms(rewrittenContent)
  
  // 2. Reestruturar frases
  rewrittenContent = restructureSentences(rewrittenContent)
  
  // 3. Adicionar abertura baseada no tom
  const currentStructure = structures[options.tone]
  const randomOpening = currentStructure.openings[Math.floor(Math.random() * currentStructure.openings.length)]
  
  // 4. Adicionar contexto local se especificado
  let localContext = ''
  if (options.targetKeywords && options.targetKeywords.toLowerCase().includes('maria helena')) {
    localContext = ' A informação tem relevância direta para os moradores e comerciantes da região.'
  }
  
  // 5. Reestruturar parágrafos
  const paragraphs = rewrittenContent.split('\n\n')
  const rewrittenParagraphs = paragraphs.map((paragraph, index) => {
    if (index === 0) {
      return `${randomOpening} ${paragraph.toLowerCase().charAt(0).toUpperCase() + paragraph.slice(1)}${localContext}`
    }
    
    // Adicionar transições entre parágrafos
    const randomTransition = currentStructure.transitions[Math.floor(Math.random() * currentStructure.transitions.length)]
    return `${randomTransition} ${paragraph}`
  })
  
  rewrittenContent = rewrittenParagraphs.join('\n\n')
  
  // 6. Adicionar instruções personalizadas se fornecidas
  if (options.customInstructions) {
    const instructions = options.customInstructions.toLowerCase()
    
    if (instructions.includes('maior') || instructions.includes('expandir')) {
      rewrittenContent += '\n\nEsta situação representa um marco importante que merece atenção especial da comunidade. Os desdobramentos desta decisão podem influenciar significativamente o cenário local nos próximos meses, criando novas oportunidades e desafios para todos os envolvidos.'
    }
    
    if (instructions.includes('local') || instructions.includes('regional')) {
      rewrittenContent += '\n\nPara a região de Maria Helena, este desenvolvimento assume particular relevância, considerando as características específicas do mercado local e as necessidades da comunidade.'
    }
    
    if (instructions.includes('técnico') || instructions.includes('detalhado')) {
      rewrittenContent += '\n\nOs aspectos técnicos desta implementação envolvem múltiplas variáveis que devem ser cuidadosamente analisadas pelos especialistas do setor, garantindo que todos os procedimentos sejam executados conforme as melhores práticas estabelecidas.'
    }
  }
  
  // 7. Otimização SEO avançada
  if (options.seoOptimization && options.targetKeywords) {
    const keywords = options.targetKeywords.split(',').map(k => k.trim())
    rewrittenContent += `\n\nEste conteúdo aborda temas relacionados a: ${keywords.join(', ')}. Mantenha-se informado sobre estes e outros assuntos relevantes para sua região.`
  }
  
  return {
    title: rewrittenTitle,
    subtitle: rewrittenSubtitle,
    content: rewrittenContent
  }
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
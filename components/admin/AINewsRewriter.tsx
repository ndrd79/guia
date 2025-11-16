import { useState } from 'react'

interface AINewsRewriterProps {
  title: string
  subtitle: string
  content: string
  onRewrite: (rewrittenContent: { title: string; subtitle: string; content: string }) => void
}

interface RewriteOptions {
  seoOptimization: boolean
  plagiarismPrevention: boolean
  tone: 'formal' | 'informal' | 'neutral'
  targetKeywords: string
  customInstructions: string
}

export default function AINewsRewriter({ title, subtitle, content, onRewrite }: AINewsRewriterProps) {
  const [isRewriting, setIsRewriting] = useState(false)
  const [options, setOptions] = useState<RewriteOptions>({
    seoOptimization: true,
    plagiarismPrevention: true,
    tone: 'neutral',
    targetKeywords: '',
    customInstructions: ''
  })
  const [showOptions, setShowOptions] = useState(false)
  const [lastRewriteTime, setLastRewriteTime] = useState<string>('')

  const handleRewrite = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Título e conteúdo são obrigatórios para reescrita')
      return
    }

    setIsRewriting(true)
    try {
      const response = await fetch('/api/news/paraphrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          category: ''
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'erro' }))
        throw new Error(errorData.error || 'Erro ao reescrever conteúdo')
      }

      const result = await response.json()
      if (result.success && result.paraphrased && result.formatted) {
        const rewritten = {
          title: result.paraphrased.title,
          subtitle: result.formatted.dek || subtitle,
          content: result.paraphrased.content
        }
        onRewrite(rewritten)
        setLastRewriteTime(new Date().toLocaleTimeString())
        alert('Conteúdo reescrito com sucesso!')
      } else {
        throw new Error('Resposta inválida da API')
      }
    } catch (error: any) {
      alert(error?.message || 'Erro ao reescrever conteúdo')
    } finally {
      setIsRewriting(false)
    }
  }

  const handleOptionChange = (key: keyof RewriteOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Reescrita com IA</h3>
              <p className="text-sm text-gray-600">
                Otimize seu conteúdo para SEO e evite plágio
                {lastRewriteTime && (
                  <span className="ml-2 text-green-600">• Última reescrita: {lastRewriteTime}</span>
                )}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowOptions(!showOptions)}
            className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            {showOptions ? 'Ocultar opções' : 'Configurar'}
          </button>
        </div>

        {showOptions && (
          <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Opções de Reescrita</h4>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="seo"
                  checked={options.seoOptimization}
                  onChange={(e) => handleOptionChange('seoOptimization', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="seo" className="text-sm text-gray-700">Otimização para SEO</label>
              </div>
              
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="plagiarism"
                  checked={options.plagiarismPrevention}
                  onChange={(e) => handleOptionChange('plagiarismPrevention', e.target.checked)}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="plagiarism" className="text-sm text-gray-700">Prevenção de plágio</label>
              </div>
              
              <div>
                <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">Tom de escrita</label>
                <select
                  id="tone"
                  value={options.tone}
                  onChange={(e) => handleOptionChange('tone', e.target.value as RewriteOptions['tone'])}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                >
                  <option value="formal">Formal</option>
                  <option value="informal">Informal</option>
                  <option value="neutral">Neutro</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">Palavras-chave alvo</label>
                <input
                  type="text"
                  id="keywords"
                  value={options.targetKeywords}
                  onChange={(e) => handleOptionChange('targetKeywords', e.target.value)}
                  placeholder="Ex: comércio local, Maria Helena, negócios"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
              </div>
              
              <div>
                <label htmlFor="customInstructions" className="block text-sm font-medium text-gray-700 mb-1">Instruções personalizadas</label>
                <textarea
                  id="customInstructions"
                  value={options.customInstructions}
                  onChange={(e) => handleOptionChange('customInstructions', e.target.value)}
                  placeholder="Ex: deixe o texto maior, adicione mais detalhes, use linguagem mais técnica..."
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Digite instruções específicas para personalizar a reescrita</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Status:</span> 
            {title && content ? (
              <span className="text-green-600">Pronto para reescrita</span>
            ) : (
              <span className="text-orange-600">Aguardando título e conteúdo</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleRewrite}
            disabled={isRewriting || !title.trim() || !content.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isRewriting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reescrevendo...
              </>
            ) : (
              <>
                <svg className="-ml-1 mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Reescrever com IA
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
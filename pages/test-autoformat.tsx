import { autoFormatNews } from '../lib/text/autoFormatNews'
import { useState } from 'react'

export default function TestAutoFormat() {
  const [input, setInput] = useState(`Resumo em 30 segundos O advogado de defesa de Alan dos Santos, de 33 anos, foi assassinado a tiros na noite de ontem. O crime aconteceu no centro da cidade de Maringá. Segundo testemunhas, o advogado estava indo para sua casa quando foi surpreendido por homens armados. A polícia está investigando o caso e não descarta nenhuma hipótese.`)
  
  const [result, setResult] = useState<any>(null)

  const handleFormat = () => {
    try {
      const formatted = autoFormatNews({ content: input })
      setResult(formatted)
    } catch (error) {
      console.error('Erro:', error)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Teste AutoFormat</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Texto Original:</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full h-32 p-3 border rounded-lg"
          placeholder="Digite o texto para formatar..."
        />
      </div>

      <button
        onClick={handleFormat}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-6"
      >
        Formatar Texto
      </button>

      {result && (
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Título:</h3>
            <p className="text-lg">{result.title}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Resumo:</h3>
            <p className="text-gray-700">{result.dek}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">HTML Gerado:</h3>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {result.html}
            </pre>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Preview HTML:</h3>
            <div 
              className="border p-4 rounded-lg"
              dangerouslySetInnerHTML={{ __html: result.html }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
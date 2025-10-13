import { useState } from 'react'
import Head from 'next/head'

export default function TestAnalytics() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, status: number, data: any) => {
    setResults(prev => [...prev, { test, status, data, timestamp: new Date().toLocaleTimeString() }])
  }

  const testTrackingEndpoint = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerId: '550e8400-e29b-41d4-a716-446655440000',
          tipo: 'impressao'
        })
      })
      const data = await response.json()
      addResult('Track com UUID inexistente', response.status, data)

    } catch (error: any) {
      addResult('Erro de rede', 0, { error: error.message })
    }
    setLoading(false)
  }

  return (
    <>
      <Head>
        <title>Teste Analytics API</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Teste dos Endpoints de Analytics
          </h1>

          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Testes Disponíveis</h2>
            
            <button
              onClick={testTrackingEndpoint}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded mr-4"
            >
              Testar Endpoint de Tracking
            </button>

            {loading && (
              <div className="mt-4 text-blue-600">
                ⏳ Executando testes...
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Resultados dos Testes</h2>
            
            {results.length === 0 ? (
              <p className="text-gray-500">Nenhum teste executado ainda.</p>
            ) : (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{result.test}</h3>
                      <span className={`px-2 py-1 rounded text-sm font-medium ${
                        result.status >= 200 && result.status < 300 
                          ? 'bg-green-100 text-green-800'
                          : result.status >= 400 && result.status < 500
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        Status: {result.status}
                      </span>
                    </div>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
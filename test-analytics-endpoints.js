// Script para testar os endpoints de analytics

async function testAnalyticsEndpoints() {
  console.log('🧪 Testando endpoints de analytics...\n')

  try {
    // Simular um bannerId válido (você pode ajustar conforme necessário)
    const testBannerId = '550e8400-e29b-41d4-a716-446655440000' // UUID de exemplo
    
    // 1. Testar endpoint de tracking - impressão
    console.log('1. Testando registro de impressão...')
    try {
      const response = await fetch('http://localhost:3000/api/analytics/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bannerId: testBannerId,
          tipo: 'impressao',
          position: 'hero'
        })
      })
      
      const data = await response.json()
      console.log('Status:', response.status)
      console.log('Resposta:', data)
    } catch (error) {
      console.log('Erro:', error.message)
    }

    console.log('\n✅ Teste básico concluído!')

  } catch (error) {
    console.error('❌ Erro geral no teste:', error)
  }
}

// Executar os testes
testAnalyticsEndpoints()
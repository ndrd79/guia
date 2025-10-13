const fetch = require('node-fetch');

async function testAnalyticsAPI() {
  console.log('🧪 Testando endpoint /api/analytics/track...\n');
  
  const testData = {
    bannerId: '731759cd-c6e9-48fa-9488-6fa88096482f', // ID do banner PetShop
    tipo: 'clique',
    posicao: 'Sidebar Esquerda'
  };

  try {
    console.log('📤 Enviando dados:', testData);
    
    const response = await fetch('http://localhost:3000/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Status da resposta:', response.status);
    console.log('📡 Status text:', response.statusText);
    console.log('📡 Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta da API:', result);

  } catch (error) {
    console.error('❌ Erro ao fazer requisição:', error.message);
  }
}

// Testar também uma impressão
async function testImpressionAPI() {
  console.log('\n🧪 Testando impressão...\n');
  
  const testData = {
    bannerId: '731759cd-c6e9-48fa-9488-6fa88096482f', // ID do banner PetShop
    tipo: 'impressao',
    posicao: 'Sidebar Esquerda'
  };

  try {
    console.log('📤 Enviando dados:', testData);
    
    const response = await fetch('http://localhost:3000/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log('📡 Status da resposta:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta:', errorText);
      return;
    }

    const result = await response.json();
    console.log('✅ Resposta da API:', result);

  } catch (error) {
    console.error('❌ Erro ao fazer requisição:', error.message);
  }
}

async function runTests() {
  await testAnalyticsAPI();
  await testImpressionAPI();
}

runTests();
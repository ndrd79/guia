/**
 * Teste do webhook de integração Google Forms
 */

const testData = {
  nome: 'Empresa Teste Webhook',
  categoria: 'Comércio',
  telefone: '(41) 3333-4444',
  cidade: 'Itaperuçu',
  endereco: 'Rua Teste, 123 - Centro',
  descricao: 'Empresa de teste para verificar a integração do Google Forms com o sistema',
  email: 'teste@empresa.com',
  website: 'https://empresa-teste.com',
  whatsapp: '(41) 99999-8888',
  horario_funcionamento_dias: 'Seg a Sex',
  horario_funcionamento_horario: '8h às 18h',
  facebook: 'empresateste',
  instagram: 'empresateste',
  maps: 'https://maps.google.com/teste',
  user: 'noita',
  timestamp: new Date().toISOString(),
  form_response_id: 'test_' + Date.now()
};

async function testWebhook() {
  try {
    console.log('🧪 Testando webhook...');
    console.log('📤 Dados a serem enviados:', testData);
    
    const response = await fetch('http://localhost:3000/api/webhook/empresa', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    const responseText = await response.text();
    
    console.log('📥 Status da resposta:', response.status);
    console.log('📄 Resposta:', responseText);
    
    if (response.ok) {
      console.log('✅ Teste do webhook bem-sucedido!');
      console.log('🎯 Agora verifique o painel de moderação em: http://localhost:3000/admin/empresas/pendentes');
    } else {
      console.log('❌ Teste do webhook falhou');
    }
    
  } catch (error) {
    console.error('💥 Erro no teste:', error);
  }
}

// Executar o teste
testWebhook();
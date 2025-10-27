const https = require('https');
const http = require('http');

// URLs das imagens que estão falhando nos logs
const imageUrls = [
  'https://mlkpnapnijdbskaimquj.supabase.co/storage/v1/object/public/noticias/images/1755699106545-yy3omr-carlo-ancelotti-forma-selecao-brasileira-webp.webp',
  'https://mlkpnapnijdbskaimquj.supabase.co/storage/v1/object/public/banners/images/1755636259153-zydf3n-junina-png.png',
  'https://mlkpnapnijdbskaimquj.supabase.co/storage/v1/object/public/banners/images/1755636284660-wvkwqr-loja-png.png',
  'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=300&q=80'
];

async function testImageAccess(url) {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      console.log(`✅ ${url}`);
      console.log(`   Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   Content-Type: ${res.headers['content-type']}`);
      console.log('');
      
      resolve({
        url,
        status: res.statusCode,
        contentType: res.headers['content-type']
      });
    });
    
    req.on('error', (error) => {
      console.log(`❌ ${url}`);
      console.log(`   Erro: ${error.message}`);
      console.log('');
      
      resolve({
        url,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      console.log(`⏰ ${url} - Timeout`);
      req.destroy();
      resolve({
        url,
        error: 'Timeout'
      });
    });
  });
}

async function testAllImages() {
  console.log('🔍 Testando acesso às imagens...\n');
  
  for (const url of imageUrls) {
    await testImageAccess(url);
  }
}

testAllImages().catch(console.error);
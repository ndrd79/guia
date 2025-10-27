console.log('Iniciando teste de imagens...');

const https = require('https');

const testUrl = 'https://mlkpnapnijdbskaimquj.supabase.co/storage/v1/object/public/noticias/images/1755699106545-yy3omr-carlo-ancelotti-forma-selecao-brasileira-webp.webp';

console.log('Testando URL:', testUrl);

https.get(testUrl, (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (err) => {
  console.log('Erro:', err.message);
});
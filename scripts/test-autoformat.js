// Teste simples para verificar o autoformat
const { autoFormatNews } = require('./lib/text/autoFormatNews.ts');

const textoTeste = `Resumo em 30 segundos O advogado de defesa de Alan dos Santos, de 33 anos, foi assassinado a tiros na noite de ontem. O crime aconteceu no centro da cidade de Maringá. Segundo testemunhas, o advogado estava indo para sua casa quando foi surpreendido por homens armados. A polícia está investigando o caso e não descarta nenhuma hipótese.`;

console.log('Texto original:');
console.log(textoTeste);
console.log('\n' + '='.repeat(50) + '\n');

try {
  const resultado = autoFormatNews(textoTeste);
  console.log('Texto formatado:');
  console.log(resultado);
} catch (error) {
  console.error('Erro ao formatar:', error.message);
}
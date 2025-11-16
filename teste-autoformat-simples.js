// Teste simples do autoformat
const { autoFormatNews } = require('./lib/text/autoFormatNews.ts');

// Texto que estava dando problema
const textoProblema = `Resumo em 30 segundos O advogado de defesa de Alan dos Santos, de 33 anos, foi assassinado a tiros na noite de ontem. O crime aconteceu no centro da cidade de Maringá. Segundo testemunhas, o advogado estava indo para sua casa quando foi surpreendido por homens armados. A polícia está investigando o caso e não descarta nenhuma hipótese.`;

try {
  console.log('=== TESTE AUTOFORMAT ===');
  console.log('\nTexto original:');
  console.log(textoProblema);
  
  const resultado = autoFormatNews({ content: textoProblema });
  
  console.log('\n=== RESULTADO ===');
  console.log('\nTítulo:', resultado.title);
  console.log('\nResumo:', resultado.dek);
  console.log('\nHTML:');
  console.log(resultado.html);
  
  console.log('\n=== VERIFICAÇÃO ===');
  const temFragmentacao = resultado.html.includes('<p>13.') || resultado.html.includes('<p><strong>O advogado') && resultado.html.includes('</strong></p> <p>13.');
  console.log('Tem fragmentação?', temFragmentacao ? 'SIM ❌' : 'NÃO ✅');
  
} catch (error) {
  console.error('Erro:', error.message);
}
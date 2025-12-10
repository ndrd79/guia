const puppeteer = require('puppeteer');

async function testFrontendLogin() {
  console.log('🧪 TESTE DE LOGIN NO FRONTEND');
  console.log('=============================\n');

  let browser;
  try {
    // Iniciar browser
    console.log('🚀 Iniciando browser...');
    browser = await puppeteer.launch({ 
      headless: false, 
      devtools: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Interceptar logs do console
    page.on('console', msg => {
      console.log('🖥️ Console:', msg.text());
    });
    
    // Interceptar erros
    page.on('pageerror', error => {
      console.log('❌ Erro na página:', error.message);
    });
    
    // Ir para a página de login
    console.log('📄 Navegando para página de login...');
    await page.goto('http://localhost:3000/admin/login', { waitUntil: 'networkidle0' });
    
    // Aguardar a página carregar
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('✅ Página de login carregada');
    
    // Preencher formulário
    console.log('📝 Preenchendo formulário...');
    await page.type('input[type="email"]', 'admin@portal.com');
    await page.type('input[type="password"]', '123456');
    
    // Clicar no botão de login
    console.log('🔐 Clicando no botão de login...');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento ou erro
    console.log('⏳ Aguardando resultado...');
    
    try {
      // Aguardar redirecionamento para admin/noticias ou erro
      await page.waitForFunction(
        () => window.location.pathname.includes('/admin/noticias') || 
              document.querySelector('.error') !== null ||
              window.location.pathname.includes('/admin/login'),
        { timeout: 15000 }
      );
      
      const currentUrl = page.url();
      console.log('🌐 URL atual:', currentUrl);
      
      if (currentUrl.includes('/admin/noticias')) {
        console.log('🎉 LOGIN BEM-SUCEDIDO! Redirecionado para painel admin');
        
        // Verificar se a página carregou corretamente
        await page.waitForSelector('h1', { timeout: 5000 });
        const title = await page.$eval('h1', el => el.textContent);
        console.log('📄 Título da página:', title);
        
      } else if (currentUrl.includes('/admin/login')) {
        console.log('❌ Ainda na página de login - verificando erros...');
        
        // Verificar se há mensagens de erro
        const errorElements = await page.$$('.error, .text-red-500, [class*="error"]');
        if (errorElements.length > 0) {
          for (const element of errorElements) {
            const errorText = await page.evaluate(el => el.textContent, element);
            console.log('❌ Erro encontrado:', errorText);
          }
        }
        
        // Verificar cookies
        const cookies = await page.cookies();
        console.log('🍪 Cookies presentes:', cookies.map(c => c.name).join(', '));
        
        // Verificar localStorage
        const localStorage = await page.evaluate(() => {
          const items = {};
          for (let i = 0; i < window.localStorage.length; i++) {
            const key = window.localStorage.key(i);
            items[key] = window.localStorage.getItem(key);
          }
          return items;
        });
        console.log('💾 LocalStorage:', Object.keys(localStorage));
        
      } else {
        console.log('❓ Redirecionamento inesperado para:', currentUrl);
      }
      
    } catch (timeoutError) {
      console.log('⏰ Timeout - verificando estado atual...');
      const currentUrl = page.url();
      console.log('🌐 URL atual:', currentUrl);
      
      // Capturar screenshot para debug
      await page.screenshot({ path: 'login-debug.png' });
      console.log('📸 Screenshot salvo como login-debug.png');
    }
    
  } catch (error) {
    console.log('❌ Erro no teste:', error.message);
  } finally {
    if (browser) {
      console.log('🔚 Fechando browser...');
      await browser.close();
    }
  }
}

// Verificar se o servidor está rodando
const http = require('http');
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  console.log('✅ Servidor está rodando na porta 3000');
  testFrontendLogin();
});

req.on('error', (err) => {
  console.log('❌ Servidor não está rodando na porta 3000');
  console.log('💡 Execute "npm run dev" primeiro');
});

req.on('timeout', () => {
  console.log('⏰ Timeout ao conectar com o servidor');
  req.destroy();
});

req.end();
# Script de Deploy para Vercel - Portal Maria Helena
# Execute este script para fazer deploy automatizado

Write-Host "🚀 Iniciando deploy do Portal Maria Helena..." -ForegroundColor Green

# Verificar se o Vercel CLI está instalado
if (!(Get-Command "vercel" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Vercel CLI não encontrado. Instalando..." -ForegroundColor Yellow
    npm install -g vercel
}

# Verificar se o build funciona
Write-Host "🔨 Testando build local..." -ForegroundColor Blue
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build falhou! Corrija os erros antes de fazer deploy." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build local bem-sucedido!" -ForegroundColor Green

# Fazer deploy
Write-Host "🌐 Fazendo deploy para Vercel..." -ForegroundColor Blue
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "🎉 Deploy realizado com sucesso!" -ForegroundColor Green
    Write-Host "📱 Acesse seu site em produção" -ForegroundColor Cyan
} else {
    Write-Host "❌ Deploy falhou! Verifique as configurações." -ForegroundColor Red
    exit 1
}

Write-Host "📋 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Configure as variáveis de ambiente no painel do Vercel" -ForegroundColor White
Write-Host "2. Teste todas as funcionalidades em produção" -ForegroundColor White
Write-Host "3. Configure domínio personalizado (opcional)" -ForegroundColor White

Write-Host "✅ Deploy concluído!" -ForegroundColor Green
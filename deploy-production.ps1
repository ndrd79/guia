Param(
  [Parameter(Mandatory=$false)] [string]$ProjectName
)

Write-Host "Construindo projeto..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build falhou" -ForegroundColor Red; exit 1 }

Write-Host "Fazendo deploy no Vercel (prod)..." -ForegroundColor Cyan
if ($ProjectName) {
  vercel deploy --prod --project $ProjectName
} else {
  vercel deploy --prod
}

Write-Host "✅ Deploy concluído." -ForegroundColor Green
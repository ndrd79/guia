Param(
  [Parameter(Mandatory=$true)] [string]$ProjectName,
  [Parameter(Mandatory=$true)] [string]$SiteUrl,
  [Parameter(Mandatory=$false)] [string]$EmailFrom = "noreply@portalmariahelena.com.br"
)

# Este script usa Vercel CLI para definir variáveis de ambiente em Production
# Pré-requisito: estar logado no Vercel CLI (`vercel login`) e ter acesso ao projeto

Write-Host "Configurando variáveis no Vercel para projeto '$ProjectName'..." -ForegroundColor Cyan

$envPairs = @(
  @{ key = "NEXT_PUBLIC_SITE_URL"; value = $SiteUrl; target = "production" },
  @{ key = "EMAIL_FROM"; value = $EmailFrom; target = "production" }
)

foreach ($pair in $envPairs) {
  $cmd = "vercel env add $($pair.key) $($pair.target) --yes"
  Write-Host "Definindo $($pair.key)=$($pair.value) ($($pair.target))" -ForegroundColor Yellow
  # O comando padrão pede input interativo; usamos um pipe para enviar o valor
  $processInfo = New-Object System.Diagnostics.ProcessStartInfo
  $processInfo.FileName = "powershell"
  $processInfo.Arguments = "-NoProfile -Command \"'$($pair.value)' | $cmd\""
  $processInfo.RedirectStandardOutput = $true
  $processInfo.RedirectStandardError = $true
  $processInfo.UseShellExecute = $false
  $processInfo.WorkingDirectory = (Get-Location)

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $processInfo
  $process.Start() | Out-Null
  $stdout = $process.StandardOutput.ReadToEnd()
  $stderr = $process.StandardError.ReadToEnd()
  $process.WaitForExit()

  if ($process.ExitCode -ne 0) {
    Write-Host "Erro ao definir $($pair.key): $stderr" -ForegroundColor Red
  } else {
    Write-Host "OK: $($pair.key) configurado." -ForegroundColor Green
  }
}

Write-Host "Concluído. Faça um redeploy para aplicar as variáveis." -ForegroundColor Cyan
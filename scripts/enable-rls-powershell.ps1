# Script PowerShell para habilitar RLS na tabela audit_logs
$supabaseUrl = "https://mlkpnapnijdbskaimquj.supabase.co"
$serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sa3BuYXBuaWpkYnNrYWltcXVqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzY1NzQyNSwiZXhwIjoyMDY5MjMzNDI1fQ.yhrc1YYwt4r-FOa3Iqa094hNEmGPj3PDEF0GkLmLZ6s"

Write-Host "🔧 Habilitando RLS na tabela audit_logs..." -ForegroundColor Yellow

# Prepare headers
$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $serviceKey"
    "apikey" = $serviceKey
}

# SQL command to enable RLS
$sqlCommand = "ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;"

# Try different endpoints
$endpoints = @(
    "/rest/v1/rpc/exec_sql",
    "/rest/v1/rpc/sql",
    "/rest/v1/rpc/execute_sql"
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "🔄 Tentando endpoint: $endpoint" -ForegroundColor Cyan
        
        $body = @{
            sql = $sqlCommand
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "$supabaseUrl$endpoint" -Method POST -Headers $headers -Body $body -ErrorAction Stop
        
        Write-Host "✅ RLS habilitado com sucesso via $endpoint!" -ForegroundColor Green
        Write-Host "📊 Resposta: $response" -ForegroundColor Gray
        break
    }
    catch {
        Write-Host "❌ Falha no endpoint $endpoint : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "✅ Processo concluído!" -ForegroundColor Green
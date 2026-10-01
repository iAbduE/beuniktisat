# BEÜ İktisat Topluluğu - Nginx Config Deploy
# Sadece nginx konfigürasyonunu günceller

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    [string]$ServerUser = "root"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🔧 Nginx Config Deploy Başlıyor...`n" -ForegroundColor Cyan

$NginxConfig = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "nginx\beuniktisat.conf"

if (-not (Test-Path $NginxConfig)) {
    Write-Host "❌ Nginx config bulunamadı: $NginxConfig" -ForegroundColor Red
    exit 1
}

Write-Host "📤 Config dosyası aktarılıyor..." -ForegroundColor Yellow
scp "$NginxConfig" "$ServerUser@$ServerIP`:/etc/nginx/sites-available/beuniktisat.conf"

Write-Host "🔄 Nginx yeniden yükleniyor..." -ForegroundColor Yellow
ssh "$ServerUser@$ServerIP" @"
    sudo ln -sf /etc/nginx/sites-available/beuniktisat.conf /etc/nginx/sites-enabled/
    sudo nginx -t && sudo systemctl reload nginx
    echo "Nginx başarıyla yeniden yüklendi"
"@

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Nginx config güncellendi!`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Nginx güncelleme başarısız!`n" -ForegroundColor Red
}

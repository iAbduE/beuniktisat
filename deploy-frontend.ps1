# BEÜ İktisat Topluluğu - Hızlı Frontend Deploy
# Sadece frontend build edip sunucuya atar (en hızlı yöntem)

param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    [string]$ServerUser = "root",
    [string]$RemotePath = "/var/www/beuniktisat/client/dist"
)

$ErrorActionPreference = "Stop"

Write-Host "`n🚀 Hızlı Frontend Deploy Başlıyor...`n" -ForegroundColor Cyan

$ClientPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "client"
$DistPath = Join-Path $ClientPath "dist"

# Build
Push-Location $ClientPath
Write-Host "📦 Build ediliyor..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build başarısız!" }
Pop-Location

Write-Host "✅ Build tamamlandı!" -ForegroundColor Green

# Deploy
Write-Host "📤 Dosyalar aktarılıyor..." -ForegroundColor Yellow

# Eski dosyaları sil ve yenilerini kopyala
ssh "$ServerUser@$ServerIP" "rm -rf $RemotePath/*"
scp -r "$DistPath\*" "$ServerUser@$ServerIP`:$RemotePath/"

if ($LASTEXITCODE -eq 0) {
    Write-Host "📌 Sunucuda izinler ayarlanıyor ve nginx yeniden yükleniyor..." -ForegroundColor Yellow
    # Sunucuda dosya sahibi/nginx yeniden yükleme
    ssh "$ServerUser@$ServerIP" "sudo chown -R www-data:www-data $RemotePath && sudo nginx -t && sudo systemctl reload nginx" 

    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deploy tamamlandı! Site: https://beuniktisat.com`n" -ForegroundColor Green
    } else {
        Write-Host "`n⚠️ Deploy tamamlandı ama izinler veya nginx yeniden yüklemede hata oluştu.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n❌ Deploy başarısız!`n" -ForegroundColor Red
}

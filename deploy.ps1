# BEÜ İktisat Topluluğu - Deployment Script
# Bu script frontend'i build edip sunucuya deploy eder

param(
    [string]$ServerIP = "",
    [string]$ServerUser = "root",
    [string]$ServerPath = "/var/www/beuniktisat",
    [switch]$BuildOnly,
    [switch]$DeployOnly,
    [switch]$Help
)

# Renkli çıktı fonksiyonları
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

# Banner
function Show-Banner {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
    Write-Host "║      BEÜ İktisat Topluluğu - Deployment Script             ║" -ForegroundColor Blue
    Write-Host "║                   beuniktisat.com                          ║" -ForegroundColor Blue
    Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
    Write-Host ""
}

# Yardım
function Show-Help {
    Show-Banner
    Write-Host "Kullanım:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -ServerIP <IP> [-ServerUser <user>] [-ServerPath <path>]"
    Write-Host ""
    Write-Host "Parametreler:" -ForegroundColor Yellow
    Write-Host "  -ServerIP     : Sunucu IP adresi (zorunlu)"
    Write-Host "  -ServerUser   : SSH kullanıcı adı (varsayılan: root)"
    Write-Host "  -ServerPath   : Sunucudaki proje yolu (varsayılan: /var/www/beuniktisat)"
    Write-Host "  -BuildOnly    : Sadece build yap, deploy etme"
    Write-Host "  -DeployOnly   : Build yapmadan sadece deploy et (önceki build'i kullan)"
    Write-Host "  -Help         : Bu yardım mesajını göster"
    Write-Host ""
    Write-Host "Örnekler:" -ForegroundColor Yellow
    Write-Host "  .\deploy.ps1 -ServerIP 192.168.1.100"
    Write-Host "  .\deploy.ps1 -ServerIP 192.168.1.100 -ServerUser ubuntu"
    Write-Host "  .\deploy.ps1 -BuildOnly"
    Write-Host ""
    exit 0
}

# Yardım kontrolü
if ($Help) { Show-Help }

Show-Banner

# Proje kök dizini
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClientPath = Join-Path $ProjectRoot "client"
$ServerPath_Local = Join-Path $ProjectRoot "server"
$NginxConfig = Join-Path $ProjectRoot "nginx\beuniktisat.conf"
$DistPath = Join-Path $ClientPath "dist"

# Dizin kontrolü
if (-not (Test-Path $ClientPath)) {
    Write-Error "Client dizini bulunamadı: $ClientPath"
    exit 1
}

# ===== BUILD AŞAMASI =====
if (-not $DeployOnly) {
    Write-Info "Frontend build başlatılıyor..."
    
    Push-Location $ClientPath
    
    # Node modules kontrolü
    if (-not (Test-Path "node_modules")) {
        Write-Info "Node modules yükleniyor..."
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "npm install başarısız!"
            Pop-Location
            exit 1
        }
    }
    
    # Build
    Write-Info "Vite build çalıştırılıyor..."
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Build başarısız!"
        Pop-Location
        exit 1
    }
    
    Pop-Location
    Write-Success "Frontend build tamamlandı!"
    
    # Build boyutu
    if (Test-Path $DistPath) {
        $size = (Get-ChildItem $DistPath -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Info "Build boyutu: $([math]::Round($size, 2)) MB"
    }
}

# Sadece build isteniyorsa burada dur
if ($BuildOnly) {
    Write-Success "Build tamamlandı! Deploy için: .\deploy.ps1 -ServerIP <IP> -DeployOnly"
    exit 0
}

# ===== DEPLOY AŞAMASI =====
if ([string]::IsNullOrEmpty($ServerIP)) {
    Write-Warning "ServerIP belirtilmedi. Sadece build yapıldı."
    Write-Info "Deploy için: .\deploy.ps1 -ServerIP <sunucu-ip-adresi>"
    exit 0
}

Write-Info "Deploy başlatılıyor: $ServerUser@$ServerIP"

# SSH bağlantı testi
Write-Info "SSH bağlantısı test ediliyor..."
$sshTest = ssh -o ConnectTimeout=5 -o BatchMode=yes "$ServerUser@$ServerIP" "echo 'connected'" 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "SSH bağlantısı başarısız! SSH key ayarlandığından emin olun."
    Write-Info "SSH key eklemek için: ssh-copy-id $ServerUser@$ServerIP"
    exit 1
}
Write-Success "SSH bağlantısı başarılı!"

# Dist klasörü kontrolü
if (-not (Test-Path $DistPath)) {
    Write-Error "Build klasörü bulunamadı: $DistPath"
    Write-Info "Önce build yapın: .\deploy.ps1 -BuildOnly"
    exit 1
}

# Sunucuda dizin oluştur
Write-Info "Sunucuda dizinler hazırlanıyor..."
ssh "$ServerUser@$ServerIP" "mkdir -p $ServerPath/client/dist $ServerPath/server $ServerPath/nginx"

# Frontend deploy
Write-Info "Frontend dosyaları aktarılıyor..."
scp -r "$DistPath\*" "$ServerUser@$ServerIP`:$ServerPath/client/dist/"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Frontend dosyaları aktarılamadı!"
    exit 1
}
Write-Success "Frontend dosyaları aktarıldı!"

# Server dosyaları deploy
Write-Info "Backend dosyaları aktarılıyor..."
scp -r "$ServerPath_Local\*" "$ServerUser@$ServerIP`:$ServerPath/server/"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Backend dosyaları aktarılamadı!"
    exit 1
}
Write-Success "Backend dosyaları aktarıldı!"

# Nginx config deploy
Write-Info "Nginx konfigürasyonu aktarılıyor..."
scp "$NginxConfig" "$ServerUser@$ServerIP`:$ServerPath/nginx/"
if ($LASTEXITCODE -ne 0) {
    Write-Warning "Nginx config aktarılamadı (isteğe bağlı)"
}

# Sunucuda işlemler
Write-Info "Sunucuda servisler yeniden başlatılıyor..."
ssh "$ServerUser@$ServerIP" @"
    cd $ServerPath/server
    
    # Node modules kurulumu/güncellemesi
    npm install --production

    # Yeni Prisma migration'larını uygula ve client'ı sunucu şemasına göre üret
    npx prisma migrate deploy
    npx prisma generate

    # PM2 ile yeniden başlat
    if command -v pm2 &> /dev/null; then
        pm2 restart beuniktisat-api 2>/dev/null || pm2 start index.js --name beuniktisat-api
        echo "PM2 ile API yeniden başlatıldı"
    fi
    
    # Nginx config'i kopyala ve yeniden yükle
    if [ -f "$ServerPath/nginx/beuniktisat.conf" ]; then
        sudo cp $ServerPath/nginx/beuniktisat.conf /etc/nginx/sites-available/beuniktisat.conf
        sudo ln -sf /etc/nginx/sites-available/beuniktisat.conf /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        echo "Nginx yeniden yüklendi"
    fi
"@

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              🎉 DEPLOY BAŞARIYLA TAMAMLANDI! 🎉            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Info "Site: https://beuniktisat.com"
Write-Info "Sunucu: $ServerUser@$ServerIP"
Write-Host ""

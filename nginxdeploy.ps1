# Vue.js Otomatik Deployment Script (Windows - Local Nginx)
# Kullanım: .\nginxdeploy.ps1

param(
    [string]$VueProjectPath = "C:\beuniktisat\client",
    [string]$NginxHtmlPath = "C:\nginx\html",
    [string]$NginxPath = "C:\nginx"
)

# Renkli output için fonksiyonlar
function Write-Success {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host $Message -ForegroundColor Yellow
}

# Header
Write-Host "=================================" -ForegroundColor Magenta
Write-Host "    Vue.js Deployment Script     " -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta
Write-Host ""

# 1. Vue projesinin varlığını kontrol et
Write-Info "1. Vue proje klasörü kontrol ediliyor..."
if (-not (Test-Path $VueProjectPath)) {
    Write-Error "HATA: Vue proje klasörü bulunamadı: $VueProjectPath"
    exit 1
}

if (-not (Test-Path "$VueProjectPath\package.json")) {
    Write-Error "HATA: package.json bulunamadı. Bu bir Vue projesi değil gibi görünüyor."
    exit 1
}

Write-Success "✓ Vue proje klasörü bulundu"

# 2. Nginx klasörünü kontrol et
Write-Info "2. Nginx klasörü kontrol ediliyor..."
if (-not (Test-Path $NginxPath)) {
    Write-Error "HATA: Nginx klasörü bulunamadı: $NginxPath"
    exit 1
}

if (-not (Test-Path "$NginxPath\nginx.exe")) {
    Write-Error "HATA: nginx.exe bulunamadı: $NginxPath"
    exit 1
}

if (-not (Test-Path $NginxHtmlPath)) {
    # Eğer html klasörü yoksa oluştur
    try {
        New-Item -ItemType Directory -Path $NginxHtmlPath -Force | Out-Null
        Write-Info "Nginx html klasörü oluşturuldu: $NginxHtmlPath"
    } catch {
        Write-Error "HATA: Nginx html klasörü oluşturulamadı: $($_.Exception.Message)"
        exit 1
    }
}

Write-Success "✓ Nginx klasörü bulundu"

# 3. Vue projesine git ve build yap
Write-Info "3. Vue projesi build ediliyor..."
Write-Warning "Bu işlem birkaç dakika sürebilir..."

Set-Location $VueProjectPath

# npm install kontrol et (isteğe bağlı)
Write-Info "Dependencies kontrol ediliyor..."
if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules bulunamadı, npm install çalıştırılıyor..."
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Error "HATA: npm install başarısız!"
        exit 1
    }
}

# Vue build
Write-Info "Vue build başlatılıyor..."
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Error "HATA: Vue build başarısız!"
    exit 1
}

Write-Success "✓ Vue build tamamlandı"

# 4. Build klasörünü kontrol et
Write-Info "4. Build dosyaları kontrol ediliyor..."
if (-not (Test-Path "$VueProjectPath\dist")) {
    Write-Error "HATA: dist klasörü oluşturulmadı!"
    exit 1
}

if (-not (Test-Path "$VueProjectPath\dist\index.html")) {
    Write-Error "HATA: index.html build klasöründe bulunamadı!"
    exit 1
}

Write-Success "✓ Build dosyaları hazır"

# 5. Nginx html klasörünü temizle
Write-Info "5. Nginx html klasörü temizleniyor..."
try {
    if (Test-Path $NginxHtmlPath) {
        Get-ChildItem -Path $NginxHtmlPath -Force | Remove-Item -Recurse -Force
        Write-Success "✓ Nginx html klasörü temizlendi"
    }
} catch {
    Write-Error "HATA: Nginx html klasörü temizlenemedi: $($_.Exception.Message)"
    exit 1
}

# 6. Yeni build'i kopyala
Write-Info "6. Yeni build dosyaları kopyalanıyor..."
try {
    Copy-Item "$VueProjectPath\dist\*" $NginxHtmlPath -Recurse -Force -ErrorAction Stop
    Write-Success "✓ Build dosyaları kopyalandı"
} catch {
    Write-Error "HATA: Build dosyaları kopyalanamadı: $($_.Exception.Message)"
    exit 1
}

# 7. Nginx'i reload et
Write-Info "7. Nginx yeniden yükleniyor..."
Set-Location $NginxPath

# Nginx syntax kontrol
Write-Info "Nginx yapılandırması kontrol ediliyor..."
.\nginx.exe -t

if ($LASTEXITCODE -ne 0) {
    Write-Error "HATA: Nginx yapılandırmasında hata var!"
    exit 1
}

# Nginx reload
.\nginx.exe -s reload

if ($LASTEXITCODE -eq 0) {
    Write-Success "✓ Nginx başarıyla yeniden yüklendi"
} else {
    Write-Warning "! Nginx reload komutu çalıştırıldı, ancak durum belirsiz"
}

# 8. Deployment başarılı
Write-Host ""
Write-Host "=================================" -ForegroundColor Green
Write-Host "   DEPLOYMENT SUCCESSFUL        " -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""
Write-Info "Deployment details:"
Write-Host "- Vue project: $VueProjectPath" -ForegroundColor Gray
Write-Host "- Nginx html: $NginxHtmlPath" -ForegroundColor Gray
Write-Host "- Nginx path: $NginxPath" -ForegroundColor Gray
Write-Host "- Deployment time: $(Get-Date -Format 'dd/MM/yyyy HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
Write-Success "Website updated"
Write-Host ""

# Optional: open browser
$openBrowser = Read-Host 'Open site in browser? (y/n)'
if ($openBrowser -eq 'y' -or $openBrowser -eq 'Y') {
    try {
        Start-Process 'http://localhost'
    } catch {
        Write-Warning ("Could not open browser: {0}" -f $_.Exception.Message)
    }
}

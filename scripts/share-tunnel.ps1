# Expose localhost:3000 to public URL (free, for small-scale testing)
# Run `npm run dev` in another terminal first

$ErrorActionPreference = "Stop"
$port = 3000
$url = "http://localhost:$port/zh"

Write-Host "Checking $url ..."
try {
    $null = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
    Write-Host "[OK] Local server is running." -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Start dev server first: npm run dev" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Starting public tunnel (localtunnel)..." -ForegroundColor Cyan
Write-Host " Wait for line: your url is: https://..." -ForegroundColor Cyan
Write-Host " Then open: https://YOUR-URL/zh" -ForegroundColor Cyan
Write-Host " Guide:     https://YOUR-URL/zh/guide" -ForegroundColor Cyan
Write-Host " DO NOT type 'xxx' - copy the REAL url!" -ForegroundColor Yellow
Write-Host " Keep this terminal open while sharing." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npx --yes localtunnel --port $port --local-host 127.0.0.1

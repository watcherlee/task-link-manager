# Show LAN URL for testers on the same WiFi (no tunnel, no IP verification)
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" } | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = "YOUR_LAN_IP" }
Write-Host ""
Write-Host "Same WiFi / same LAN testers can use:" -ForegroundColor Green
Write-Host "  http://${ip}:3000/zh" -ForegroundColor Cyan
Write-Host "  http://${ip}:3000/zh/guide" -ForegroundColor Cyan
Write-Host "(Run npm run dev first; Windows Firewall may ask to allow Node.js)" -ForegroundColor Yellow
Write-Host ""

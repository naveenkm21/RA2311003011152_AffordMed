# Run from E:\F\frontend-tracks\
# Reuses credentials.json (created by register-and-auth.ps1) to fetch a
# fresh Bearer token. Use this whenever the previous token has expired.

$credsPath = Join-Path $PSScriptRoot "credentials.json"
if (-not (Test-Path $credsPath)) {
    Write-Host "credentials.json not found. Run register-and-auth.ps1 first." -ForegroundColor Red
    exit 1
}

$creds = Get-Content $credsPath | ConvertFrom-Json
$body = @{
    email        = $creds.email
    name         = $creds.name
    rollNo       = $creds.rollNo
    accessCode   = $creds.accessCode
    clientID     = $creds.clientID
    clientSecret = $creds.clientSecret
} | ConvertTo-Json

try {
    $auth = Invoke-RestMethod -Method Post `
        -Uri "http://20.207.122.201/evaluation-service/auth" `
        -Body $body -ContentType "application/json"
} catch {
    Write-Host "Auth failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
    exit 1
}

$env:AUTH_TOKEN     = $auth.access_token
$env:LOG_AUTH_TOKEN = $auth.access_token
Write-Host "Token refreshed. Expires at (epoch): $($auth.expires_in)" -ForegroundColor Green

# Run from E:\F\frontend-tracks\
# Registers ONCE with the eval server, saves clientID/clientSecret to
# credentials.json, then fetches a Bearer token and exports it as AUTH_TOKEN
# in the current PowerShell session.

$email    = "nm5777@srmist.edu.in"
$name     = "Naveen Kumar Mohanarajan"
$rollNo   = "RA2311003011152"
$mobileNo = "9106663529"
$github   = "naveenkm21"
$access   = "QkbpxH"

$credsPath = Join-Path $PSScriptRoot "credentials.json"

if (Test-Path $credsPath) {
    Write-Host "credentials.json already exists - skipping /register and refreshing token only." -ForegroundColor Yellow
    $reg = Get-Content $credsPath | ConvertFrom-Json
} else {
    $regBody = @{
        email          = $email
        name           = $name
        mobileNo       = $mobileNo
        githubUsername = $github
        rollNo         = $rollNo
        accessCode     = $access
    } | ConvertTo-Json

    Write-Host "Registering with evaluation server..." -ForegroundColor Cyan
    try {
        $reg = Invoke-RestMethod -Method Post `
            -Uri "http://20.207.122.201/evaluation-service/register" `
            -Body $regBody -ContentType "application/json"
    } catch {
        Write-Host "Registration failed:" -ForegroundColor Red
        Write-Host $_.Exception.Message
        if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
        exit 1
    }

    $reg | ConvertTo-Json | Out-File -Encoding utf8 $credsPath
    Write-Host "Saved clientID/clientSecret to credentials.json" -ForegroundColor Green
    $reg | Format-List
}

$authBody = @{
    email        = $reg.email
    name         = $reg.name
    rollNo       = $reg.rollNo
    accessCode   = $reg.accessCode
    clientID     = $reg.clientID
    clientSecret = $reg.clientSecret
} | ConvertTo-Json

Write-Host "Requesting access token..." -ForegroundColor Cyan
try {
    $auth = Invoke-RestMethod -Method Post `
        -Uri "http://20.207.122.201/evaluation-service/auth" `
        -Body $authBody -ContentType "application/json"
} catch {
    Write-Host "Auth failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails) { Write-Host $_.ErrorDetails.Message }
    exit 1
}

$env:AUTH_TOKEN     = $auth.access_token
$env:LOG_AUTH_TOKEN = $auth.access_token

Write-Host ""
Write-Host "AUTH_TOKEN and LOG_AUTH_TOKEN set in this PowerShell session." -ForegroundColor Green
Write-Host "Token type:  $($auth.token_type)"
Write-Host "Expires at (epoch): $($auth.expires_in)"
Write-Host ""
Write-Host "Now run:" -ForegroundColor Cyan
Write-Host "  cd notification_app_be"
Write-Host "  npm install      # first time only"
Write-Host "  node app.js"

$ErrorActionPreference = "Stop"
. .\scripts\test-db.ps1
$env:DATABASE_URL = $env:DEV_DATABASE_URL
$env:THTH_SAMPLE_PHOTOS = "1"
$env:THTH_UPLOAD_DIR = "$env:TEMP\thth-up"
if (-not (Test-Path $env:THTH_UPLOAD_DIR)) {
  New-Item -ItemType Directory -Path $env:THTH_UPLOAD_DIR -Force | Out-Null
}

cmd.exe /c "npx next start -p 3000 > server.log 2>&1"

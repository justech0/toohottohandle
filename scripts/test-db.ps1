$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $repoRoot ".env.test.local"
$dataDir = "C:\laragon\data\thth-test"
$port = 3307

if (-not (Test-Path -LiteralPath $envFile)) {
  throw ".env.test.local bulunamadı. Test veritabanı bağlantılarını önce oluştur."
}

foreach ($line in Get-Content -LiteralPath $envFile) {
  if ($line -match '^\s*(TEST_DATABASE_URL|DEV_DATABASE_URL)=(.+)\s*$') {
    [Environment]::SetEnvironmentVariable($Matches[1], $Matches[2], "Process")
  }
}
if (-not $env:TEST_DATABASE_URL -or -not $env:DEV_DATABASE_URL) {
  throw ".env.test.local içinde TEST_DATABASE_URL ve DEV_DATABASE_URL bulunmalı."
}

function Test-Port {
  param([int]$Number)
  $client = [Net.Sockets.TcpClient]::new()
  try {
    return $client.ConnectAsync("127.0.0.1", $Number).Wait(250)
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

if (-not (Test-Port $port)) {
  if (-not (Test-Path -LiteralPath (Join-Path $dataDir "auto.cnf"))) {
    throw "Test veri klasörü başlatılmamış: $dataDir"
  }
  $serverDir = Get-ChildItem "C:\laragon\bin\mysql" -Directory |
    Where-Object { Test-Path -LiteralPath (Join-Path $_.FullName "bin\mysqld.exe") } |
    Sort-Object Name -Descending |
    Select-Object -First 1
  if (-not $serverDir) { throw "Laragon MySQL/MariaDB sunucusu bulunamadı." }

  $server = Join-Path $serverDir.FullName "bin\mysqld.exe"
  $arguments = @(
    "--no-defaults",
    "--basedir=$($serverDir.FullName)",
    "--datadir=$dataDir",
    "--port=$port",
    "--bind-address=127.0.0.1",
    "--mysqlx=0",
    "--log-error=$(Join-Path $dataDir 'thth-test.err')"
  )
  Start-Process -FilePath $server -ArgumentList $arguments -WindowStyle Hidden | Out-Null

  for ($attempt = 0; $attempt -lt 40 -and -not (Test-Port $port); $attempt++) {
    Start-Sleep -Milliseconds 250
  }
  if (-not (Test-Port $port)) {
    throw "Test MySQL sunucusu 127.0.0.1:$port üzerinde başlamadı."
  }
}

Write-Host "Test MySQL hazır: 127.0.0.1:$port"

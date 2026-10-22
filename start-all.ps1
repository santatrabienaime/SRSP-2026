# ============================================================================
# SRSP Fitovinany - Démarrage complet (PostgreSQL + backend + frontend)
#
# Prérequis : PostgreSQL 18 installé, Node.js 20+, .env renseigné.
# Le script démarre le service PostgreSQL, crée la base si nécessaire,
# importe database/srsp_db.sql sur une base vide, puis lance l'API et Vite.
# ============================================================================

$ErrorActionPreference = "Stop"

$ROOT = $PSScriptRoot
$BACKEND_DIR = Join-Path $ROOT "Backend"
$FRONTEND_DIR = Join-Path $ROOT "Frontend"
$SQL_FILE = Join-Path $ROOT "database\srsp_db.sql"
$ENV_FILE = Join-Path $BACKEND_DIR ".env"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany - Démarrage complet (PostgreSQL)" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# 1. Localiser PostgreSQL et psql
# ---------------------------------------------------------------------------
Write-Host "`n[1/5] Vérification de PostgreSQL..." -ForegroundColor Yellow

$pgCandidates = @(
    "C:\Program Files\PostgreSQL\18\bin",
    "C:\Program Files\PostgreSQL\17\bin",
    "C:\Program Files\PostgreSQL\16\bin",
    "C:\Program Files\PostgreSQL\15\bin"
)
$pgBin = $null
foreach ($dir in $pgCandidates) {
    if (Test-Path (Join-Path $dir "psql.exe")) { $pgBin = $dir; break }
}
if (-not $pgBin) {
    $psqlCommand = Get-Command psql.exe -ErrorAction SilentlyContinue
    if ($psqlCommand) { $pgBin = Split-Path $psqlCommand.Source -Parent }
}
if (-not $pgBin) {
    Write-Host "  ERREUR: psql.exe introuvable. Installez PostgreSQL 18 ou ajoutez son dossier bin au PATH." -ForegroundColor Red
    exit 1
}
$PSQL = Join-Path $pgBin "psql.exe"
Write-Host "  PostgreSQL trouvé : $pgBin" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 2. Lire .env
# ---------------------------------------------------------------------------
Write-Host "`n[2/5] Lecture de la configuration..." -ForegroundColor Yellow

if (-Not (Test-Path $ENV_FILE)) {
    Copy-Item (Join-Path $BACKEND_DIR ".env.example") $ENV_FILE
    Write-Host "  .env créé depuis .env.example. Renseignez DB_PASSWORD et JWT_SECRET, puis relancez." -ForegroundColor Yellow
    exit 1
}

function Get-EnvValue([string]$Name, [string]$Default) {
    $line = Get-Content $ENV_FILE | Where-Object { $_ -match "^$([regex]::Escape($Name))=" } | Select-Object -First 1
    if (-not $line) { return $Default }
    return ($line -replace "^$([regex]::Escape($Name))=", "").Trim()
}

$DB_HOST = Get-EnvValue "DB_HOST" "localhost"
$DB_PORT = Get-EnvValue "DB_PORT" "5432"
$DB_USER = Get-EnvValue "DB_USER" "postgres"
$DB_PASSWORD = Get-EnvValue "DB_PASSWORD" ""
$DB_NAME = Get-EnvValue "DB_NAME" "srsp_db"
$env:PGPASSWORD = $DB_PASSWORD
$env:PGCLIENTENCODING = "UTF8"

# ---------------------------------------------------------------------------
# 3. Démarrer PostgreSQL si nécessaire
# ---------------------------------------------------------------------------
Write-Host "`n[3/5] Vérification du service PostgreSQL..." -ForegroundColor Yellow

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue |
    Sort-Object Name | Select-Object -First 1
if ($pgService -and $pgService.Status -ne "Running") {
    Write-Host "  Démarrage du service $($pgService.Name)..." -ForegroundColor Yellow
    try { Start-Service $pgService.Name; Start-Sleep -Seconds 3 } catch {
        Write-Host "  ERREUR: impossible de démarrer $($pgService.Name)." -ForegroundColor Red
        exit 1
    }
}

function Invoke-Psql([string]$Database, [string[]]$Arguments) {
    & $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $Database -v ON_ERROR_STOP=1 @Arguments | Out-Null
    return $LASTEXITCODE
}

$test = Invoke-Psql "postgres" @("-tAc", "SELECT 1")
if ($test -ne 0) {
    Write-Host "  ERREUR: PostgreSQL ne répond pas sur ${DB_HOST}:${DB_PORT}." -ForegroundColor Red
    Write-Host "  Vérifiez le service et DB_PASSWORD dans Backend/.env." -ForegroundColor Yellow
    exit 1
}
Write-Host "  PostgreSQL répond sur ${DB_HOST}:${DB_PORT}." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 4. Créer et initialiser la base si nécessaire
# ---------------------------------------------------------------------------
Write-Host "`n[4/5] Vérification de la base '$DB_NAME'..." -ForegroundColor Yellow

$exists = (& $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'").Trim()
if ($exists -ne "1") {
    Write-Host "  Création de la base '$DB_NAME'..." -ForegroundColor Yellow
    $code = Invoke-Psql "postgres" @("-c", "CREATE DATABASE `"$DB_NAME`" ENCODING 'UTF8' TEMPLATE template0;")
    if ($code -ne 0) {
        Write-Host "  ERREUR: impossible de créer la base '$DB_NAME'." -ForegroundColor Red
        exit 1
    }
}

$hasRoles = (& $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -tAc "SELECT to_regclass('public.roles') IS NOT NULL").Trim()
if ($hasRoles -ne "t") {
    if (-Not (Test-Path $SQL_FILE)) {
        Write-Host "  ERREUR: base vide et fichier $SQL_FILE introuvable." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Importation du schéma et des données depuis database/srsp_db.sql..." -ForegroundColor Yellow
    $code = Invoke-Psql $DB_NAME @("-f", $SQL_FILE)
    if ($code -ne 0) {
        Write-Host "  ERREUR: l'importation du dump PostgreSQL a échoué." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Base initialisée." -ForegroundColor Green
} else {
    Write-Host "  Base '$DB_NAME' déjà initialisée." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 5. Démarrer le backend et le frontend
# ---------------------------------------------------------------------------
Write-Host "`n[5/5] Démarrage du backend et du frontend..." -ForegroundColor Yellow

$backendLog = Join-Path $BACKEND_DIR "logs\api.out.log"
$backendErr = Join-Path $BACKEND_DIR "logs\api.err.log"
New-Item -ItemType Directory -Force -Path (Split-Path $backendLog) | Out-Null

$backendUp = $false
try {
    Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 2 | Out-Null
    $backendUp = $true
} catch {}

if (-not $backendUp) {
    Start-Process -FilePath "node" -ArgumentList "src/server.js" `
        -WorkingDirectory $BACKEND_DIR `
        -RedirectStandardOutput $backendLog -RedirectStandardError $backendErr `
        -WindowStyle Hidden
    for ($i = 0; $i -lt 30; $i++) {
        Start-Sleep -Seconds 1
        try {
            Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 2 | Out-Null
            $backendUp = $true; break
        } catch {}
    }
}

if ($backendUp) {
    Write-Host "  Backend démarré sur http://localhost:5000" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION: le backend n'a pas répondu. Voir $backendErr" -ForegroundColor Yellow
}

$frontendUp = $false
try {
    Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing | Out-Null
    $frontendUp = $true
} catch {}

if (-not $frontendUp) {
    $frontendLog = Join-Path $FRONTEND_DIR "vite.out.log"
    $frontendErr = Join-Path $FRONTEND_DIR "vite.err.log"
    Start-Process -FilePath "npm.cmd" -ArgumentList "run", "dev" `
        -WorkingDirectory $FRONTEND_DIR `
        -RedirectStandardOutput $frontendLog -RedirectStandardError $frontendErr `
        -WindowStyle Hidden
    for ($i = 0; $i -lt 40; $i++) {
        Start-Sleep -Seconds 1
        try {
            Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing | Out-Null
            $frontendUp = $true; break
        } catch {}
    }
}

if ($frontendUp) {
    Write-Host "  Frontend démarré sur http://localhost:5173" -ForegroundColor Green
} else {
    Write-Host "  ATTENTION: le frontend n'a pas répondu. Voir Frontend\vite.err.log" -ForegroundColor Yellow
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany est démarré !" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:5000/api" -ForegroundColor Green
Write-Host "  Admin    : admin@srsp.mg / Admin123!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "`nPour arrêter : arrêtez les processus node sur les ports 5000 et 5173."
Write-Host "Le service PostgreSQL peut rester actif."

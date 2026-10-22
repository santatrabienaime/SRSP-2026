# ============================================================================
# SRSP Fitovinany - Démarrage PostgreSQL + Backend
#
# Ce script vérifie PostgreSQL, crée la base srsp_db si nécessaire, importe
# database/srsp_db.sql sur une base vide, puis lance l'API en mode développement.
# ============================================================================

$ErrorActionPreference = "Stop"

$BACKEND_DIR = $PSScriptRoot
$ROOT = Split-Path $BACKEND_DIR -Parent
$ENV_FILE = Join-Path $BACKEND_DIR ".env"
$ENV_EXAMPLE = Join-Path $BACKEND_DIR ".env.example"
$SQL_FILE = Join-Path $ROOT "database\srsp_db.sql"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany - Démarrage PostgreSQL + Backend" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# Étape 1 : .env
# ---------------------------------------------------------------------------
Write-Host "`n[1/4] Vérification du fichier .env..." -ForegroundColor Yellow
if (-Not (Test-Path $ENV_FILE)) {
    Copy-Item $ENV_EXAMPLE $ENV_FILE
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
# Étape 2 : localiser et démarrer PostgreSQL
# ---------------------------------------------------------------------------
Write-Host "`n[2/4] Vérification de PostgreSQL..." -ForegroundColor Yellow

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
    Write-Host "  ERREUR: psql.exe introuvable. Installez PostgreSQL 18." -ForegroundColor Red
    exit 1
}
$PSQL = Join-Path $pgBin "psql.exe"

$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue |
    Sort-Object Name | Select-Object -First 1
if ($pgService -and $pgService.Status -ne "Running") {
    Write-Host "  Démarrage du service $($pgService.Name)..." -ForegroundColor Yellow
    Start-Service $pgService.Name
    Start-Sleep -Seconds 3
}

$probe = (& $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1" 2>$null)
if ($LASTEXITCODE -ne 0 -or $probe.Trim() -ne "1") {
    Write-Host "  ERREUR: PostgreSQL ne répond pas sur ${DB_HOST}:${DB_PORT}." -ForegroundColor Red
    Write-Host "  Vérifiez le service et DB_PASSWORD dans Backend/.env." -ForegroundColor Yellow
    exit 1
}
Write-Host "  PostgreSQL répond sur ${DB_HOST}:${DB_PORT}." -ForegroundColor Green

# ---------------------------------------------------------------------------
# Étape 3 : créer et initialiser la base
# ---------------------------------------------------------------------------
Write-Host "`n[3/4] Vérification de la base '$DB_NAME'..." -ForegroundColor Yellow

$exists = (& $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'").Trim()
if ($exists -ne "1") {
    Write-Host "  Création de la base '$DB_NAME'..." -ForegroundColor Yellow
    & $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d postgres -v ON_ERROR_STOP=1 -c "CREATE DATABASE `"$DB_NAME`" ENCODING 'UTF8' TEMPLATE template0;" | Out-Null
    if ($LASTEXITCODE -ne 0) {
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
    Write-Host "  Importation de database/srsp_db.sql..." -ForegroundColor Yellow
    & $PSQL -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1 -f $SQL_FILE | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERREUR: l'importation du dump PostgreSQL a échoué." -ForegroundColor Red
        exit 1
    }
    Write-Host "  Base initialisée." -ForegroundColor Green
} else {
    Write-Host "  Base '$DB_NAME' déjà initialisée." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# Étape 4 : démarrer le backend
# ---------------------------------------------------------------------------
Write-Host "`n[4/4] Démarrage du backend..." -ForegroundColor Yellow
Set-Location $BACKEND_DIR
npm run dev

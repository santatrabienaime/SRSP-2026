# ============================================================================
# SRSP Fitovinany - Script de démarrage complet
# Démarre MariaDB, initialise la base de données, puis lance backend et frontend
# ============================================================================

$ErrorActionPreference = "Stop"

$ROOT = "C:\Users\TOSHIBA\Desktop\SRSP-2026"
$BACKEND_DIR = "$ROOT\Backend"
$FRONTEND_DIR = "$ROOT\Frontend"
$SQL_FILE = "$ROOT\srsp_db.sql"
$DB_NAME = "srsp_db"
$DB_USER = "root"
$DB_PASSWORD = ""

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany - Démarrage complet" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# 1. Vérifier que MariaDB est installé
# ---------------------------------------------------------------------------
Write-Host "`n[1/5] Vérification de MariaDB..." -ForegroundColor Yellow

$mariadbPaths = @(
    "C:\Program Files\MariaDB\MariaDB 10.11\bin\mariadb.exe",
    "C:\Program Files\MariaDB\MariaDB 10.6\bin\mariadb.exe",
    "C:\Program Files\MariaDB\MariaDB 10.5\bin\mariadb.exe",
    "C:\Program Files (x86)\MariaDB\MariaDB 10.11\bin\mariadb.exe",
    "C:\Program Files (x86)\MariaDB\MariaDB 10.6\bin\mariadb.exe",
    "C:\Program Files (x86)\MariaDB\MariaDB 10.5\bin\mariadb.exe",
    "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe",
    "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin\mysql.exe",
)

$mariadbCmd = $null
foreach ($p in $mariadbPaths) {
    if (Test-Path $p) {
        $mariadbCmd = $p
        break
    }
}

if (-not $mariadbCmd) {
    Write-Host "  ERREUR: MariaDB/MySQL n'est pas trouvé sur ce système." -ForegroundColor Red
    Write-Host "  Veuillez installer MariaDB ou MySQL manuellement." -ForegroundColor Yellow
    Write-Host "  Puis relancer ce script." -ForegroundColor Yellow
    exit 1
}
Write-Host "  MariaDB trouvé: $mariadbCmd" -ForegroundColor Green

# ---------------------------------------------------------------------------
# 2. Démarrer MariaDB si nécessaire
# ---------------------------------------------------------------------------
Write-Host "`n[2/5] Vérification que MariaDB est démarré..." -ForegroundColor Yellow

function Test-MariaDB-Connection {
    try {
        $result = & $mariadbCmd -u $DB_USER -e "SELECT 1" 2>$null
        return $true
    } catch {
        return $false
    }
}

if (-not (Test-MariaDB-Connection)) {
    Write-Host "  Démarrage de MariaDB..." -ForegroundColor Yellow
    try {
        # Tenter de démarrer le service Windows
        net start mariadb 2>$null
        Start-Sleep -Seconds 3
        if (-not (Test-MariaDB-Connection)) {
            net start mysql 2>$null
            Start-Sleep -Seconds 3
        }
    } catch {}

    if (-not (Test-MariaDB-Connection)) {
        Write-Host "  ERREUR: Impossible de démarrer MariaDB automatiquement." -ForegroundColor Red
        Write-Host "  Veuillez démarrer MariaDB manuellement (services.msc ou services.msc -> MariaDB)" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host "  MariaDB est démarré." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 3. Créer la base de données si nécessaire
# ---------------------------------------------------------------------------
Write-Host "`n[3/5] Vérification de la base de données '$DB_NAME'..." -ForegroundColor Yellow

$dbExists = & $mariadbCmd -u $DB_USER -e "SHOW DATABASES LIKE '$DB_NAME';" 2>$null
if ($dbExists -notmatch $DB_NAME) {
    Write-Host "  Création de la base de données '$DB_NAME'..." -ForegroundColor Yellow
    & $mariadbCmd -u $DB_USER -e "CREATE DATABASE $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  ERREUR: Impossible de créer la base de données '$DB_NAME'." -ForegroundColor Red
        Write-Host "  Vérifiez que le mot de passe root est correct dans .env" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "  Base de données '$DB_NAME' créée." -ForegroundColor Green
} else {
    Write-Host "  Base de données '$DB_NAME' existe déjà." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# 4. Importer le schéma SQL
# ---------------------------------------------------------------------------
Write-Host "`n[4/5] Importation du schéma SQL..." -ForegroundColor Yellow

if (-not (Test-Path $SQL_FILE)) {
    Write-Host "  ERREUR: Le fichier $SQL_FILE n'existe pas." -ForegroundColor Red
    exit 1
}

& $mariadbCmd -u $DB_USER $DB_NAME < $SQL_FILE 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERREUR: Échec de l'importation du schéma SQL." -ForegroundColor Red
    exit 1
}
Write-Host "  Schéma importé avec succès." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 5. Démarrer le backend et le frontend
# ---------------------------------------------------------------------------
Write-Host "`n[5/5] Démarrage du backend et du frontend..." -ForegroundColor Yellow

# Démarrer le backend en arrière-plan
Write-Host "  Démarrage du backend sur http://localhost:5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$BACKEND_DIR'; npm run dev`" -WindowStyle Hidden

# Attendre que le backend soit prêt
Write-Host "  Attente du démarrage du backend..." -ForegroundColor Yellow
$backendReady = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    try {
        $test = Invoke-RestMethod -Uri "http://localhost:5000/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($test) {
            $backendReady = $true
            break
        }
    } catch {}
}
if (-not $backendReady) {
    Write-Host "  ATTENTION: Le backend n'a pas répondu dans les 30 secondes." -ForegroundColor Yellow
    Write-Host "  Vérifiez manuellement: cd Backend && npm run dev" -ForegroundColor Yellow
} else {
    Write-Host "  Backend démarré sur http://localhost:5000" -ForegroundColor Green
}

# Démarrer le frontend en arrière-plan
Write-Host "  Démarrage du frontend sur http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd '$FRONTEND_DIR'; npm run dev`" -WindowStyle Hidden

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany est démarré !" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:5000/api" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan

Write-Host "`nPour arrêter les services, appuyez sur Ctrl+C dans chaque fenêtre ou utilisez :"
Write-Host "  net stop mariadb"
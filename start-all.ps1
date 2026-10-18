# ============================================================================
# SRSP Fitovinany - Script de démarrage complet (MariaDB + Backend + Frontend)
# ============================================================================

$ROOT = "C:\Users\TOSHIBA\Desktop\SRSP-2026"
$BACKEND_DIR = "$ROOT\Backend"
$FRONTEND_DIR = "$ROOT\Frontend"

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany - Démarrage complet" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# ---------------------------------------------------------------------------
# 1. Vérifier et démarrer MariaDB
# ---------------------------------------------------------------------------
Write-Host "`n[1/3] Vérification de MariaDB..." -ForegroundColor Yellow

function Test-MariaDB {
    try {
        $result = mysql -u root -e "SELECT 1" 2>$null
        return $true
    } catch {
        return $false
    }
}

if (-Not (Test-MariaDB)) {
    Write-Host "  MariaDB ne répond pas. Tentative de démarrage..." -ForegroundColor Yellow
    try {
        net start mariadb 2>$null
        Start-Sleep -Seconds 3
    } catch {}
    
    if (-Not (Test-MariaDB)) {
        Write-Host "  Impossible de démarrer MariaDB automatiquement." -ForegroundColor Red
        Write-Host "  Veuillez démarrer MariaDB manuellement puis relancer ce script." -ForegroundColor Yellow
        Write-Host "    net start mariadb" -ForegroundColor Yellow
        exit 1
    }
}
Write-Host "  MariaDB est actif." -ForegroundColor Green

# ---------------------------------------------------------------------------
# 2. Vérifier la base de données
# ---------------------------------------------------------------------------
Write-Host "`n[2/3] Vérification de la base de données srsp_db..." -ForegroundColor Yellow

try {
    $result = mysql -u root -e "SHOW DATABASES LIKE 'srsp_db';" 2>$null
    if ($result -notmatch "srsp_db") {
        Write-Host "  Création de la base de données srsp_db..." -ForegroundColor Yellow
        mysql -u root -e "CREATE DATABASE srsp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
        Write-Host "  Base de données créée." -ForegroundColor Green
    } else {
        Write-Host "  Base de données srsp_db existe déjà." -ForegroundColor Green
    }
} catch {
    Write-Host "  Impossible d'accéder à MariaDB. Vérifiez votre mot de passe root dans Backend/.env" -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# 3. Démarrer le backend et frontend
# ---------------------------------------------------------------------------
Write-Host "`n[3/3] Démarrage du backend et frontend..." -ForegroundColor Yellow

# Démarrer le backend en arrière-plan
Write-Host "  Démarrage du backend sur :5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command `"cd '$BACKEND_DIR'; npm run dev`" -WindowStyle Hidden

# Attendre que le backend soit prêt
Start-Sleep -Seconds 5

# Démarrer le frontend en arrière-plan
Write-Host "  Démarrage du frontend sur :5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-Command `"cd '$FRONTEND_DIR'; npm run dev`" -WindowStyle Hidden

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany est démarré !" -ForegroundColor Cyan
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend  : http://localhost:5000/api" -ForegroundColor Green
Write-Host "  Comptes : admin@srsp.mg / Admin123!" -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Cyan
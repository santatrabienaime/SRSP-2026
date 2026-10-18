# ============================================================================
# SRSP Fitovinany - Script de démarrage MariaDB et Backend
# ============================================================================

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  SRSP Fitovinany - Démarrage MariaDB + Backend" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

$BACKEND_DIR = "C:\Users\TOSHIBA\Desktop\SRSP-2026\Backend"
$ENV_FILE = "$BACKEND_DIR\.env"
$ENV_EXAMPLE = "$BACKEND_DIR\.env.example"

# ---------------------------------------------------------------------------
# Étape 1 : Vérifier que .env existe
# ---------------------------------------------------------------------------
Write-Host "`n[1/4] Vérification du fichier .env..." -ForegroundColor Yellow

if (-Not (Test-Path $ENV_FILE)) {
    Write-Host "  Le fichier .env n'existe pas. Création depuis .env.example..." -ForegroundColor Yellow
    Copy-Item $ENV_EXAMPLE $ENV_FILE
    Write-Host "  Veuillez éditer $ENV_FILE avec vos identifiants MariaDB (DB_PASSWORD)." -ForegroundColor Yellow
    Write-Host "  Puis relancez ce script." -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "  Fichier .env trouvé." -ForegroundColor Green
}

# ---------------------------------------------------------------------------
# Étape 2 : Vérifier/démarrer MariaDB
# ---------------------------------------------------------------------------
Write-Host "`n[2/4] Vérification de MariaDB..." -ForegroundColor Yellow

# Fonction pour tester si MariaDB répond
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
    
    # Tentatives de démarrage selon l'environnement
    $started = $false
    
    # Option 1 : Service Windows
    try {
        net start mariadb 2>$null
        if ($LASTEXITCODE -eq 0) { $started = $true }
    } catch {}
    
    # Option 2 : mysqld directement
    if (-Not $started) {
        try {
            Start-Process "C:\Program Files\MariaDB\MariaDB 10.x\bin\mariadbd.exe" -ArgumentList "--defaults-file=C:\Program Files\MariaDB\MariaDB 10.x\data\my.ini" -WindowStyle Hidden
            Start-Sleep -Seconds 5
            if (Test-MariaDB) { $started = $true }
        } catch {}
    }
    
    # Option 3 : Service MySQL (alias)
    if (-Not $started) {
        try {
            net start mysql 2>$null
            if ($LASTEXITCODE -eq 0) { $started = $true }
        } catch {}
    }
    
    if (-Not $started) {
        Write-Host "  Impossible de démarrer MariaDB automatiquement." -ForegroundColor Red
        Write-Host "  Veuillez démarrer MariaDB manuellement :" -ForegroundColor Yellow
        Write-Host "    - Windows : services.msc -> Démarrer 'MariaDB' ou 'MySQL'" -ForegroundColor Yellow
        Write-Host "    - Ou : net start mariadb" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "  MariaDB est démarré." -ForegroundColor Green

# ---------------------------------------------------------------------------
# Étape 3 : Créer la base de données srsp_db
# ---------------------------------------------------------------------------
Write-Host "`n[3/4] Vérification de la base de données srsp_db..." -ForegroundColor Yellow

try {
    $result = mysql -u root -e "SHOW DATABASES LIKE 'srsp_db';" 2>$null
    if ($result -match "srsp_db") {
        Write-Host "  Base de données srsp_db existe déjà." -ForegroundColor Green
    } else {
        Write-Host "  Création de la base de données srsp_db..." -ForegroundColor Yellow
        mysql -u root -e "CREATE DATABASE srsp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Base de données srsp_db créée avec succès." -ForegroundColor Green
        } else {
            Write-Host "  Impossible de créer la base de données. Vérifiez votre mot de passe root dans .env" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "  Erreur lors de la vérification de la base de données." -ForegroundColor Red
    exit 1
}

# ---------------------------------------------------------------------------
# Étape 4 : Vérifier que le backend peut se connecter
# ---------------------------------------------------------------------------
Write-Host "`n[4/4] Test de connexion à la base de données..." -ForegroundColor Yellow

# Lire le DB_NAME depuis .env
$dbName = (Get-Content $ENV_FILE | Where-Object { $_ -match "^DB_NAME=" }) -replace "DB_NAME=", ""
if (-Not $dbName) { $dbName = "srsp_db" }

try {
    $result = mysql -u root -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$dbName';" 2>$null
    Write-Host "  Connexion à la base de données réussie." -ForegroundColor Green
} catch {
    Write-Host "  Impossible de se connecter à la base de données $dbName." -ForegroundColor Red
    Write-Host "  Vérifiez votre fichier .env (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)" -ForegroundColor Yellow
    exit 1
}

# ---------------------------------------------------------------------------
# Étape 5 : Démarrer le backend
# ---------------------------------------------------------------------------
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  Tout est prêt ! Démarrage du backend..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

cd $BACKEND_DIR
npm run dev
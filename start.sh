#!/usr/bin/env bash
# =============================================================================
# SRSP Fitovinany — Démarrage rapide backend + frontend (PostgreSQL)
#
#   ./start.sh            → démarre (ou réutilise) PostgreSQL, backend + frontend
#   ./start.sh restart    → redémarre les deux
#   ./start.sh stop       → arrête les deux
#   ./start.sh status     → état des services
# =============================================================================
set -u

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT/Backend"
FRONTEND_DIR="$ROOT/Frontend"
BACK_LOG="/tmp/srsp-backend.log"
FRONT_LOG="/tmp/srsp-frontend.log"

# ---- Couleurs ----------------------------------------------------------------
C_GREEN=$'\e[32m'; C_YELLOW=$'\e[33m'; C_RED=$'\e[31m'; C_BOLD=$'\e[1m'; C_OFF=$'\e[0m'

info()  { echo "${C_GREEN}${1}${C_OFF}"; }
warn()  { echo "${C_YELLOW}${1}${C_OFF}"; }
err()   { echo "${C_RED}${1}${C_OFF}"; }
step()  { echo; echo "${C_BOLD}### ${1}${C_OFF}"; }

# ---- Utilitaires -------------------------------------------------------------
# PID du processus écoutant sur un port (via ss), vide si aucun.
pid_on_port() { ss -ltnp "sport = :$1" 2>/dev/null | sed -nE 's/.*pid=([0-9]+).*/\1/p' | head -1; }

is_up() { local path="${2:-/}"; curl -s -m 2 -o /dev/null "http://localhost:$1$path" 2>/dev/null; }

# Extraction des variables depuis Backend/.env (sans source, préserve les \)
env_val() { sed -n "s/^$1=//p" "$BACKEND_DIR/.env" 2>/dev/null | head -1; }

# Localise psql : PATH, puis emplacements classiques Linux/macOS.
find_psql() {
  if command -v psql >/dev/null 2>&1; then command -v psql; return 0; fi
  for p in \
    /usr/lib/postgresql/*/bin/psql \
    /usr/local/pgsql/bin/psql \
    /opt/homebrew/bin/psql \
    /Applications/Postgres.app/Contents/Versions/latest/bin/psql; do
    [[ -x "$p" ]] && { echo "$p"; return 0; }
  done
  return 1
}

DB_HOST="$(env_val DB_HOST)"; DB_HOST="${DB_HOST:-localhost}"
DB_PORT="$(env_val DB_PORT)"; DB_PORT="${DB_PORT:-5432}"
DB_USER="$(env_val DB_USER)"; DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="$(env_val DB_PASSWORD)"
DB_NAME="$(env_val DB_NAME)"; DB_NAME="${DB_NAME:-srsp_db}"

PSQL="$(find_psql)" || true

psql_cmd() {
  PGPASSWORD="$DB_PASSWORD" PGCLIENTENCODING=UTF8 "$PSQL" \
    -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -v ON_ERROR_STOP=1 "$@"
}

check_db() {
  [[ -n "$PSQL" ]] || return 1
  psql_cmd -d postgres -tAc "SELECT 1" >/dev/null 2>&1
}

ensure_db() {
  if [[ -z "$PSQL" ]]; then
    err "  ✗ psql introuvable. Installez PostgreSQL 18 ou ajoutez son dossier bin au PATH."
    return 1
  fi
  if ! check_db; then
    err "  ✗ PostgreSQL ne répond pas sur ${DB_HOST}:${DB_PORT}."
    err "    Démarrez le service PostgreSQL (systemctl start postgresql) puis relancez."
    return 1
  fi
  info "  ✓ PostgreSQL : ${DB_HOST}:${DB_PORT}"

  if [[ "$(psql_cmd -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'")" != "1" ]]; then
    step "Création de la base '$DB_NAME'"
    psql_cmd -d postgres -c "CREATE DATABASE \"$DB_NAME\" ENCODING 'UTF8' TEMPLATE template0;" || return 1
    info "  ✓ Base '$DB_NAME' créée."
  fi

  if [[ "$(psql_cmd -d "$DB_NAME" -tAc "SELECT to_regclass('public.roles') IS NOT NULL")" != "t" ]]; then
    if [[ -f "$ROOT/database/srsp_db.sql" ]]; then
      step "Initialisation du schéma et des données"
      psql_cmd -d "$DB_NAME" -f "$ROOT/database/srsp_db.sql" || return 1
      info "  ✓ Base initialisée depuis database/srsp_db.sql."
    else
      warn "  ⚠ Base vide et database/srsp_db.sql absent : importez le dump PostgreSQL manuellement."
    fi
  fi
}

# ---- Actions -----------------------------------------------------------------
start_backend() {
  if [[ -n "$(pid_on_port 5000)" ]]; then
    warn "⚠ Backend déjà démarré sur :5000 (PID $(pid_on_port 5000)) — réutilisé."
  else
    step "Démarrage du backend sur :5000"
    (cd "$BACKEND_DIR" && setsid node src/server.js > "$BACK_LOG" 2>&1 < /dev/null &)
    for _ in $(seq 1 30); do is_up 5000 /api/health && break; sleep 1; done
    if is_up 5000 /api/health; then info "  ✓ Backend : http://localhost:5000  → /api/health OK"
    else err "  ✗ Backend KO. Dernières lignes du log ($BACK_LOG) :"; tail -15 "$BACK_LOG" 2>/dev/null | sed 's/^/     /'; return 1; fi
  fi
}

start_frontend() {
  if [[ -n "$(pid_on_port 5173)" ]]; then
    warn "⚠ Frontend déjà démarré sur :5173 (PID $(pid_on_port 5173)) — réutilisé."
  else
    step "Démarrage du frontend sur :5173"
    (cd "$FRONTEND_DIR" && setsid npm run dev > "$FRONT_LOG" 2>&1 < /dev/null &)
    for _ in $(seq 1 40); do is_up 5173 && break; sleep 1; done
    if is_up 5173; then info "  ✓ Frontend : http://localhost:5173"
    else err "  ✗ Frontend KO. Dernières lignes du log ($FRONT_LOG) :"; tail -15 "$FRONT_LOG" 2>/dev/null | sed 's/^/     /'; return 1; fi
  fi
}

stop_all() {
  step "Arrêt des services"
  for port in 5173 5000; do
    local pid; pid="$(pid_on_port "$port")"
    if [[ -n "$pid" ]]; then
      kill "$pid" 2>/dev/null && info "  • Port :$port arrêté (PID $pid)"
      local i; for i in $(seq 1 10); do [[ -z "$(pid_on_port "$port")" ]] && break; sleep 0.5; done
    else warn "  • Port :$port : rien à arrêter."; fi
  done
}

show_status() {
  step "État des services SRSP"
  local bpid fpid
  bpid="$(pid_on_port 5000)"; fpid="$(pid_on_port 5173)"
  if check_db; then
    local n; n="$(psql_cmd -d "$DB_NAME" -tAc "SELECT COUNT(*) FROM roles" 2>/dev/null || echo 0)"
    info "  ✓ PostgreSQL : ${DB_HOST}:${DB_PORT} — base $DB_NAME ($n rôles)"
  else
    err "  ✗ PostgreSQL : ${DB_HOST}:${DB_PORT} — injoignable"
  fi
  [[ -n "$bpid" ]] && is_up 5000 /api/health && info "  ✓ Backend  :5000 (PID $bpid) — /api/health OK" || err "  ✗ Backend  :5000 — arrêté"
  [[ -n "$fpid" ]] && is_up 5173 && info "  ✓ Frontend :5173 (PID $fpid) — HTTP OK" || err "  ✗ Frontend :5173 — arrêté"
}

# ---- Dispatch ----------------------------------------------------------------
case "${1:-start}" in
  start)
    step "SRSP Fitovinany — démarrage rapide"
    ensure_db || exit 1
    start_backend || exit 1
    start_frontend || exit 1
    show_status
    step "Accès"
    info "  🚀 Frontend : http://localhost:5173"
    info "  🔌 Backend  : http://localhost:5000/api"
    info "  🔑 Admin    : admin@srsp.mg / Admin123!   (autres comptes : Demo123!)"
    echo
    warn "  Logs : tail -f $BACK_LOG   |   tail -f $FRONT_LOG"
    ;;
  restart)
    stop_all; sleep 1; exec "$0" start
    ;;
  stop)
    stop_all
    ;;
  status)
    show_status
    ;;
  *)
    echo "Usage : $0 {start|restart|stop|status}"
    exit 1
    ;;
esac

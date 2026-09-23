#!/usr/bin/env bash
# =============================================================================
# SRSP Fitovinany — Démarrage rapide backend + frontend en une commande
#
#   ./start.sh            → démarre (ou réutilise) backend + frontend
#   ./start.sh restart    → redémarre les deux
#   ./start.sh stop       → arrête les deux
#   ./start.sh status     → état des services
#   ./start.sh init       → réinitialise la base (idempotent) puis démarre
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

# ---- Utilitaires --------------------------------------------------------------
# PID du processus écoutant sur un port (via ss), vide si aucun.
pid_on_port() { ss -ltnp "sport = :$1" 2>/dev/null | sed -nE 's/.*pid=([0-9]+).*/\1/p' | head -1; }

is_up() { curl -s -m 2 -o /dev/null "http://localhost:$1/" 2>/dev/null; }

# Extraction des variables depuis Backend/.env (sans source, préserve les \)
env_val() { sed -n "s/^$1=//p" "$BACKEND_DIR/.env" 2>/dev/null | head -1; }

# Detection du port MariaDB : probe 3307 et 3306, sinon valeur .env.
detect_db_port() {
  local pass; pass="$(env_val DB_PASSWORD)"
  for p in 3307 3306; do
    local out
    out="$(cd "$BACKEND_DIR" && DB_PORT="$p" DB_PASSWORD="$pass" DB_USER="$(env_val DB_USER)" node --input-type=module -e '
      import mysql from "mysql2/promise";
      try {
        const c = await mysql.createConnection({
          host: "localhost", port: +process.env.DB_PORT,
          user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: "srsp_db"
        });
        const [r] = await c.query("SELECT COUNT(*) n FROM roles");
        await c.end();
        console.log("OK:" + r[0].n);
      } catch { process.exit(1); }
    ' 2>/dev/null)"
    if [[ "$out" == OK:* ]]; then echo "$p"; return 0; fi
  done
  echo "$(env_val DB_PORT)"; return 1   # repli sur .env (vérif au prochain démarrage)
}

# Lance l'instance MariaDB locale du projet (3307) si elle est à l'arrêt.
# Sans elle, detect_db_port retombe sur 3306 (autre instance → accès refusé).
DB_DATADIR="$HOME/.local/share/mariadb-srsp"
DB_SOCKET="$HOME/.local/run/mariadb-srsp.sock"
DB_PIDFILE="$HOME/.local/run/mariadb-srsp.pid"
DB_ERRLOG="$HOME/.local/run/mariadb-srsp.err"

start_db() {
  if [[ -n "$(pid_on_port 3307)" ]]; then
    info "  • MariaDB déjà actif sur :3307"
    return 0
  fi
  if [[ ! -d "$DB_DATADIR" ]]; then
    warn "  • Pas de datadir local ($DB_DATADIR) — MariaDB non géré par ce script."
    return 0
  fi
  if ! command -v mariadbd >/dev/null 2>&1; then
    warn "  • mariadbd introuvable — MariaDB non géré par ce script."
    return 0
  fi
  step "Démarrage de MariaDB (instance projet, port 3307)"
  mkdir -p "$(dirname "$DB_SOCKET")"
  (setsid mariadbd \
      --datadir="$DB_DATADIR" \
      --port=3307 --bind-address=127.0.0.1 \
      --socket="$DB_SOCKET" --pid-file="$DB_PIDFILE" \
      --log-error="$DB_ERRLOG" \
      < /dev/null > /dev/null 2>&1 &)
  for _ in $(seq 1 30); do
    [[ -n "$(pid_on_port 3307)" ]] && break
    sleep 1
  done
  if [[ -n "$(pid_on_port 3307)" ]]; then
    info "  ✅ MariaDB : 127.0.0.1:3307 (log : $DB_ERRLOG)"
  else
    err "  ❌ MariaDB non démarré sur :3307. Log ($DB_ERRLOG) :"
    tail -8 "$DB_ERRLOG" 2>/dev/null | sed 's/^/     /'
    return 1
  fi
}

# ---- Actions -------------------------------------------------------------------
start_backend() {
  local dbp; dbp="$(detect_db_port)"
  if [[ -n "$(pid_on_port 5000)" ]]; then
    warn "• Backend déjà démarré sur :5000 (PID $(pid_on_port 5000)) — réutilisé."
  else
    step "Démarrage du backend sur :5000 (DB port $dbp)"
    # setsid : nouvelle session → le service survit à la fin du terminal/script
    (cd "$BACKEND_DIR" && setsid env DB_PORT="$dbp" node src/server.js > "$BACK_LOG" 2>&1 < /dev/null &)
    for _ in $(seq 1 30); do is_up 5000 && break; sleep 1; done
    if is_up 5000; then info "  ✅ Backend : http://localhost:5000  → /api/health OK"
    else err "  ❌ Backend KO. Dernières lignes du log ($BACK_LOG) :"; tail -15 "$BACK_LOG" 2>/dev/null | sed 's/^/     /'; return 1; fi
  fi
}

start_frontend() {
  if [[ -n "$(pid_on_port 5173)" ]]; then
    warn "• Frontend déjà démarré sur :5173 (PID $(pid_on_port 5173)) — réutilisé."
  else
    step "Démarrage du frontend sur :5173"
    (cd "$FRONTEND_DIR" && setsid npm run dev > "$FRONT_LOG" 2>&1 < /dev/null &)
    for _ in $(seq 1 40); do is_up 5173 && break; sleep 1; done
    if is_up 5173; then info "  ✅ Frontend : http://localhost:5173"
    else err "  ❌ Frontend KO. Dernières lignes du log ($FRONT_LOG) :"; tail -15 "$FRONT_LOG" 2>/dev/null | sed 's/^/     /'; return 1; fi
  fi
}

stop_all() {
  step "Arrêt des services"
  for port in 5173 5000; do
    local pid; pid="$(pid_on_port "$port")"
    if [[ -n "$pid" ]]; then
      kill "$pid" 2>/dev/null && info "  ⏹  Port :$port arrêté (PID $pid)"
      local i; for i in $(seq 1 10); do [[ -z "$(pid_on_port "$port")" ]] && break; sleep 0.5; done
    else warn "  • Port :$port : rien à arrêter."; fi
  done
}

show_status() {
  step "État des services SRSP"
  local bpid fpid dbpid
  bpid="$(pid_on_port 5000)"; fpid="$(pid_on_port 5173)"; dbpid="$(pid_on_port 3307)"
  [[ -n "$dbpid" ]] && info "  ✅ MariaDB   :3307 (PID $dbpid) — instance projet" || warn "  ❌ MariaDB   :3307 — arrêté (start_db le relancera)"
  [[ -n "$bpid" ]] && is_up 5000 && info "  ✅ Backend  :5000 (PID $bpid) — /api/health OK" || err "  ❌ Backend  :5000 — arrêté"
  [[ -n "$fpid" ]] && is_up 5173 && info "  ✅ Frontend :5173 (PID $fpid) — HTTP OK"        || err "  ❌ Frontend :5173 — arrêté"
  local dbp; dbp="$(detect_db_port)"
  if [[ "$dbp" != "$(env_val DB_PORT)" ]]; then warn "  ℹ  DB utilisée : port $dbp (pensez à aligner DB_PORT dans Backend/.env)"; fi
}

init_db() {
  local dbp; dbp="$(detect_db_port)"
  step "Initialisation de la base srsp_db (port $dbp, idempotent)"
  (cd "$BACKEND_DIR" && DB_PORT="$dbp" node database/init.js) || { err "  ❌ Init DB échouée. Vérifier DB_PASSWORD dans Backend/.env"; return 1; }
  info "  ✅ Base prête (14 comptes, 13 rôles, 11 statuts…)"
}

# ---- Dispatch -------------------------------------------------------------------
case "${1:-start}" in
  start)
    step "SRSP Fitovinany — démarrage rapide"
    start_db || exit 1
    start_backend || exit 1
    start_frontend || exit 1
    show_status
    step "Accès"
    info "  🌐  Frontend : http://localhost:5173"
    info "  🔌  Backend  : http://localhost:5000/api"
    info "  👤  Admin    : admin@srsp.mg / Admin123!   (autres comptes : Demo123!)"
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
  init)
    init_db || exit 1
    exec "$0" start
    ;;
  *)
    echo "Usage : $0 {start|restart|stop|status|init}"
    exit 1
    ;;
esac
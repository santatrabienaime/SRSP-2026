/**
 * Utilitaires de formatage des dates (locales fr-FR).
 */

const pad = (n) => String(n).padStart(2, '0');

/** 'YYYY-MM-DD' | Date → 'JJ/MM/AAAA' */
export function formatDate(value, { time = false } = {}) {
  if (!value) return '—';
  const d = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return '—';
  const date = `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  if (!time) return date;
  return `${date} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Date → 'JJ/MM/AAAA HH:MM' */
export function formatDateTime(value) {
  return formatDate(value, { time: true });
}

/** 'YYYY-MM-DD' → 'JJ/MM/AAAA' (chaîne sans conversion de fuseau) */
export function formatDateString(value) {
  if (!value) return '—';
  const m = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (m) return `${m[3]}/${m[2]}/${m[1]}`;
  return formatDate(value);
}

/** Date du jour au format ISO (YYYY-MM-DD) utilisable en <input type="date"> */
export function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Durée relative, ex. « il y a 5 min ». */
export function timeAgo(value) {
  if (!value) return '—';
  const d = typeof value === 'string' ? new Date(value) : value;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'à l’instant';
  const min = Math.floor(sec / 60);
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j < 30) return `il y a ${j} j`;
  const mois = Math.floor(j / 30);
  if (mois < 12) return `il y a ${mois} mois`;
  return `il y a ${Math.floor(mois / 12)} an(s)`;
}
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

/**
 * 'YYYY-MM-DD' | horodatage → 'JJ/MM/AAAA'
 *
 * Une date SQL est une date SANS heure : celle du 28/09 enregistrée à minuit.
 * Le pilote la restitue en JavaScript, puis la sérialise en UTC : minuit à
 * Fitovinany (UTC+3) devient 21h00 la VEILLE. Lire les trois premiers groupes
 * de la chaîne renvoyée affichait donc systématiquement la veille — un dossier
 * reçu le 28/09 s'affichait le 27/09, et une échéance au 31/12 au 30/12.
 *
 * On distingue les deux cas :
 *   - chaîne du jour seule ('YYYY-MM-DD') : aucune conversion, c'est déjà la
 *     date voulue ;
 *   - horodatage complet : on se place dans le fuseau du navigateur, car c'est
 *     l'heure locale qui fait foi pour une date d'échéance administrative.
 */
export function formatDateString(value) {
  if (!value) return '—';

  const texte = String(value);
  // Cas « date seule » : le format ISO, sans heure, se lit directement.
  if (/^\d{4}-\d{2}-\d{2}$/.test(texte)) {
    const [a, m, j] = texte.split('-');
    return `${j}/${m}/${a}`;
  }

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/**
 * Valeur d'un champ <input type="date"> à partir d'une date SQL.
 *
 * Le même décalage d'un jour que dans formatDateString applies à la saisie :
 * donner à l'utilisateur « 27/09 » dans un champ censé contenir le 28/09 le
 * ferait enregistrer la mauvaise date sans qu'il s'en aperçoive.
 */
export function pourChampDate(value) {
  if (!value) return '';
  const texte = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(texte)) return texte;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
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
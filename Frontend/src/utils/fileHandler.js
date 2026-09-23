/** Utilitaires de fichiers (upload, téléchargement). */

/** Taille lisible, ex. 5242880 → '5,0 Mo'. */
export function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/** Extension (minuscules, sans point). */
export function getExtension(name) {
  const parts = String(name || '').split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

/** 'pdf,jpg' → ['pdf', 'jpg'] */
export function extensionsToArray(list) {
  return String(list || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedExtension(name, extensionsList) {
  const allowed = extensionsToArray(extensionsList);
  if (allowed.length === 0) return true;
  return allowed.includes(getExtension(name));
}

/** Construit un FormData pour upload (fichier + champs). */
export function buildFormData(file, fields = {}) {
  const fd = new FormData();
  if (file) fd.append('fichier', file);
  for (const [k, v] of Object.entries(fields)) {
    if (v !== undefined && v !== null && v !== '') fd.append(k, String(v));
  }
  return fd;
}

/** Déclenche le téléchargement d'un blob côté navigateur. */
export function downloadBlob(blob, filename) {
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
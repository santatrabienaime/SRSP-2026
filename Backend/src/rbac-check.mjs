// Vérifications RBAC v2.0 en conditions réelles (backend :5000, MariaDB :3307)
const base = 'http://localhost:5000/api';

async function login(identifiant, password) {
  const r = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password }),
  });
  if (r.status !== 200) return { token: null, err: r.status };
  return r.json();
}
async function get(path, token) {
  const r = await fetch(base + path, { headers: { Authorization: 'Bearer ' + token } });
  return { status: r.status, body: await r.json().catch(() => null) };
}

const admin = await login('admin@srsp.mg', 'Admin123!');
const secr = await login('secretaire@srsp.mg', 'Demo123!');
const visa = await login('chef.visa@srsp.mg', 'Demo123!');
const agt = await login('verif.visa@srsp.mg', 'Demo123!');
const liq = await login('liquidateur@srsp.mg', 'Demo123!');

function names(p) { return (p.body || []).map((x) => x.nom); }

// 1. Admin : toutes les permissions (41)
const admPerms = names(await get('/permissions/me', admin.token));
console.log('ADMIN permissions:', admPerms.length + '/41');

// 2. Chef Visa : workflow division + courriers NON inclus
const vPerms = names(await get('/permissions/me', visa.token));
console.log('CHEF_VISA:', vPerms.length, '→ valider:', vPerms.includes('valider_dossier'),
  '| affecter:', vPerms.includes('affecter_dossier'),
  '| courrier (attendu false):', vPerms.includes('manage_courriers'));

// 3. Secrétaire : création/orientation/courriers, PAS signature ni gestion courriers avancée
const sPerms = names(await get('/permissions/me', secr.token));
console.log('SECRETAIRE:', sPerms.length, '→ create:', sPerms.includes('create_dossier'),
  '| orienter:', sPerms.includes('orienter_dossier'),
  '| courrier:', sPerms.includes('manage_courriers'),
  '| signer (attendu false):', sPerms.includes('signer_dossier'));

// 4. Vérificateur Visa : traitement + soumission, PAS affectation
const aPerms = names(await get('/permissions/me', agt.token));
console.log('VERIFICATEUR_VISA:', aPerms.length, '→ traiter:', aPerms.includes('traiter_dossier'),
  '| soumettre:', aPerms.includes('soumettre_verification'),
  '| affecter (attendu false):', aPerms.includes('affecter_dossier'));

// 5. Liquidateur Pension : liquidation + dossiers meres, PAS mandatement
const lPerms = names(await get('/permissions/me', liq.token));
console.log('LIQUIDATEUR_PENSION:', lPerms.length, '→ liquider:', lPerms.includes('liquider_pension'),
  '| extraits:', lPerms.includes('gerer_dossiers_meres'),
  '| mandatement (attendu false):', lPerms.includes('preparer_mandatement'));

// 6. Workflow : transition directe INTERDITE pour les agents/sécrétaires (guard workflow v1 supprimé)
const trans = await get('/workflow/1/transition', secr.token);
console.log('workflow transition (secrétaire):', trans.status, '(attendu 403)');

// 7. Journal d'audit : 200 admin, 403 secrétaire
const aud = await get('/audit', admin.token);
const audS = await get('/audit', secr.token);
console.log('audit admin:', aud.status, '| audit secrétaire:', audS.status, '(attendu 403)');

// 8. Dossiers : liste OK pour tous ; création 403 pour secrétaire sans create_dossier
const dosS = await get('/dossiers/1', secr.token);
console.log('dossier GET (secrétaire):', dosS.status, '(attendu 200)');

// 9. Courriers : liste gated manage_courriers → admin 200 / chargé 403
const crA = await get('/courriers', admin.token);
const crL = await get('/courriers', liq.token);
console.log('courriers admin:', crA.status, '| courriers liquidateur:', crL.status, '(attendu 403)');

process.exit(0);

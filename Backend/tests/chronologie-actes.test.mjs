/* La chronologie des actes du Secrétaire, contre l'API réelle.
 *
 * Ce qui rend un registre d'actes différent d'une liste : un numéro ne revient
 * jamais, un acte annulé reste visible, et un numéro qui manque doit se voir.
 * Ces trois propriétés sont les contrôles de ce test ; le reste vérifie que le
 * registre est fermé à ceux qui n'y ont pas accès.
 *
 * Le test consomme des numéros. Il les RESTITUE à la fin : un numéro d'acte
 * consommé par un test resterait un trou au registre de l'agent, et un trou
 *.Execution dans le registre est précisément ce que le registre sert à
 * détecter. */
const base = 'http://localhost:5000/api';
import db from '../src/config/db.js';

const login = async (identifiant, motDePasse = 'Demo123!') =>
  (await (await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifiant, password: motDePasse }),
  })).json());

const g = async (token, chemin, options = {}) => {
  const r = await fetch(base + chemin, {
    method: options.method || 'GET',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return { s: r.status, b: await r.json().catch(() => null) };
};

let ko = 0;
const v = (libelle, conforme, detail = '') => {
  if (!conforme) ko++;
  console.log(`  ${conforme ? '✅' : '❌'} ${libelle}${detail ? ' — ' + detail : ''}`);
};
const attendu = async (libelle, reponse, codeAttendu) => {
  const conforme = reponse.s === codeAttendu;
  v(libelle, conforme, conforme ? String(reponse.s) : `reçu ${reponse.s} ${JSON.stringify(reponse.b)}`);
};

const secretaire = await login('secretaire@srsp.mg');
const chef = await login('chefservice@srsp.mg');
const admin = await login('admin@srsp.mg', 'Admin123!');
const agent = await login('verif.visa@srsp.mg');

const annee = new Date().getFullYear();
const aujourdhui = new Date().toISOString().slice(0, 10);

/* Les compteurs consommés par ce test, pour les lui rendre. La valeur de départ
 * est lue AVANT toute création : sans elle, le test ne saurait pas ce qu'il a
 * consommé. */
const avant = await db.query(
  `SELECT cle, valeur FROM compteurs_numerotation WHERE cle LIKE 'ACTE-%'`
);
const compteursAvant = Object.fromEntries(avant.map((l) => [l.cle, Number(l.valeur)]));

const idsCrees = [];

try {
  console.log('=== 1. Les types amorcés et le format du numéro ===');
  const types = await g(secretaire.token, '/actes/types');
  v('les types sont listés', types.s === 200 && types.b.length >= 3,
    `${types.b?.length} type(s)`);
  const id = Object.fromEntries(types.b.map((t) => [t.code, t.id]));
  v('les trois types cités par le document existent',
    Boolean(id.BON_ENTREE && id.NOTE && id.LETTRE));
  v('chaque type porte un préfixe court', types.b.every((t) => /^[A-Z]{2,10}$/.test(t.prefixe)),
    types.b.map((t) => t.prefixe).join(', '));

  const acte = async (token, corps) => g(token, '/actes', { method: 'POST', body: corps });

  const n1 = await acte(secretaire.token, { type_acte_id: id.NOTE, date_acte: aujourdhui, objet: 'Note de service un' });
  await attendu('la secrétaire enregistre une note', n1, 201);
  idsCrees.push(n1.b.id);
  v('le numéro suit {PRÉFIXE}-{ANNÉE}-{6CHIFFRES}',
    /^NOT-\d{4}-\d{6}$/.test(n1.b.numero || ''), n1.b.numero);
  v("l'acte est rattaché à son auteur",
    n1.b.created_by !== null, n1.b.auteur_nom || 'agent sans nom');

  const n2 = await acte(secretaire.token, { type_acte_id: id.NOTE, date_acte: aujourdhui, objet: 'Note de service deux' });
  idsCrees.push(n2.b.id);
  const suite = Number(String(n2.b.numero).split('-').pop());
  const premier = Number(String(n1.b.numero).split('-').pop());
  v('la numérotation est continue', suite === premier + 1, `${n1.b.numero} puis ${n2.b.numero}`);

  console.log('\n=== 2. L’année est celle de l’acte, pas celle du jour ===');
  const ancien = await acte(secretaire.token, { type_acte_id: id.NOTE, date_acte: '2025-12-31', objet: 'Note de l Exercise précédent' });
  idsCrees.push(ancien.b.id);
  v('un acte de 2025 est numéroté dans la série 2025',
    /^NOT-2025-\d{6}$/.test(ancien.b.numero || ''), ancien.b.numero);
  v('et non dans celle du jour', !ancien.b.numero.includes(String(annee)) || annee === 2025);

  console.log('\n=== 3. Un acte annulé ne libère pas son numéro ===');
  const n3 = await acte(secretaire.token, { type_acte_id: id.NOTE, date_acte: aujourdhui, objet: 'Note à annuler' });
  idsCrees.push(n3.b.id);
  const sansMotif = await g(secretaire.token, `/actes/${n3.b.id}/annuler`, { method: 'PUT', body: {} });
  await attendu("annuler sans motif est refusé", sansMotif, 400);
  const annule = await g(secretaire.token, `/actes/${n3.b.id}/annuler`, { method: 'PUT', body: { motif: 'Erreur de destinataire' } });
  await attendu("l'acte est annulé", annule, 200);
  v("l'acte annulé reste au registre", annule.b.statut === 'ANNULE', annule.b.statut);
  v('et conserve son numéro', annule.b.numero === n3.b.numero, annule.b.numero);
  const twice = await g(secretaire.token, `/actes/${n3.b.id}/annuler`, { method: 'PUT', body: { motif: 'Encore' } });
  await attendu('un acte déjà annulé ne s’annule pas deux fois', twice, 409);

  const n4 = await acte(secretaire.token, { type_acte_id: id.NOTE, date_acte: aujourdhui, objet: 'Note après annulation' });
  idsCrees.push(n4.b.id);
  const apres = Number(String(n4.b.numero).split('-').pop());
  v('le numéro annulé ne revient pas dans la file',
    apres === suite + 2, `annulé n${Number(String(n3.b.numero).split('-').pop())}, nouveau n${apres}`);

  console.log('\n=== 4. Une écriture refusée ne consomme pas de numéro ===');
  /* Un numéro consommé sans acte au registre laisse un trou, et un trou dans un
   * registre des actes se lit comme une pièce disparue. Le compteur et l'écriture
   * sont donc solidaires. */
  const avantEchec = await db.query(
    "SELECT valeur FROM compteurs_numerotation WHERE cle = ?", [`ACTE-NOT-${annee}`]
  );
  const valeurAvantEchec = Number(avantEchec[0]?.valeur || 0);
  const mauvais = await acte(secretaire.token, { type_acte_id: id.NOTE, date_acte: aujourdhui, objet: 'x', dossier_id: 999999 });
  v("un acte rattaché à un dossier inexistant est refusé", mauvais.s >= 400, `HTTP ${mauvais.s}`);
  const apresEchec = await db.query(
    "SELECT valeur FROM compteurs_numerotation WHERE cle = ?", [`ACTE-NOT-${annee}`]
  );
  v('et aucun numéro n’a été consommé',
    Number(apresEchec[0]?.valeur) === valeurAvantEchec,
    `compteur ${valeurAvantEchec} -> ${Number(apresEchec[0]?.valeur)}`);

  console.log('\n=== 5. Le registre se lit ===');
  const reg = await g(secretaire.token, `/actes/chronologie?annee=${annee}`);
  await attendu('le registre est consultable', reg, 200);
  v('il porte son année', reg.b.annee === annee, String(reg.b.annee));
  v('il énumère les familles d’actes', reg.b.familles.length >= 3,
    reg.b.familles.map((f) => `${f.prefixe}:${f.total}`).join(' '));
  const familleNote = reg.b.familles.find((f) => f.prefixe === 'NOT');
  v('la famille des notes est comptée', familleNote.total >= 3, `${familleNote.total} acte(s)`);
  v('un acte annulé ne se lit pas comme un numéro manquant', familleNote.trous.length === 0,
    familleNote.trous.length ? `trous : ${familleNote.trous.join(', ')}` : 'série continue');

  /* Un numéro réellement absent doit, lui, être signalé. La simulation est la
   * suppression d'un acte en base : c'est le cas que le registre sert à
   * démasquer — une pièce retirée de la file sans laisser de trace.
   *
   * Avancer le compteur sans acte ne conviendrait pas : ce n'est pas un trou,
   * c'est un numéro encore disponible. Confondre les deux ferait crier « pièce
   * disparue » à chaque numéro simplement non encore utilisé. */
  const numeroDisparu = Number(String(n2.b.numero).split('-').pop());
  await db.query('DELETE FROM actes WHERE id = ?', [n2.b.id]);
  const apresTrou = await g(secretaire.token, `/actes/chronologie?annee=${annee}`);
  const familleApresTrou = apresTrou.b.familles.find((f) => f.prefixe === 'NOT');
  v('un numéro réellement absent est signalé', familleApresTrou.trous.includes(numeroDisparu),
    `trous : ${familleApresTrou.trous.join(', ') || 'aucun'}`);
  v('et rien d’autre n’est signalé', familleApresTrou.trous.length === 1);

  const recherche = await g(secretaire.token, `/actes?recherche=${encodeURIComponent(n1.b.numero)}`);
  await attendu('un acte se retrouve par son numéro', recherche, 200);
  v('la recherche par numéro ramène l’acte', recherche.b.total === 1,
    `${recherche.b.total} résultat(s)`);

  const parDossier = await g(secretaire.token, '/actes?dossier_id=1');
  v('le registre se filtre par dossier', parDossier.s === 200, `HTTP ${parDossier.s}`);

  console.log('\n=== 6. Qui accède au registre ===');
  await attendu('la secrétaire y accède', await g(secretaire.token, '/actes'), 200);
  await attendu('le chef de service y accède', await g(chef.token, '/actes'), 200);
  await attendu("l'administrateur y accède", await g(admin.token, '/actes'), 200);
  await attendu('un agent sans permission en est écarté', await g(agent.token, '/actes'), 403);
  await attendu('et ne peut pas lire un acte précis', await g(agent.token, `/actes/${n1.b.id}`), 403);
  await attendu('ni le registre', await g(agent.token, '/actes/chronologie'), 403);

  console.log('\n=== 7. La nomenclature revient à l’administration ===');
  /* Ouvrir une nouvelle série de numéros est une décision d'organisation, pas
   * une saisie du quotidien. */
  const typeParSecretaire = await g(secretaire.token, '/actes/types', {
    method: 'POST', body: { code: 'CERTIFICAT_TEST', libelle: 'Certificat de test', prefixe: 'CT' },
  });
  await attendu('la secrétaire ne crée pas de type', typeParSecretaire, 403);
  const typeParAdmin = await g(admin.token, '/actes/types', {
    method: 'POST', body: { code: 'CERTIFICAT_TEST', libelle: 'Certificat de test', prefixe: 'CT' },
  });
  await attendu("l'administrateur crée un type", typeParAdmin, 201);
  const doublon = await g(admin.token, '/actes/types', {
    method: 'POST', body: { code: 'AUTRE_TEST', libelle: 'Autre', prefixe: 'CT' },
  });
  await attendu("un préfixe déjà pris est refusé", doublon, 409);

  console.log('\n=== 8. La saisie est validée ===');
  await attendu('un objet vide est refusé',
    await acte(secretaire.token, { type_acte_id: id.NOTE, date_acte: aujourdhui, objet: '' }), 400);
  await attendu('une date absente est refusée',
    await acte(secretaire.token, { type_acte_id: id.NOTE, objet: 'Sans date' }), 400);
  await attendu('un type inconnu est refusé',
    await acte(secretaire.token, { type_acte_id: 999999, date_acte: aujourdhui, objet: 'Type inconnu' }), 400);

  console.log('\n=== 9. Chaque acte est tracé ===');
  /* Le journal est contrôlé sur les actes de CE run : il en contient d'autres,
   * d'exécutions antérieures, qui n'ont pas les mêmes numéros. */
  const journal = await db.query(
    `SELECT action, details FROM historique_actions
     WHERE action IN ('ACTE_ENREGISTRE', 'ACTE_ANNULE')
       AND (details LIKE ? OR details LIKE ? OR details LIKE ?)
     ORDER BY id`,
    [`%${n1.b.numero}%`, `%${n3.b.numero}%`, `%${n4.b.numero}%`]
  );
  v('l’enregistrement est journalisé', journal.some((l) => l.action === 'ACTE_ENREGISTRE'),
    `${journal.filter((l) => l.action === 'ACTE_ENREGISTRE').length} entrée(s)`);
  v('l’annulation aussi', journal.some((l) => l.action === 'ACTE_ANNULE'));
  v('le journal porte le numéro de l’acte',
    journal.length > 0 && journal.every((l) => l.details && /NOT-\d{4}-\d{6}/.test(String(l.details))));
} finally {
  /* Restitution. Les actes créés sont supprimés dans l'ordre inverse, et les
   * compteurs remis à leur valeur de départ : un test ne doit pas laisser de
   * trace dans l'état du service. */
  for (const idActe of [...idsCrees].reverse()) {
    await db.query('DELETE FROM actes WHERE id = ?', [idActe]);
  }
  await db.query("DELETE FROM historique_actions WHERE action IN ('ACTE_ENREGISTRE', 'ACTE_ANNULE')");
  await db.query("DELETE FROM types_actes WHERE code = 'CERTIFICAT_TEST'");

  const apres = await db.query(
    `SELECT cle, valeur FROM compteurs_numerotation WHERE cle LIKE 'ACTE-%'`
  );
  const compteursApres = Object.fromEntries(apres.map((l) => [l.cle, Number(l.valeur)]));
  for (const [cle, valeur] of Object.entries(compteursAvant)) {
    if (compteursApres[cle] !== valeur) {
      await db.query(
        `INSERT INTO compteurs_numerotation (cle, valeur) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE valeur = ?`,
        [cle, valeur, valeur]
      );
    }
  }
  for (const cle of Object.keys(compteursApres)) {
    if (!(cle in compteursAvant)) await db.query('DELETE FROM compteurs_numerotation WHERE cle = ?', [cle]);
  }

  const reste = await db.query('SELECT COUNT(*) AS n FROM actes');
  console.log(`\n  restitution : ${reste[0].n} acte(s) au registre, compteurs remis à leur valeur de départ`);
}

console.log(ko === 0 ? '\nTOUT CONFORME' : `\n${ko} point(s) non conforme(s)`);
process.exit(ko === 0 ? 0 : 1);

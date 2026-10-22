/**
 * Fusionne les fiches en double d'un même compte de connexion.
 *
 * `agents.user_id` n'a jamais été unique : un compte a pu recevoir plusieurs
 * fiches. Conséquence directe : la personne apparaissait deux fois à l'écran,
 * et tout ce que l'application lit à travers cette jointure (division,
 * fonction, nom dans le journal) dépendait de la ligne que le moteur trouvait
 * en premier.
 *
 * Le code ne crée plus de doublon (`personnelService` refuse un compte déjà
 * rattaché) ; ce script répare les données déjà présentes.
 *
 * Règles de fusion, pour un compte qui porte plusieurs fiches :
 *   - la fiche conservée est la plus ancienne : c'est celle que l'application a
 *     toujours montrée, et donc celle que d'éventuelles références désignent ;
 *   - l'identité (nom, prénom) vient de la fiche la plus récente : c'est celle
 *     que l'administrateur vient de saisir ;
 *   - les autres champs (matricule, fonction, division, contact) sont pris sur
 *     la fiche la plus récente lorsqu'elle les renseigne, sinon repris tels
 *     quels de la fiche conservée : une information saisie n'est pas perdue ;
 *   - une fiche encore citée par un dossier, un traitement ou une vérification
 *     n'est jamais supprimée : le script s'arrête et le signale.
 *
 * Utilisation (depuis le dossier Backend) :
 *   node scripts/fusionner-fiches-doublons.mjs            → analyse seule
 *   node scripts/fusionner-fiches-doublons.mjs --appliquer → applique la fusion
 */
import db from '../src/config/db.js';

const APPLIQUER = process.argv.includes('--appliquer');

const titre = (t) => console.log(`\n=== ${t} ===`);

/** Comptes qui portent plus d'une fiche. */
async function comptesEnDoublon() {
  return db.query(
    `SELECT user_id, COUNT(*) AS fiches
     FROM agents
     WHERE user_id IS NOT NULL
     GROUP BY user_id
     HAVING COUNT(*) > 1
     ORDER BY user_id`
  );
}

/** Colonnes de la base qui référencent une fiche. */
async function colonnesReferencees() {
  return db.query(
    `SELECT rel.relname AS table_name, att.attname AS column_name
       FROM pg_constraint con
       JOIN pg_class rel ON rel.oid = con.conrelid
       JOIN pg_namespace n ON n.oid = rel.relnamespace
       JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
      WHERE con.contype = 'f'
        AND con.confrelid = 'agents'::regclass
        AND n.nspname = 'public'
      ORDER BY rel.relname, att.attname`
  );
}

/** Où la fiche est-elle citée ? Liste vide = supprimable. */
async function referencesDe(ficheId, colonnes) {
  const trouvees = [];
  for (const { table_name: table, column_name: colonne } of colonnes) {
    const rows = await db.query(
      `SELECT COUNT(*) AS n FROM \`${table}\` WHERE \`${colonne}\` = ?`,
      [ficheId]
    );
    if (Number(rows[0].n) > 0) trouvees.push(`${table}.${colonne} (${rows[0].n})`);
  }
  return trouvees;
}

/** Champ « renseigné » : ni null, ni chaîne vide. */
const renseigne = (v) => v !== null && v !== undefined && String(v).trim() !== '';

/**
 * Valeurs de la fiche conservée après fusion.
 * L'identité et l'état viennent de la fiche la plus récente ; les autres champs
 * ne sont repris que s'ils y sont renseignés, sinon la fiche conservée garde
 * les siens.
 */
function valeursFusionnees(garde, recente) {
  const completer = (champ) => (renseigne(recente[champ]) ? recente[champ] : garde[champ]);
  return {
    nom: recente.nom,
    prenom: recente.prenom,
    matricule: completer('matricule'),
    fonction_id: completer('fonction_id'),
    division_id: completer('division_id'),
    email: completer('email'),
    telephone: completer('telephone'),
    actif: recente.actif ?? garde.actif,
  };
}

const ligne = (f) =>
  `  #${f.id}  ${f.nom} ${f.prenom} · matricule ${f.matricule ?? '—'} · ` +
  `fonction ${f.fonction_id ?? '—'} · division ${f.division_id ?? '—'} · ` +
  `contact ${f.email ?? '—'} · actif ${f.actif}`;

async function main() {
  const doublons = await comptesEnDoublon();

  if (doublons.length === 0) {
    console.log('Aucun compte ne porte plusieurs fiches : rien à fusionner.');
    await db.pool?.end?.();
    return;
  }

  const colonnes = await colonnesReferencees();
  let fusionnees = 0;
  let bloquee = false;

  for (const { user_id: userId, fiches } of doublons) {
    titre(`Compte ${userId} — ${fiches} fiches`);
    const lignes = await db.query(
      'SELECT * FROM agents WHERE user_id = ? ORDER BY id',
      [userId]
    );
    const garde = lignes[0];
    const recente = lignes[lignes.length - 1];
    const aSupprimer = lignes.slice(1);

    console.log('Fiches trouvées :');
    lignes.forEach((f) => console.log(ligne(f)));
    console.log(`Conservée : #${garde.id} (la plus ancienne) — supprimées : ${aSupprimer.map((f) => `#${f.id}`).join(', ')}`);

    // Aucune fiche citée ne peut disparaître : une référence brisée ferait
    // perdre le lien entre un dossier et la personne qui l'a instruit.
    const cites = [];
    for (const f of aSupprimer) {
      const refs = await referencesDe(f.id, colonnes);
      if (refs.length > 0) cites.push(`#${f.id} → ${refs.join(', ')}`);
    }
    if (cites.length > 0) {
      console.log('⛔ Fusion impossible, fiches encore citées :');
      cites.forEach((c) => console.log(`   ${c}`));
      bloquee = true;
      continue;
    }

    const valeurs = valeursFusionnees(garde, recente);

    if (!APPLIQUER) {
      console.log('Aperçu (aucune écriture — relancer avec --appliquer) :');
      console.log(ligne({ ...garde, ...valeurs }));
      continue;
    }

    await db.withTransaction(async (conn) => {
      /* Les fiches en trop partent en premier : le matricule est unique en
         base, et la fiche conservée ne peut pas le reprendre tant qu'une autre
         le porte encore. La transaction rend l'ordre sans conséquence : si
         l'écriture échoue, les suppressions sont annulées avec elle. */
      for (const f of aSupprimer) {
        await conn.query('DELETE FROM agents WHERE id = ?', [f.id]);
      }
      await conn.query(
        `UPDATE agents
         SET nom = ?, prenom = ?, matricule = ?, fonction_id = ?, division_id = ?,
             email = ?, telephone = ?, actif = ?
         WHERE id = ?`,
        [
          valeurs.nom, valeurs.prenom, valeurs.matricule, valeurs.fonction_id,
          valeurs.division_id, valeurs.email, valeurs.telephone, valeurs.actif,
          garde.id,
        ]
      );
    });

    const apres = await db.query('SELECT * FROM agents WHERE user_id = ?', [userId]);
    console.log(`✔ Fusion faite — le compte ${userId} ne porte plus qu’une fiche :`);
    apres.forEach((f) => console.log(ligne(f)));
    fusionnees += 1;
  }

  titre('Bilan');
  if (APPLIQUER) {
    console.log(`${fusionnees} compte(s) fusionné(s).`);
    if (bloquee) console.log('Au moins une fusion a été refusée : voir ci-dessus.');
  } else {
    console.log('Analyse seule. Relancez avec --appliquer pour écrire.');
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Échec du script :', err.message);
    process.exit(1);
  });

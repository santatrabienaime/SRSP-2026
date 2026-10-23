/**
 * Audit des doublons de codes et des résidus de campagne.
 *
 * La base est livrée avec des index UNIQUE : deux lignes ne peuvent pas porter
 * le même code exact. Mais un code peut être dupliqué « à la casse près »
 * (`VISA` / `visa`), un libellé peut être dupliqué dans le même type, et une
 * campagne de test peut laisser des lignes derrière elle. Cet audit le dit.
 *
 * Usage (depuis Backend/) :
 *   node scripts/audit-doublons.mjs              → lecture seule, rien n'est modifié
 *   node scripts/audit-doublons.mjs --corriger   → supprime les résidus et les
 *                                                  doublons non référencés
 *
 * Le code de sortie vaut 1 si un doublon subsiste après correction : le script
 * peut donc servir de garde-fou avant une livraison.
 */
import db from '../src/config/db.js';

const CORRIGER = process.argv.includes('--corriger');

let anomalies = 0;
let corrigees = 0;
let muet = false;

const titre = (texte) => { if (!muet) console.log(`\n=== ${texte} ===`); };
const ligne = (texte) => { if (!muet) console.log(`  ${texte}`); };

/**
 * Tables dont le code doit être unique dans toute la base.
 * `sous_types_dossiers` est à part : son code est unique PAR type de dossier.
 */
const TABLES_CODE_GLOBAL = [
  'types_dossiers', 'statuts_dossiers', 'divisions', 'types_pieces',
  'antennes', 'districts', 'referentiel_postes', 'references_logiciel_secours',
  /* `mandatement_pieces` n'a pas d'identifiant : son code EST la clé primaire.
     Un doublon y est impossible par construction, l'index unique le refuse. */
];

/** Tables dont le code doit être unique à l'intérieur d'un périmètre. */
const TABLES_CODE_SCOPE = [
  { table: 'sous_types_dossiers', scope: 'type_dossier_id' },
];

/** Libellés qui doivent rester distincts à l'intérieur d'un même type. */
const TABLES_LIBELLE_SCOPE = [
  { table: 'sous_types_dossiers', scope: 'type_dossier_id', libelle: 'libelle' },
  { table: 'types_pieces', scope: 'type_dossier_id', libelle: 'libelle' },
];

/**
 * Résidus de campagne : ces codes ne sont pas des données de référence. Ils
 * sont créés par les tests de bout en bout, qui ne peuvent pas les supprimer
 * par l'API (une pièce est « désactivée », jamais effacée).
 */
const RESIDUS = [
  {
    table: 'types_pieces',
    where: "code LIKE 'PIECE_TEST_%'",
    libelle: 'pièces de test (E2E)',
    reference: { table: 'depouillements', colonne: 'piece', cible: 'code' },
  },
];

async function doublonsCode(table) {
  return db.query(
    `SELECT lower(trim(code)) AS valeur, COUNT(*) AS total,
            array_agg(id ORDER BY id) AS ids
       FROM ${table}
      GROUP BY lower(trim(code))
     HAVING COUNT(*) > 1
      ORDER BY 1`
  );
}

async function doublonsCodeScope(table, scope) {
  return db.query(
    `SELECT ${scope}, lower(trim(code)) AS valeur, COUNT(*) AS total,
            array_agg(id ORDER BY id) AS ids
       FROM ${table}
      GROUP BY ${scope}, lower(trim(code))
     HAVING COUNT(*) > 1
      ORDER BY 1, 2`
  );
}

async function doublonsLibelle(table, scope, libelle) {
  return db.query(
    `SELECT ${scope}, lower(trim(${libelle})) AS valeur, COUNT(*) AS total,
            array_agg(id ORDER BY id) AS ids
       FROM ${table}
      GROUP BY ${scope}, lower(trim(${libelle}))
     HAVING COUNT(*) > 1
      ORDER BY 1, 2`
  );
}

/** Un code est-il utilisé ailleurs ? On ne supprime que ce qui est libre. */
async function estReference(table, colonne, valeur) {
  const lignes = await db.query(
    `SELECT COUNT(*)::int AS total FROM ${table} WHERE ${colonne} = ?`,
    [valeur]
  );
  return Number(lignes[0]?.total || 0) > 0;
}

/**
 * Supprime tous les doublons d'un groupe sauf le plus ancien (le plus petit
 * identifiant). Une ligne encore référencée n'est jamais touchée : la base
 * refuserait la suppression, et une donnée référencée n'est pas un doublon
 * qu'on jette, c'est une donnée qu'on corrige.
 */
async function corrigerGroupe(table, ids, idGarde) {
  const supprimables = ids.filter((id) => Number(id) !== Number(idGarde));
  let supprimees = 0;
  for (const id of supprimables) {
    try {
      const r = await db.query(`DELETE FROM ${table} WHERE id = ?`, [id]);
      supprimees += Number(r.affectedRows || 0);
    } catch (e) {
      ligne(`  conservation de #${id} : ${e.message}`);
    }
  }
  return supprimees;
}

async function auditerCodes() {
  titre('Codes dupliqués (toutes casses, espaces ignorés)');

  for (const table of TABLES_CODE_GLOBAL) {
    const lignes = await doublonsCode(table);
    if (!lignes.length) {
      ligne(`${table} : aucun doublon`);
      continue;
    }
    for (const d of lignes) {
      anomalies += 1;
      ligne(`${table} : « ${d.valeur} » ×${d.total} (ids ${d.ids.join(', ')})`);
      if (!CORRIGER) continue;
      const restants = await corrigerGroupe(table, d.ids, d.ids[0]);
      corrigees += restants;
      ligne(`  → ${restants} doublon(s) supprimé(s)`);
    }
  }

  for (const { table, scope } of TABLES_CODE_SCOPE) {
    const lignes = await doublonsCodeScope(table, scope);
    if (!lignes.length) {
      ligne(`${table} : aucun doublon par ${scope}`);
      continue;
    }
    for (const d of lignes) {
      anomalies += 1;
      ligne(`${table} (${scope}=${d[scope]}) : « ${d.valeur} » ×${d.total} (ids ${d.ids.join(', ')})`);
      if (!CORRIGER) continue;
      const restants = await corrigerGroupe(table, d.ids, d.ids[0]);
      corrigees += restants;
      ligne(`  → ${restants} doublon(s) supprimé(s)`);
    }
  }
}

async function auditerLibelles() {
  titre('Libellés dupliqués dans un même périmètre');

  for (const { table, scope, libelle } of TABLES_LIBELLE_SCOPE) {
    const lignes = await doublonsLibelle(table, scope, libelle);
    if (!lignes.length) {
      ligne(`${table} : aucun libellé dupliqué`);
      continue;
    }
    for (const d of lignes) {
      /* Un libellé identique dans deux types différents est légitime : chaque
         type porte ses propres pièces. Seul le doublon DANS un type est
         ambigu — l'agent ne sait plus laquelle choisir. */
      anomalies += 1;
      ligne(`${table} (${scope}=${d[scope]}) : « ${d.valeur} » ×${d.total} (ids ${d.ids.join(', ')})`);
    }
  }
}

async function auditerIdentifiants() {
  titre('Identifiants et références dupliqués');

  const controles = [
    {
      label: 'emails de comptes',
      sql: `SELECT lower(trim(email)) AS valeur, COUNT(*) AS total, array_agg(id ORDER BY id) AS ids
              FROM users GROUP BY lower(trim(email)) HAVING COUNT(*) > 1`,
    },
    {
      label: 'identifiants de connexion',
      sql: `SELECT lower(trim(username)) AS valeur, COUNT(*) AS total, array_agg(id ORDER BY id) AS ids
              FROM users GROUP BY lower(trim(username)) HAVING COUNT(*) > 1`,
    },
    {
      label: 'matricules d’agents',
      sql: `SELECT lower(trim(matricule)) AS valeur, COUNT(*) AS total, array_agg(id ORDER BY id) AS ids
              FROM agents WHERE matricule IS NOT NULL AND trim(matricule) <> ''
             GROUP BY lower(trim(matricule)) HAVING COUNT(*) > 1`,
    },
    {
      label: 'numéros de dossier',
      sql: `SELECT numero AS valeur, COUNT(*) AS total, array_agg(id ORDER BY id) AS ids
              FROM dossiers GROUP BY numero HAVING COUNT(*) > 1`,
    },
    {
      label: 'références de bordereau',
      sql: `SELECT lower(trim(reference)) AS valeur, COUNT(*) AS total, array_agg(id ORDER BY id) AS ids
              FROM bordereaux WHERE reference IS NOT NULL
             GROUP BY lower(trim(reference)) HAVING COUNT(*) > 1`,
    },
    {
      label: 'références de correspondance',
      sql: `SELECT lower(trim(reference)) AS valeur, COUNT(*) AS total, array_agg(id ORDER BY id) AS ids
              FROM correspondances WHERE reference IS NOT NULL
             GROUP BY lower(trim(reference)) HAVING COUNT(*) > 1`,
    },
  ];

  for (const controle of controles) {
    const lignes = await db.query(controle.sql);
    if (!lignes.length) {
      ligne(`${controle.label} : aucun doublon`);
      continue;
    }
    for (const d of lignes) {
      anomalies += 1;
      ligne(`${controle.label} : « ${d.valeur} » ×${d.total} (ids ${d.ids.join(', ')})`);
    }
  }
}

async function auditerResidus() {
  titre('Résidus de campagne de test');

  for (const residu of RESIDUS) {
    const lignes = await db.query(
      `SELECT id, code, libelle, actif FROM ${residu.table} WHERE ${residu.where} ORDER BY id`
    );
    if (!lignes.length) {
      ligne(`${residu.libelle} : aucun résidu`);
      continue;
    }

    anomalies += 1;
    ligne(`${residu.libelle} : ${lignes.length} ligne(s) — ids ${lignes.map((l) => l.id).join(', ')}`);
    if (!CORRIGER) continue;

    /* Une ligne encore citée par un dépouillement n'est pas un résidu : c'est
       une trace de contrôle. On la laisse et on le dit. */
    if (residu.reference) {
      const codes = lignes.map((l) => `'${String(l.code).replace(/'/g, "''")}'`).join(', ');
      const referencees = await db.query(
        `SELECT DISTINCT ${residu.reference.colonne} AS valeur
           FROM ${residu.reference.table}
          WHERE ${residu.reference.colonne} IN (${codes})`
      );
      const gardes = new Set(referencees.map((r) => r.valeur));
      if (gardes.size) {
        ligne(`  conservation de ${gardes.size} code(s) référencé(s) : ${[...gardes].join(', ')}`);
      }
      const libres = lignes.filter((l) => !gardes.has(l.code));
      if (libres.length) {
        const ids = libres.map((l) => l.id);
        const r = await db.query(
          `DELETE FROM ${residu.table} WHERE id IN (${ids.map(() => '?').join(',')})`,
          ids
        );
        corrigees += Number(r.affectedRows || 0);
        ligne(`  → ${r.affectedRows || 0} ligne(s) supprimée(s)`);
      }
    } else {
      const ids = lignes.map((l) => l.id);
      const r = await db.query(
        `DELETE FROM ${residu.table} WHERE id IN (${ids.map(() => '?').join(',')})`,
        ids
      );
      corrigees += Number(r.affectedRows || 0);
      ligne(`  → ${r.affectedRows || 0} ligne(s) supprimée(s)`);
    }
  }
}

async function principal() {
  console.log('Audit des doublons — base SRSP');
  console.log(CORRIGER ? 'Mode : correction' : 'Mode : lecture seule (--corriger pour nettoyer)');

  await auditerCodes();
  await auditerLibelles();
  await auditerIdentifiants();
  await auditerResidus();
  const detectees = anomalies;

  /* Après correction, on relit : le script ne doit pas annoncer un nettoyage
     qu'il n'a pas vérifié. La relecture est muette — seul le bilan parle. */
  let restantes = detectees;
  if (CORRIGER) {
    muet = true;
    anomalies = 0;
    await auditerCodes();
    await auditerLibelles();
    await auditerIdentifiants();
    await auditerResidus();
    restantes = anomalies;
    muet = false;
  }

  titre('Bilan');
  ligne(`anomalie(s) détectée(s) : ${detectees}`);
  if (CORRIGER) {
    ligne(`ligne(s) corrigée(s) : ${corrigees}`);
    ligne(`anomalie(s) restante(s) : ${restantes}`);
  }

  /* Le code de sortie ne vaut 0 que si plus rien ne subsiste : une anomalie
     non supprimable (doublon référencé, libellé ambigu) doit faire échouer un
     enchaînement de livraison. */
  process.exitCode = restantes > 0 ? 1 : 0;

  await db.pool?.end?.();
  /* Le pool est exporté sous forme d'objet : on ferme la connexion pour que le
     script rende la main (utile enchaîné dans une campagne). */
  if (typeof db.end === 'function') await db.end();
}

principal().catch(async (e) => {
  console.error('Audit interrompu :', e.message);
  process.exitCode = 1;
  try { await db.end?.(); } catch { /* déjà fermé */ }
});

import db from '../config/db.js';

/**
 * Périmètre géographique du SRSP Fitovinany.
 *
 * Le service couvre six districts répartis sur deux antennes depuis 2022. Cette
 * dimension existait dans l'organigramme officiel et nulle part dans la
 * plateforme : un dossier ne disait pas de quel district venait le demandeur.
 *
 * Elle compte pour le traitement, pas seulement pour un tableau de bord : le
 * circuit d'un secours de décès, d'une demande de pension et d'un visa n'est pas
 * le même selon l'antenne, et le siège — Manakara depuis 2022 — détermine où
 * sont conservées les pièces et qui relève de qui.
 */

/* ------------------------------------------------------------------ */
/* Référentiel                                                         */
/* ------------------------------------------------------------------ */

export async function listerAntennes({ seulementActives = true } = {}) {
  return db.query(
    `SELECT a.*, COUNT(d.id) AS nb_districts
     FROM antennes a
     LEFT JOIN districts d ON d.antenne_id = a.id AND d.actif = 1
     ${seulementActives ? 'WHERE a.actif = 1' : ''}
     GROUP BY a.id
     ORDER BY a.siege DESC, a.libelle`
  );
}

export async function listerDistricts({ antenneId = null, seulementActifs = true } = {}) {
  const where = [];
  const params = [];
  if (antenneId) { where.push('d.antenne_id = ?'); params.push(antenneId); }
  if (seulementActifs) where.push('d.actif = 1');

  return db.query(
    `SELECT d.*, a.code AS antenne_code, a.libelle AS antenne_libelle, a.siege
     FROM districts d
     JOIN antennes a ON a.id = d.antenne_id
     ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
     ORDER BY a.siege DESC, a.libelle, d.libelle`,
    params
  );
}

/** Antenne et districts, tels que la secrétaire les choisit à la création. */
export async function referentielGeographique() {
  const [antennes, districts] = await Promise.all([listerAntennes(), listerDistricts()]);
  return {
    antennes,
    districts,
    // Rappel de terrain, pas décoratif : le siège porte l'administration.
    siege: antennes.find((a) => a.siege) || null,
  };
}

/* ------------------------------------------------------------------ */
/* Rattachement des dossiers                                            */
/* ------------------------------------------------------------------ */

/**
 * Rattache un dossier à un district.
 *
 * L'historisation est volontaire : un demandeur qui change de district reste
 * rattaché à l'antenne d'origine pour les dossiers déjà ouverts, sinon un
 * dossier de pension créé en 2023 se retrouverait àManakara après un simple
 * déplacement administratif, et l'antenne n'y serait jamais intervenue.
 *
 * L'ancienne ligne courante est marquée non courante plutôt que supprimée :
 * « quel district était le sien au moment où ce dossier a été ouvert » est une
 * question à laquelle l'historique doit pouvoir répondre.
 */
export async function rattacherDossier(dossierId, districtId, { dateRattachement = null, origine = 'SAISIE' } = {}) {
  const [district] = await db.query(
    'SELECT id, code, libelle FROM districts WHERE id = ? AND actif = 1', [districtId]
  );
  if (!district) {
    const e = new Error('District inconnu ou inactif.');
    e.status = 400;
    throw e;
  }

  // Un dossier ne peut avoir qu'un district courant : le rapport par antenne
  // compterait sinon le même dossier dans les deux antennes.
  await db.query(
    'UPDATE dossiers_districts SET courante = 0 WHERE dossier_id = ? AND courante = 1', [dossierId]
  );

  const resultat = await db.query(
    `INSERT INTO dossiers_districts (dossier_id, district_id, date_rattachement, courante, origine)
     VALUES (?, ?, COALESCE(?, CURDATE()), 1, ?)`,
    [dossierId, districtId, dateRattachement, origine]
  );
  return { id: resultat.insertId, district_id: districtId, district: district.libelle };
}

/** District actuellement applicable à un dossier, ou null. */
export async function districtCourant(dossierId) {
  const lignes = await db.query(
    `SELECT dd.dossier_id, dd.date_rattachement, dd.origine,
            d.id AS district_id, d.code AS district_code, d.libelle AS district_libelle,
            a.id AS antenne_id, a.code AS antenne_code, a.libelle AS antenne_libelle
     FROM dossiers_districts dd
     JOIN districts d ON d.id = dd.district_id
     JOIN antennes a ON a.id = d.antenne_id
     WHERE dd.dossier_id = ? AND dd.courante = 1
     LIMIT 1`,
    [dossierId]
  );
  return lignes[0] || null;
}

/**
 * Rattachements successifs d'un dossier.
 *
 * Séparé de `districtCourant` parce que ce ne sont pas les mêmes questions :
 * l'écran de saisie demande « quel district maintenant », l'historique demande
 * « par quel district est-il passé ».
 */
export async function historiqueRattachement(dossierId) {
  return db.query(
    `SELECT dd.*, d.code AS district_code, d.libelle AS district_libelle,
            a.libelle AS antenne_libelle
     FROM dossiers_districts dd
     JOIN districts d ON d.id = dd.district_id
     JOIN antennes a ON a.id = d.antenne_id
     WHERE dd.dossier_id = ?
     ORDER BY dd.date_rattachement DESC, dd.id DESC`,
    [dossierId]
  );
}

/**
 * Rattachement des dossiers d'une division, en une requête.
 *
 * Le filtre de division est fait dans la jointure et non par une sous-requête :
 * la jointure renvoie directement le district, et la division peut donc être
 * contrainte sans seconde lecture. Une division ne se restitue pas après coup.
 */
export async function dossiersParDistrict(divisionId = null) {
  const params = [];
  let where = "s.code NOT IN ('ARCHIVE')";
  if (divisionId) { where += ' AND d.division_id = ?'; params.push(divisionId); }

  return db.query(
    `SELECT
       a.id AS antenne_id, a.code AS antenne_code, a.libelle AS antenne_libelle,
       di.id AS district_id, di.code AS district_code, di.libelle AS district_libelle,
       COUNT(*) AS total_dossiers,
       SUM(CASE WHEN s.code IN ('EN_TRAITEMENT') THEN 1 ELSE 0 END) AS en_cours,
       SUM(CASE WHEN s.code NOT IN ('ARCHIVE') AND d.date_limite IS NOT NULL
                 AND d.date_limite < CURDATE() THEN 1 ELSE 0 END) AS en_retard
     FROM dossiers d
     JOIN statuts_dossiers s ON s.id = d.statut_id
     LEFT JOIN dossiers_districts dd ON dd.dossier_id = d.id AND dd.courante = 1
     LEFT JOIN districts di ON di.id = dd.district_id
     LEFT JOIN antennes a ON a.id = di.antenne_id
     WHERE ${where}
     GROUP BY a.id, a.code, a.libelle, di.id, di.code, di.libelle, a.siege
     ORDER BY a.siege DESC, a.libelle, di.libelle`,
    params
  );
}

/**
 * Synthèse par antenne, pour le tableau de bord.
 *
 * Les dossiers SANS district sont comptés à part plutôt qu'ignorés. Les perdre
 * dans la somme ferait croire que le service en a moins qu'il n'en a, et le
 * total par antenne ne correspondrait plus au nombre de dossiers.
 */
export async function syntheseParAntenne(divisionId = null) {
  const parDistrict = await dossiersParDistrict(divisionId);

  const totalGeneral = (await db.query(
    `SELECT COUNT(*) AS n FROM dossiers d
     JOIN statuts_dossiers s ON s.id = d.statut_id
     WHERE s.code <> 'ARCHIVE'${divisionId ? ' AND d.division_id = ?' : ''}`,
    divisionId ? [divisionId] : []
  ))[0].n;

  const parAntenne = new Map();
  for (const l of parDistrict) {
    if (!l.antenne_id) continue;
    if (!parAntenne.has(l.antenne_id)) {
      parAntenne.set(l.antenne_id, {
        antenne_id: l.antenne_id,
        antenne_code: l.antenne_code,
        antenne_libelle: l.antenne_libelle,
        siege: l.antenne_libelle ? undefined : undefined,
        total: 0, en_cours: 0, en_retard: 0, districts: 0,
      });
    }
    const antenne = parAntenne.get(l.antenne_id);
    antenne.total += Number(l.total_dossiers);
    antenne.en_cours += Number(l.en_cours);
    antenne.en_retard += Number(l.en_retard);
    if (l.district_id) antenne.districts += 1;
  }

  const rattaches = [...parAntenne.values()].reduce((s, a) => s + a.total, 0);

  return {
    antennes: [...parAntenne.values()],
    dossiers_rattaches: rattaches,
    dossiers_sans_district: Math.max(0, Number(totalGeneral) - rattaches),
    total: Number(totalGeneral),
  };
}

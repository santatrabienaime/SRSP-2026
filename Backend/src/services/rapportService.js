import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import db from '../config/db.js';
import { httpError } from '../utils/httpError.js';

/* ════════════════════════════════════════════════════════════════════
   CONSTANTES ET UTILITAIRES PDF/EXCEL (partagés)
   ════════════════════════════════════════════════════════════════════ */

const PDF_MARGIN = 40;
const PDF_TITLE_FONT_SIZE = 16;
const PDF_HEADER_FONT_SIZE = 10;
const PDF_ROW_FONT_SIZE = 9;

function pdfHeader(doc, titre, filtres = {}) {
  doc.fontSize(16).font('Helvetica-Bold')
     .text('SRSP Fitovinany', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(14).font('Helvetica-Bold')
     .text(titre, { align: 'center' });
  doc.moveDown(0.2);
  doc.fontSize(9).font('Helvetica')
     .text(`Généré le ${new Date().toLocaleString('fr-FR')}`, { align: 'center' });
  if (Object.keys(filtres).length) {
    doc.moveDown(0.2);
    doc.fontSize(8).font('Helvetica-Oblique')
       .text(`Filtres : ${Object.entries(filtres).map(([k,v])=>`${k}=${v}`).join(' | ')}`, { align: 'center' });
  }
  doc.moveDown(0.5);
}

function pdfTable(doc, colonnes, lignes) {
  const nbCols = colonnes.length;
  const colWidth = Math.floor(720 / colonnes.length) - 4;

  doc.fontSize(8).font('Helvetica-Bold');
  let x = 40;
  colonnes.forEach((c) => {
    doc.text(c.header, x, doc.y, { width: Math.floor(720 / colonnes.length) - 4, ellipsis: true });
    x += Math.floor(720 / colonnes.length);
  });
  doc.moveDown(0.3);

  doc.fontSize(8).font('Helvetica');
  lignes.forEach((l) => {
    if (doc.y > 750) { doc.addPage(); }
    let x = 40;
    colonnes.forEach((c) => {
      const v = l[c.key] ?? '';
      doc.text(String(v), x, doc.y, { width: Math.floor(720 / colonnes.length) - 4, ellipsis: true });
      x += Math.floor(720 / colonnes.length);
    });
    doc.moveDown(0.2);
  });
}

function excelSheet(worksheet, colonnes, lignes) {
  worksheet.columns = colonnes.map((c) => ({ header: c.header, key: c.key, width: c.width || 20 }));
  lignes.forEach((l) => worksheet.addRow(l));
}

/* ═════════════════════════════════════════════════════════════════════
   RAPPORTS ORIGINAUX (compatibilité)
   ════════════════════════════════════════════════════════════════════ */

/**
 * Génère un PDF générique (existant - 100 derniers dossiers).
 */
export async function generatePDF(res, filters = {}) {
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception,
            s.libelle AS statut, dv.nom AS division
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON d.division_id = dv.id
     ORDER BY d.date_reception DESC LIMIT 100`
  );

  const doc = new PDFDocument({ margin: 40 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=rapport.pdf');
  doc.pipe(res);

  doc.fontSize(18).text('Rapport des dossiers - SRSP Fitovinany', { align: 'center' });
  doc.moveDown();
  doc.fontSize(10).text(`Généré le : ${new Date().toLocaleString('fr-FR')}`);
  doc.moveDown();

  rows.forEach((r) => {
    doc.fontSize(10).text(
      `${r.numero} | ${r.objet} | ${r.demandeur} | ${r.date_reception?.toISOString?.().slice(0, 10) || ''} | ${r.statut} | ${r.division}`
    );
  });

  doc.end();
}

/**
 * Génère un Excel générique (existant).
 */
export async function generateExcel(res) {
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception,
            s.libelle AS statut, dv.nom AS division
     FROM dossiers d
     JOIN statuts_dossiers s ON d.statut_id = s.id
     JOIN divisions dv ON d.division_id = dv.id
     ORDER BY d.date_reception DESC`
  );

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Dossiers');
  worksheet.columns = [
    { header: 'Numéro', key: 'numero', width: 20 },
    { header: 'Objet', key: 'objet', width: 40 },
    { header: 'Demandeur', key: 'demandeur', width: 25 },
    { header: 'Date réception', key: 'date_reception', width: 15 },
    { header: 'Statut', key: 'statut', width: 20 },
    { header: 'Division', key: 'division', width: 20 },
  ];
  rows.forEach((r) => worksheet.addRow(r));

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', 'attachment; filename=rapport.xlsx');
  await workbook.xlsx.write(res);
  res.end();
}

/* ═════════════════════════════════════════════════════════════════════
   NOUVEAUX RAPPORTS SECRÉTAIRE — Cahier des charges §9
   ═════════════════════════════════════════════════════════════════════ */

/* ── 1. Rapport journalier des dossiers reçus ───────────────────────── */

export async function rapportJournalierRecus(filtres = {}) {
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.matricule, d.date_reception,
            t.libelle AS type_dossier, dv.nom AS division
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     JOIN divisions dv ON d.division_id = dv.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'RECU' AND DATE(d.date_reception) = ?
     ORDER BY d.date_reception DESC`,
    [filtres.date || new Date().toISOString().slice(0, 10)]
  );
  return { titre: `Rapport journalier des dossiers reçus — ${filtres.date || new Date().toISOString().slice(0, 10)}`, lignes: rows };
}

/* ── 2. Liste des dossiers enregistrés par période ─────────────────── */

export async function rapportDossiersPeriode(filtres = {}) {
  const where = ['1=1'];
  if (filtres.date_debut) where.push('DATE(d.date_reception) >= ?');
  if (filtres.date_fin) where.push('DATE(d.date_reception) <= ?');
  const whereSQL = where.join(' AND ');

  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.matricule, d.date_reception,
            t.libelle AS type_dossier, dv.nom AS division, s.libelle AS statut
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     JOIN divisions dv ON d.division_id = dv.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE ${whereSQL}
     ORDER BY d.date_reception DESC`,
    [filtres.date_debut, filtres.date_fin].filter(Boolean)
  );
  return { titre: `Dossiers enregistrés du ${filtres.date_debut || 'début'} au ${filtres.date_fin || 'fin'}`, lignes: rows };
}

/* ── 3. Liste des dossiers en attente de transmission ──────────────── */

export async function rapportAttenteTransmission() {
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception,
            dv.nom AS division
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     WHERE s.code = 'ORIENTE'
     ORDER BY d.date_reception ASC`
  );
  return { titre: 'Dossiers en attente de transmission (orientés)', lignes: rows };
}

/* ── 4. Liste des dossiers incomplets ──────────────────────────────── */

export async function rapportIncomplets() {
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception,
            dv.nom AS division,
            STRING_AGG(tp.libelle, ', ') AS pieces_manquantes
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     JOIN depouillements dp ON dp.dossier_id = d.id
     JOIN types_pieces tp ON tp.code = dp.piece
     WHERE dp.presente = 0 AND tp.obligatoire = 1
     GROUP BY d.id, dv.nom
     ORDER BY d.date_reception ASC`
  );
  return { titre: 'Dossiers incomplets (pièces obligatoires manquantes)', lignes: rows };
}

/* ── 5. Liste des dossiers retournés ───────────────────────────────── */

export async function rapportRetournes() {
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception,
            dv.nom AS division, ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     LEFT JOIN agents ag ON ag.id = d.agent_responsable_id
     WHERE s.code = 'CORRECTION_DEMANDEE'
     ORDER BY d.date_reception DESC`
  );
  return { titre: 'Dossiers retournés (correction demandée)', lignes: rows };
}

/* ── 6. Rapport des transmissions par division ─────────────────────── */

export async function rapportTransmissionsDivision(filtres = {}) {
  const where = ['b.statut IN (\'EMIS\',\'RECU_PAR_DIVISION\',\'ARCHIVE\')'];
  const params = [];
  if (filtres.date_debut) { where.push('DATE(b.date_transmission) >= ?'); params.push(filtres.date_debut); }
  if (filtres.date_fin) { where.push('DATE(b.date_transmission) <= ?'); params.push(filtres.date_fin); }
  const whereSQL = where.join(' AND ');

  const rows = await db.query(
    `SELECT dv.nom AS division, COUNT(DISTINCT b.id) AS nb_bordereaux,
            COUNT(bd.dossier_id) AS nb_dossiers,
            MIN(b.date_transmission) AS premiere_transmission,
            MAX(b.date_transmission) AS derniere_transmission
     FROM bordereaux b
     JOIN divisions dv ON dv.id = b.division_id
     LEFT JOIN bordereaux_dossiers bd ON bd.bordereau_id = b.id
     WHERE ${where.join(' AND ')}
     GROUP BY dv.id, dv.nom
     ORDER BY nb_dossiers DESC`,
    params
  );
  return { titre: `Transmissions par division${filtres.date_debut ? ` (du ${filtres.date_debut} au ${filtres.date_fin})` : ''}`, lignes: rows };
}

/* ── 7. Registre des courriers entrants et sortants ────────────────── */

export async function registreCourriers(filtres = {}) {
  const where = ['1=1'];
  const params = [];
  if (filtres.date_debut) { where.push('DATE(c.created_at) >= ?'); params.push(filtres.date_debut); }
  if (filtres.date_fin) { where.push('DATE(c.created_at) <= ?'); params.push(filtres.date_fin); }
  if (filtres.sens) { where.push('c.sens = ?'); params.push(filtres.sens); }
  const whereSQL = where.join(' AND ');

  const rows = await db.query(
    `SELECT c.numero, c.sens, c.type_id, tc.libelle AS type_courrier,
            c.expediteur, c.destinataire, c.objet, c.created_at,
            dv.nom AS division
     FROM courriers c
     JOIN types_courriers tc ON tc.id = c.type_id
     LEFT JOIN divisions dv ON dv.id = c.division_id
     WHERE ${where.join(' AND ')}
     ORDER BY c.created_at DESC`,
    params
  );
  return { titre: `Registre des courriers ${filtres.sens ? `(${filtres.sens})` : '(entrants et sortants)'}`, lignes: rows };
}

/* ── 8. Liste des dossiers clôturés ───────────────────────────────── */

export async function rapportClotures(filtres = {}) {
  const where = ["s.code = 'CLOTURE'"];
  if (filtres.date_debut) where.push('DATE(d.date_cloture) >= ?');
  if (filtres.date_fin) where.push('DATE(d.date_cloture) <= ?');
  const whereSQL = where.join(' AND ');

  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception, d.date_cloture,
            dv.nom AS division, ag.nom AS agent_nom, ag.prenom AS agent_prenom
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     LEFT JOIN agents ag ON ag.id = d.agent_responsable_id
     WHERE ${where.join(' AND ')}
     ORDER BY d.date_cloture DESC`,
    [filtres.date_debut, filtres.date_fin].filter(Boolean)
  );
  return { titre: `Dossiers clôturés${filtres.date_debut || filtres.date_fin ? ` (${filtres.date_debut || ''} - ${filtres.date_fin || ''})` : ''}`, lignes: rows };
}

/* ── 9. Liste des dossiers archivés ────────────────────────────────── */

export async function rapportArchives(filtres = {}) {
  const where = ['a.restaure = 0'];
  const params = [];
  if (filtres.date_debut) { where.push('DATE(a.date_archivage) >= ?'); params.push(filtres.date_debut); }
  if (filtres.date_fin) { where.push('DATE(a.date_archivage) <= ?'); params.push(filtres.date_fin); }
  const whereSQL = where.join(' AND ');

  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, a.date_archivage,
            a.reference_archivage, a.emplacement_physique, a.localisation_numerique,
            dv.nom AS division, a.archive_par
     FROM archives a
     JOIN dossiers d ON d.id = a.dossier_id
     JOIN divisions dv ON d.division_id = dv.id
     WHERE ${where.join(' AND ')}
     ORDER BY a.date_archivage DESC`,
    params
  );
  return { titre: `Dossiers archivés${filtres.date_debut || filtres.date_fin ? ` (${filtres.date_debut || ''} - ${filtres.date_fin || ''})` : ''}`, lignes: rows };
}

/* ── 10. Statistiques par type de dossier, période et division ─────── */

export async function statsParTypePeriodeDivision(filtres = {}) {
  const where = ['1=1'];
  if (filtres.date_debut) where.push('DATE(d.date_reception) >= ?');
  if (filtres.date_fin) where.push('DATE(d.date_reception) <= ?');
  const whereSQL = where.join(' AND ');
  const params = [filtres.date_debut, filtres.date_fin].filter(Boolean);

  const parType = await db.query(
    `SELECT t.libelle AS type_dossier, COUNT(*) AS total
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     WHERE ${where.join(' AND ')}
     GROUP BY t.id, t.libelle ORDER BY total DESC`,
    params
  );

  const parDivision = await db.query(
    `SELECT dv.nom AS division, COUNT(*) AS total
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     WHERE ${where.join(' AND ')}
     GROUP BY dv.id, dv.nom ORDER BY total DESC`,
    params
  );

  const parMois = await db.query(
    `SELECT TO_CHAR(d.date_reception, 'YYYY-MM') AS mois, COUNT(*) AS total
     FROM dossiers d
     WHERE ${where.join(' AND ')}
     GROUP BY mois ORDER BY mois ASC`,
    params
  );

  return { titre: 'Statistiques par type, période et division', parType, parDivision, parMois };
}

/* ═════════════════════════════════════════════════════════════════════
   RAPPORTS VISA — périodes mensuelle, trimestrielle et annuelle
   ═════════════════════════════════════════════════════════════════════ */

function deuxChiffres(n) {
  return String(n).padStart(2, '0');
}

function dernierJourDuMois(annee, mois) {
  return new Date(annee, mois, 0).getDate();
}

/**
 * Période d'un rapport VISA.
 *
 * `periode=mensuel|trimestriel|annuel` avec `annee`, `mois` ou `trimestre`.
 * Des dates explicites (`date_debut`, `date_fin`) restent prioritaires : elles
 * permettent un export libre sans perdre les rapports normalisés.
 */
export function periodeVisa(filtres = {}) {
  const annee = Number(filtres.annee) || new Date().getFullYear();
  const type = String(filtres.periode || 'annuel').toLowerCase();

  if (filtres.date_debut || filtres.date_fin) {
    return {
      debut: filtres.date_debut || `${annee}-01-01`,
      fin: filtres.date_fin || `${annee}-12-31`,
      libelle: `du ${filtres.date_debut || `${annee}-01-01`} au ${filtres.date_fin || `${annee}-12-31`}`,
      type: 'libre',
    };
  }

  if (type === 'mensuel') {
    const mois = Math.min(12, Math.max(1, Number(filtres.mois) || new Date().getMonth() + 1));
    return {
      debut: `${annee}-${deuxChiffres(mois)}-01`,
      fin: `${annee}-${deuxChiffres(mois)}-${deuxChiffres(dernierJourDuMois(annee, mois))}`,
      libelle: `mois ${deuxChiffres(mois)}/${annee}`,
      type,
    };
  }

  if (type === 'trimestriel') {
    const trimestre = Math.min(4, Math.max(1, Number(filtres.trimestre) || Math.ceil((new Date().getMonth() + 1) / 3)));
    const premierMois = (trimestre - 1) * 3 + 1;
    const dernierMois = premierMois + 2;
    return {
      debut: `${annee}-${deuxChiffres(premierMois)}-01`,
      fin: `${annee}-${deuxChiffres(dernierMois)}-${deuxChiffres(dernierJourDuMois(annee, dernierMois))}`,
      libelle: `trimestre ${trimestre}/${annee}`,
      type,
    };
  }

  return {
    debut: `${annee}-01-01`,
    fin: `${annee}-12-31`,
    libelle: `année ${annee}`,
    type: 'annuel',
  };
}

function conditionsVisa(filtres = {}) {
  const periode = periodeVisa(filtres);
  const where = [
    "t.code = 'VISA'",
    'DATE(d.date_reception) BETWEEN ? AND ?',
  ];
  const params = [periode.debut, periode.fin];

  if (filtres.verificateur_id) {
    where.push('d.verificateur_id = ?');
    params.push(Number(filtres.verificateur_id));
  }
  if (filtres.statut) {
    where.push('s.code = ?');
    params.push(String(filtres.statut).toUpperCase());
  }

  return { where, params, periode };
}

const FROM_VISA = `
  FROM dossiers d
  JOIN types_dossiers t ON t.id = d.type_id
  JOIN statuts_dossiers s ON d.statut_id = s.id
  LEFT JOIN sous_types_dossiers st ON st.id = d.sous_type_id
  LEFT JOIN agents ag ON ag.id = d.verificateur_id
  LEFT JOIN users u ON u.id = d.signataire_id
`;

export async function rapportVisa(filtres = {}) {
  const { where, params, periode } = conditionsVisa(filtres);
  const rows = await db.query(
    `SELECT d.reference_visa, d.numero, d.date_reception,
            d.origine_presentateur, d.comptable_presentateur,
            d.type_acte, d.annee_reference,
            COALESCE(st.libelle, d.type_acte) AS sous_type,
            TRIM(CONCAT(COALESCE(ag.prenom, ''), ' ', COALESCE(ag.nom, ''))) AS verificateur,
            s.libelle AS statut,
            d.date_signature, u.username AS signataire,
            DATEDIFF(COALESCE(d.date_signature, CURDATE()), d.date_reception) AS delai_jours
     ${FROM_VISA}
     WHERE ${where.join(' AND ')}
     ORDER BY d.date_reception ASC, d.numero ASC`,
    params
  );
  return {
    titre: `Dossiers VISA — ${periode.libelle}`,
    periode: periode.libelle,
    lignes: rows,
  };
}

export async function rapportVisaParVerificateur(filtres = {}) {
  const { where, params, periode } = conditionsVisa(filtres);
  const rows = await db.query(
    `SELECT TRIM(CONCAT(COALESCE(ag.prenom, ''), ' ', COALESCE(ag.nom, ''))) AS verificateur,
            COUNT(*) AS total,
            SUM(CASE WHEN s.code IN ('SIGNE', 'CLOTURE', 'ARCHIVE') THEN 1 ELSE 0 END) AS signes,
            SUM(CASE WHEN s.code = 'ARCHIVE' THEN 1 ELSE 0 END) AS archives,
            SUM(CASE WHEN s.code = 'EN_ATTENTE_COMPLEMENT' THEN 1 ELSE 0 END) AS en_attente_complement,
            ROUND(AVG(DATEDIFF(COALESCE(d.date_signature, CURDATE()), d.date_reception)), 1) AS delai_moyen_jours
     ${FROM_VISA}
     WHERE ${where.join(' AND ')}
     GROUP BY d.verificateur_id, ag.nom, ag.prenom
     ORDER BY total DESC, verificateur ASC`,
    params
  );
  return {
    titre: `Dossiers VISA par vérificateur — ${periode.libelle}`,
    periode: periode.libelle,
    lignes: rows,
  };
}


/* ═════════════════════════════════════════════════════════════════════
   RAPPORTS PAR DIVISION (§ 12.4 du cahier des fonctionnalités)
   ════════════════════════════════════════════════════════════════════ */

/** Divisions couvertes par le rapport d'opérations. */
const DIVISIONS_OPERATION = {
  SOLDE: 'SOLDE',
  PENSION: 'PENSION',
  SECOURS: 'SECOURS',
};

/**
 * Conditions de filtrage d'un rapport d'opérations.
 *
 * La période suit la même normalisation que le rapport VISA — mensuel,
 * trimestriel, annuel — pour que les deux se lisent de la même façon.
 */
function conditionsOperation(filtres = {}) {
  const periode = periodeVisa(filtres);
  const where = ['DATE(d.date_reception) BETWEEN ? AND ?'];
  const params = [periode.debut, periode.fin];

  /* Une division vide couvre les trois divisions de production : c'est
     le cas par défaut de l'écran des rapports, et un rapport qui n'en
     montrerait qu'une serait trompeur. */
  const type = String(filtres.type || filtres.division || '').toUpperCase();
  if (type) {
    if (!Object.values(DIVISIONS_OPERATION).includes(type)) {
      throw httpError(422, `Division inconnue pour le rapport d'opérations : ${type}.`);
    }
    where.push('t.code = ?');
    params.push(type);
  } else {
    where.push(`t.code IN (${Object.values(DIVISIONS_OPERATION).map(() => '?').join(', ')})`);
    params.push(...Object.values(DIVISIONS_OPERATION));
  }

  if (filtres.sous_type_id) {
    where.push('st.id = ?');
    params.push(Number(filtres.sous_type_id));
  }
  if (filtres.statut) {
    where.push('s.code = ?');
    params.push(String(filtres.statut).toUpperCase());
  }
  if (filtres.agent_id) {
    where.push('d.agent_responsable_id = ?');
    params.push(Number(filtres.agent_id));
  }

  return { where, params, periode, type };
}

/**
 * Détail, dossier par dossier, des opérations d'une division.
 *
 * Les colonnes portent ce que la division doit pouvoir suivre : l'opération,
 * le montant **saisi**, sa source, et qui l'a **validé** ou **contrôlé** —
 * ainsi que l'agent responsable.
 */
export async function rapportOperation(filtres = {}) {
  const { where, params, periode, type } = conditionsOperation(filtres);
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.matricule, d.date_reception,
            COALESCE(st.libelle, '—') AS operation,
            s.libelle AS statut,
            TRIM(CONCAT(COALESCE(ag.prenom, ''), ' ', COALESCE(ag.nom, ''))) AS responsable,
            o.reference_externe, o.reference_dossier_mere, o.periode,
            o.montant, o.source_montant,
            CASE WHEN o.valide_par IS NOT NULL THEN 'Oui' ELSE 'Non' END AS montant_valide,
            o.date_validation,
            o.decision_controle, o.date_controle,
            TRIM(CONCAT(COALESCE(ctrl.prenom, ''), ' ', COALESCE(ctrl.nom, ''))) AS controleur,
            o.destinataire, o.localisation, o.observation
     FROM dossiers d
     JOIN types_dossiers t ON t.id = d.type_id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     LEFT JOIN sous_types_dossiers st ON st.id = d.sous_type_id
     LEFT JOIN agents ag ON ag.id = d.agent_responsable_id
     LEFT JOIN donnees_operation o ON o.dossier_id = d.id
     LEFT JOIN users cu ON cu.id = o.controleur_id
     LEFT JOIN agents ctrl ON ctrl.user_id = cu.id
     WHERE ${where.join(' AND ')}
     ORDER BY st.ordre, st.libelle, d.date_reception ASC, d.numero ASC`,
    params
  );
  return {
    titre: `Opérations ${type || 'Solde, Pensions et Secours'} — ${periode.libelle}`,
    periode: periode.libelle,
    lignes: rows,
  };
}

/**
 * Agrégat par type d'opération : combien de dossiers, quels montants saisis,
 * combien validés, combien en attente de contrôle.
 *
 * C'est la lecture de pilotage d'une division : elle dit d'un coup d'œil ce
 * qui a été instruit, ce qui a été contrôlé et ce qui ne l'a pas été.
 */
export async function rapportOperationParType(filtres = {}) {
  const { where, params, periode, type } = conditionsOperation(filtres);
  const rows = await db.query(
    `SELECT COALESCE(st.libelle, '—') AS operation,
            st.code AS operation_code,
            COUNT(d.id) AS total,
            COALESCE(SUM(o.montant), 0) AS montant_saisi,
            COALESCE(SUM(CASE WHEN o.valide_par IS NOT NULL THEN o.montant ELSE 0 END), 0) AS montant_valide,
            COALESCE(SUM(CASE WHEN o.montant IS NOT NULL AND o.valide_par IS NULL THEN 1 ELSE 0 END), 0) AS en_attente_validation,
            COALESCE(SUM(CASE WHEN o.decision_controle = 'APPROUVE' THEN 1 ELSE 0 END), 0) AS controles_approuves,
            COALESCE(SUM(CASE WHEN o.decision_controle = 'RETOURNE' THEN 1 ELSE 0 END), 0) AS controles_retournes,
            COALESCE(SUM(CASE WHEN o.decision_controle IS NULL THEN 1 ELSE 0 END), 0) AS non_controls
     FROM dossiers d
     JOIN types_dossiers t ON t.id = d.type_id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     LEFT JOIN sous_types_dossiers st ON st.id = d.sous_type_id
     LEFT JOIN donnees_operation o ON o.dossier_id = d.id
     WHERE ${where.join(' AND ')}
     GROUP BY st.id, st.code, st.libelle, st.ordre
     ORDER BY st.ordre, st.libelle`,
    params
  );
  return {
    titre: `Opérations ${type || 'Solde, Pensions et Secours'} par type — ${periode.libelle}`,
    periode: periode.libelle,
    lignes: rows,
  };
}

/**
 * Secours : état d'avancement des cinq étapes du mandat.
 *
 * Le cahier (§ 12.4) demande de suivre « les dossiers reçus du contrôle
 * financier, mandatement préparé, pièces produites, émargement, signatures en
 * attente et dossiers archivés ». C'est ce que raconte ce rapport.
 */
export async function rapportSecours(filtres = {}) {
  const { where, params, periode } = conditionsOperation({ ...filtres, type: 'SECOURS' });
  const rows = await db.query(
    `SELECT d.numero, d.objet, d.demandeur, d.date_reception,
            s.libelle AS statut,
            v.numero_visa, v.date_visa,
            m.etat AS etat_mandatement,
            m.montant_total,
            CASE WHEN e.id IS NOT NULL THEN 'Oui' ELSE 'Non' END AS emargement,
            CASE WHEN so.id IS NOT NULL THEN 'Oui' ELSE 'Non' END AS signature,
            CASE WHEN c.id IS NOT NULL THEN 'Oui' ELSE 'Non' END AS cachet,
            d.date_archivage
     FROM dossiers d
     JOIN types_dossiers t ON t.id = d.type_id
     JOIN statuts_dossiers s ON d.statut_id = s.id
     LEFT JOIN visas_controle_financier v ON v.dossier_id = d.id
     LEFT JOIN mandatements m ON m.dossier_id = d.id
     LEFT JOIN etats_emargement e ON e.mandatement_id = m.id
     LEFT JOIN signatures_ordonnateur so ON so.mandatement_id = m.id
     LEFT JOIN cachets_mandatement c ON c.mandatement_id = m.id
     WHERE ${where.join(' AND ')}
     ORDER BY d.date_reception ASC, d.numero ASC`,
    params
  );
  return {
    titre: `Dossiers Secours de décès — ${periode.libelle}`,
    periode: periode.libelle,
    lignes: rows,
  };
}

/* ═════════════════════════════════════════════════════════════════════
   GÉNÉRATEURS PDF / EXCEL GÉNÉRIQUES (utilisent les utilitaires partagés)
   ════════════════════════════════════════════════════════════════════ */

const rapportsConfig = {
  journalierRecus: {
    titre: 'Rapport journalier des dossiers reçus',
    getLignes: rapportJournalierRecus,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Objet', key: 'objet', width: 180 },
      { header: 'Demandeur', key: 'demandeur', width: 140 },
      { header: 'Matricule', key: 'matricule', width: 100 },
      { header: 'Date réception', key: 'date_reception', width: 100 },
      { header: 'Type', key: 'type_dossier', width: 100 },
      { header: 'Division', key: 'division', width: 100 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 40 },
      { header: 'Demandeur', key: 'demandeur', width: 30 },
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Date réception', key: 'date_reception', width: 15 },
      { header: 'Type', key: 'type_dossier', width: 20 },
      { header: 'Division', key: 'division', width: 20 },
    ],
  },
  dossiersPeriode: {
    titre: 'Dossiers enregistrés par période',
    getLignes: rapportDossiersPeriode,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Demandeur', key: 'demandeur', width: 120 },
      { header: 'Matricule', key: 'matricule', width: 90 },
      { header: 'Date', key: 'date_reception', width: 90 },
      { header: 'Type', key: 'type_dossier', width: 90 },
      { header: 'Division', key: 'division', width: 90 },
      { header: 'Statut', key: 'statut', width: 80 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 35 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Matricule', key: 'matricule', width: 15 },
      { header: 'Date', key: 'date_reception', width: 15 },
      { header: 'Type', key: 'type_dossier', width: 20 },
      { header: 'Division', key: 'division', width: 20 },
      { header: 'Statut', key: 'statut', width: 15 },
    ],
  },
  attenteTransmission: {
    titre: 'Dossiers en attente de transmission',
    getLignes: rapportAttenteTransmission,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Objet', key: 'objet', width: 180 },
      { header: 'Demandeur', key: 'demandeur', width: 140 },
      { header: 'Date', key: 'date_reception', width: 100 },
      { header: 'Division', key: 'division', width: 100 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 35 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Date', key: 'date_reception', width: 15 },
      { header: 'Division', key: 'division', width: 20 },
    ],
  },
  incomplets: {
    titre: 'Dossiers incomplets',
    getLignes: rapportIncomplets,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Demandeur', key: 'demandeur', width: 120 },
      { header: 'Date', key: 'date_reception', width: 90 },
      { header: 'Division', key: 'division', width: 90 },
      { header: 'Pièces manquantes', key: 'pieces_manquantes', width: 150 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 35 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Date', key: 'date_reception', width: 15 },
      { header: 'Division', key: 'division', width: 20 },
      { header: 'Pièces manquantes', key: 'pieces_manquantes', width: 30 },
    ],
  },
  retournes: {
    titre: 'Dossiers retournés',
    getLignes: rapportRetournes,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Demandeur', key: 'demandeur', width: 120 },
      { header: 'Date', key: 'date_reception', width: 90 },
      { header: 'Division', key: 'division', width: 90 },
      { header: 'Agent', key: 'agent_nom', width: 100 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 35 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Date', key: 'date_reception', width: 15 },
      { header: 'Division', key: 'division', width: 20 },
      { header: 'Agent', key: 'agent_nom', width: 20 },
    ],
  },
  transmissionsDivision: {
    titre: 'Transmissions par division',
    getLignes: rapportTransmissionsDivision,
    pdfColonnes: [
      { header: 'Division', key: 'division', width: 150 },
      { header: 'Bordereaux', key: 'nb_bordereaux', width: 90 },
      { header: 'Dossiers', key: 'nb_dossiers', width: 90 },
      { header: 'Première', key: 'premiere_transmission', width: 120 },
      { header: 'Dernière', key: 'derniere_transmission', width: 120 },
    ],
    excelColonnes: [
      { header: 'Division', key: 'division', width: 25 },
      { header: 'Bordereaux', key: 'nb_bordereaux', width: 15 },
      { header: 'Dossiers', key: 'nb_dossiers', width: 15 },
      { header: 'Première', key: 'premiere_transmission', width: 20 },
      { header: 'Dernière', key: 'derniere_transmission', width: 20 },
    ],
  },
  registreCourriers: {
    titre: 'Registre des courriers',
    getLignes: registreCourriers,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Sens', key: 'sens', width: 70 },
      { header: 'Type', key: 'type_courrier', width: 90 },
      { header: 'Expéditeur', key: 'expediteur', width: 120 },
      { header: 'Destinataire', key: 'destinataire', width: 120 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Date', key: 'created_at', width: 90 },
      { header: 'Division', key: 'division', width: 90 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Sens', key: 'sens', width: 12 },
      { header: 'Type', key: 'type_courrier', width: 18 },
      { header: 'Expéditeur', key: 'expediteur', width: 25 },
      { header: 'Destinataire', key: 'destinataire', width: 25 },
      { header: 'Objet', key: 'objet', width: 30 },
      { header: 'Date', key: 'created_at', width: 15 },
      { header: 'Division', key: 'division', width: 18 },
    ],
  },
  clotures: {
    titre: 'Dossiers clôturés',
    getLignes: rapportClotures,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Demandeur', key: 'demandeur', width: 120 },
      { header: 'Réception', key: 'date_reception', width: 90 },
      { header: 'Clôture', key: 'date_cloture', width: 90 },
      { header: 'Division', key: 'division', width: 90 },
      { header: 'Agent', key: 'agent_nom', width: 100 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 35 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Réception', key: 'date_reception', width: 15 },
      { header: 'Clôture', key: 'date_cloture', width: 15 },
      { header: 'Division', key: 'division', width: 20 },
      { header: 'Agent', key: 'agent_nom', width: 20 },
    ],
  },
  archives: {
    titre: 'Dossiers archivés',
    getLignes: rapportArchives,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 100 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Demandeur', key: 'demandeur', width: 120 },
      { header: 'Archivage', key: 'date_archivage', width: 90 },
      { header: 'Référence', key: 'reference_archivage', width: 120 },
      { header: 'Emplacement', key: 'emplacement_physique', width: 120 },
      { header: 'Localisation', key: 'localisation_numerique', width: 120 },
      { header: 'Division', key: 'division', width: 90 },
      { header: 'Archivé par', key: 'archive_par', width: 90 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 35 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Archivage', key: 'date_archivage', width: 15 },
      { header: 'Référence', key: 'reference_archivage', width: 20 },
      { header: 'Emplacement', key: 'emplacement_physique', width: 20 },
      { header: 'Localisation', key: 'localisation_numerique', width: 25 },
      { header: 'Division', key: 'division', width: 18 },
      { header: 'Archivé par', key: 'archive_par', width: 18 },
    ],
  },
  visa: {
    titre: 'Dossiers VISA',
    getLignes: rapportVisa,
    pdfColonnes: [
      { header: 'Référence', key: 'reference_visa', width: 90 },
      { header: 'Réception', key: 'date_reception', width: 70 },
      { header: 'Origine', key: 'origine_presentateur', width: 100 },
      { header: 'Comptable', key: 'comptable_presentateur', width: 100 },
      { header: 'Type d’acte', key: 'sous_type', width: 90 },
      { header: 'Année', key: 'annee_reference', width: 45 },
      { header: 'Vérificateur', key: 'verificateur', width: 90 },
      { header: 'Statut', key: 'statut', width: 80 },
      { header: 'Signature', key: 'date_signature', width: 70 },
      { header: 'Signataire', key: 'signataire', width: 70 },
    ],
    excelColonnes: [
      { header: 'Référence VISA', key: 'reference_visa', width: 20 },
      { header: 'N° dossier', key: 'numero', width: 20 },
      { header: 'Date réception', key: 'date_reception', width: 15 },
      { header: 'Origine / présentateur', key: 'origine_presentateur', width: 25 },
      { header: 'Comptable présentateur', key: 'comptable_presentateur', width: 25 },
      { header: 'Type d’acte', key: 'sous_type', width: 22 },
      { header: 'Année de référence', key: 'annee_reference', width: 12 },
      { header: 'Vérificateur', key: 'verificateur', width: 22 },
      { header: 'Statut', key: 'statut', width: 22 },
      { header: 'Date signature', key: 'date_signature', width: 18 },
      { header: 'Signataire', key: 'signataire', width: 18 },
      { header: 'Délai (jours)', key: 'delai_jours', width: 12 },
    ],
  },
  visaParVerificateur: {
    titre: 'Dossiers VISA par vérificateur',
    getLignes: rapportVisaParVerificateur,
    pdfColonnes: [
      { header: 'Vérificateur', key: 'verificateur', width: 160 },
      { header: 'Total', key: 'total', width: 70 },
      { header: 'Signés', key: 'signes', width: 70 },
      { header: 'Archivés', key: 'archives', width: 70 },
      { header: 'En attente complément', key: 'en_attente_complement', width: 100 },
      { header: 'Délai moyen (j)', key: 'delai_moyen_jours', width: 100 },
    ],
    excelColonnes: [
      { header: 'Vérificateur', key: 'verificateur', width: 28 },
      { header: 'Total', key: 'total', width: 12 },
      { header: 'Signés', key: 'signes', width: 12 },
      { header: 'Archivés', key: 'archives', width: 12 },
      { header: 'En attente complément', key: 'en_attente_complement', width: 20 },
      { header: 'Délai moyen (jours)', key: 'delai_moyen_jours', width: 18 },
    ],
  },
  statsTypePeriodeDivision: {
    titre: 'Statistiques par type, période et division',
    getLignes: statsParTypePeriodeDivision,
    special: true,
  },
  /* ── Rapports par division (§ 12.4) ────────────────────────────── */
  operationDivision: {
    titre: 'Opérations par division',
    getLignes: rapportOperation,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 90 },
      { header: 'Opération', key: 'operation', width: 120 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Demandeur', key: 'demandeur', width: 120 },
      { header: 'Référence', key: 'reference_externe', width: 100 },
      { header: 'Période', key: 'periode', width: 80 },
      { header: 'Montant', key: 'montant', width: 90 },
      { header: 'Validé', key: 'montant_valide', width: 60 },
      { header: 'Décision', key: 'decision_controle', width: 80 },
      { header: 'Statut', key: 'statut', width: 90 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Opération', key: 'operation', width: 25 },
      { header: 'Objet', key: 'objet', width: 40 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Référence', key: 'reference_externe', width: 20 },
      { header: 'Dossier mère', key: 'reference_dossier_mere', width: 20 },
      { header: 'Période', key: 'periode', width: 15 },
      { header: 'Montant', key: 'montant', width: 15 },
      { header: 'Source du montant', key: 'source_montant', width: 30 },
      { header: 'Montant validé', key: 'montant_valide', width: 15 },
      { header: 'Date de validation', key: 'date_validation', width: 18 },
      { header: 'Décision de contrôle', key: 'decision_controle', width: 20 },
      { header: 'Date de contrôle', key: 'date_controle', width: 18 },
      { header: 'Contrôleur', key: 'controleur', width: 22 },
      { header: 'Responsable', key: 'responsable', width: 22 },
      { header: 'Statut', key: 'statut', width: 20 },
    ],
  },
  operationParType: {
    titre: 'Opérations par division et par type',
    getLignes: rapportOperationParType,
    pdfColonnes: [
      { header: 'Opération', key: 'operation', width: 160 },
      { header: 'Dossiers', key: 'total', width: 70 },
      { header: 'Montant saisi', key: 'montant_saisi', width: 100 },
      { header: 'Montant validé', key: 'montant_valide', width: 100 },
      { header: 'En attente de validation', key: 'en_attente_validation', width: 110 },
      { header: 'Contrôles approuvés', key: 'controles_approuves', width: 100 },
      { header: 'Retournés', key: 'controles_retournes', width: 80 },
      { header: 'Non contrôlés', key: 'non_controls', width: 90 },
    ],
    excelColonnes: [
      { header: 'Opération', key: 'operation', width: 30 },
      { header: 'Dossiers', key: 'total', width: 12 },
      { header: 'Montant saisi', key: 'montant_saisi', width: 18 },
      { header: 'Montant validé', key: 'montant_valide', width: 18 },
      { header: 'En attente de validation', key: 'en_attente_validation', width: 22 },
      { header: 'Contrôles approuvés', key: 'controles_approuves', width: 20 },
      { header: 'Contrôles retournés', key: 'controles_retournes', width: 20 },
      { header: 'Non contrôlés', key: 'non_controls', width: 16 },
    ],
  },
  secours: {
    titre: 'Suivi des dossiers Secours de décès',
    getLignes: rapportSecours,
    pdfColonnes: [
      { header: 'N°', key: 'numero', width: 90 },
      { header: 'Objet', key: 'objet', width: 150 },
      { header: 'Demandeur', key: 'demandeur', width: 120 },
      { header: 'N° visa', key: 'numero_visa', width: 90 },
      { header: 'Mandatement', key: 'etat_mandatement', width: 90 },
      { header: 'Émargement', key: 'emargement', width: 70 },
      { header: 'Signature', key: 'signature', width: 70 },
      { header: 'Cachet', key: 'cachet', width: 60 },
      { header: 'Statut', key: 'statut', width: 90 },
    ],
    excelColonnes: [
      { header: 'N°', key: 'numero', width: 20 },
      { header: 'Objet', key: 'objet', width: 40 },
      { header: 'Demandeur', key: 'demandeur', width: 25 },
      { header: 'Date de réception', key: 'date_reception', width: 18 },
      { header: 'N° visa', key: 'numero_visa', width: 18 },
      { header: 'Date du visa', key: 'date_visa', width: 15 },
      { header: 'État du mandatement', key: 'etat_mandatement', width: 20 },
      { header: 'Montant total', key: 'montant_total', width: 15 },
      { header: 'Émargement', key: 'emargement', width: 12 },
      { header: 'Signature', key: 'signature', width: 12 },
      { header: 'Cachet', key: 'cachet', width: 10 },
      { header: 'Date d\'archivage', key: 'date_archivage', width: 18 },
      { header: 'Statut', key: 'statut', width: 20 },
    ],
  },
};

/* ── Générateurs PDF/Excel génériques ──────────────────────────────── */

function makePdfGenerator(cfg, filtresParDefaut = {}) {
  return async function(res, filtresAppel = {}) {
    const filtres = { ...filtresParDefaut, ...filtresAppel };
    const { lignes } = await cfg.getLignes(filtres);
    const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cfg.titre.toLowerCase().replace(/\s+/g,'-')}.pdf"`);
    doc.pipe(res);
    pdfHeader(doc, cfg.titre, filtres);
    pdfTable(doc, cfg.pdfColonnes, lignes);
    doc.end();
  };
}

/**
 * Le nom d'un onglet Excel ne peut pas dépasser 31 caractères.
 *
 * Excel tronque silencieusement un nom trop long, et le tronque au milieu
 * d'un mot : « Rapport journalier des dossiers reçus » devient « Rapport
 * journalier des dos… ». Ce n'est pas cassé, mais c'est illisible — et
 * deux onglets tronqués au même endroit feraient échouer le fichier.
 *
 * On raccourcit donc proprement, sur une frontière de mot, et on garantit
 * l'unicité du nom.
 */
const MAX_NOM_FEUILLE = 31;

function nomFeuille(titre, pris = []) {
  let nom = String(titre || 'Feuille').trim();

  if (nom.length > MAX_NOM_FEUILLE) {
    nom = nom.slice(0, MAX_NOM_FEUILLE);
    /* On recule jusqu'à un espace : un nom coupé au milieu d'un mot se lit
       mal dans l'onglet. */
    const dernierEspace = nom.lastIndexOf(' ');
    if (dernierEspace > 0) nom = nom.slice(0, dernierEspace);
  }

  let candidat = nom;
  let suffixe = 2;
  while (pris.includes(candidat.toLowerCase())) {
    const marque = ` (${suffixe})`;
    candidat = `${nom.slice(0, MAX_NOM_FEUILLE - marque.length)}${marque}`;
    suffixe += 1;
  }
  return candidat;
}

function makeExcelGenerator(cfg, filtresParDefaut = {}) {
  return async function(res, filtresAppel = {}) {
    const filtres = { ...filtresParDefaut, ...filtresAppel };
    const { lignes } = await cfg.getLignes(filtres);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(
      nomFeuille(cfg.titre, workbook.worksheets.map((w) => w.name))
    );
    excelSheet(worksheet, cfg.excelColonnes, lignes);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${cfg.titre.toLowerCase().replace(/\s+/g,'-')}.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  };
}

/* ─── Générateurs PDF/EXCEL PAR RAPPORT ────────────────────────────── */

// 1. Journalier reçus
export const pdfJournalierRecus = makePdfGenerator(rapportsConfig.journalierRecus);
export const excelJournalierRecus = makeExcelGenerator(rapportsConfig.journalierRecus);

// 2. Dossiers par période
export const pdfDossiersPeriode = makePdfGenerator(rapportsConfig.dossiersPeriode);
export const excelDossiersPeriode = makeExcelGenerator(rapportsConfig.dossiersPeriode);

// 3. Attente transmission
export const pdfAttenteTransmission = makePdfGenerator(rapportsConfig.attenteTransmission);
export const excelAttenteTransmission = makeExcelGenerator(rapportsConfig.attenteTransmission);

// 4. Incomplets
export const pdfIncomplets = makePdfGenerator(rapportsConfig.incomplets);
export const excelIncomplets = makeExcelGenerator(rapportsConfig.incomplets);

// 5. Retournés
export const pdfRetournes = makePdfGenerator(rapportsConfig.retournes);
export const excelRetournes = makeExcelGenerator(rapportsConfig.retournes);

// 6. Transmissions par division
export const pdfTransmissionsDivision = makePdfGenerator(rapportsConfig.transmissionsDivision);
export const excelTransmissionsDivision = makeExcelGenerator(rapportsConfig.transmissionsDivision);

// 7. Registre courriers
export const pdfRegistreCourriers = makePdfGenerator(rapportsConfig.registreCourriers);
export const excelRegistreCourriers = makeExcelGenerator(rapportsConfig.registreCourriers);

// 8. Clôtures
export const pdfClotures = makePdfGenerator(rapportsConfig.clotures);
export const excelClotures = makeExcelGenerator(rapportsConfig.clotures);

// 9. Archives
export const pdfArchives = makePdfGenerator(rapportsConfig.archives);
export const excelArchives = makeExcelGenerator(rapportsConfig.archives);

// 11. Dossiers VISA (mensuel / trimestriel / annuel)
export const pdfVisa = makePdfGenerator(rapportsConfig.visa);
export const excelVisa = makeExcelGenerator(rapportsConfig.visa);

// 12. Dossiers VISA par vérificateur
export const pdfVisaParVerificateur = makePdfGenerator(rapportsConfig.visaParVerificateur);
export const excelVisaParVerificateur = makeExcelGenerator(rapportsConfig.visaParVerificateur);

// 12. Opérations par division
export const pdfOperationDivision = makePdfGenerator(rapportsConfig.operationDivision);
export const excelOperationDivision = makeExcelGenerator(rapportsConfig.operationDivision);

// 13. Opérations par division et par type
export const pdfOperationParType = makePdfGenerator(rapportsConfig.operationParType);
export const excelOperationParType = makeExcelGenerator(rapportsConfig.operationParType);

// 14. Suivi des dossiers Secours de décès
export const pdfSecours = makePdfGenerator(rapportsConfig.secours);
export const excelSecours = makeExcelGenerator(rapportsConfig.secours);

// 10. Stats par type/période/division (structure spéciale)
export async function pdfStatsParTypePeriodeDivision(res, filtres = {}) {  const data = await statsParTypePeriodeDivision(filtres);
  const doc = new PDFDocument({ margin: 40, layout: 'landscape' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="stats-type-periode-division.pdf"`);
  doc.pipe(res);
  pdfHeader(doc, 'Statistiques par type, période et division', filtres);

  // Tableau par type
  doc.fontSize(12).font('Helvetica-Bold').text('Par type de dossier');
  doc.moveDown(0.3);
  pdfTable(doc, [
    { header: 'Type de dossier', key: 'type_dossier', width: 300 },
    { header: 'Total', key: 'total', width: 100 },
  ], data.parType);
  doc.moveDown(1);

  // Par division
  doc.fontSize(12).font('Helvetica-Bold').text('Par division');
  doc.moveDown(0.3);
  pdfTable(doc, [
    { header: 'Division', key: 'division', width: 300 },
    { header: 'Total', key: 'total', width: 100 },
  ], data.parDivision);
  doc.moveDown(1);

  // Par mois
  doc.fontSize(12).font('Helvetica-Bold').text('Par mois');
  doc.moveDown(0.3);
  pdfTable(doc, [
    { header: 'Mois', key: 'mois', width: 200 },
    { header: 'Total', key: 'total', width: 100 },
  ], data.parMois);

  doc.end();
}

export async function excelStatsParTypePeriodeDivision(res, filtres = {}) {
  const data = await statsParTypePeriodeDivision(filtres);
  const workbook = new ExcelJS.Workbook();
  
  const ws1 = workbook.addWorksheet('Par type');
  excelSheet(ws1, [
    { header: 'Type de dossier', key: 'type_dossier', width: 35 },
    { header: 'Total', key: 'total', width: 15 },
  ], data.parType);

  const ws2 = workbook.addWorksheet('Par division');
  excelSheet(ws2, [
    { header: 'Division', key: 'division', width: 30 },
    { header: 'Total', key: 'total', width: 15 },
  ], data.parDivision);

  const ws3 = workbook.addWorksheet('Par mois');
  excelSheet(ws3, [
    { header: 'Mois', key: 'mois', width: 20 },
    { header: 'Total', key: 'total', width: 15 },
  ], data.parMois);

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="stats-type-periode-division.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
}
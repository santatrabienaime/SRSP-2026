import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import db from '../config/db.js';

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
            GROUP_CONCAT(tp.libelle SEPARATOR ', ') AS pieces_manquantes
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     JOIN depouillements dp ON dp.dossier_id = d.id
     JOIN types_pieces tp ON tp.code = dp.piece
     WHERE dp.presente = 0 AND tp.obligatoire = 1
     GROUP BY d.id
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
  const where = ['a.restaure = FALSE'];
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

  const parType = await db.query(
    `SELECT t.libelle AS type_dossier, COUNT(*) AS total
     FROM dossiers d
     JOIN types_dossiers t ON d.type_id = t.id
     WHERE ${where.join(' AND ')}
     GROUP BY t.id, t.libelle ORDER BY total DESC`,
    []
  );

  const parDivision = await db.query(
    `SELECT dv.nom AS division, COUNT(*) AS total
     FROM dossiers d
     JOIN divisions dv ON d.division_id = dv.id
     WHERE ${where.join(' AND ')}
     GROUP BY dv.id, dv.nom ORDER BY total DESC`,
    []
  );

  const parMois = await db.query(
    `SELECT DATE_FORMAT(d.date_reception, '%Y-%m') AS mois, COUNT(*) AS total
     FROM dossiers d
     WHERE ${where.join(' AND ')}
     GROUP BY mois ORDER BY mois ASC`,
    []
  );

  return { titre: 'Statistiques par type, période et division', parType, parDivision, parMois };
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
  statsTypePeriodeDivision: {
    titre: 'Statistiques par type, période et division',
    getLignes: statsParTypePeriodeDivision,
    special: true,
  },
};

/* ── Générateurs PDF/Excel génériques ──────────────────────────────── */

function makePdfGenerator(cfg, filtres = {}) {
  return async function(res) {
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

function makeExcelGenerator(cfg, filtres = {}) {
  return async function(res) {
    const { lignes } = await cfg.getLignes(filtres);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(cfg.titre);
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

// 10. Stats par type/période/division (structure spéciale)
export async function pdfStatsParTypePeriodeDivision(res, filtres = {}) {
  const data = await statsParTypePeriodeDivision(filtres);
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
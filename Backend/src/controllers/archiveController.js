import * as service from '../services/archiveService.js';
import { LIBELLES_TRIS } from '../models/archiveModel.js';
import { httpError } from '../utils/httpError.js';

/** Listes les tris disponibles (le client n'invente pas ses propres colonnes). */
export function tris(req, res, next) {
  try {
    res.json({ tris: LIBELLES_TRIS });
  } catch (e) { next(e); }
}

export async function lister(req, res, next) {
  try {
    res.json(await service.lister(req.user.id, req.query));
  } catch (e) { next(e); }
}

export async function detail(req, res, next) {
  try {
    res.json(await service.detail(req.user.id, req.params.id));
  } catch (e) { next(e); }
}

export async function statistiques(req, res, next) {
  try {
    res.json(await service.statistiques(req.user.id, req.query));
  } catch (e) { next(e); }
}

export async function alertes(req, res, next) {
  try {
    res.json({ alertes: await service.alertes(req.user.id, req.query) });
  } catch (e) { next(e); }
}

export async function restaurer(req, res, next) {
  try {
    const resultat = await service.restaurer(req.user.id, req.params.id, req.body?.motif);
    res.json({ message: 'Dossier restauré.', ...resultat });
  } catch (e) { next(e); }
}

/* ------------------------------------------------------------------ */
/* Exports                                                             */
/* ------------------------------------------------------------------ */

const COLONNES = [
  { cle: 'numero', titre: 'N° dossier' },
  { cle: 'type_libelle', titre: 'Type' },
  { cle: 'division_nom', titre: 'Division' },
  { cle: 'objet', titre: 'Objet' },
  { cle: 'demandeur', titre: 'Demandeur' },
  { cle: 'matricule', titre: 'CIN' },
  { cle: 'date_reception', titre: 'Réception' },
  { cle: 'date_cloture', titre: 'Clôture' },
  { cle: 'date_archivage', titre: 'Archivage' },
  { cle: 'agent', titre: 'Agent responsable' },
  { cle: 'priorite_libelle', titre: 'Priorité' },
  { cle: 'statut', titre: 'Statut' },
];

const valeur = (ligne, cle) => {
  if (cle === 'agent') {
    return [ligne.agent_nom, ligne.agent_prenom].filter(Boolean).join(' ') || '';
  }
  if (cle === 'statut') return 'ARCHIVE';
  const v = ligne[cle];
  if (v === null || v === undefined) return '';
  return String(v);
};

const dateISO = (v) => (v ? String(v).slice(0, 10) : '');

const nomFichier = (extension) =>
  `archives-srsp-${new Date().toISOString().slice(0, 10)}.${extension}`;

/** Export CSV : séparateur point-virgule, décimale virgule (usage FR). */
export async function exportCsv(req, res, next) {
  try {
    const { lignes } = await service.lignesPourExport(req.user.id, req.query);
    const echapper = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const lignesCsv = [
      COLONNES.map((c) => echapper(c.titre)).join(';'),
      ...lignes.map((l) =>
        COLONNES.map((c) => {
          const v = valeur(l, c.cle);
          return echapper(['date_reception', 'date_cloture', 'date_archivage'].includes(c.cle) ? dateISO(v) : v);
        }).join(';')
      ),
    ];
    // BOM UTF-8 : sans lui, Excel affiche mal les accents.
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier('csv')}"`);
    res.send('﻿' + lignesCsv.join('\r\n'));
  } catch (e) { next(e); }
}

/** Export Excel (.xlsx). */
export async function exportExcel(req, res, next) {
  try {
    const ExcelJS = (await import('exceljs')).default;
    const { lignes } = await service.lignesPourExport(req.user.id, req.query);

    const classeur = new ExcelJS.Workbook();
    classeur.creator = 'SRSP Fitovinany';
    classeur.created = new Date();
    const feuille = classeur.addWorksheet('Archives');

    feuille.columns = COLONNES.map((c) => ({
      header: c.titre,
      key: c.cle,
      width: Math.max(12, c.titre.length + 2),
    }));
    feuille.getRow(1).font = { bold: true };
    feuille.getRow(1).fill = {
      type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' },
    };
    feuille.views = [{ state: 'frozen', ySplit: 1 }];

    for (const l of lignes) {
      const ligne = {};
      for (const c of COLONNES) {
        const v = valeur(l, c.cle);
        ligne[c.cle] = ['date_reception', 'date_cloture', 'date_archivage'].includes(c.cle)
          ? dateISO(v)
          : v;
      }
      feuille.addRow(ligne);
    }
    feuille.autoFilter = { from: 'A1', to: { row: 1, column: COLONNES.length } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier('xlsx')}"`);
    await classeur.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
}

/** Export PDF, paysage, avec un en-tête d'identification. */
export async function exportPdf(req, res, next) {
  try {
    const PDFDocument = (await import('pdfkit')).default;
    const { lignes } = await service.lignesPourExport(req.user.id, req.query);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${nomFichier('pdf')}"`);

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
    doc.pipe(res);

    doc.fontSize(13).text('République de Madagascar');
    doc.fontSize(9).text('Ministère de l\'Économie et des Finances');
    doc.fontSize(9).text('Service Régional de la Solde et des Pensions Fitovinany');
    doc.moveDown(0.3);
    doc.fontSize(12).text('Liste des dossiers archivés');
    doc.fontSize(8).text(
      `Édité le ${new Date().toLocaleDateString('fr-FR')} — ${lignes.length} dossier(s)`
    );
    doc.moveDown(0.8);

    // Colonnes resserrées pour tenir en paysage.
    const largeurs = [95, 55, 60, 130, 100, 80, 62, 62, 62, 95, 55, 50];
    const headers = ['N° dossier', 'Type', 'Division', 'Objet', 'Demandeur', 'CIN', 'Réception', 'Clôture', 'Archivage', 'Agent', 'Priorité', 'Statut'];

    const enTete = () => {
      const y = doc.y;
      doc.rect(30, y - 3, 806, 14).fill('#EFF6FF');
      let x = 30;
      doc.fontSize(7).fillColor('#0F172A');
      headers.forEach((h, i) => { doc.text(h, x + 2, y, { width: largeurs[i] - 4 }); x += largeurs[i]; });
      doc.y = y + 14;
      doc.fillColor('#000000');
    };
    enTete();

    doc.fontSize(7);
    for (const l of lignes) {
      if (doc.y > 545) { doc.addPage(); enTete(); doc.fontSize(7); }
      const y = doc.y;
      let x = 30;
      COLONNES.forEach((c, i) => {
        const v = valeur(l, c.cle);
        const affichable = c.cle.startsWith('date_') ? dateISO(v) : v;
        doc.text(String(affichable), x + 2, y, {
          width: largeurs[i] - 4, ellipsis: true, lineBreak: false,
        });
        x += largeurs[i];
      });
      doc.y = y + 11;
    }

    doc.end();
  } catch (e) {
    if (!res.headersSent) next(e);
    else next(httpError(500, 'Export PDF impossible.'));
  }
}

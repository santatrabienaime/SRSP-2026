import * as service from '../services/historiqueService.js';
import { LIBELLES_ACTIONS } from '../utils/libellesActions.js';

/**
 * Journal des actions.
 *
 * La réponse est un ENVELOPPE `{ actions, total, tronque }` et non un tableau
 * nu : un tableau ne peut pas porter le nombre total d'événements alors que
 * seul un sous-ensemble est renvoyé, et l'utilisateur croirait avoir tout vu.
 */

export async function list(req, res, next) {
  try {
    res.json(await service.getHistorique(req.user.id, req.query));
  } catch (e) { next(e); }
}

/** Types d'actions présents au journal, pour les listes de filtrage. */
export async function actions(req, res, next) {
  try {
    res.json({ actions: await service.getActions(req.user.id) });
  } catch (e) { next(e); }
}

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */

const COLONNES = [
  { cle: 'date', titre: 'Date' },
  { cle: 'heure', titre: 'Heure' },
  { cle: 'action', titre: 'Action' },
  { cle: 'agent', titre: 'Agent' },
  { cle: 'role', titre: 'Rôle' },
  { cle: 'dossier', titre: 'N° dossier' },
  { cle: 'detail', titre: 'Détail' },
  { cle: 'ip', titre: 'Adresse IP' },
];

/** Découpe l'horodatage en date et heure : le document les veut séparés. */
function parties(horodatage) {
  const d = new Date(horodatage);
  const p = (n) => String(n).padStart(2, '0');
  if (Number.isNaN(d.getTime())) return { date: '', heure: '' };
  return {
    date: `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()}`,
    heure: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`,
  };
}

const valeur = (action, cle) => {
  switch (cle) {
    case 'date': return parties(action.date_action).date;
    case 'heure': return parties(action.date_action).heure;
    case 'action': return LIBELLES_ACTIONS[action.action] || action.action;
    case 'agent': return action.agent.identite;
    case 'role': return action.role ? action.role.libelle : '—';
    case 'dossier': return action.dossier_numero || '—';
    case 'detail': return action.details || '—';
    case 'ip': return action.ip_address || '—';
    default: return '';
  }
};

/**
 * L'export porte sur TOUS les événements correspondant aux filtres, pas sur
 * la seule page affichée : on exporte un journal pour l'auditer, et un export
 * tronqué aux lignes vues à l'écran n'aurait aucun sens.
 */
async function lignesPourExport(req) {
  const { actions } = await service.getHistorique(req.user.id, { ...req.query, limit: 5000 });
  return actions;
}

const nomFichier = (extension) =>
  `historique-srsp-${new Date().toISOString().slice(0, 10)}.${extension}`;

export async function exportCsv(req, res, next) {
  try {
    const lignes = await lignesPourExport(req);
    const echapper = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const corps = [
      COLONNES.map((c) => echapper(c.titre)).join(';'),
      ...lignes.map((a) => COLONNES.map((c) => echapper(valeur(a, c.cle))).join(';')),
    ];
    // BOM UTF-8 : sans lui, Excel affiche mal les accents.
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier('csv')}"`);
    res.send('﻿' + corps.join('\r\n'));
  } catch (e) { next(e); }
}

export async function exportExcel(req, res, next) {
  try {
    const ExcelJS = (await import('exceljs')).default;
    const lignes = await lignesPourExport(req);

    const classeur = new ExcelJS.Workbook();
    classeur.creator = 'SRSP Fitovinany';
    classeur.created = new Date();
    const feuille = classeur.addWorksheet('Historique');
    feuille.columns = COLONNES.map((c) => ({ header: c.titre, key: c.cle, width: Math.max(12, c.titre.length + 4) }));
    feuille.getRow(1).font = { bold: true };
    feuille.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEFF6FF' } };
    feuille.views = [{ state: 'frozen', ySplit: 1 }];
    for (const a of lignes) {
      const ligne = {};
      for (const c of COLONNES) ligne[c.cle] = valeur(a, c.cle);
      // Un événement sans auteur est surligné : il doit se voir dans le
      // document exporté, pas se confondre avec une saisie normale.
      if (a.agent.systeme) {
        feuille.addRow(ligne).font = { color: { argb: 'FFB45309' } };
      } else {
        feuille.addRow(ligne);
      }
    }
    feuille.autoFilter = { from: 'A1', to: { row: 1, column: COLONNES.length } };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${nomFichier('xlsx')}"`);
    await classeur.xlsx.write(res);
    res.end();
  } catch (e) { next(e); }
}

export async function exportPdf(req, res, next) {
  try {
    const PDFDocument = (await import('pdfkit')).default;
    const lignes = await lignesPourExport(req);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${nomFichier('pdf')}"`);

    const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 30 });
    doc.pipe(res);

    doc.fontSize(13).text('République de Madagascar');
    doc.fontSize(9).text("Ministère de l'Économie et des Finances");
    doc.fontSize(9).text('Service Régional de la Solde et des Pensions Fitovinany');
    doc.moveDown(0.3);
    doc.fontSize(12).text('Journal des actions');
    doc.fontSize(8).text(`Édité le ${new Date().toLocaleDateString('fr-FR')} — ${lignes.length} action(s)`);
    doc.moveDown(0.8);

    const largeurs = [58, 52, 108, 100, 105, 82, 190, 85];
    const enTete = () => {
      const y = doc.y;
      doc.rect(30, y - 3, 806, 14).fill('#EFF6FF');
      let x = 30;
      doc.fontSize(7).fillColor('#0F172A');
      COLONNES.forEach((c, i) => { doc.text(c.titre, x + 2, y, { width: largeurs[i] - 4 }); x += largeurs[i]; });
      doc.y = y + 14;
      doc.fillColor('#000000');
    };
    enTete();

    doc.fontSize(7);
    for (const a of lignes) {
      if (doc.y > 545) { doc.addPage(); enTete(); doc.fontSize(7); }
      const y = doc.y;
      let x = 30;
      COLONNES.forEach((c, i) => {
        // Un événement sans auteur est imprimé en ambre : l'anomalie doit
        // sauter aux yeux du lecteur qui audite le document.
        doc.fillColor(a.agent.systeme ? '#B45309' : '#000000');
        doc.text(String(valeur(a, c.cle)), x + 2, y, { width: largeurs[i] - 4, ellipsis: true, lineBreak: false });
        x += largeurs[i];
      });
      doc.fillColor('#000000');
      doc.y = y + 11;
    }

    doc.end();
  } catch (e) {
    /* `doc.pipe(res)` envoie les en-têtes dès la première écriture : passé ce
       point,On ne peut plus renvoyer une réponse d'erreur structurée, et
       insister provoquerait ERR_HTTP_HEADERS_SENT. On coupe donc le flux et on
       laisse une trace serveur ; l'utilisateur verra un PDF tronqué, ce qui
       vaut mieux qu'une promesse d'erreur qui n'arrive jamais. */
    if (res.headersSent) {
      console.error('[historique] export PDF interrompu :', e.message);
      try { doc.end(); } catch { /* flux déjà fermé */ }
      return;
    }
    next(e);
  }
}

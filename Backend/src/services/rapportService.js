import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import db from '../config/db.js';

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
import PDFDocument from 'pdfkit';

export function createPDF(res, filename, title) {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  doc.pipe(res);

  doc.fontSize(20).fillColor('#1e40af').text('SRSP Fitovinany', { align: 'center' });
  doc.moveDown(0.3);
  doc.fontSize(12).fillColor('#000').text(title, { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor('#555').text(`Généré le : ${new Date().toLocaleString('fr-FR')}`, { align: 'right' });
  doc.moveDown(1);
  doc.moveTo(40, doc.y).lineTo(555, doc.y).strokeColor('#ccc').stroke();
  doc.moveDown(0.5);

  return doc;
}

export function addTableRow(doc, columns, widths) {
  const startY = doc.y;
  let x = 40;
  doc.fontSize(9).fillColor('#000');
  columns.forEach((col, i) => {
    doc.text(String(col ?? ''), x, startY, { width: widths[i], continued: false });
    x += widths[i];
  });
  doc.moveDown(0.3);
}

export function addHeaderRow(doc, columns, widths) {
  const startY = doc.y;
  let x = 40;
  doc.fontSize(10).fillColor('#1e40af').font('Helvetica-Bold');
  columns.forEach((col, i) => {
    doc.text(col, x, startY, { width: widths[i] });
    x += widths[i];
  });
  doc.font('Helvetica').fillColor('#000');
  doc.moveDown(0.4);
}
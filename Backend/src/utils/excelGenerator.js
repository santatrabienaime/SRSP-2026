import ExcelJS from 'exceljs';

export async function createExcel(res, filename, sheetName, columns, rows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SRSP Plateforme';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet(sheetName);
  worksheet.columns = columns;

  // Style de l'en-tête
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E40AF' },
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

  rows.forEach((r) => worksheet.addRow(r));

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

  await workbook.xlsx.write(res);
  res.end();
}
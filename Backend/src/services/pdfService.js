import PDFDocument from 'pdfkit';

const formatDate = (value) => {
  if (!value) return '—';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '—';
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

/**
 * Génère un PDF pour la fiche de réception / récépissé d'un dossier.
 * Retourne un Buffer.
 */
export async function genererFicheReception(dossier) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // ---- En-tête institutionnel ----
      doc.fontSize(16).font('Helvetica-Bold')
         .text('SERVICE RÉGIONAL DE LA SOLDE ET DES PENSIONS', { align: 'center' });
      doc.fontSize(12).font('Helvetica')
         .text('SRSP Fitovinany', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold')
         .text('FICHE DE RÉCEPTION / RÉCÉPISSÉ', { align: 'center', underline: true });
      doc.moveDown(1);

      // ---- Informations du dossier ----
      const leftCol = 60;
      const rightCol = 300;
      const lineHeight = 20;

      const addField = (label, value, y) => {
        doc.fontSize(10).font('Helvetica-Bold')
           .text(label, leftCol, y, { width: 220 });
        doc.font('Helvetica')
           .text(value || '—', rightCol, y, { width: 260 });
      };

      let y = doc.y;

      // Référence + Type
      addField('Référence du dossier :', dossier.numero, y); y += lineHeight;
      addField('Type de dossier :', dossier.type_dossier_libelle || dossier.type_dossier_code, y); y += lineHeight;

      // Bénéficiaire
      addField('Bénéficiaire :', `${dossier.beneficiaire_nom || ''} ${dossier.beneficiaire_prenom || ''}`.trim(), y); y += lineHeight;
      addField('Matricule :', dossier.matricule || '—', y); y += lineHeight;

      // Dates
      addField('Date de réception :', dossier.date_reception ? formatDate(dossier.date_reception) : '—', y); y += lineHeight;
      addField('Heure de réception :', dossier.heure_reception || '—', y); y += lineHeight;

      // Origine / Objet
      addField('Origine :', dossier.origine || '—', y); y += lineHeight;
      addField('Objet :', dossier.objet || '—', y); y += lineHeight;

      // Pièces
      addField('Nombre de pièces :', dossier.nombre_pieces ? String(dossier.nombre_pieces) : '—', y); y += lineHeight;

      // Secrétaire réceptionnaire
      const secretaire = dossier.secretaire_nom
        ? `${dossier.secretaire_nom} ${dossier.secretaire_prenom || ''}`.trim()
        : '—';
      addField('Agent réceptionnaire :', secretaire, y); y += lineHeight;

      // Division destinataire
      addField('Division destinataire :', dossier.division_nom || '—', y); y += lineHeight;

      // Statut
      addField('Statut actuel :', dossier.statut_libelle || dossier.statut_code || '—', y); y += lineHeight * 1.5;

      // ---- Observations ----
      if (dossier.observations) {
        doc.fontSize(10).font('Helvetica-Bold')
           .text('Observations :', leftCol, y);
        y += 18;
        doc.font('Helvetica')
           .text(dossier.observations, leftCol, y, { width: 500, align: 'left' });
        y = doc.y + 20;
      }

      // ---- Pied de page ----
      doc.moveDown(2);
      doc.fontSize(9).font('Helvetica-Oblique')
         .text('Ce récépissé confirme la réception du dossier par le service. Il ne constitue pas une décision sur le fond.', leftCol, doc.y, { width: 500, align: 'center' });
      doc.moveDown(0.5);
      const now = new Date();
      doc.fontSize(8)
         .text(`Document généré le ${formatDate(now)} à ${now.toLocaleTimeString('fr-FR')}`, { align: 'center' });

      // ---- Ligne de signature ----
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica')
         .text('Signature du réceptionnaire :', leftCol, doc.y);
      doc.moveDown(1.5);
      doc.text('Signature du bénéficiaire (si présent) :', leftCol, doc.y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * Génère un PDF pour un bordereau de transmission.
 */
export async function genererBordereauPDF(bordereau) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'portrait' });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // En-tête
      doc.fontSize(16).font('Helvetica-Bold')
         .text('SERVICE RÉGIONAL DE LA SOLDE ET DES PENSIONS', { align: 'center' });
      doc.fontSize(12).font('Helvetica')
         .text('SRSP Fitovinany', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(14).font('Helvetica-Bold')
         .text('BORDEREAU DE TRANSMISSION', { align: 'center', underline: true });
      doc.moveDown(1);

      // Infos bordereau
      const leftCol = 60;
      const rightCol = 300;
      const lineHeight = 20;

      const addField = (label, value, y) => {
        doc.fontSize(10).font('Helvetica-Bold')
           .text(label, leftCol, y, { width: 220 });
        doc.font('Helvetica')
           .text(value || '—', rightCol, y, { width: 260 });
      };

      let y = doc.y;
      addField('Référence :', bordereau.reference, y); y += lineHeight;
      addField('Division destinataire :', bordereau.division_nom || '—', y); y += lineHeight;
      addField('Date de transmission :', bordereau.date_transmission ? formatDate(bordereau.date_transmission) : '—', y); y += lineHeight;
      addField('Émis par :', `${bordereau.agent_nom || ''} ${bordereau.agent_prenom || ''}`.trim() || '—', y); y += lineHeight;
      addField('Statut :', bordereau.statut, y); y += lineHeight;

      if (bordereau.observation) {
        doc.fontSize(10).font('Helvetica-Bold').text('Observation :', leftCol, y);
        y += 18;
        doc.font('Helvetica').text(bordereau.observation, leftCol, y, { width: 500 });
        y = doc.y + 20;
      }

      // Tableau des dossiers
      if (bordereau.dossiers?.length) {
        y += 10;
        doc.fontSize(12).font('Helvetica-Bold').text(`Dossiers transmis (${bordereau.dossiers.length})`, leftCol, y);
        y += 25;

        // En-têtes tableau
        const col1 = leftCol;
        const col2 = leftCol + 80;
        const col3 = leftCol + 200;
        const col4 = leftCol + 400;

        doc.fontSize(9).font('Helvetica-Bold');
        doc.text('N°', col1, y, { width: 80 });
        doc.text('Référence', col2, y, { width: 120 });
        doc.text('Objet', col3, y, { width: 200 });
        doc.text('Statut', col4, y, { width: 100 });
        y += 18;

        doc.font('Helvetica');
        bordereau.dossiers.forEach((d, i) => {
          if (y > 720) { doc.addPage(); y = 40; }
          doc.text(String(i + 1), col1, y, { width: 80 });
          doc.text(d.numero, col2, y, { width: 120 });
          doc.text((d.objet || '').substring(0, 40), col3, y, { width: 200 });
          doc.text(d.statut_libelle || d.statut_code || '—', col4, y, { width: 100 });
          y += 16;
        });
      }

      // Signatures
      doc.moveDown(3);
      doc.fontSize(10).font('Helvetica')
         .text('Émis par :', leftCol, y);
      doc.moveDown(1.5);
      doc.text('Reçu par (division) :', leftCol, doc.y);
      doc.moveDown(1.5);
      doc.text('Date et cachet :', leftCol, doc.y);

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

export default { genererFicheReception, genererBordereauPDF };
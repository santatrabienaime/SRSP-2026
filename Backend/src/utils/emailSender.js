/**
 * Envoi d'email via SMTP – implémentation simplifiée.
 * Pour un envoi réel, installez nodemailer : npm install nodemailer
 */

export async function sendEmail({ to, subject, html }) {
  // Mode simulation (développement)
  if (process.env.NODE_ENV !== 'production' || !process.env.SMTP_HOST) {
    console.log('📧 [SIMULATION EMAIL]');
    console.log(`   À      : ${to}`);
    console.log(`   Sujet  : ${subject}`);
    console.log(`   Contenu: ${html?.slice(0, 100)}...`);
    return { simulated: true };
  }

  // Implémentation réelle avec nodemailer (à activer)
  /*
  import nodemailer from 'nodemailer';
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to,
    subject,
    html,
  });
  return info;
  */

  throw new Error('SMTP non configuré.');
}

export function renderNotificationEmail({ nom, message, lien }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #1e40af;">SRSP Fitovinany</h2>
      <p>Bonjour ${nom},</p>
      <p>${message}</p>
      ${lien ? `<p><a href="${lien}" style="background:#1e40af;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">Voir</a></p>` : ''}
      <hr>
      <small>Ceci est un message automatique.</small>
    </div>
  `;
}
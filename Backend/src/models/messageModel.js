import db from '../config/db.js';

/**
 * Création de la table messages si elle n'existe pas.
 * À appeler au démarrage de l'application.
 */
export async function initMessageTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      dossier_id INT NULL,
      expediteur_id INT NOT NULL,
      destinataire_id INT NOT NULL,
      action VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(20) DEFAULT 'INFO',
      lu TINYINT(1) DEFAULT 0,
      date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dossier_id) REFERENCES dossiers(id) ON DELETE CASCADE,
      FOREIGN KEY (expediteur_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (destinataire_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_destinataire_lu (destinataire_id, lu),
      INDEX idx_date_creation (date_creation)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);
}

/**
 * Appel automatique au démarrage du serveur.
 */
export async function initMessages() {
  try {
    await initMessageTable();
    console.log('✅ Table messages initialisée.');
  } catch (err) {
    console.error('❌ Erreur lors de l\'initialisation de la table messages:', err.message);
  }
}

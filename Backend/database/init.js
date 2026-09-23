import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Comptes de démonstration conforme aux postes du SRSP (§7 du cahier des charges).
 * Clé : role_nom -> { username, email, fonction_id, division_code|null }
 */
const ACCOUNTS = [
  { role: 'ADMIN',                    username: 'admin',          email: 'admin@srsp.mg',          fonction: 1, division: null, isAdmin: true },
  { role: 'CHEF_SERVICE',             username: 'chef.service',   email: 'chefservice@srsp.mg',    fonction: 1, division: null },
  { role: 'CHEF_BAAF',                username: 'chef.baaf',      email: 'chefbaaf@srsp.mg',       fonction: 2, division: null },
  { role: 'COORDINATRICE',            username: 'coordinatrice',  email: 'coordinatrice@srsp.mg',  fonction: 3, division: null },
  { role: 'SECRETAIRE',               username: 'secretaire',     email: 'secretaire@srsp.mg',     fonction: 4, division: null },
  { role: 'CHEF_DIVISION_VISA',       username: 'chef.visa',      email: 'chef.visa@srsp.mg',      fonction: 5, division: 'VISAS' },
  { role: 'VERIFICATEUR_VISA',        username: 'verif.visa',     email: 'verif.visa@srsp.mg',     fonction: 6, division: 'VISAS' },
  { role: 'CHEF_DIVISION_SOLDE',      username: 'chef.solde',     email: 'chef.solde@srsp.mg',     fonction: 5, division: 'SOLDE' },
  { role: 'VERIFICATEUR_SOLDE',       username: 'verif.solde',    email: 'verif.solde@srsp.mg',    fonction: 6, division: 'SOLDE' },
  { role: 'CHEF_DIVISION_PENSION',    username: 'chef.pension',   email: 'chef.pension@srsp.mg',   fonction: 5, division: 'PENSIONS' },
  { role: 'LIQUIDATEUR_PENSION',      username: 'liquidateur',    email: 'liquidateur@srsp.mg',    fonction: 7, division: 'PENSIONS' },
  { role: 'CHEF_DIVISION_SECOURS',    username: 'chef.secours',   email: 'chef.secours@srsp.mg',   fonction: 5, division: 'SECOURS' },
  { role: 'CHARGE_SECOURS',           username: 'charge.secours', email: 'charge.secours@srsp.mg', fonction: 8, division: 'SECOURS' },
];

const DEFAULT_PASSWORD = 'Demo123!';

async function initDatabase() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: true,
  });

  console.log('📦 Connexion à MySQL réussie.');

  // 1. Schéma
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await connection.query(schema);
  console.log('✅ Schéma créé avec succès.');

  // 2. Données de référence
  const seeds = fs.readFileSync(path.join(__dirname, 'seeds.sql'), 'utf8');
  await connection.query(seeds);
  console.log('✅ Données de référence insérées (rôles, statuts, types, permissions...).');

  // 3. Comptes utilisateur + agents
  const adminHash = await bcrypt.hash('Admin123!', 10);
  const demoHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  let matricule = 0;
  for (const acc of ACCOUNTS) {
    // Rôle
    const [roleRows] = await connection.query(
      'SELECT id FROM roles WHERE nom = ?', [acc.role]
    );
    if (!roleRows[0]) throw new Error(`Rôle introuvable : ${acc.role}`);
    const roleId = roleRows[0].id;

    // Utilisateur
    const hash = acc.isAdmin ? adminHash : demoHash;
    await connection.query(
      `INSERT INTO users (username, email, password_hash, role_id, actif)
       VALUES (?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE email = VALUES(email), password_hash = VALUES(password_hash), role_id = VALUES(role_id)`,
      [acc.username, acc.email, hash, roleId]
    );
    const [userRows] = await connection.query(
      'SELECT id FROM users WHERE username = ?', [acc.username]
    );
    const userId = userRows[0].id;

    // Division
    let divisionId = null;
    if (acc.division) {
      const [divRows] = await connection.query(
        'SELECT id FROM divisions WHERE code = ?', [acc.division]
      );
      divisionId = divRows[0]?.id || null;
    }

    // Agent lié
    matricule += 1;
    const nom = acc.division ? acc.division.charAt(0) + acc.division.slice(1).toLowerCase() : 'SRSP';
    const prenom = acc.username.replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    await connection.query(
      `INSERT INTO agents (user_id, nom, prenom, matricule, fonction_id, division_id, email, actif)
       VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
       ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), nom = VALUES(nom), prenom = VALUES(prenom),
               fonction_id = VALUES(fonction_id), division_id = VALUES(division_id), email = VALUES(email)`,
      [userId, nom || 'SRSP', prenom, `SRSP-${String(matricule).padStart(3, '0')}`, acc.fonction, divisionId, acc.email]
    );

    // Responsable de division
    if (acc.role.startsWith('CHEF_DIVISION') && divisionId) {
      const [agentRows] = await connection.query(
        'SELECT id FROM agents WHERE user_id = ?', [userId]
      );
      await connection.query(
        'UPDATE divisions SET responsable_id = ? WHERE id = ?',
        [agentRows[0]?.id || null, divisionId]
      );
    }
  }

  console.log(`✅ ${ACCOUNTS.length} comptes utilisateurs et agents créés.`);
  console.log('   Administrateur : admin@srsp.mg / Admin123!');
  console.log(`   Autres comptes  : <username>@... / ${DEFAULT_PASSWORD}`);

  await connection.end();
  console.log('🎉 Initialisation terminée.');
  process.exit(0);
}

initDatabase().catch((error) => {
  console.error('❌ Erreur lors de l\'initialisation :', error.message);
  process.exit(1);
});
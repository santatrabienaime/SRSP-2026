/**
 * Migration : les droits que le cahier confie à un poste, et que personne ne
 * porte.
 *
 * Le problème
 * -----------
 * Cinq points d'entrée du circuit Secours exigeaient un droit que **aucun
 * rôle ne portait** :
 *
 *   enregistrer_visa_cf          le visa du contrôle financier
 *   generer_etat_emargement      l'état d'émargement et les références
 *   signer_pieces_mandatement    la signature de l'ordonnateur
 *   archiver_copie_mandatement   l'archivage de la copie signée
 *   apposer_cachet               le cachet de l'ordonnateur
 *
 * Une route exigeant un droit que personne ne porte est une route fermée :
 * le serveur répond 403 à tout le monde, et l'agent voit un écran où les
 * cinq étapes du mandat ne s'exécutent pas. Le code était là, les données
 * étaient là, le circuit ne l'était pas.
 *
 * D'où cela vient
 * ---------------
 * Les droits ont été créés et posés sur les routes, mais l'attribution aux
 * rôles a été oubliée. Rien ne l'avait signalé : les campagnes vérifient
 * des parcours, et aucun ne parcourait le circuit Secours de bout en bout.
 *
 * L'attribution
 * --------------
 * Elle n'est pas inventée : elle est lue dans le registre de conformité,
 * qui porte, pour chaque exigence, le poste qui l'exerce et le droit qui
 * l'exerce. Le cahier dit :
 *
 *   - le visa du contrôle financier et l'état d'émargement sont une affaire
 *     de la Division Secours (registre 75, 76, 81, 92, 94) ;
 *   - la signature de l'ordonnateur est un droit **dédié** : le Chef de
 *     Division ne signe pas le dossier, il fait signer les pièces
 *     (registre 95) ;
 *   - le cachet est apposé par le chargé de Secours (registre 97, 98) ;
 *   - l'archivage de la copie signée referme le mandat : il appartient à
 *     ceux qui tiennent le dossier.
 *
 * Deux attributions ont été **écartées**, et l'on dit pourquoi :
 *
 *   - `traiter_dossier` n'est pas accordé aux chefs de division. Ce n'est
 *     pas un oubli : l'affectation automatique ne propose un dossier qu'aux
 *     agents qui portent ce droit, et l'accorder aux chefs chargerait ceux
 *     du traitement qu'ils n'ont pas à faire (voir affectationAutoService).
 *     Le registre attribue « traiter les dossiers » au chef de division ;
 *     c'est le vocabulaire du cahier, pas le fonctionnement de la plateforme.
 *   - `controler_decomptes` n'est pas accordé au chef de division Solde
 *     par ce script : il ne correspond à aucune route. Il est traité à part,
 *     avec les opérations de décompte.
 *
 * Usage (depuis Backend/) :
 *   node scripts/migration-droits-manquants.mjs            → relevé
 *   node scripts/migration-droits-manquants.mjs --apply    → exécute
 */
import db from '../src/config/db.js';

const APPLY = process.argv.includes('--apply');

/**
 * Les attributions, et la raison de chacune.
 *
 * `motif` est écrit dans la table : c'est la trace du pourquoi, et elle
 * reste lisible quand quelqu'un se demandera pourquoi tel rôle porte tel
 * droit.
 */
const ATTRIBUTIONS = [
  {
    permission: 'enregistrer_visa_cf',
    roles: ['CHEF_DIVISION_SECOURS'],
    motif: 'Visa du contrôle financier et contrôle des décisions visées par le CF (registre 75, 76).',
  },
  {
    permission: 'generer_etat_emargement',
    roles: ['CHEF_DIVISION_SECOURS'],
    motif: 'État d’émargement, références du logiciel Secours et report des signatures (registre 81, 92, 94).',
  },
  {
    permission: 'signer_pieces_mandatement',
    roles: ['CHEF_DIVISION_SECOURS'],
    motif: 'Droit dédié : le Chef de Division fait signer les pièces par l’ordonnateur, il ne signe pas le dossier lui-même (registre 95).',
  },
  {
    permission: 'apposer_cachet',
    roles: ['CHARGE_SECOURS'],
    motif: 'Cachet, titre et nom de l’ordonnateur apposés sur les pièces du mandatement (registre 97, 98).',
  },
  {
    permission: 'archiver_copie_mandatement',
    roles: ['CHEF_DIVISION_SECOURS', 'CHARGE_SECOURS'],
    motif: 'Dernier acte du mandat : l’archivage de la copie signée. Il referme le cycle du chargé et du chef de division.',
  },
  {
    permission: 'consolidate_reports',
    roles: ['CHEF_SERVICE', 'COORDINATRICE'],
    motif: 'Le Chef de Service représente le SRSP et dispose des rapports consolidés ; la Coordination prépare les rapports d’activité qui lui sont destinés (registre 109, 150, 151).',
  },
  {
    permission: 'manage_personnel',
    roles: ['CHEF_BAAF'],
    motif: 'Le Chef BAAF gère le personnel : avancement, renouvellement des contrats (registre 126, 127).',
  },
  {
    permission: 'liquider_pension',
    roles: ['CHEF_DIVISION_PENSION'],
    motif: 'Le Chef de Division Pensions gère la liquidation des pensions (registre 50).',
  },
  {
    permission: 'gerer_ordonnancement',
    roles: ['CHEF_DIVISION_SOLDE', 'LIQUIDATEUR_PENSION'],
    motif: 'Le Chef de Division Solde gère le montant à engager ; le liquidateur gère les bons de caisse en retour (registre 29, 60).',
  },
  {
    permission: 'preparer_mandatement',
    roles: ['CHEF_DIVISION_SOLDE', 'VERIFICATEUR_SOLDE'],
    motif: 'Les dossiers de mandatement destinés au niveau central sont préparés par la Division Solde : le chef de division et le vérificateur (registre 31, 42).',
  },
  {
    permission: 'gerer_correspondances',
    roles: ['VERIFICATEUR_SOLDE'],
    motif: 'Le vérificateur Solde expédie les dossiers mères aux SRSP concernés (registre 41).',
  },
];

async function main() {
  console.log(APPLY
    ? '=== APPLICATION MIGRATION DROITS MANQUANTS ==='
    : '=== RELEVÉ (dry-run) ===');

  /* Attention à la déstructuration : `const [x] = await query(...)` ne
     garde que la PREMIÈRE ligne. C'est un défaut rencontré trois fois dans
     ce projet — dont deux fois dans du code livré. */
  const permissions = await db.query('SELECT id, nom FROM permissions');
  const roles = await db.query('SELECT id, nom FROM roles');

  let accords = 0;
  let dejaPorts = 0;
  let absents = 0;

  for (const attribution of ATTRIBUTIONS) {
    const permission = permissions.find((p) => p.nom === attribution.permission);
    if (!permission) {
      console.log(`  ⚠️  Permission « ${attribution.permission} » absente : ignorée.`);
      absents += 1;
      continue;
    }

    for (const nomRole of attribution.roles) {
      const role = roles.find((r) => r.nom === nomRole);
      if (!role) {
        console.log(`  ⚠️  Rôle « ${nomRole} » absent : ignoré.`);
        absents += 1;
        continue;
      }

      const [deja] = await db.query(
        'SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?',
        [role.id, permission.id]
      );
      if (deja) {
        dejaPorts += 1;
        console.log(`  =    ${nomRole} porte déjà « ${attribution.permission} »`);
        continue;
      }

      if (APPLY) {
        await db.query(
          'INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)',
          [role.id, permission.id]
        );
      }
      accords += 1;
      console.log(`  +    ${nomRole} ← ${attribution.permission}`);
      console.log(`       ${attribution.motif}`);
    }
  }

  /* On laisse la trace du pourquoi dans la description de la permission :
     c'est là qu'on laIRA quand on se demandera qui porte quoi. */
  if (APPLY) {
    for (const attribution of ATTRIBUTIONS) {
      const permission = permissions.find((p) => p.nom === attribution.permission);
      if (!permission) continue;
      await db.query(
        'UPDATE permissions SET description = ? WHERE id = ?',
        [attribution.motif, permission.id]
      );
    }
  }

  console.log(APPLY
    ? `\n✅ ${accords} attribution(s) accordée(s), ${dejaPorts} déjà en place, ${absents} ignorée(s).`
    : `\n⚡ ${accords} attribution(s) à accorder, ${dejaPorts} déjà en place, ${absents} ignorée(s).`);

  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur migration :', err.message);
  process.exit(1);
});

import db from '../config/db.js';
import { STATUTS, DIVISION_CHEF_ROLE } from '../utils/constants.js';

/**
 * « À faire ensuite » — la prochaine action d'un dossier.
 *
 * Le cahier des functionalities est explicite : l'agent doit savoir
 * « immédiatement où il se trouve, à connaître la prochaine action ». Un
 * dossier affiché avec une barre de boutons ne le dit pas : il faut déjà
 * connaître le circuit pour deviner lequel presser.
 *
 * Cette règle est écrite ici, **au serveur**, en un seul endroit. La même
 * information est donc servie à l'écran, à la liste, et aux notifications —
 * et elle ne peut pas diverger entre les deux.
 *
 * Deux notions sont tenues séparées, et la distinction est le fond de la
 * fonctionnalité :
 *
 *   - **l'étape suivante**, qui dépend du seul statut du dossier ;
 *   - **l'acteur de cette étape**, qui dépend en plus du rôle : l'agent
 *     connecté peut être, ou non, celui à qui incombe l'action.
 *
 * C'est ce second point qui manque le plus aux utilisateurs : savoir que le
 * dossier attend le Chef de Division, plutôt que de supposer que c'est à lui
 * de faire quelque chose.
 */

/** Libellé de l'acteur par poste. */
const LIBELLE_ACTEUR = {
  SECRETAIRE: 'Le secrétariat',
  COORDINATRICE: 'La coordination',
  CHEF_SERVICE: 'Le Chef de Service',
  CHEF_BAAF: 'Le Chef BAAF',
  ADMIN: "L'administrateur technique",
};

/** Libellé de l'acteur par rôle de chef de division. */
const LIBELLE_CHEF_DIVISION = {
  CHEF_DIVISION_VISA: 'Le Chef de la division Visa',
  CHEF_DIVISION_SOLDE: 'Le Chef de la division Solde',
  CHEF_DIVISION_PENSION: 'Le Chef de la division Pensions',
  CHEF_DIVISION_SECOURS: 'Le Chef de la division Secours',
};

/** Libellé de l'acteur par rôle d'agent technique. */
const LIBELLE_AGENT = {
  VERIFICATEUR_VISA: 'Le vérificateur Visa',
  VERIFICATEUR_SOLDE: 'Le vérificateur Solde',
  LIQUIDATEUR_PENSION: 'Le liquidateur Pensions',
  CHARGE_SECOURS: 'Le chargé Secours',
};

/**
 * Règles d'étape, par statut.
 *
 * `permissions` liste les permissions qui autorisent l'action : si l'agent
 * connecté en détient au moins une, l'action lui revient.
 * `acteur` désigne le poste attendu, pour l'affichage.
 */
const REGLES = {
  [STATUTS.BROUILLON]: {
    code: 'PUBLIER',
    titre: 'Compléter et publier le dossier',
    description:
      "Ce dossier est un brouillon : il n'est visible que de vous et n'est pas dans le circuit. "
      + 'Complétez-le et publiez-le pour qu’il soit orienté vers la division.',
    permissions: ['edit_dossier', 'create_dossier'],
    acteur: null,
  },
  [STATUTS.RECU]: {
    code: 'ORIENTER',
    titre: 'Orienter le dossier vers sa division',
    description:
      'Le dossier a été reçu mais n’est pas encore orienté. L’orientation vers la '
      + 'division se fait automatiquement ; si le dossier est resté ici, une action manuelle est attendue.',
    permissions: ['orienter_dossier'],
    acteur: 'SECRETAIRE',
  },
  [STATUTS.ENREGISTRE]: {
    code: 'ORIENTER',
    titre: 'Orienter le dossier vers sa division',
    description: 'Le dossier est enregistré et attend d’être orienté vers la division compétente.',
    permissions: ['orienter_dossier'],
    acteur: 'SECRETAIRE',
  },
  [STATUTS.ORIENTE]: {
    code: 'AFFECTER',
    titre: 'Affecter le dossier à un agent',
    description: 'Le dossier est orienté mais personne ne l’a encore pris en charge.',
    permissions: ['affecter_dossier'],
    acteur: 'CHEF_DIVISION',
  },
  [STATUTS.AFFECTE]: {
    code: 'TRAITER',
    titre: 'Prendre le dossier en charge',
    description: 'Le dossier vous est affecté : il attend votre première action.',
    permissions: ['traiter_dossier'],
    acteur: 'AGENT',
  },
  [STATUTS.EN_TRAITEMENT]: {
    code: 'SOUMETTRE',
    titre: 'Soumettre au Chef de Division',
    description:
      'Le traitement est en cours. Quand il est terminé, soumettez le dossier à la vérification.',
    permissions: ['soumettre_verification'],
    acteur: 'AGENT',
  },
  [STATUTS.CORRECTION_DEMANDEE]: {
    code: 'CORRIGER',
    titre: 'Corriger et soumettre à nouveau',
    description:
      'Des corrections ont été demandées. Reprenez le traitement, puis soumettez de nouveau '
      + 'à la vérification : un dossier corrigé ne peut pas être validé directement.',
    permissions: ['traiter_dossier', 'soumettre_verification'],
    acteur: 'AGENT',
  },
  [STATUTS.EN_ATTENTE_COMPLEMENT]: {
    code: 'RELANCER',
    titre: 'Relancer le demandeur',
    description:
      'Le dossier attend une pièce ou une information du demandeur. Le motif de la demande '
      + 'figure dans la fiche : c’est lui qui sera transmis.',
    permissions: ['create_dossier', 'edit_dossier'],
    acteur: 'SECRETAIRE',
  },
  [STATUTS.SOUMIS_A_VERIFICATION]: {
    code: 'VERIFIER',
    titre: 'Vérifier et décider',
    description:
      'Le dossier attend la vérification du Chef de Division. Décidez : valider, ou demander '
      + 'une correction avec un motif.',
    permissions: ['verifier_dossier', 'valider_dossier'],
    acteur: 'CHEF_DIVISION',
  },
  [STATUTS.VALIDE]: {
    code: 'SIGNER',
    titre: 'Signer le dossier',
    description:
      'Le dossier est validé et attend la signature du Chef de Service. '
      + 'La vérification de la division et la signature sont deux étapes distinctes.',
    permissions: ['signer_dossier'],
    acteur: 'CHEF_SERVICE',
  },
  [STATUTS.SIGNE]: {
    code: 'CLOTURER',
    titre: 'Clôturer le dossier',
    description: 'Le dossier est signé. Il reste à le clôturer avant son archivage.',
    permissions: ['cloturer_dossier'],
    acteur: 'CHEF_SERVICE',
  },
  [STATUTS.CLOTURE]: {
    code: 'ARCHIVER',
    titre: 'Archiver le dossier',
    description:
      'Le dossier est clôturé. L’archivage consigne la référence d’archive et l’emplacement '
      + 'de conservation.',
    permissions: ['archiver_dossier'],
    acteur: 'CHEF_SERVICE',
  },
  [STATUTS.ARCHIVE]: {
    code: null,
    titre: 'Dossier archivé',
    description: 'Le dossier a été archivé. Il n’y a plus rien à faire.',
    permissions: [],
    acteur: null,
  },
};

/**
 * Règle applicable au dossier VISA signé.
 *
 * Le circuit VISA ne comporte pas de clôture intermédiaire : le dossier signé
 * s'archive directement (« Signé → À archiver → Archivé »).
 */
const REGLE_VISA_SIGNE = {
  code: 'ARCHIVER',
  titre: 'Archiver le dossier signé',
  description:
    'Le dossier est signé : il peut être archivé. L’archivage est refusé tant que la '
    + 'signature n’est pas enregistrée ou qu’une pièce d’archivage manque.',
  permissions: ['archiver_dossier'],
  acteur: 'CHEF_SERVICE',
};

/** Permissions de l'agent connecté. */
async function permissionsDe(userId) {
  const rows = await db.query(
    `SELECT p.nom
     FROM permissions p
     JOIN role_permissions rp ON p.id = rp.permission_id
     WHERE rp.role_id = (SELECT role_id FROM users WHERE id = ?)`,
    [userId]
  );
  return rows.map((r) => r.nom);
}

/** Rôle de l'agent connecté. */
async function roleDe(userId) {
  const rows = await db.query(
    `SELECT r.nom FROM users u JOIN roles r ON r.id = u.role_id WHERE u.id = ?`,
    [userId]
  );
  return rows[0]?.nom || null;
}

/** Libellé lisible de l'acteur attendu. */
function libelleActeur(acteur, role, divisionCode) {
  if (!acteur) return null;
  if (acteur === 'CHEF_DIVISION') {
    const roleChef = DIVISION_CHEF_ROLE[divisionCode];
    return LIBELLE_CHEF_DIVISION[roleChef] || 'Le Chef de Division';
  }
  if (acteur === 'AGENT') {
    return LIBELLE_AGENT[role] || 'L’agent responsable';
  }
  return LIBELLE_ACTEUR[acteur] || null;
}

/**
 * Prochaine action d'un dossier pour l'agent connecté.
 *
 * Renvoie `null` si le dossier n'existe pas.
 */
export async function prochaineAction(dossier, user) {
  const estVisa = dossier.type_code === 'VISA';
  let regle = REGLES[dossier.statut_code] || null;

  /* Le VISA s'archive depuis « Signé », sans clôture intermédiaire. */
  if (estVisa && dossier.statut_code === STATUTS.SIGNE) regle = REGLE_VISA_SIGNE;

  if (!regle) {
    return {
      code: null,
      titre: 'Aucune action en attente',
      description: 'Le dossier n’attend aucune action.',
      acteur: null,
      pour_moi: false,
      permissions: [],
    };
  }

  const permissions = await permissionsDe(user.id);
  const role = await roleDe(user.id);

  /* L'action revient-elle à l'agent connecté ? */
  let pourMoi = regle.permissions.some((p) => permissions.includes(p));

  /* Le brouillon n'appartient qu'à son auteur : une permission générale ne
     suffit pas à le publier. */
  if (dossier.statut_code === STATUTS.BROUILLON) {
    pourMoi = Number(dossier.created_by) === Number(user.id)
      || permissions.includes('manage_users');
  }

  /* L'archivage VISA revient au vérificateur VISA comme au Chef de Service :
     les deux y ont droit. */
  if (regle.code === 'ARCHIVER' && estVisa) {
    pourMoi = permissions.includes('archiver_dossier');
  }

  const acteur = libelleActeur(regle.acteur, role, dossier.division_code);

  return {
    code: regle.code,
    titre: regle.titre,
    description: regle.description,
    /* « À vous » quand l'action lui revient, sinon le poste attendu. */
    acteur: pourMoi ? 'Vous' : acteur,
    pour_moi: pourMoi,
    permissions: regle.permissions,
    statut: dossier.statut_code,
  };
}

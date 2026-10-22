# Guide de l'administrateur — SRSP Fitovinany

Ce guide s'adresse à l'**administrateur technique** : il administre le service
sans détenir de pouvoir de décision métier. Il ne valide pas, ne signe pas,
n'archive pas un dossier.

Le manuel d'usage est dans [MANUEL_UTILISATEUR.md](MANUEL_UTILISATEUR.md). La
procédure de sauvegarde est dans [SAUVEGARDE_RESTITUTION.md](SAUVEGARDE_RESTITUTION.md).

---

## 1. Périmètre de l'administrateur technique

| Peut | Ne peut pas |
|---|---|
| Gérer le personnel (comptes et fiches agents) | Valider, signer, archiver, décider d'un dossier |
| Gérer les rôles et les permissions | Traiter un dossier métier |
| Gérer les divisions et le référentiel | Déroger à la validation |
| Configurer les types d'actes et les pièces requises | Archiver un dossier VISA signé |
| Supprimer un dossier non traité, avec motif | Modifier l'historique |
| Sauvegarder et restaurer la base | Signer à la place du Chef de Service |

Cette séparation est délibérée : un compte technique qui valide, signe ou
archive un dossier rend la séparation des responsabilités inexistante, et
rend la piste d'audit ininterprétable.

---

## 2. Comptes et personnel

**Administration → Personnel**. L'écran réunit ce qui était auparavant deux
écrans séparés (« Agents » et « Utilisateurs ») : ce sont les mêmes personnes.

### 2.1 Créer un compte

1. Bouton **Nouvel agent / compte**.
2. Renseigner : nom, prénom, fonction, division, e-mail, matricule.
3. Choisir un **rôle** — il détermine les permissions.
4. Choisir un **mot de passe initial** (8 caractères minimum, avec une
   majuscule, une minuscule, un chiffre et un caractère spécial).
5. **Créer**.

Le compte est lié à la fiche agent : l'agent qui travaille sur un dossier et
la personne qui se connecte sont le même dossier, pas deux.

### 2.2 Rôles

| Rôle | Rôle métier |
|---|---|
| `ADMIN` | Administrateur technique |
| `CHEF_SERVICE` | Chef de Service |
| `CHEF_BAAF` | Chef BAAF |
| `COORDINATRICE` | Coordonnatrice |
| `SECRETAIRE` | Secrétaire |
| `CHEF_DIVISION_VISA` | Chef de la division Visa |
| `VERIFICATEUR_VISA` | Vérificateur Visa |
| `CHEF_DIVISION_SOLDE` | Chef de la division Solde |
| `VERIFICATEUR_SOLDE` | Vérificateur Solde |
| `CHEF_DIVISION_PENSION` | Chef de la division Pension |
| `LIQUIDATEUR_PENSION` | Liquidateur Pension |
| `CHEF_DIVISION_SECOURS` | Chef de la division Secours |
| `CHARGE_SECOURS` | Chargé Secours |

### 2.3 Permissions par rôle

Les permissions sont accordées au rôle, pas à la personne. L'écran
*Administration → Rôles & permissions* les affiche.

| Permission | Détenue par |
|---|---|
| `create_dossier`, `edit_dossier` | Secrétaire, Coordonnatrice, Administrateur |
| `orienter_dossier` | Secrétaire |
| `affecter_dossier` | Chefs de division, Chef de Service |
| `traiter_dossier` | Agents (vérificateurs, liquidateur, chargé), Chef de Service |
| `soumettre_verification` | Agents (vérificateurs, liquidateur, chargé) |
| `verifier_dossier`, `valider_dossier` | Chefs de division, Chef de Service |
| `signer_dossier` | **Chef de Service uniquement** |
| `deroger_validation` | **Chef de Service uniquement** |
| `cloturer_dossier` | Chef de Service |
| `archiver_dossier` | Chef de Service, Vérificateur VISA |
| `depouiller_pieces` | Agents, Chefs de division, Vérificateur VISA |
| `delete_dossier` | **Administrateur technique uniquement** |
| `saisir_donnees_operation` | Agents et chefs des quatre divisions | Saisir les données propres à l'opération (référence, période, montant, pièces) |
| `controler_donnees_operation` | Chefs des quatre divisions | Contrôler et valider les données d'opération |
| `gerer_correspondances` | Chef de division Pensions, Liquidateur Pensions | Préparer et suivre les correspondances (prescriptions, oppositions, arrérages) |
| `gerer_immatriculations` | Coordination | Enregistrer et suivre les immatriculations, insertions et changements de mode de paiement |
| `configurer_pieces`, `gerer_sous_types` | Administrateur technique |
| `view_audit`, `view_journal` | Administrateur technique, Chef de Service, Chef BAAF |
| `view_archives` | Administrateur technique, Chef BAAF, Vérificateur VISA, Chef de Service |

> La signature est doublement protégée : la permission `signer_dossier` et,
> dans le code du service, le **rôle exact**. Une route mal configurée ne
> suffit pas à faire signer un rôle technique.

### 2.4 Désactiver un compte

**Personnel → bouton « Désactiver »**. Le compte ne peut plus se connecter.
C'est le geste à poser en premier en cas de départ ou de compromission : il
est instantané, alors qu'une suppression de compte ne l'est pas.

### 2.6 Désactiver un compte, effet immédiat

**Personnel → bouton « Désactiver »**. Le compte ne peut plus se connecter.
C'est le geste à poser en premier en cas de départ ou de compromission : il
est instantané, alors qu'une suppression de compte ne l'est pas.

**L'effet est immédiat, y compris sur les sessions ouvertes.** Une personne
désactivée voit ses requêtes refusées (401) et son canal temps réel coupé.
Le contrôle est appliqué à chaque requête authentifiée, et au canal WebSocket
de la même façon : une révocation ne vaut pas seulement pour les pages
rafraîchies.

> L'état du compte est lu en cache pendant dix secondes, ce qui préserve la
> base d'un interrogatoire à chaque clic. Mais **toute action qui change
> l'état d'un compte vide l'entrée correspondante immédiatement** : la
> désactivation prend donc effet sans attendre.

Si un compte de démonstration a été laissé désactivé par une campagne de test
interrompue :

```bash
cd Backend
node scripts/reparer-comptes-demo.mjs
```

Le script réactive les treize comptes de démonstration et remet le compteur
d'échecs à zéro. Il ne touche à aucune donnée métier.

### 2.7 Réinitialiser un mot de passe

**Personnel → « Réinitialiser le mot de passe »**. L'ancien mot de passe
devient caduc. Un mot de passe doit être renouvelé au plus tard tous les
**90 jours** (la date d'expiration est affichée dans *Mon profil*).

> La réinitialisation **coupe les sessions ouvertes** du compte concerné :
> l'agent doit se reconnecter. C'est indispensable — un mot de passe volé ne
> doit pas rester exploitable.

### 2.8 Les permissions de données d'opération

Deux permissions nouvelles séparent deux gestes qui ne doivent jamais être
confondus :

| Permission | Détenue par | Ce qu'elle permet |
|---|---|---|
| `saisir_donnees_operation` | Vérificateur Solde, Liquidateur Pensions, Chargé Secours, Vérificateur VISA, et les chefs des quatre divisions | Saisir la référence, la période, le montant et sa source, la localité, les observations |
| `controler_donnees_operation` | Chefs des quatre divisions | Contrôler l'opération (décision, observations, date) et valider le montant |

> L'agent qui a saisi **ne peut pas** contrôler sa propre opération. Sans
> cette séparation, l'agent validerait sa propre saisie — exactement ce que
> le cahier refuse.

`gerer_correspondances` est également tenue par le **liquidateur Pensions**,
qui doit produire les prescriptions, les demandes de dossier mère et les
oppositions que le cahier lui confie. Elle n'était détenue que par le chef de
division : le liquidateur ne pouvait pas produire ce que le dossier demandait.

---

## 2 bis. Demandes de réinitialisation de mot de passe

**Administration → Réinitialisation**.

La plateforme n'envoie ni e-mail ni SMS — ces canaux sont exclus du
périmètre. Un agent qui a perdu son mot de passe dépose donc une **demande**
depuis l'écran public ; l'administrateur vérifie son identité et lui délivre
un **code**.

### 2 bis.1 Traiter une demande

1. Ouvrir *Administration → Réinitialisation*. Les demandes en attente sont
   signalées par un compteur.
2. Cliquer sur **Code** en face de la demande.
3. Saisir un **motif** facultatif — il est conservé dans le journal d'audit.
   *Pièce d'identité présentée au guichet*, *vérification par téléphone*…
4. Cliquer sur **Délivrer le code**.

Le code s'affiche **une seule fois**, sur six chiffres. Il n'est **pas
conservé en clair** : seule son empreinte est enregistrée, il n'est donc pas
reconsultable. S'il est perdu, délivrez-en un nouveau — l'ancien devient
inutilisable.

5. Communiquer le code à l'agent, par le moyen que vous jugez approprié
   (téléphone, remise en main propre, note de service). Il est valable
   **quinze minutes** et ne sert **qu'une fois**.
6. Cliquer sur **J'ai communiqué le code**.

> L'administrateur **ne choisit pas** le mot de passe de l'agent. Il lève le
> verrou ; l'agent saisit le code et choisit lui-même son mot de passe.
> Personne ne voit le mot de passe d'un tiers, et il n'est jamais stocké en
> clair.

### 2 bis.2 Ce que la délivrance fait d'autre

- Le compte est **déverrouillé** s'il l'était : c'est souvent la raison de
  la demande.
- Les **sessions ouvertes** du compte concerné sont invalidées. Un mot de
  passe volé ne reste pas exploitable.
- L'opération est **journalisée** (`CODE_REINITIALISATION_GENERE`), avec
  l'administrateur comme auteur.

### 2 bis.3 Annuler une demande

Le bouton **Annuler** (croix rouge) refuse la demande. Utilisez-le si
l'identité n'a pas pu être vérifiée, ou si la demande est abusive. La
demande reste consultable dans l'historique, avec son statut `Annulée`.

### 2 bis.4 Séparer les cas

| Besoin | Écran | Qui fait quoi |
|---|---|---|
| L'agent a perdu son mot de passe | *Réinitialisation* | L'agent dépose une demande, l'administrateur délivre un code, l'agent choisit son mot de passe. |
| L'agent est bloqué (cinq échecs) | *Réinitialisation* | La délivrance du code déverrouille le compte. |
| Un compte doit changer de mot de passe pour une raison de service | *Personnel* | L'administrateur fixe un mot de passe provisoire. |
| Un agent a oublié son mot de passe **et** est absent | *Personnel* | L'administrateur fixe un mot de passe provisoire, à lui remettre en main propre. |

> La première ligne laisse l'agent **choisir** son mot de passe. C'est
> préférable : il ne le transmet à personne, et il ne l'écrit nulle part.

---

## 3. Référentiel

**Administration → Référentiel**. Cinq onglets.

### 3.1 Types de dossiers

Les grandes catégories : VISA, SOLDE, PENSION, SECOURS. Chaque type est
rattaché à une division ; c'est ce rattachement qui détermine le routage
automatique des dossiers.

### 3.2 Types d'acte (sous-types)

Un sous-type affine un type de dossier : « Visa » devient « Visa de
mariage », « Visa de naissance »…

- **Code** : stable et non modifiable après création. Il désigne le
  sous-type dans les dossiers déjà enregistrés.
- **Libellé** : modifiable.
- **Ordre** : ordre d'affichage dans les formulaires.
- **Actif / Désactivé** : un sous-type désactivé disparaît des formulaires
  sans disparaître des dossiers existants.

> Un sous-type **utilisé** par un dossier n'est jamais supprimé : le serveur
> refuse l'opération. Désactivez-le.

### 3.3 Types d'opérations (sous-types)

Un sous-type affine un type de dossier : « Visa » devient « Visa de
mariage », « Visa de naissance »… ; « Solde » devient « Mandatement »,
« Avance de solde »… ; « Pensions » devient « Liquidation », « Opposition
sur pension »…

Les **22 types du cahier des fonctionnalités** sont préchargés, et
modifiables. Ce sont eux qui portent le libellé affiché sur le dossier et
qui déterminent les pièces obligatoires du dépouillement.

- **Code** : stable et non modifiable après création. Il désigne le
  sous-type dans les dossiers déjà enregistrés.
- **Libellé** : modifiable.
- **Ordre** : ordre d'affichage dans les formulaires.
- **Actif / Désactivé** : un sous-type désactivé disparaît des formulaires
  sans disparaître des dossiers existants.

> Un sous-type **utilisé** par un dossier n'est jamais supprimé : le serveur
> refuse l'opération. Désactivez-le.

**Règle de portée d'une pièce** : une pièce s'applique à un dossier si son
type de dossier est vide ou égal à celui du dossier, **et** si son type
d'opération est vide ou égal. La division restreint également.

### 3.4 Types de pièces

C'est la configuration la plus structurante : elle définit ce que le
dépouillement demandera.

| Champ | Rôle |
|---|---|
| **Code** | Identifiant stable de la pièce (ex. `ACTE_MARIAGE`). Non modifiable. |
| **Libellé** | Ce qui s'affiche dans le contrôle. |
| **Phase** | `DEPOUILLEMENT` (contrôle du dossier) ou `ARCHIVAGE` (conditions d'archivage). |
| **Type de dossier** | La pièce ne s'applique qu'à ce type. |
| **Type d'acte** | La pièce ne s'applique qu'à ce sous-type. |
| **Division** | La pièce ne s'applique qu'à cette division. |
| **Obligatoire** | Une pièce obligatoire non satisfaite bloque la validation (phase dépouillement) ou l'archivage (phase archivage). *« Présente » et « non applicable » satisfont l'obligation.* |
| **Ordre** | Ordre d'affichage. |
| **État** | Active / Désactivée. |

**Règle de portée** : une pièce s'applique à un dossier si son type de dossier
est vide ou égal à celui du dossier, **et** si son type d'opération est vide
ou égal à celui du dossier. La division restreint également.

> Une pièce n'est **jamais effacée**. La désactivation la retire des nouveaux
> dossiers tout en laissant les dépouillements passés lisibles : effacer une
> pièce ferait disparaître de l'historique la preuve qu'elle était attendue.

**Le portfolio des pièces d'une division** (table `types_pieces`) porte les
pièces par division et par phase. Le câblage par type d'opération est
**volontairement inactif en base** : toutes les pièces ont
`sous_type_id = NULL`, donc elles s'appliquent à toutes les opérations d'une
division. Le cahier demande que la liste exacte des pièces par dossier soit
**validée par le SRSP**, et une liste par opération inventée serait une
invention de notre part. L'administrateur peut différencier les pièces par
opération depuis l'écran *Référentiel*, sans développement.

**Pièces configurées par division** :

| Division | Pièces de contrôle | Pièces d'archivage |
|---|---|---|
| VISA | Demande de visa, Acte de mariage, Acte de naissance, Certificat médical, Décision de visa | État de signature, PV de réception |
| Solde | Fiche de liquidation, Décompte, État d'émargement | Cachet du mandatement, Signature de l'ordonnateur, Référence du logiciel |
| Pensions | Demande, Acte de décès, Certificat de non-remariage, Liquidation | État de décompte, PV de vérification |
| Secours | Décision, État de décompte, CCETPP, Demande de l'intéressé | Acte de décès, Acte de mariage, Certificat NSC, Certificat NDIV, CIN du défunt, CIN du bénéficiaire |

### 3.5 Schémas d'opérations

Chaque type d'opération porte **ses propres champs**. Un transfert de
localité n'a pas de « version produite » ; une fiche de contrôle en a une.

*Référentiel → Schémas d'opérations*. Pour chaque opération, l'écran montre
les champs, et permet de :

- **ajouter** un champ (clé, libellé, type, obligatoire, aide) ;
- **retirer** un champ ;
- **enregistrer** le schéma.

Les champs **communs** — référence externe, dossier mère, matricule, période,
montant, source, date de référence, destinataire, localité, observation —
sont toujours disponibles : ils ne se configurent pas ici, parce que
d'autres écrans s'appuient dessus.

| Type de champ | Rendu |
|---|---|
| `texte` | Champ court |
| `nombre` | Champ numérique (montants, durées, indices) |
| `date` | Sélecteur de date |
| `textarea` | Zone de texte long |
| `choix` | Liste déroulante — les valeurs se saisissent séparées par une barre verticale |

> Les 17 types du cahier sont préchargés avec les champs que le cahier leur
> décrit. **C'est là que le SRSP doit dire ce qui est juste** : le point
> n° 16 de la liste des validations.

### 3.6 Types de courriers et divisions

Les courriers entrants et sortants se classent par type ; les divisions se
créent, se modifient et s'activent. Une division désactivée n'accepte plus de
nouveaux dossiers, sans que ses dossiers existants soient affectés.

---

## 4. Journal d'audit

**Suivi → Historique** (ou *Administration → Journal d'audit*).

Le journal enregistre **qui** a fait **quoi**, **quand**, seconde comprise,
avec l'adresse IP. Il est filtrable par action, agent et période, et
exportable en CSV, Excel et PDF.

### 4.1 Suppressions de dossiers

Un dossier supprimé n'existe plus : sans trace, la suppression serait
muette. Le tableau **« Suppressions de dossiers »**, en bas de l'écran,
porte le numéro du dossier, son objet, son demandeur, son statut au moment
de la suppression, **le motif**, **l'auteur**, la date, et le **nombre
d'actions de journal conservées**.

Le journal lui-même est lié au dossier par une clé étrangère en cascade : il
disparaît avec lui. C'est pourquoi l'instantané est recopié dans une table
sans clé étrangère, qui survit.

### 4.2 Archivage

Un dossier archivé conserve son dossier et son journal, et sa référence
d'archivage. Il n'accepte plus de pièce jointe. La restauration est possible
depuis *Suivi → Archives*.

---

## 5. Mises à jour du schéma

Les migrations sont **idempotentes** : les relancer plusieurs fois ne casse
rien. Elles s'appliquent directement sur la base vivante.

```bash
cd Backend

# Conformité VISA (statuts, sous-types, champs VISA, pièces, permissions)
node scripts/migration-visa-conformite.mjs --apply

# Archives enrichies (référence, emplacement, localisation numérique)
node scripts/migration-archives-enrichies.mjs --apply

# Bordereaux de transmission
node scripts/migration-bordereaux.mjs --apply

# Trace durable des suppressions
node scripts/migration-trace-suppressions.mjs --apply

# Demandes de réinitialisation de mot de passe
node scripts/migration-reinitialisation-mdp.mjs --apply

# Précision à la milliseconde de la date de changement de mot de passe
node scripts/migration-precision-mdp.mjs --apply

# Statut brouillon
node scripts/migration-brouillon.mjs --apply

# Types d'opérations Solde et Pensions
node scripts/migration-types-operations.mjs --apply

# Données d'opération, versionnage des pièces, état « non applicable »
node scripts/migration-donnees-operations.mjs --apply

# Permissions de contrôle des pièces et des correspondances
node scripts/migration-permissions-pieces.mjs --apply

# Schémas de données par type d'opération
node scripts/migration-schemas-operations.mjs --apply

# Module d'immatriculation de la Coordination
node scripts/migration-immatriculations.mjs --apply
```

> Toutes ces migrations sont **idempotentes** : les relancer ne casse rien
> et ne duplique aucune ligne. Le contrôle de l'encodage des sources
> (`node scripts/verifier-encodage.mjs`) est également à lancer après une
> modification faite avec un outil en ligne de commande : un shell qui relit
> un fichier avec le mauvais jeu de caractères dégrade les accents en silence,
> et le code compile quand même.

> Toujours **sauvegarder avant** une migration (voir §5).

Le schéma complet est documenté dans [BASE_DE_DONNEES.md](BASE_DE_DONNEES.md),
généré à partir de la base vivante.

---

## 6. Vérifications périodiques

| Contrôle | Fréquence | Comment |
|---|---|---|
| Sauvegarde réussie | Quotidienne | *Administration → Sauvegarde*, ou tâche planifiée |
| **Test de restauration** | **Mensuelle** | Restaurer une sauvegarde sur une base de test et vérifier l'ouverture d'un document |
| Comptes désactivés | Mensuelle | *Personnel* : vérifier que les partants sont désactivés |
| Motifs de passe échoués | Hebdomadaire | *Historique* : filtrer sur `CONNEXION_ECHOUEE` |
| Pièces du référentiel | Trimestrielle | *Référentiel → Types de pièces* : ajuster obligations et périmètres |
| Espace disque des pièces jointes | Mensuelle | Taille de `Backend/src/uploads/` |

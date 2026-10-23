# Manuel de l'utilisateur — SRSP Fitovinany

Ce manuel décrit l'usage de la plateforme, écran par écran, pour les profils
qui traitsent des dossiers au quotidien : **secrétariat**, **agent de
traitement**, **chef de division**, **vérificateur VISA**, **chef de service**.

Le guide d'administration (comptes, référentiel, sauvegardes) est dans
[GUIDE_ADMIN.md](GUIDE_ADMIN.md). La procédure de sauvegarde et de
restauration est dans [SAUVEGARDE_RESTITUTION.md](SAUVEGARDE_RESTITUTION.md).

---

## 1. Connexion

1. Ouvrir l'adresse de l'application (par exemple `http://localhost:5173`).
2. Saisir l'**identifiant** (nom d'utilisateur ou e-mail) et le **mot de
   passe**.
3. Cliquer sur **Se connecter**.

La session se ferme automatiquement après une période d'inactivité. Il faut
alors se reconnecter — c'est une mesure de sécurité, pas un défaut.

> **Mot de passe oublié** : cliquer sur « Mot de passe oublié » sur l'écran de
> connexion et saisir l'e-mail du compte. Un administrateur peut aussi
> réinitialiser un mot de passe depuis *Administration → Personnel*.

Après connexion, l'écran d'accueil est le **tableau de bord**. L'onglet
« Ma boîte de travail » liste ce qui attend une action.

> **Mot de passe oublié** : voir § 1.1 ci-dessous.

### 1.1 Mot de passe oublié
La plateforme **n'envoie ni e-mail ni SMS** : ces canaux sont exclus du
périmètre. La procédure passe par l'administrateur du service, qui vérifie
votre identité.

**Étape 1 — déposer la demande.** Depuis l'écran de connexion, cliquer sur
« Mot de passe oublié ? », saisir votre identifiant ou votre e-mail, puis
*Demander un code*.

La réponse est **la même** que le compte existe ou non : c'est délibéré, une
réponse qui dirait « compte inconnu » permettrait d'énumérer les comptes du
service. Dans tous les cas, la demande est transmise à l'administrateur, qui
en est prévenu par notification interne.

**Étape 2 — recevoir le code.** L'administrateur vérifie votre identité et
vous remet un **code de six chiffres**, valable **quinze minutes** et
utilisable **une seule fois**. Il vous le communique par le moyen qu'il
juge approprié.

> L'administrateur ne choisit **pas** votre mot de passe. Il lève seulement
> le verrou : c'est vous qui le choisissez, et personne ne le voit en clair.

**Étape 3 — choisir le nouveau mot de passe.** Cliquer sur « J'ai mon code de
réinitialisation », saisir l'identifiant, le code, puis le nouveau mot de
passe et sa confirmation.

La politique de mot de passe s'applique : **8 caractères minimum**, avec une
majuscule, une minuscule, un chiffre et un caractère spécial. L'écran montre
les règles au fur et à mesure de la saisie.

> Un code erroné ou expiré est refusé. Au-delà de **cinq tentatives**, la
> demande est annulée : il faut en déposer une nouvelle.

**Ce que la réinitialisation entraîne.** Les sessions ouvertes sur votre
compte sont **fermées**, y compris celle-ci : vous êtes ramené à l'écran de
connexion. C'est indispensable : si quelqu'un avait volé votre mot de
passe, la réinitialisation doit lui retirer l'accès.

**Compte verrouillé.** Après cinq tentatives de connexion infructueuses, le
compte est bloqué quinze minutes. L'administrateur peut le déverrouiller
lorsqu'il délivre le code : c'est souvent la raison de la demande.

---

## 2. Le tableau de bord et la boîte de travail

### 2.1 Tableau de bord

Le tableau de bord est personnalisé selon le rôle. Il affiche notamment :

- le nombre de dossiers **reçus**, **en cours**, **terminés**, **urgents** ;
- la **répartition par division** et par **statut** ;
- l'**évolution** mensuelle des entrées ;
- les **indicateurs du secrétariat** (pour le profil secrétaire) ;
- un aperçu de la **boîte de travail**.

### 2.2 Boîte de travail

C'est l'écran qui répond à la question : *« qu'est-ce qui m'attend ? »*.

| File | Ce qu'elle contient |
|---|---|
| **À traiter par moi** | Les dossiers dont l'action suivante vous incombe, selon votre rôle. |
| **En attente de validation** | Les dossiers soumis à vérification. |
| **Incomplets** | Les dossiers dont une pièce obligatoire n'est pas « présente ». |
| **Clôturés récemment** | Les dossiers.aboutis dans les 30 derniers jours. |

La page donne aussi le **total par catégorie** (type de dossier) et le **total
par statut** : la carte du service en un coup d'œil.

> Un dossier n'est jamais qualifié « en retard ». Une date limite n'a de sens
> que si elle a été validée, et le service ne l'impose pas. L'écran affiche
> l'**échéance dépassée** lorsqu'il y en a une, et l'**âge** du dossier
> (nombre de jours depuis la réception) dans tous les cas.

### 2.3 Le temps réel

En haut de l'écran, à droite, un **point vert** signale que le canal temps
réel est établi : les écrans se rafraîchissent seuls dès qu'un dossier change
d'état. Un dossier soumis à vérification apparaît dans la file du Chef de
Division sans qu'il ait à recharger la page.

Le point devient **ambre** pendant la connexion, et **gris** avec la mention
« Hors ligne » si le canal est coupé. Dans ce cas, les données peuvent être
périmées : le bouton *Actualiser* de la barre supérieure recharge la page.

> Le canal ne transporte que l'alerte. Ce qui est affiché vient toujours de
> l'API : le temps réel accélère l'affichage, il ne le décide pas.

---

## 2 bis. « À faire ensuite »

En tête de chaque fiche dossier, un bloc encadré répond à la question que
l'agent pose le plus souvent : **que dois-je faire, et est-ce à moi ?**

```
┌────────────────────────────────────────────────────────┐
│ À FAIRE ENSUITE                                          │
│ Vérifier et décider                                      │
│ Le dossier attend la vérification du Chef de Division.   │
│ [En attente de : Le Chef de la division Visa]            │
└────────────────────────────────────────────────────────┘
```

Deux informations y sont tenues séparées, et c'est tout l'intérêt :

- **l'étape suivante** — ce que le dossier attend ;
- **l'acteur** — qui doit agir.

Quand l'action revient à l'agent connecté, le bloc l'affiche sous forme de
bouton et l'annonce par « **C'est à vous** ». Quand elle revient à un autre
poste, il le dit — « en attente de : Le Chef de Service » — et **n'affiche
aucun bouton** : un bouton qui mènerait à un refus apprend à l'agent à
ignorer les boutons.

Le clic sur le bouton ouvre directement l'action annoncée : l'agent n'a pas
à chercher lequel presser.

> Cette information est calculée par le serveur, en un seul endroit. Le
> tableau de bord, la liste et la fiche ne peuvent donc pas se contredire.

---

## 3. Créer un dossier

**Menu Dossiers → Nouveau dossier** (ou le bouton *Nouveau dossier* de la
liste).

### 3.1 Champs communs

| Champ | Obligatoire | Remarque |
|---|---|---|
| Type de dossier | oui | Détermine la division et le circuit. |
| Objet | oui | 500 caractères maximum. |
| Demandeur (nom, prénom) | oui | |
| Matricule | non | 2 à 10 caractères, chiffres et lettres. |
| Date de réception | oui | Par défaut, la date du jour. |
| Priorité | oui | Urgente, Haute, Normale, Basse. |

La **matricule** sert d'aide : si elle est déjà connue, l'application propose
le dossier existant. Ce n'est **pas** un blocage — un client revient
légitimement pour un visa, puis pour une solde, puis pour une pension.

### 3.2 Champs VISA (dossiers VISA uniquement)

Pour un dossier VISA, la fiche de réception comporte des champs propres. Ils
sont **obligatoires à la création** : les renseigner au guichet, c'est les
demander au demandeur pendant qu'il est là.

| Champ | Contenu |
|---|---|
| **Type d'acte** | Liste déroulante des types d'acte (mariage, naissance, décès, séjour, autre). Configurable par l'administrateur. **Demandé dès la première étape** : c'est lui qui dit de quel acte il s'agit, et le serveur l'exige. |
| **Date et heure de réception** | Moment précis de la remise du dossier. |
| **Origine / présentateur** | Qui a remis le dossier (guichet, courrier, etc.). |
| **Comptable présentateur** | Le comptable qui a transmis la demande. |
| **Année de référence** | Année de l'acte visé. |
| **Vérificateur** | L'agent qui instruit le dossier. |
| **Bénéficiaire** | La personne concernée. |
| **Organisme** | L'organisme émetteur. |
| **Référence VISA** | Unique. Par défaut, le numéro de dossier. |

Pendant la saisie, un encadré **« Fiche de réception VISA — à compléter »**
rappelle en permanence ce qui manque. Le bouton *Créer le dossier* n'est
jamais gris : un clic affiche la liste exacte de ce qu'il reste à renseigner.
Aucun bouton ne bloque sans dire pourquoi.

Le dossier reçoit automatiquement un numéro de la forme
`VISA-2026-000042`, et sa référence VISA.

À la création, le dossier est **orienté** vers la division de son type et
**affecté** à un agent de traitement. Il n'attend donc pas une orientation
manuelle.

### 3.3 Le type d'opération

Chaque division distingue des **types d'opérations** :

| Division | Types |
|---|---|
| **VISA** | Type d'acte : mariage, naissance, décès, séjour, autre |
| **Solde** | Mandatement, fiche de contrôle, dossier mère, transfert de localité, avance de solde, trop-perçu, certificat de cessation de paiement, bon de caisse, domiciliation irrévocable de salaire |
| **Pensions** | Liquidation, dossier mère, lettre de prescription, demande de dossier mère, opposition sur pension, derniers arrérages, bon de caisse en retour, certificat de cessation de paiement |

Le type d'opération se choisit **à la création**. Il porte le libellé
affiché sur le dossier et détermine **les pièces obligatoires** de son
dépouillement.

> Le type d'acte (VISA) ou d'opération (autres divisions) est demandé dès la
> **première étape** : un dossier publié doit dire de quelle opération il
> s'agit. Un clic sur *Continuer* sans l'avoir choisi indique précisément
> quoi faire — aucun bouton ne se fige sans explication.

> Les listes exactes de pièces par opération restent **à valider par le
> SRSP** : elles sont configurables depuis l'écran *Référentiel*, sans
> développement.

### 3.4 Enregistrer en brouillon

Si la fiche n'est pas complète — le demandeur doit revenir demain avec une
pièce, une référence manque —, le bouton **« Enregistrer en brouillon »** la
met de côté.

Un brouillon : n'est **visible que de vous** ; n'apparaît dans **aucune
liste, aucune file, aucun compteur** ; ne déclenche **aucune notification** ;
et ne peut être publié que par vous. Le dossier garde son numéro définitif :
une référence n'est jamais réutilisée.

Pour le retrouver : l'onglet **« Mes brouillons »** de la liste des dossiers.
Une fois la fiche complétée, le bouton **« Publier le brouillon »** l'envoie
dans le circuit : il est alors orienté, affecté et notifié comme une
création ordinaire.

> Un brouillon VISA incomplet ne peut pas être publié : la plateforme exige
> la fiche complète avant que le dossier n'entre dans le circuit.

---

## 4. Traiter un dossier

### 4.1 La fiche dossier

La fiche s'ouvre sur l'onglet **Informations**. Les onglets disponibles sont :

| Onglet | Contenu |
|---|---|
| **Informations** | Objet, demandeur, division, dates, agent responsable, ancienneté, observation, archivage. |
| **Documents** | Pièces jointes : dépôt, téléchargement, suppression, versions. |
| **Transmissions** | Bordereaux par lesquels le dossier a circulé : expéditeur, destinataire, date, référence, accusé de réception. |
| **Historique** | Journal des actions et traçabilité des actes (affectations, traitements, décisions). |
| **Commentaires** | Commentaires internes, visibles du service. |
| **Opération** | *(Solde, Pensions, Secours)* Données propres à l'opération : référence du dossier mère, période, montant, contrôle et validation. |
| **Correspondances** | *(Pensions, Secours)* Prescriptions, oppositions, derniers arrérages, et leur suivi jusqu'au niveau central. |
| **VISA** | *(dossiers VISA)* Métadonnées de la fiche, signature, dérogation, complément, contrôle des pièces. |
| **Secours** | *(dossiers Secours)* Dépouillement, mandatement et les cinq étapes du mandat : visa du contrôle financier, références du logiciel Secours, état d'émargement, signature de l'ordonnateur, cachet. |

> La signature de l'ordonnateur se termine par **l'archivage de la copie
> signée**. Ce n'est pas un détail de forme : tant que la copie n'est pas
> archivée, la signature reste un état indéfiniment — personne ne sait si le
> papier a été conservé. Le bouton n'apparaît qu'une fois la signature
> enregistrée, et l'écran affiche ensuite la date d'archivage.

### 4.2 Les actions possibles

Les boutons disponibles dépendent **du statut** et **du profil**. Un bouton
qui n'a pas de sens pour votre rôle n'apparaît pas.

| Action | Quand | Qui |
|---|---|---|
| Modifier | Dossier non clôturé | Secrétaire, Coordonnatrice, Administrateur |
| Publier le brouillon | Dossier en brouillon | Son auteur |
| Changer l'agent affecté | Dossier reçu, orienté, affecté ou en correction | Chef de division |
| Prendre en charge | Dossier affecté, en correction ou en attente de complément | Agent de traitement |
| Soumettre à vérification | Dossier en traitement | Agent de traitement |
| Demander un complément | Dossier en traitement ou soumis | Agent, vérificateur, chef de division |
| Décider (valider / corriger) | Dossier soumis à vérification | Chef de division, Chef de service |
| Signer le dossier | Dossier validé | **Chef de service uniquement** |
| Archiver | Dossier clôturé (ou signé, pour le VISA) | Chef de service, Vérificateur VISA |
| Supprimer | Dossier reçu, enregistré, orienté ou affecté, **sans traitement** | Administrateur technique |

> Le bloc « À faire ensuite » (§ 2 bis) indique en permanence l'action
> attendue et son responsable : il n'est pas nécessaire de connaître le
> circuit pour savoir quoi presser.

### 4.3 Le circuit VISA

Le circuit VISA est le suivant :

```
Reçu → Enregistré → Orienté → Affecté → En cours d'exploitation
     → En attente de complément (si une pièce manque)
     → Soumis au Chef de Division
     → À corriger (⇄ retour en traitement)  ou  Validé
     → À présenter pour signature (signé par le Chef de Service)
     → À archiver  →  Archivé
```

Trois points méritent attention :

1. **La signature du Chef de Service est distincte de la vérification par le
   Chef de Division.** Un dossier vérifié n'est pas signé. Aucun rôle
   technique ne peut signer à la place du Chef de Service : le contrôle est
   fait par le serveur, et le bouton n'est proposé qu'au Chef de service.
2. **L'archivage exige la signature** enregistrée (date et signataire) et les
   pièces d'archivage obligatoires. Le dossier signé s'archive directement,
   sans clôture intermédiaire.
3. **Un dossier incomplet ne peut pas être validé.** La validation est
   bloquée si un champ obligatoire manque ou si une pièce obligatoire n'est
   pas « présente ». Seul le Chef de service peut passer outre, avec un motif
   écrit : la dérogation est enregistrée sur le dossier et reste visible.

### 4.4 Motifs obligatoires

Trois actions exigent un motif écrit. Ce motif est celui qui dit à
l'intéressé ce qu'il doit faire :

- **Demander un complément** : le motif est transmis au demandeur.
- **Demander une correction** : le motif explique ce qui doit être repris.
- **Supprimer un dossier** : le motif est conservé dans la trace de
  suppression.

### 4.5 Réaffectation

Un changement d'agent demande un motif. La fiche conserve l'**ancien agent**,
le **nouveau**, l'**auteur** et le **motif** : le transfert reste lisible.

---

## 5. Le contrôle des pièces (dépouillement)

Onglet **Opération** (Solde, Pensions), **Secours** ou **VISA**.

Chaque pièce requise par le type de dossier et le type d'opération est
listée avec cinq états possibles :

| État | Signification |
|---|---|
| **Présente** | La pièce est là, lisible. |
| **Manquante** | La pièce n'a pas été fournie. |
| **Illisible** | La pièce est là mais ne peut pas être lue. |
| **À corriger** | La pièce est lisible mais comporte une erreur. |
| **Non applicable** | La pièce n'a pas à être fournie pour ce dossier. |

« Présente » **et** « non applicable » satisfont une pièce obligatoire : une
pièce qui ne s'applique pas n'avait pas à être là, et la traiter comme
manquante bloquerait le dossier à tort.

Les trois autres états demandent un **motif**, qui est transmis au
secrétariat et conservé dans la fiche.

> **L'historique des contrôles.** Sous la check-list, un lien **Historique
> des contrôles** ouvre la trace chronologique : quelles pièces ont été
> contrôlées, par qui, et dans quel ordre. La check-list répond à « quel est
> l'état de chaque pièce » ; l'historique répond à « quand a-t-on contrôlé
> celle-ci, et qui l'a fait ». Il ne s'ouvre que si vous le demandez — rien
> à personne ne sert de faire défiler un historique pour une liste de dix
> pièces.

La pièce obligatoire manquante bloque la validation, et l'archivage pour les
pièces d'archivage.

### 5.1 Les versions d'un document

Un dépôt ne **remplace pas** le fichier déposé : il crée la version
suivante. La version précédente est conservée, et le lien entre les deux
est visible dans l'onglet *Documents*.

C'est ce qui permet de montrer ce qui avait été produit, puis ce qui l'a
remplacé. Le **motif du remplacement** est demandé et conservé.

> Une version antérieure ne peut pas être supprimée : elle est la trace. Si
> le dépôt le plus récent est erroné, c'est lui qu'on supprime.

---

## 5 bis. Les données de l'opération

Onglet **Opération** (Solde, Pensions, Secours).

Chaque division a ses **types d'opérations**, et chaque opération ses
données propres. L'onglet les réunit sur une seule fiche :

| Champ | Usage |
|---|---|
| **Référence externe** | La référence de l'opération : bon de caisse, mandat, opposition… |
| **Référence du dossier mère** | Le dossier permanent de l'agent, s'il en existe un. |
| **Période concernée** | La période couverte par l'opération. |
| **Montant** | **Saisi** par l'agent qui instruit. *Aucun calcul n'est fait.* |
| **Source du montant** | D'où vient le chiffre : un relevé, une décision, un barème. C'est cette ligne qui rend le montant vérifiable. |
| **Date de référence**, **Destinataire**, **Localité** | Les repères de l'opération. |
| **Observation** | Ce qui doit être su. |

Deux gestes, deux profils :

- **Saisir** — l'agent qui instruit le dossier (vérificateur Solde,
  liquidateur Pensions, chargé Secours, vérificateur VISA).
- **Contrôler et valider** — le **chef de division**. Sa décision, sa date
  et ses observations sont conservées ; le montant porte alors la mention
  « validé le … par … ».

> L'agent qui a saisi **ne peut pas** contrôler sa propre opération. C'est
> vérifié par le serveur, et c'est la raison pour laquelle les deux droits
> sont distincts.

### 5.2 Les formulaires suivent l'opération

Le formulaire n'est pas le même pour toutes les opérations. Une **avance de
solde** demande la durée et le décompte validé ; un **transfert de
localité** demande la localité d'origine, celle de destination, le motif et
la date ; un **bon de caisse** demande la référence, la mention « Vu bon à
payer » et la signature.

Ces champs sont définis par l'administration, depuis *Référentiel → Schémas
d'opérations*. Vous n'avez donc rien à signaler quand un champ manque :
il suffit de le dire.

---

## 5 bis. Les correspondances (Pensions et Secours)

Onglet **Correspondances**.

Une correspondance est une lettre, une demande ou une opposition :
prescription, demande de dossier mère, opposition sur pension, derniers
arrérages.

Chaque correspondance porte sa **référence**, son **destinataire**, son
**objet**, la **pièce liée** et son **état de réponse**. Pour une opposition
ou des derniers arrérages, elle porte aussi la **transmission centrale** :
date, destinataire central, référence de bordereau et état de réception.

C'est ce qui permet de suivre une opposition jusqu'au niveau central, sans
chercher dans plusieurs registres.

---

## 5 ter. Immatriculations (Coordination)

Menu **Immatriculations**.

Trois gestes, dans l'ordre où ils se produisent :

1. **La demande d'immatriculation.** Vous saisissez l'identité de l'agent et
   la plateforme lui attribue une **référence**. Le CIN et le matricule ne
   peuvent pas être partagés : un doublon est **refusé à l'enregistrement**,
   pas découvert plus tard à la paie.
2. **L'insertion en paie.** Vous saisissez les éléments requis par les
   systèmes de paie et de pension : matricule du système, situation
   familiale, adresse, téléphone, indice de base, salaire de base.
3. **Le changement de mode de paiement.** Le **motif est obligatoire** —
   une décision sans motif ne s'explique ni ne s'audite — et les pièces
   justificatives doivent être cochées. Un virement exige un numéro de
   compte ; le serveur le refuse sinon.

En tête de l'écran, les **volumes** : combien de demandes de chaque type ont
été enregistrées.

---

## 5 quater. Les signalements (dossier bloqué)

Onglet **Signalements** de la fiche, et menu **Signalements** pour la hiérarchie.

Un dossier peut être bloqué sans que son statut change : une pièce qu'un
service extérieur ne renvoie pas, un désaccord entre deux divisions, une
décision qui remonte au chef de service. Le signalement sert à **nommer cette
difficulté et à lui donner un responsable**, sans sortir le dossier de son
circuit.

**Chef de division** — dans la fiche d'un dossier de votre division, bouton
*Signaler un blocage* : choisissez la nature (blocage, interlocution,
arbitrage), la priorité, et écrivez le motif (10 caractères minimum). Le
signalement part dans la file du chef de service.

**Chef de service** — menu **Signalements** : la file montre les signalements
ouverts de toutes les divisions. Vous pouvez *prendre en charge* (le
signalement passe « en cours »), puis *résoudre* ou *rejeter* — dans les deux
cas avec un texte obligatoire. L'auteur est notifié à chaque étape.

**Coordination et Chef BAAF** — consultation de la file et de l'état.

Un signalement **ne change jamais le statut du dossier** : il est une trace de
suivi, pas une transition de workflow. Le dossier continue d'avancer pendant
que la difficulté est instruite.

---

## 6. Les pièces jointes

Onglet **Documents**.

- **Déposer** : PDF, JPG, PNG, DOCX ou XLSX, **5 Mo maximum**. Le fichier
  peut être rattaché à une pièce du dépouillement.
- **Télécharger** : ouvert à tout profil qui voit le dossier.
- **Supprimer** : réservé au déposant du fichier et à l'administrateur.

Le nom du fichier est remplacé par un identifiant sur le serveur : le nom
d'origine ne révèle pas qui a déposé la pièce. Un dossier archivé n'accepte
plus de dépôt.

---

## 7. Recherche et listes

La liste des dossiers se filtre par :

- **recherche** : numéro de dossier, référence VISA, objet, demandeur,
  bénéficiaire ;
- **statut**, **type** ;
- **division**, **responsable**, **période de réception** : dans
  *Filtres avancés*.

Le périmètre est restreint par le serveur : un agent ne voit que ses dossiers,
un chef de division que ceux de sa division. Choisir une division ou un
responsable hors de son périmètre ne produit pas de résultat, jamais un
résultat trompeur.

Les onglets de la liste (Nouveaux, En cours, Terminés, Urgents, Archivés,
Incomplets, **Mes brouillons**) sont des filtres serveur : le compteur affiché
correspond exactement au contenu de la liste, et le **nombre de résultats**
est annoncé au-dessus du tableau.

> **Au secrétariat, les onglets sont les types de dossier** — *Visas*,
> *Soldes*, *Pensions*, *Secours* — et non l'avancement du traitement. Voir
> § 7.2.

### 7.1 Le triage : trier et regrouper par statut ou par niveau

Le triage sert à retrouver vite le dossier à traiter, et à voir d'un coup d'œil
où en est le service. Il est **ouvert à tous les profils** : chaque agent trie
sa file, chaque chef de division trie sa division, chaque chef de service trie
le service.

**Trier par** — un sélecteur au-dessus de la liste. Le tri ne change ni le
contenu de la liste, ni les droits, ni l'état d'un dossier : c'est un ordre
de lecture.

| Tri | Ce qu'il met en tête |
|---|---|
| À traiter en premier | L'urgence, puis l'échéance, puis l'ancienneté |
| **Niveau de priorité (urgent d'abord)** | Les dossiers du niveau le plus haut au plus bas : URGENTE (niveau 4) → HAUTE (3) → NORMALE (2) → BASSE (1) |
| **Niveau de priorité (faible d'abord)** | L'ordre inverse, pour relire une file du moins prioritaire au plus urgent |
| **Statut du circuit** | Les dossiers selon l'ordre du workflow : reçu → enregistré → orienté → affecté → en traitement → en attente de complément → soumis à vérification → correction demandée → validé → signé → clôturé → archivé |
| Statut du circuit (inverse) | Le même ordre, en remontant le circuit |
| Échéance la plus proche | Les dossiers dont la date limite approche |
| Priorité | Les plus urgents d'abord, statut du circuit en second |
| Plus anciens / plus récents d'abord | L'ancienneté de la réception |
| Numéro de dossier | L'ordre des numéros |
| Type de dossier | Par nature de demande (Visa, Solde, Pension, Secours) |
| Division | Par division |
| Agent responsable | Par agent |
| Demandeur | Par ordre alphabétique du nom |
| **Dossiers signalés** | Les dossiers bloqués qui attendent une décision de la hiérarchie |

**Le niveau de priorité** est celui du référentiel : le SRSP peut renommer une
priorité ou changer son rang sans modifier l'application. La colonne *Niveau*
affiche le libellé et le rang (par exemple « URGENTE — niveau 4 »). Le filtre
**Niveau de priorité**, dans *Filtres avancés*, isole un niveau précis — utile
pour traiter d'abord les urgents d'une division.

**Grouper par statut** — un bouton à côté du tri. La liste est alors
découpée en **sections, une par statut du circuit**, et chaque section affiche
son effectif : c'est la vue qui répond à « où en est le service ? ». Une
section de plus de dix dossiers est repliée ; un clic la déploie.

**Grouper par niveau** — le second bouton. La liste est découpée en sections
par niveau de priorité, **du plus urgent au moins urgent** : URGENTE, puis
HAUTE, puis NORMALE, puis BASSE. Chaque section affiche son rang et son
effectif. Les dossiers dont la priorité n'est pas connue forment une dernière
section, jamais escamotée. Les deux regroupements sont exclusifs : un clic sur
l'un remplace l'autre, un second clic revient à la liste plate.

Les deux se combinent avec le tri : on peut grouper par niveau et, à
l'intérieur de chaque section, trier par échéance ou par statut.

**Le dernier mouvement** — la liste porte une colonne *Dernier mouvement* :
le dernier acte enregistré (création, affectation, traitement, validation,
archivage…) et sa date. C'est la circulation récente du dossier, visible sans
ouvrir la fiche ; l'onglet *Historique* en donne le détail complet.

Le même tri est proposé dans la **boîte de travail** (il ordonne les quatre
files) et dans la liste des **dossiers prêts à être archivés**.

> **Chercher une circulation** — le journal (*Historique*) se cherche par
> numéro de dossier, référence visa, **demandeur**, **matricule**, agent,
> action ou détail. Un lecteur qui connaît la personne mais pas le numéro de
> son dossier retrouve donc tous ses passages.

### 7.2 Les onglets du secrétariat : par type de dossier

Le secrétariat instruit les quatre natures de dossier. Ce qui les rassemble
n'est pas leur avancement — un visa et un secours ne se traitent pas de la
même façon — mais leur nature : les onglets de l'écran *Dossiers* sont donc
**Visas, Soldes, Pensions, Secours**, plus un onglet *Tous*.

| Onglet | Ce qu'il montre |
|---|---|
| **Visas** | Les demandes de visa et d'exploitation |
| **Soldes** | Les mandatements et avances de solde |
| **Pensions** | Les liquidations de pension et oppositions |
| **Secours** | Les secours de décès |
| **Tous** | Les quatre types réunis |

Chaque onglet porte son **effectif**, calculé par le serveur : le nombre
annoncé est exactement celui que la liste va montrer.

En dessous, des **filtres rapides** complètent l'onglet choisi : *Nouveaux*,
*Urgents*, *Incomplets*, *Mes brouillons*. Ils se **cumulent** avec l'onglet :
« Secours » puis « Urgents » donne les dossiers Secours urgents ; un clic de
plus sur le même filtre l'enlève.

La recherche, le tri, le regroupement par statut et les filtres avancés
(division, responsable, période) restent disponibles, exactement comme pour
les autres profils.

> Les autres profils — chef de service, chef de division, vérificateur — gardent
> leurs onglets d'avancement (*Nouveaux*, *En cours*, *Terminés*…), qui
> répondent à « qu'est-ce qui m'attend ? ». Un chef de division ne voit de
> toute façon qu'une seule nature de dossier.

---

## 8. Notifications et commentaires

- **Notifications** : messages internes, sans e-mail ni SMS. Chaque
  notification se marque comme lue.
- **Commentaires** : commentaires internes attachés au dossier, visibles du
  service. Ils ne remplacent jamais le motif d'une décision.

---

## 9. Rapports

Menu **Rapports**. Les rapports s'exportent en **PDF** et en **Excel**. Parmi
eux :

- **Rapport VISA** — activity on the VISA dossiers.
- **Rapport VISA par vérificateur** — volumes treated by verifier.
- **Journalier des reçus**, **Dossiers par période**, **Incomplets**,
  **Retournés**, **Clôtures**, **Archives**, **Transmissions par division**,
  **Registre des courriers**, **Statistiques par type / période / division**.

---

## 9 bis. Le territoire (antennes et districts)

Menu **Territoire**.

Le SRSP est régional : les antennes et leurs districts sont la carte du
service. L'écran montre :

- la **synthèse par antenne** : combien de dossiers sont rattachés à chaque
  antenne, combien sont en cours, combien sont en retard, et la part de
  chacune. Les dossiers **sans district** sont comptés à part — ils ne sont
  pas perdus, et le total se retrouve ;
- le **référentiel territorial** : les antennes et, pour chacune, ses
  districts. L'antenne marquée **Siège** est celle qui porte le service
  central.

Vous pouvez y **rattacher un dossier à un district** : saisissez son numéro,
choisissez le district, validez. L'écran montre ensuite le district courant
du dossier et l'historique de ses rattachements — un dossier peut en avoir
changé, et l'on voit qui l'a rattaché et quand.

---

## 9 ter. La performance du service

Menu **Performance**.

Les chiffres du service : combien de dossiers sont traités, clôturés,
archivés, en cours, en attente, à corriger ; le **délai moyen** entre la
réception et la clôture ; le **taux de traitement**.

Surtout, la liste des **dossiers en retard** : ceux dont la date limite
saisie est dépassée, avec le nombre de jours de retard. C'est l'information
la plus utile de l'écran — le retard le plus ancien est en haut.

Viennent ensuite la répartition par division, la répartition par agent, et
l'évolution du volume sur douze mois.

> Tous ces chiffres sont **restreints à votre périmètre** : un chef de
> division ne voit que sa division, un agent que ses propres dossiers. Vous
> ne voyez pas les chiffres des autres, et l'écran ne les demande pas.

---

## 10. Les rôles et ce qu'ils ne peuvent pas faire

| Rôle | Peut | Ne peut pas |
|---|---|---|
| Administrateur technique | Gérer comptes, rôles, divisions, référentiel, suppression motivée de dossiers non traités | **Valider, signer, archiver un dossier, décider d'un métier** |
| Chef de Service | Valider, **signer**, archiver, déroger à la validation | Modifier le référentiel technique |
| Chef de Division | Valider, vérifier, affecter, contrôler les pièces | Signer à la place du Chef de Service |
| Agent / Vérificateur | Traiter, soumettre, contrôler les pièces, demander un complément | Valider, signer |
| Secrétaire / Coordination | Enregistrer, orienter, modifier, transmettre | Traiter un dossier métier |

> L'administrateur technique n'hérite d'aucun pouvoir de décision métier.
> C'est délibéré : un compte technique qui valide, signe ou archive un
> dossier rend la séparation des responsabilités inexistante.

---

## 11. Bonnes pratiques

1. **Enregistrer une seule fois.** Un dossier est créé au guichet, avec ses
   champs VISA renseignés. Demander une information plus tard, c'est un
   aller-retour inutile.
2. **Motiver systématiquement** une correction, un complément, une
   réaffectation. Le motif est l'information qui fait avancer le dossier.
3. **Contrôler les pièces avant de soumettre.** La validation sera bloquée
   sinon, et le dossier reviendra au même endroit.
4. **Utiliser la boîte de travail** au lieu de parcourir les listes : elle
   montre ce qui attend votre action, dans votre périmètre.
5. **Archiver plutôt que supprimer.** La suppression est réservée à
   l'administrateur, exige un motif, et n'est possible qu'avant le début du
   traitement.
6. **Changer son mot de passe** si on suspecte qu'il a été communiqué. La
   plateforme n'envoie ni e-mail ni SMS.

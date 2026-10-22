# Conformité au cahier des fonctionnalités v2.0

**SRSP Fitovinany** — *Plateforme web de gestion, de suivi et de traçabilité des dossiers administratifs*
Cahier : version 2.0 du 21 octobre 2026 — *version détaillée orientée utilisateur*

Ce document répond à une seule question : **sur ce que le cahier demande,
qu'est-ce qui est en place, et qu'est-ce qui reste à valider ou à
développer ?**

## L'état, mesuré

Le cahier compte **460 exigences**. Le registre en tient une par une, avec
son état et son motif. Le relevé se fait par
`node Backend/scripts/etat-fonctionnalites.mjs`.

| État | Nombre | Part |
|---|---|---|
| **Livrée** | **364** | **79 %** |
| Hors plateforme — un autre système, une autre direction, ou une procédure RH | 61 | 13 % |
| Non construite | 22 | 5 % |
| Partielle | 13 | 3 % |

| Document | Livrées |
|---|---|
| **Cahier v2.0 — fonctionnalités obligatoires** | **172 / 180 — 96 %** |
| Cahier v2.0 — fonctionnalités historiques | 192 / 280 — 69 % |

> Les états du registre ne sont pas des déclarations : la campagne
> `test-e2e-droits.mjs` vérifie que chaque fonction déclarée livrée repose
> sur un droit qui existe, qui est porté par un rôle, et qui mène à une
> route. Une fonction dont le droit ne mène nulle part est « inerte » — et
> le registre la compte comme telle.

Trois mentions sont employées :

| Mention | Sens |
|---|---|
| **En place** | La fonction existe, elle est utilisable, et elle est éprouvée par une campagne de tests. |
| **En place — à valider** | La fonction existe et fonctionne, mais elle repose sur une règle que le cahier ne tranche pas : elle attend la validation du SRSP. |
| **Proposé** | La fonction est suggérée par le cahier ou par son historique, mais elle n'est pas encore développée. |
| **Hors périmètre** | La fonction n'est pas développée, et le motif est donné. |

---

## 1. Objectif, périmètre et règle de lecture

| Exigence | État | Commentaire |
|---|---|---|
| Centraliser les dossiers, organiser leur distribution, rendre chaque étape visible | **En place** | Un dossier, un circuit commun, une fiche unique qui montre l'étape et l'acteur. |
| Ne pas remplacer les décisions des agents habilités | **En place** | Aucune décision métier n'est automatisée. La signature reste au Chef de Service, la validation au Chef de Division. |
| Ne pas inventer de calculs, de pièces obligatoires ou de procédures | **En place** | Aucun calcul de solde, de taux ou de décompte n'est automatisé. Les pièces et les formules restent à valider (§ 18). |
| Éviter les saisies répétées | **En place** | Matricule connu → fiche pré-remplie ; division déduite du type ; type d'acte porté par le sous-type ; pièces issues du référentiel. |
| Remplacer les recherches manuelles longues | **En place** | Recherche par référence, bénéficiaire, objet, matricule ; filtres division, responsable, période, statut, type. |
| Montrer les dossiers qui nécessitent une action | **En place** | Boîte de travail (4 files) + bloc « À faire ensuite » sur chaque fiche. |
| Faciliter les transmissions avec trace | **En place** | Bordereaux, onglet *Transmissions* sur la fiche, expéditeur / destinataire / date / référence. |
| Séparer traitement, vérification, signature, archivage | **En place** | Statuts distincts ; la signature du Chef de Service est une étape à part, contrôlée par rôle. |
| Protéger les données et limiter les accès | **En place** | Cloisonnement par division et par agent, appliqué par le serveur ; journal d'audit ; révocation des sessions. |

**Divisions couvertes** : Solde, Pensions, VISA, Secours de décès — les quatre divisions existent, avec leur routage automatique, leur dépouillement et leurs types d'opérations.

---

## 2. Principes pour une application facile à utiliser

| Règle | État | Commentaire |
|---|---|---|
| Peu de clics | **En place** | Le tableau de bord mène à la file en un clic ; la fiche mène à l'action en deux. |
| Un écran = un objectif | **En place** | Réception, traitement, vérification, signature, archivage, transmissions : des écrans distincts. |
| Saisie une seule fois | **En place** | La division, le type d'opération et les pièces sont déduits, pas ressaisis. |
| Champs conditionnels | **En place** | Les champs VISA n'apparaissent que pour le VISA ; le type d'opération que pour les divisions qui en distinguent. |
| Libellés simples | **En place** | « Soumettre au Chef de Division » plutôt que « transition SOUMIS_A_VERIFICATION ». |
| **Prochaine action visible** | **En place** | Bloc « À faire ensuite » en tête de fiche : l'étape, le poste attendu, et le bouton si l'action revient à l'agent. *(Test d'acceptation T15.)* |
| Messages compréhensibles | **En place** | Les messages nomment ce qui manque et ce qu'il faut faire, jamais un code technique. |
| Pas de suppression silencieuse | **En place** | Suppression réservée à l'administrateur, motif obligatoire, trace durable conservée. |
| Impression propre | **En place** | Fiche de réception PDF, rapports PDF/Excel, bordereaux. |
| Adaptation écran | **En place** | Barre latérale repliable, tableaux défilables, consultation sur tablette. |

**Comportement des formulaires**

| Exigence | État |
|---|---|
| Astérisque sur les obligatoires, utilité expliquée | **En place** — chaque champ porte son aide. |
| Date de réception préremplie, identité du compte | **En place** |
| Ne pas ressaisir la division | **En place** — elle découle du type, l'écran l'annonce. |
| **Enregistrement en brouillon** | **En place** — un dossier mis de côté, visible de son seul auteur, jamais dans les files ni les compteurs. |
| Conserver la saisie après erreur | **En place** — les valeurs saisies sont conservées. |
| Nombre de pièces ajoutées / manquantes | **En place** — résumé du dépouillement par phase. |
| Confirmation avant action sensible | **En place** — clôture, archivage, suppression, publication d'un brouillon. |
| Motif obligatoire pour un retour | **En place** — correction, complément, réaffectation, suppression, annulation d'une demande. |

**Présentation visuelle** : menu latéral court, recherche toujours accessible, statut = texte + couleur + badge, action principale mise en avant, tableaux triables et filtrables, contrastes conformes.

---

## 3. Organisation générale des écrans

| Écran | État | Commentaire |
|---|---|---|
| Connexion | **En place** | Identifiant, mot de passe, aide à la réinitialisation, fermeture de session sur inactivité. |
| Tableau de bord | **En place** | Par rôle : dossiers par état, à traiter, retours, notifications, raccourcis, graphiques. |
| Liste de dossiers | **En place** | Référence, objet, type, date, statut, responsable, âge, échéance ; recherche et filtres avancés ; nombre de résultats affiché. |
| Nouveau dossier | **En place** | Formulaire guidé en trois étapes : informations, pièces attendues, récapitulatif. Bouton « Enregistrer en brouillon ». |
| Fiche dossier | **En place** | En-tête (référence, type, objet, statut, responsable, réception, prochaine action) + onglets Général, Documents, Transmissions, Historique, Commentaires, VISA, Secours. |
| File de vérification | **En place** | File « À vérifier par le Chef de Division » de la boîte de travail et du tableau de bord, avec date de soumission et agent. |
| Transmissions | **En place** | Écran *Transmission des dossiers* (bordereaux) + onglet *Transmissions* sur chaque fiche. |
| Rapports | **En place** | Période, division, type, aperçu, impression, export PDF/Excel. |
| Administration | **En place** | Comptes, rôles et permissions, divisions, types de dossiers, types d'actes, pièces requises, paramètres, sauvegardes, réinitialisations. |

**Zone « À faire ensuite »** (recommandation du § 3.3) : en place. Le bloc est en tête de fiche, avant la barre d'actions ; il nomme l'étape, le poste qui doit agir, et n'affiche le bouton que si l'action revient à l'agent connecté.

---

## 4. Parcours simples

| Parcours | État | Commentaire |
|---|---|---|
| **A — Enregistrer un dossier reçu** | **En place** | Choix du type → seuls les champs pertinents s'affichent → pièces attendues → brouillon ou enregistrement → message de confirmation avec la référence → orientation et affectation automatiques. |
| **B — Traiter un dossier affecté** | **En place** | File personnelle, tri par ancienneté, fiche, observations, « Demander un complément » avec motif, soumission au Chef de Division. |
| **C — Vérifier et retourner un dossier** | **En place** | File de vérification, pièces et observations, retour motivé ou étape suivante ; date, utilisateur et résultat journalisés. |
| **D — Retrouver un dossier** | **En place** | Recherche par référence, nom, matricule, objet ; filtres division, période, statut, responsable. |
| **E — Archiver** | **En place** | Vérification des étapes requises, archivage ; la référence d'archive, la date, l'agent et l'emplacement sont conservés. |

---

## 5. Fonctions communes à tous les dossiers

### 5.1 Référence et doublons

| Exigence | État | Commentaire |
|---|---|---|
| Référence interne unique, jamais réutilisée | **En place** | `{TYPE}-{ANNEE}-{6 chiffres}`. Un brouillon consomme aussi son numéro. |
| Références externes conservées | **En place** | `reference_visa` est distincte de la référence interne. |
| Alerte sur numéro ou matricule déjà enregistré | **En place** | Contrôle du matricule à la création, avec proposition du dossier connu — alerte, jamais blocage. |
| Éléments ressemblants, confirmation humaine | **En place** | La recherche par matricule propose le dossier existant et laisse l'agent décider. |
| Ne pas fusionner ni supprimer automatiquement | **En place** | Aucune fusion automatique n'existe. |

### 5.2 Pièces justificatives

| Exigence | État | Commentaire |
|---|---|---|
| Checklist par type | **En place** | Par type de dossier **et** par type d'opération. |
| État de chaque pièce | **En place** | Présente, manquante, illisible, à corriger, **non applicable**. *Une pièce non applicable satisfait l'obligation — elle n'avait pas à être fournie — et ne demande pas de motif.* |
| Métadonnées | **En place** | Libellé, code, date de contrôle, agent. |
| Fichier numérique | **En place** | Nom, format, taille, date d'ajout, stockage privé, accès soumis aux permissions. |
| **Remplacement — conserver la trace de la version précédente** | **En place** | Un dépôt crée une **version suivante** ; la précédente est conservée et liée. Une version antérieure ne peut pas être supprimée : elle est la trace. Le motif du remplacement est conservé. |
| Jamais de lien public non protégé | **En place** | Le téléchargement passe par une route authentifiée et cloisonnée. |

### 5.3 Transmission

| Exigence | État | Commentaire |
|---|---|---|
| Expéditeur, destinataire, dossier | **En place** | Bordereaux : agent émetteur, division destinataire, dossiers, ordre. |
| Date/heure, motif, référence du bordereau | **En place** | `date_transmission`, `observation`, `reference` auto-générée. |
| Impression d'un bordereau | **En place** | Fiche de réception et registre imprimables. |
| Confirmation de réception | **En place** | `RECU_PAR_DIVISION`, avec date et agent ayant accusé. |
| Historique des transmissions et des retours | **En place** | Onglet *Transmissions* de la fiche + journal du dossier. |

### 5.4 Commentaires et anomalies

| Exigence | État |
|---|---|
| Commentaire avec auteur et date | **En place** |
| Distinguer note interne et motif formel | **En place** — les commentaires sont des notes ; les motifs de retour sont des champs dédiés, obligatoires et journalisés. |
| Motif obligatoire au retour, refus, annulation, réouverture | **En place** |
| Ne pas effacer une ancienne observation | **En place** — les commentaires ne sont pas modifiés, seulement complétés. |

### 5.5 Remontée des dossiers bloqués

| Exigence | État | Commentaire |
|---|---|---|
| Signaler un dossier qui bloque | **En place** | Le chef de division ouvre un signalement depuis la fiche : nature (`BLOCAGE`, `INTERLOCUTION`, `ARBITRAGE`), priorité, motif écrit. |
| Interlocution entre divisions et chef de service | **En place** | La file du chef de service reçoit les signalements de toutes les divisions ; chaque chef de division ne voit que la sienne. |
| Prise en charge et décision | **En place** | Le chef de service prend en charge, puis résout ou rejette avec un texte obligatoire. Chaque geste est tracé et notifié. |
| Ne pas confondre difficulté et circuit | **En place** | Un signalement **ne change jamais le statut du dossier** : il porte la difficulté, il ne remplace pas le workflow. |

---

## 6. Données et formulaires communs

| Champ | État | Commentaire |
|---|---|---|
| Référence interne | **En place** | Générée, unique, non réutilisée. |
| Division | **En place** | Préremplie par le routage automatique. |
| Type de dossier | **En place** | Liste validée et paramétrable. |
| Date de réception | **En place** | Préremplie, modifiable selon les droits. |
| Origine / présentateur | **En place** | Obligatoire pour le VISA ; renseigné pour les autres divisions. |
| Bénéficiaire / agent / ayant droit | **En place** | Bénéficiaire et organisme pour le VISA ; demandeur partout. |
| Matricule / référence externe | **En place** | Format contrôlé, alerte de doublon. |
| Objet | **En place** | Résumé court et recherchable. |
| Responsable actuel | **En place** | Changable ; l'historique est conservé (ancien agent, nouveau, auteur, motif). |
| Statut | **En place** | Modifié par action autorisée, jamais en saisie libre. |
| Pièces | **En place** | Checklist dépendant du type et de l'opération. |
| Observation | **En place** | Facultative ; obligatoire pour un retour formel. |
| Historique | **En place** | Utilisateur, action, date/heure, anciennes et nouvelles valeurs. |
| Clôture / archive | **En place** | Remplis seulement si les conditions sont satisfaites. |

**Contrôles automatiques** : format des dates et des montants, références dupliquées, message précis **près du champ fautif** avec conservation des autres valeurs, confirmation avant transmission ou clôture, impossibilité de sauter une étape obligatoire sans dérogation motivée et tracée.

---

## 7. Module SOLDE

| Fonction du cahier | État | Commentaire |
|---|---|---|
| Page d'accueil Solde | **En place** | Cartes, raccourcis, file « À faire ensuite », filtres. |
| **Types d'opérations** | **En place** | Les 9 types sont configurés : mandatement, fiche de contrôle, dossier mère, transfert de localité, avance de solde, trop-perçu, certificat de cessation de paiement, bon de caisse, domiciliation irrévocable de salaire. |
| Fonctions du Vérificateur Solde | **En place** | Prise en charge, checklist, exploitation, observations, soumission au Chef de Division, traitement des retours, impression et historique. *La permission de contrôler les pièces lui a été accordée — elle lui manquait.* |
| Fonctions du Chef de Division Solde | **En place** | File de vérification, répartition, décision, suivi, rapports. |
| **Données de l'opération** (§ 7.5) | **En place** | Référence du dossier mère, période, montant **saisi** et sa source, localité, contrôle et validation. La saisie est faite par l'agent, le contrôle par le chef de division — jamais l'inverse. **Le formulaire est construit sur le schéma de l'opération** : un transfert de localité ne montre pas de « version produite », et une fiche de contrôle montre la sienne. |
| Fiche de contrôle de solde — **table dédiée** | **En place (schéma)** | Le type d'opération porte ses champs propres — date de contrôle, résultat, version produite — et le dépouillement s'y applique. Pas de table séparée : le cahier décrit des *données propres à l'opération*, pas des dossiers distincts. |
| Dossier mère — **table dédiée** | **En place (schéma)** | Référence, emplacement de conservation, date d'archivage, mouvements. |
| Transfert de localité, trop-perçu, bon de caisse, domiciliation — **tables dédiées** | **En place (schéma)** | Localité d'origine et de destination, motif, date et suivi ; références et bons ; mention « Vu bon à payer » et signature ; demande, état et classement. |
| **Saisie du montant / du décompte** | **En place** | L'agent saisit, la source du montant est conservée, le chef de division contrôle et valide. *Aucun calcul n'est automatisé* — conformément à l'avertissement du cahier. |
| Statuts Solde proposés | **En place** | Le circuit commun les couvre : Reçu → À contrôler → Affecté → En exploitation → À vérifier → À corriger → Signé → Clôturé / archivé. |

---

## 8. Module PENSIONS

| Fonction du cahier | État | Commentaire |
|---|---|---|
| Tableau de bord Pensions | **En place** | Files, raccourcis, volumes par type, période et division. |
| **Types de demandes** | **En place** | Les 8 types sont configurés : liquidation, dossier mère, lettre de prescription, demande de dossier mère, opposition sur pension, derniers arrérages, bon de caisse en retour, certificat de cessation de paiement. |
| Fonctions du Liquidateur | **En place** | Prise en charge, checklist, exploitation, préparation, correspondances, oppositions, arrérages, soumission. |
| Fonctions du Chef de Division Pensions | **En place** | Répartition, vérification, observations, correction motivée, indicateurs, rapports. |
| **Opposition sur pension — suivi dédié** | **En place** | Les trois types (pension alimentaire, cession volontaire, saisie-arrêt) existent dans les correspondances, avec référence, date, destinataire, **état de réponse** et **transmission centrale** (date, destinataire central, référence de bordereau, état de réception). |
| **Derniers arrérages — suivi dédié** | **En place** | Type de correspondance dédié, avec référence, état et transmission centrale. |
| Lettre de prescription | **En place** | Type de correspondance dédié. |
| Dossier mère, bon de caisse en retour, certificat de cessation — **tables dédiées** | **En place (schéma)** | Les types d'opérations portent leurs champs propres : emplacement et date d'archivage ; référence, date de retour, motif et suite ; numéro, dates de demande, de contrôle et de transmission. |
| **Données de l'opération** (§ 8.5) | **En place** | Matricule, référence du dossier mère, type de demande, opposition, correspondance, transmission centrale, vérification, archivage. |
| Saisie et validation du décompte de pension | **En place** | Saisie par l'agent, validation tracée et attribuée. *Aucun calcul n'est automatisé.* |
| Statuts Pensions proposés | **En place** | Couverts par le circuit commun. |

> **Point de la source, non tranché** : le cahier signale que « l'historique mentionne aussi des tâches liées au secours au décès dans la partie Pensions ». La répartition exacte entre la Division Pensions et la Division Secours reste **à valider** (§ 18).

---

## 9. Module VISA

Le module VISA est le plus abouti : il est conforme au cahier dans son intégralité.

| Fonction du cahier | État | Commentaire |
|---|---|---|
| Accueil VISA | **En place** | Dossiers par état, raccourcis, filtres par présentateur, type d'acte, vérificateur, période, statut. |
| Formulaire VISA | **En place** | Référence unique, origine, type d'acte, objet, bénéficiaire, pièces, vérificateur, contrôle de division, signature, archivage. |
| Fonctions du Vérificateur VISA | **En place** | Prise en charge, vérification des pièces, observations, signalement des anomalies, demande de complément, soumission, corrections, suivi de la signature, archivage après signature. |
| Fonctions du Chef de Division VISA | **En place** | File de vérification, examen, observations, retour motivé, enregistrement de la vérification, suivi des charges, rapports. |
| **Vérification et signature sont deux étapes distinctes** | **En place** | La signature est refusée à tout rôle autre que le Chef de Service, contrôle refait dans le service. |
| Signature électronique | **Hors périmètre** | Le cahier ne l'active qu'avec un système autorisé ; seule l'**état** et la **référence** de la signature sont enregistrés. |
| Archivage bloqué tant que les étapes obligatoires ne sont pas terminées | **En place** | Signature enregistrée + pièces d'archivage obligatoires. |
| Référence, date, responsable et lieu de conservation | **En place** | Registre d'archives consultable. |
| Statuts VISA proposés | **En place** | Reçu → À contrôler → En exploitation → À vérifier → À corriger → À présenter pour signature → Signé → À archiver → Archivé. |

---

## 10. Module SECOURS DE DÉCÈS

| Fonction du cahier | État | Commentaire |
|---|---|---|
| Principes particuliers (données minimales, actes d'état civil protégés, montants non modifiés sans trace) | **En place** | Permissions dédiées, verrouillage des dossiers clôturés, journalisation de chaque acte. |
| Informations de dossier | **En place** | Référence interne, origine, bénéficiaire, personne décédée, visa, état de décompte, demande de l'intéressé, pièces d'état civil, référence du logiciel Secours, émargement, archivage. |
| **Visa du contrôle financier** | **En place** | Numéro de visa unique dans toute la plateforme, date, signature portée sur la pièce. L'original n'est pas modifié. |
| **État de décompte et mandatement** | **En place** | Montant saisi par l'agent, répartition par quote-part, bénéficiaires, ordonnancement, liquidation. *Le calcul de répartition est vérifié (somme = montant total) ; aucun montant n'est déduit d'une formule réglementaire.* |
| **Références du logiciel Secours** | **En place** | Report référence par référence. |
| **État d'émargement** | **En place** | Génération, signature des bénéficiaires avec date. |
| **Signature de l'ordonnateur** | **En place** | Permission dédiée, distincte de la signature de mandatement. |
| **Cachet, titre et date** | **En place** | Permission dédiée. |
| **Bordereau de pièces et de transmission** | **En place** | Le module *Bordereau* existe : un bordereau se compose par dossier, s'émet, est acquitté par le destinataire, s'archive, et se suit depuis la fiche dossier (transmissions portées par le dossier). |
| Documents et sorties (CCETPP, TEF, bon de caisse) | **Partiel** | Le CCETPP est une pièce de checklist. Le **TEF** et le **bon de caisse** n'ont pas de sortie dédiée : ils sont saisis comme données d'opération (schéma de l'opération Solde), et leur bordereau de suivi est le bordereau de transmission. *Sorties imprimées à valider avec le SRSP.* |
| Statuts Secours proposés | **En place** | Couverts par le circuit commun, plus les étapes propres au mandat. |

> Les cinq étapes du mandat étaient **inaccessibles depuis l'interface** (le serveur les exposait, aucun écran ne les appelait). Elles sont désormais réunies dans l'onglet *Secours* de la fiche.
>
> Elles étaient de surcroît **inopérantes** : les cinq routes exigeaient un droit qu'aucun rôle ne portait. Le serveur répondait 403 à tout le monde, et l'agent voyait un mandat que personne ne pouvait faire avancer. Les attributions ont été reprises du registre de conformité, et la campagne `test-e2e-secours.mjs` parcourt désormais le circuit de bout en bout — y compris le refus à un profil d'une autre division.

---

## 11. Secrétariat, Coordination, Chef BAAF, Chef de Service

| Rôle | État | Commentaire |
|---|---|---|
| **Secrétariat** — réception, enregistrement, distribution, chronologie des actes émis | **En place** | Dossiers et courriers entrants, registre des courriers, bordereaux, fiche de réception, registre. |
| **Coordination** — immatriculation, nouveaux arrivants, changements de mode de paiement | **En place** | Demande d'immatriculation avec **référence attribuée**, doublons de CIN et de matricule refusés **avant** l'attribution, insertion en paie (éléments requis pour les systèmes de paie et de pension), changements de mode de paiement avec **motif obligatoire** et pièces vérifiées, volumes par type de demande, période et division. |
| **Coordination** — attestation en ligne, insertion Augure, ordres de déplacement | **Hors périmètre** | La plateforme ne dialogue avec aucun logiciel externe : le cahier ne mentionne aucune interface autorisée et documentée. L'insertion est **enregistrée** dans la plateforme, à charge de la coordination de la transmettre. |
| **Chef BAAF** — gestion administrative et comptable interne | **En place** | Documents, courriers, rapports consolidés. *Les « situations FCC / BCSE » ne sont pas gérées.* |
| **Chef de Service** — pilotage, signature, retour motivé, rapports consolidés | **En place** | Tableau de bord consolidé, signature, dérogation motivée, archives, écran **Performance** (délais de traitement, dossiers en retard, répartition par division et par agent), **file des signalements** (prise en charge, résolution ou rejet motivé). |
| **Administrateur technique** | **En place** | Comptes, rôles, référentiel, schémas d'opérations. **Aucun pouvoir de décision métier** — vérifié par le test. |
| **Territoire** — périmètre géographique du service | **En place** | Antennes et districts, synthèse par antenne, rattachement d'un dossier à un district avec historique. *Les dossiers sans district sont comptés à part.* |

---

## 12. Notifications, recherche et rapports

**Notifications** — les six événements du cahier sont produits et adressés à une personne identifiée, jamais diffusés à un rôle entier. Elles mènent à la fiche, et ne contiennent aucune donnée sensible. **En place.**

**Recherche** — référence exacte, nom, matricule, objet, référence externe ; filtres division, catégorie, statut, date, responsable ; bouton « Effacer les filtres » ; **nombre de résultats affiché** ; message clair quand aucun résultat ne correspond. **En place.**

**Rapports communs** — reçus par jour/mois/trimestre/année, par division/type/statut/responsable, incomplets ou retournés avec motifs, en attente de vérification/signature/transmission/archivage, registre des courriers, volume traité par période. **En place** (12 rapports transverses).

**Remontée des dossiers bloqués** — le chef de division signale un dossier de sa division (blocage, interlocution, arbitrage ; priorité ; motif écrit) ; le chef de service le voit dans sa file, le prend en charge et le referme par une résolution ou un rejet motivé ; la coordination et le BAAF consultent. Un signalement **ne change pas le statut du dossier** : il porte la difficulté, il ne remplace pas le circuit. Chaque ouverture, prise en charge et décision est journalisée et notifiée. **En place.**

**Rapports par division**

| Division | État | Commentaire |
|---|---|---|
| Solde | **En place** | **Opérations d'une division** (dossier par dossier : opération, référence, montant saisi, validation, contrôle) et **opérations par type** (agrégat : nombre de dossiers, montants saisis et validés, contrôles en attente, retournés). |
| Pensions | **En place** | Les deux mêmes rapports, paramétrés sur la division. |
| VISA | **En place** | Dossiers reçus, exploités, vérifiés, retournés, signés, archivés — mensuels, trimestriels, annuels ; **et un rapport par vérificateur**. |
| Secours de décès | **En place** | Suivi des cinq étapes du mandat : visa du contrôle financier, mandatement, émargement, signature, cachet, archivage. |
| Transversal | **En place** | Registre des courriers, rapports consolidés, documents BAAF. |

---

## 13. Rôles et droits d'accès

Les 13 rôles et leurs limites sont en place, et **vérifiés par le serveur** — masquer un bouton ne suffit pas, la route elle-même refuse. Le tableau du cahier est respecté, y compris sur les points sensibles :

| Point | État |
|---|---|
| Le secrétaire ne valide pas les opérations métier | **En place** |
| Le vérificateur ne signe pas à la place de l'autorité habilitée | **En place** |
| Le chef de division est limité à sa division | **En place** — cloisonnement appliqué par le serveur, filtre forcé. |
| La vérification de division n'équivaut pas à la signature | **En place** — refus 403 vérifié. |
| Le chargé de secours ne modifie pas les montants validés sans autorisation | **En place** |
| L'administrateur technique n'a aucun pouvoir métier automatique | **En place** — vérifié par le test. |
| Chaque utilisateur utilise son propre compte | **En place** — comptes individuels, pas de compte partagé. |

---

## 14. Sécurité, confidentialité et continuité

| Exigence | État | Commentaire |
|---|---|---|
| Authentification individuelle, mots de passe protégés | **En place** | bcrypt, politique de mot de passe vérifiée à chaque saisie. |
| HTTPS en production | **Hors périmètre** | Dépend du déploiement ; l'application est prête derrière un proxy TLS. |
| Contrôle d'accès pour chaque action et chaque pièce | **En place** | RBAC + cloisonnement par division et par agent. |
| Expiration de session, déconnexion, réinitialisation contrôlée | **En place** | Session close sur inactivité ; réinitialisation par code à usage unique délivré par un administrateur. |
| Journal d'audit | **En place** | Création, modification, affectation, statut, signature, export, archivage, suppression — auteur, date, heure, seconde, IP. |
| Sauvegardes régulières et essais de restauration | **En place** | Procédure documentée, test mensuel, script de remise en état des comptes. |
| Désactivation rapide des comptes | **En place** | La désactivation coupe **immédiatement** les sessions et le canal temps réel. |
| Limiter l'accès aux dossiers de pension, montants et pièces d'état civil | **En place** | Permissions dédiées, cloisonnement par division. |
| Ne recueillir que les données nécessaires | **En place** | Champs conditionnels par division. |
| Ne pas envoyer de détails sensibles dans les notifications | **En place** | Les notifications portent une référence et un motif, jamais une pièce. |
| Ne pas utiliser de vraies données personnelles en démonstration | **En place** | Les comptes et dossiers de démonstration sont fictifs. |
| Durées de conservation | **En place** | Règles par division (Pension : conservation permanente). *Les durées de conservation papier restent à valider.* |
| Pas de modification silencieuse d'une donnée utilisée dans une décision | **En place** | Les valeurs précédentes et l'auteur sont conservés ; l'historique n'est pas modifiable par un utilisateur ordinaire. |
| Prévenir les doubles envois et les créations en double | **En place** | Le statut rend un second envoi impossible (**409**) ; la numérotation est unique. |
| Confirmation après enregistrement, ou erreur expliquée | **En place** | |

---

## 15. Ergonomie et accessibilité

| Exigence | État |
|---|---|
| Français clair, acronymes expliqués | **En place** |
| Navigation courte (une ou deux actions) | **En place** |
| Formulaires par étapes | **En place** |
| Validation visible, saisie conservée | **En place** |
| Statuts lisibles (texte, pas seulement couleur) | **En place** |
| Clavier et souris, champs nommés | **En place** |
| Adaptation d'écran | **En place** |
| Impression : titre, référence, date | **En place** |
| Aide contextuelle | **En place** — hints de champ, messages d'action |
| Tolérance aux erreurs | **En place** — confirmation avant action sensible, correction sans effacer la fiche |

---

## 16. Tests d'acceptation

| ID | Test | Résultat |
|---|---|---|
| T01 | Créer un dossier dans chaque division | ✅ 4 divisions, règles de routage et de numérotation vérifiées |
| T02 | Champ obligatoire vide | ✅ Champ identifié, saisie conservée |
| T03 | Chercher une référence existante | ✅ Fiche correcte affichée |
| T04 | Matricule existant | ✅ Alerte de doublon, aucune fusion |
| T05 | Affecter à un agent | ✅ Responsable et historique mis à jour |
| T06 | Retourner sans motif | ✅ Action refusée, motif demandé |
| T07 | Soumettre une opération Solde | ✅ Présence dans la file de vérification, traçabilité |
| T08 | Opposition / derniers arrérages Pension | ✅ Types de correspondance dédiés, référence et transmission consultables |
| T09 | Retourner un dossier VISA | ✅ Motif, auteur et date enregistrés, dossier visible pour correction |
| T10 | Archiver un dossier VISA non signé | ✅ Action bloquée |
| T11 | Décision du Contrôle financier pour Secours | ✅ Référence et numéro de visa saisis, original préservé |
| T12 | Pièce d'état civil, rôle non autorisé | ✅ Accès refusé |
| T13 | Rapport mensuel | ✅ Chiffres concordants avec la base |
| T14 | Suppression par un utilisateur ordinaire | ✅ Action refusée |
| T15 | Prochaine action sur un dossier en attente | ✅ Action claire pour le rôle habilité |
| T16 | Transmettre deux fois rapidement | ✅ Second envoi détecté et refusé |
| T17 | Restaurer une sauvegarde de test | ✅ Procédure documentée et éprouvée |
| T18 | Test par un agent non technique | 📋 **Protocole prêt** — [PROTOCOLE_RECETTE_T18.md](PROTOCOLE_RECETTE_T18.md) : déroulé, tâches par profil, grille de synthèse. *La séance reste à conduire.* |

---

## 17. Version minimale à développer en premier

**Phase 1 — Socle commun : en place.**

Connexion, rôles et permissions · référentiel des divisions, types, agents et pièces · création de dossier avec référence unique, brouillon, recherche et statut · pièces, observations, affectations, transmissions et historique · tableau de bord par rôle et prochaines actions · impression des fiches et bordereaux · sauvegarde, journal d'audit et protection des accès.

**Phase 2 — Modules métier : partiellement en place.**

| Module | État |
|---|---|
| Solde | Types d'opérations, checklist, circuit — **en place** ; données propres à chaque opération (fiche de contrôle, dossier mère, trop-perçu, bon de caisse, domiciliation) — **à développer** |
| Pensions | Types de demandes, oppositions, arrérages, correspondances — **en place** ; données propres (dossier mère, bon de caisse en retour) — **à développer** |
| VISA | **En place** dans son intégralité |
| Secours | Visa, décompte, mandatement, émargement, signatures, archivage — **en place** ; sorties TEF / bon de caisse / bordereau de mandats — **à développer** |

**Phase 3 — Améliorations.**

| Amélioration | État |
|---|---|
| Rapports périodiques plus complets | **En place** pour le VISA et le transversal ; **à faire** par division |
| Notifications internes | **En place** |
| Indicateurs de retard après validation des délais | **En place** sous forme d'**âge réel** et d'**échéance dépassée** — le cahier interdit de qualifier un dossier « en retard » sans délai validé (§ 18) |
| Export PDF/Excel et modèles d'impression | **En place** |
| Intégration à un logiciel existant | **Hors périmètre** — aucune interface autorisée et documentée n'existe |

---

## 18. Points à valider avec le SRSP

Ces points ne sont pas des défauts : ce sont des règles que le cahier ne tranche pas et que l'application a rendues **configurables** plutôt que d'en inventer une.

| # | Point | Où l'application l'expose |
|---|---|---|
| 1 | Liste officielle des types et sous-types de dossiers de chaque division | *Référentiel → Types d'actes* — les 22 types sont préchargés, modifiables |
| 2 | Liste exacte des pièces obligatoires et les exceptions par dossier | *Référentiel → Types de pièces*, par type et par opération |
| 3 | Références officielles et règles de numérotation | *Référentiel → Types de dossiers* ; le format interne est fixe |
| 4 | Circuit précis d'affectation, exploitation, vérification, signature, transmission, archivage par type | *Paramètres* ; le circuit commun est en place, les variantes par division restent à paramétrer |
| 5 | Personnes habilitées à affecter, retourner, valider, signer, archiver | *Rôles & permissions* |
| 6 | Calculs métier, paramètres et modèles autorisés (Solde, Pensions, Secours) | Aucun calcul n'est automatisé : la saisie et la trace de validation sont en place |
| 7 | Modèles officiels à imprimer | *Rapports* ; la fiche de réception et les bordereaux sont imprimables |
| 8 | Signification exacte des acronymes (CCETPP, TEF, FCC, BCSE) | CCETPP est une pièce de checklist ; TEF, FCC et BCSE n'ont pas d'écran |
| 9 | Répartition exacte des dossiers de secours au décès entre Pensions et Secours | Les deux divisions existent ; la répartition des tâches est à trancher |
| 10 | Délais de traitement officiels | Aucun délai n'est appliqué : l'**âge** et l'**échéance dépassée** sont affichés sans jugement |
| 11 | Durées de conservation papier et numériques | *Archives* ; les règles numériques par division sont en place |
| 12 | Règles de confidentialité et autorisations sur les pièces personnelles | *Rôles & permissions* |
| 13 | Règles de correction, annulation, réouverture, perte de document | Motifs obligatoires en place ; la réouverture n'est pas offerte |
| 14 | **État « non applicable » d'une pièce** | **En place** — l'état existe : la pièce ne bloque pas la validation et ne demande pas de motif. |
| 15 | **Traçabilité des versions d'une pièce remplacée** | **En place** — un dépôt crée une version suivante, la précédente est conservée et liée ; une version antérieure ne peut plus être supprimée. |
| 16 | **Champs exacts de chaque type d'opération** | **En place, à valider** — les 17 types du cahier portent leurs champs, et l'écran *Référentiel → Schémas d'opérations* permet de les faire évoluer sans développement. C'est là que le SRSP doit dire ce qui est juste. |
| 17 | **Les droits du registre de conformité** | **En place, à valider** — le registre porte, pour chaque exigence, le poste qui l'exerce et le droit qui l'exerce. L'audit `test-e2e-droits.mjs` vérifie que les attributions attendues sont satisfaites, et qu'aucune route n'est fermée à tout le monde. **Un écart est assumé** : les chefs de division ne portent pas `traiter_dossier` — l'affectation automatique ne propose un dossier qu'aux agents qui le portent, et l'accorder aux chefs les chargerait du traitement qu'ils n'ont pas à faire. Le registre attribue « traiter les dossiers » au chef de division : c'est le vocabulaire du cahier, pas le fonctionnement de la plateforme. *À confirmer.* |
| 18 | **Le certificat de cessation imprimable** | **À faire** — la donnée de cessation est gérée (opération `PENSION_CERTIFICAT_CESSATION`, et `SOLDE_CERTIFICAT_CESSATION`), la production du certificat imprimable n'existe pas. |
| 19 | **La remontée des dossiers bloqués** | **En place** — le chef de division signale un dossier de sa division (blocage, interlocution, arbitrage), avec motif et priorité ; le chef de service le prend en charge et le referme par une résolution ou un rejet motivé ; la coordination et le BAAF consultent. Le signalement **ne change pas le statut du dossier** : il porte la difficulté, il ne remplace pas le circuit. Chaque geste est tracé et notifié. |

---

## Méthode de validation recommandée

1. **Séance de validation** avec le Chef de Service, les quatre Chefs de Division, le Secrétariat, la Coordination, le Chef BAAF et des agents qui traitent les dossiers au quotidien.
2. **Observation d'une journée de travail** : noter les étapes réelles sans interrompre le service.
3. **Validation des formulaires et des pièces obligatoires** à partir d'exemples fictifs.
4. **Test du prototype par chaque rôle**, avec des tâches courantes — c'est le test T18, le seul qui ne peut pas être automatisé.
5. **Correction des difficultés d'utilisation** avant l'import de dossiers réels.

---

## Ce que l'application garantit déjà

La meilleure plateforme pour le SRSP n'est pas celle qui contient le plus de menus : c'est celle qui permet à chaque agent de **voir ses dossiers**, de **comprendre leur statut**, d'**exécuter l'action autorisée suivante** et de **retrouver l'historique** en peu de clics.

Ces quatre capacités sont en place, et vérifiées :

- **Voir ses dossiers** — boîte de travail, liste personnelle, files par rôle.
- **Comprendre leur statut** — bloc « À faire ensuite » : l'étape, le poste attendu, et l'action quand elle revient à l'agent.
- **Exécuter l'action autorisée suivante** — un bouton par action possible, jamais un bouton qui échouerait, et un motif obligatoire dès qu'une décision refuse.
- **Retrouver l'historique** — journal, traçabilité des actes, transmissions, pièces, archives, et une trace durable des suppressions.

Le socle commun est identique dans les quatre divisions ; les formulaires, contrôles, statuts et rapports reflètent les missions propres à Solde, Pensions, VISA et Secours. Les calculs réglementaires, décisions métier et signatures restent sous le contrôle des agents habilités.

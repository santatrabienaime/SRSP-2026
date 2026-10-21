# Test d'acceptation T18 — Recette avec les agents

**SRSP Fitovinany** — Plateforme web de gestion, de suivi et de traçabilité des dossiers administratifs
Cahier des fonctionnalités v2.0, § 16 — test T18 : *« Faire tester l'application à un agent non technique. L'agent termine les tâches usuelles avec une aide minimale et sans contournement. »*

---

## Pourquoi cette séance ne peut pas être automatisée

Les dix-sept autres tests d'acceptation vérifient des **comportements** : une
référence unique, un refus sans motif, une archive bloquée sans signature.
Ceux-là sont automatisés et passent.

T18 vérifie autre chose : que **l'application se comprend**. Qu'un agent qui
n'a pas participé à sa conception, qui traite des dossiers tous les jours,
arrive à faire son travail **sans chercher**, et **sans contourner** l'outil.

Un test automatique ne peut pas mesurer cela. Seul un agent peut le dire.

Ce document est donc le **déroulé prêt à l'emploi** de la séance : les
tâches à faire, ce qu'on observe, et les questions à poser.

---

## 1. Organisation

| | |
|---|---|
| **Durée** | 1 h 30 par profil, séance de synthèse à la fin |
| **Participants** | 3 agents par division, au minimum un agent « ancien » (plus de 5 ans) et un agent « nouveau » (moins d'un an) |
| **Divisions** | Secrétariat, Coordination, Vérificateur Solde, Chef de Division Solde, Liquidateur Pensions, Chef de Division Pensions, Vérificateur VISA, Chef de Division VISA, Chargé Secours, Chef de Division Secours |
| **Encadrant** | 1 personne de l'équipe de développement, **qui ne parle pas** pendant les tâches |
| **Données** | Un jeu de dossiers **fictifs**, jamais de dossiers réels |

> **Règle absolue** : pendant les tâches, l'encadrant ne répond à aucune
> question, sauf « où est le bouton X » — et dans ce cas, il montre **où il
> est** sans dire quoi faire. La question posée à l'agent est : *« où
> est-ce que vous iriez chercher ça ? »*

---

## 2. Ce que l'on mesure

| Axe | Question | Seuil |
|---|---|---|
| **Aide minimale** | Combien de fois l'agent a-t-il eu besoin d'une explication ? | Moins de 2 par tâche |
| **Pas de contournement** | L'agent a-t-il contourné l'outil (carnet, fichier, demanda à un collègue) ? | Jamais |
| **Complétude** | La tâche est-elle allée jusqu'au bout ? | Oui |
| **Confiance** | L'agent sait-il ce qu'il doit faire ensuite, sans chercher ? | Oui |
| **Vocabulaire** | Les libellés sont-ils compris sans explication ? | Oui |

---

## 3. Déroulé de la séance

### 3.1 Accueil (10 min)

1. Expliquer l'objectif : **« on ne teste pas l'agent, on teste l'écran »**.
2. Annoncer qu'il n'y a pas de piège et que les remarques sont le résultat.
3. Faire créer un compte de test, ou utiliser un compte de démonstration.
4. Montrer la page d'accueil **sans commenter** : laisser l'agent regarder.

> **Note** : ne pas expliquer la barre latérale. Si l'agent ne la voit pas,
> c'est que l'interface n'est pas évidente — c'est une remarque.

> **Note** : ne pas expliquer la barre latérale. Si l'agent ne la voit pas,
> c'est que l'interface n'est pas évidente — c'est une remarque.

### 3.2 Tâches par profil

Chaque tâche est notée : **réussie** / **aide** / **contournement**.

---

#### Secrétariat

| # | Tâche | Ce qu'on observe |
|---|---|---|
| S1 | « Enregistrez la réception d'un dossier de visa de mariage. Voici la fiche du demandeur. » | Le type d'opération est-il trouvé sans hésitation ? Les champs VISA sont-ils compris ? |
| S2 | « Le demandeur n'a pas brought sa CIN. Enregistrez quand même le dossier. » | L'agent utilise-t-il le brouillon ? |
| S3 | « Le dossier est incomplet, on le reprendra demain. Où le retrouver ? » | Trouve-t-il « Mes brouillons » ? |
| S4 | « Le chef de division veut savoir où en est le dossier. » | Trouve-t-il la boîte de travail, ou la fiche ? |
| S5 | « Transférez ce dossier à la division Solde. » | Sait-il qu'il ne peut pas changer la division ? |

#### Vérificateur Solde

| # | Tâche | Ce qu'on observe |
|---|---|---|
| V1 | « Prenez en charge vos dossiers à traiter. » | La file est-elle trouvée ? Le tri par ancienneté aide-t-il ? |
| V2 | « Contrôlez les pièces de ce dossier et dites lesquelles manquent. » | L'écran de contrôle est-il lisible ? |
| V3 | « Une pièce est illisible : que faites-vous ? » | Le motif est-il compris comme obligatoire ? |
| V4 | « Saisissez les données de l'opération. » | Le formulaire montre-t-il les bons champs ? |
| V5 | « Soumettez le dossier à la vérification. » | Le mot « soumission » est-il compris ? |

#### Chef de Division Solde

| # | Tâche | Ce qu'on observe |
|---|---|---|
| C1 | « Qu'avez-vous à vérifier aujourd'hui ? » | La file de vérification est-elle évidente ? |
| C2 | « Un dossier est incomplet : que se passe-t-il si vous le validez ? » | Comprend-il la règle de complétude ? |
| C3 | « Contrôlez l'opération et validez le montant. » | La séparation contrôle / validation est-elle comprise ? |
| C4 | « Motivez un retour de correction. » | Sait-il que le motif est obligatoire ? |
| C5 | « Produisez le rapport des opérations du trimestre. » | Le rapport se trouve-t-il ? |

#### Vérificateur VISA

| # | Tâche | Ce qu'on observe |
|---|---|---|
| V6 | « Le dossier est validé : qui doit le signer ? » | L'agent sait-il que ce n'est pas lui ? |
| V7 | « Archivez le dossier signé. » | Trouve-t-il l'action d'archivage ? |
| V8 | « Le dossier attend une pièce : que faites-vous ? » | Le demande de complément est-elle trouvée ? |

#### Chef de Service

| # | Tâche | Ce qu'on observe |
|---|---|---|
| D1 | « Qu'attendez-vous en tant que chef de service ? » | La file de signature est-elle identifiée ? |
| D2 | « Signez ce dossier. » | La distinction vérification / signature est-elle comprise ? |
| D3 | « Un dossier est incomplet mais urgent : que pouvez-vous faire ? » | Connaît-il la dérogation, et sa trace ? |
| D4 | « Commentez la déclaration d'une de vos actions. » | Sait-il que le journal est figé ? |

#### Chargé Secours

| # | Tâche | Ce qu'on observe |
|---|---|---|
| E1 | « Enregistrez le visa du contrôle financier. » | Le numéro de visa est-il compris comme unique ? |
| E2 | « Préparez le mandatement. » | L'écran des cinq étapes est-il lisible ? |
| E3 | « Générez l'état d'émargement. » | L'action est-elle trouvée ? |
| E4 | « Le dossier est archivé : peut-on encore déposer une pièce ? » | Attend-il ce refus ? |

#### Coordination

| # | Tâche | Ce qu'on observe |
|---|---|---|
| P1 | « Enregistrez l'immatriculation d'un nouvel agent. » | La référence attribuée est-elle comprise ? |
| P2 | « Le même CIN arrive deux fois. » | Voit-il le refus et le comprend-il ? |
| P3 | « Enregistrez un changement de mode de paiement. » | Le motif est-il compris comme obligatoire ? |
| P4 | « Combien de demandes avez-vous traitées ce mois-ci ? » | Les volumes répondent-ils à la question ? |

---

### 3.3 Débriefing (20 min)

Cinq questions, dans cet ordre :

1. **« Quelle a été la chose la plus pénible ? »**
2. **« Y a-t-il eu un moment où vous avez searched ailleurs que dans l'application ? »** (→ contournement)
3. **« Si vous deviez montrer cet écran à un collègue, que lui diriez-vous ? »**
4. **« Qu'est-ce qui vous a manqué ? »**
5. **« Qu'auriez-vous aimé voir dans le dossier, et que vous n'avez pas trouvé ? »**

---

## 4. Grille de synthèse

| Profil | Tâches réussies | Aide (nb) | Contournement | Remarques bloquantes |
|---|---|---|---|---|
| Secrétariat | / 5 | | | |
| Vérificateur Solde | / 5 | | | |
| Chef de Division Solde | / 5 | | | |
| Vérificateur VISA | / 3 | | | |
| Chef de Service | / 4 | | | |
| Chargé Secours | / 4 | | | |
| Coordination | / 4 | | | |

**Critère de réception** : au moins **80 %** des tâches réussies, **zéro**
contournement, et **aucune** remarque bloquante non traitée.

---

## 5. Ce qu'on fait des remarques

Chaque remarque devient une ligne du registre des observations, avec :

| | |
|---|---|
| **Profil** | Qui l'a faite |
| **Étape** | La tâche concernée |
| **Remarque** | Ce que l'agent a dit, mot pour mot |
| **Gravité** | Bloquante (la tâche n'a pas pu être faite) / gênante (a ralenti) / confort |
| **Suite** | Corrigé / à corriger / voluntarily écarté (avec le motif) |

Les remarques **bloquantes** sont reprises dans `docs/CONFORMITE_CAHIER.md`,
au paragraphe « Points à valider », si elles remettent en cause une règle
validée. Les autres alimentent la feuille de route.

> Une remarque écartée doit être **motivée** : « on ne le fait pas parce
> que… ». Une remarque sans suite motivee est une remarque perdue.

---

## 6. Ce que cette séance ne remplace pas

- Les **tests automatisés** (T01 à T17) : ils vérifient la règle, cette
  séance vérifie l'usage.
- La **validation métier** des listes de pièces et des formules de décompte :
  elle demande le SRSP, pas un agent.

Ce que la séance remplace, en revanche, c'est **l'hypothèse** que l'interface
est claire parce qu'elle l'est pour celui qui l'a conçue.

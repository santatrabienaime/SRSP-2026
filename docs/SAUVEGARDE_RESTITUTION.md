# Sauvegarde et restauration — SRSP Fitovinany

La plateforme tient deux choses qu'il ne faut pas perdre : **les données** et
**les pièces jointes**. Une sauvegarde qui n'embarque que l'une des deux
donne un état trompeur — une base cohérente dont aucun document ne
s'ouvre. La procédure ci-dessous traite les deux ensemble.

---

## 1. Ce qui doit être sauvegardé

| Élément | Emplacement | Inclus par |
|---|---|---|
| Base de données `srsp_db` | MariaDB / MySQL | `mysqldump` |
| Pièces jointes des dossiers | `Backend/src/uploads/documents/` | archive `tar.gz` |
| Pièces jointes des courriers | `Backend/src/uploads/courriers/` | archive `tar.gz` |
| Configuration | `Backend/.env` | copie manuelle chiffrée |

> `Backend/.env` contient `JWT_SECRET` et les identifiants de la base. Il
> **ne** figure pas dans la sauvegarde automatique : le conserver hors du
> dépôt, chiffré, avec les secrets de l'établissement. Une base restaurée
> sans le même `JWT_SECRET` invalide toutes les sessions — c'est sans
> conséquence, mais cela force les agents à se reconnecter.

---

## 2. Sauvegarde depuis l'application

**Administration → Sauvegarde** → **Sauvegarder maintenant**.

L'application produit **deux fichiers** dans `Backend/backups/` :

| Fichier | Contenu |
|---|---|
| `srsp-<date>.sql` | Dump SQL de **toutes** les tables applicatives |
| `srsp-<date>-pieces.tar.gz` | Archive des pièces jointes (documents + courriers) |

Le journal enregistre l'opération (`SAUVEGARDE_DB`) avec le nombre de
fichiers inclus. **Une sauvegarde annoncée sans ses documents est un
mensonge** : c'est pourquoi le journal précise explicitement si l'archive
n'a pas pu être produite.

La liste des tables est **découverte au moment de la sauvegarde**, et non
écrite en dur : une table créée demain est sauvegardée sans qu'on ait à
modifier le code. Seules les tables techniques du moteur
(`information_schema`, `performance_schema`, `mysql`, `sys`) sont exclues.

### Vérifier une sauvegarde

Une sauvegarde n'est une sauvegarde que si elle se restaure. Après chaque
sauvegarde :

```bash
cd Backend/backups

# Le dump contient-il des données ?
grep -c "INSERT INTO" srsp-<date>.sql

# L'archive contient-elle des fichiers ?
tar -tzf srsp-<date>-pieces.tar.gz | head
```

Un `0` sur la première commande, ou une archive vide sur la seconde, signifie
que la sauvegarde est incomplète : la refaire avant de l'adresser.

---

## 3. Sauvegarde manuelle (hors application)

Quand `mysqldump` n'est pas installé, ou pour une sauvegarde planifiée :

```bash
cd Backend

# Dump de la base
MYSQL_PWD='<mot-de-passe>' mysqldump \
  -h127.0.0.1 -P3306 -u root \
  srsp_db --single-transaction --routines --skip-lock-tables \
  > backups/srsp-manuel-$(date +%F).sql

# Pièces jointes
tar -czf backups/srsp-manuel-$(date +%F)-pieces.tar.gz \
  -C src/uploads documents courriers
```

`--single-transaction` est indispensable : sans lui, le dump lit chaque
table séparément, et les données modifiées pendant l'opération sont
 incohérentes entre elles.

Si `mysqldump` n'est pas dans le `PATH`, l'application le cherche dans
`C:\xampp\mysql\bin`, `C:\Program Files\MySQL\MySQL Server 8.0\bin`,
`C:\laragon\bin\mysql\current\bin` et `C:\wamp64\bin\mysql\current\bin`. Une
variable `MYSQLDUMP_PATH` peut forcer le chemin.

---

## 4. Restauration depuis l'application

**Administration → Sauvegarde** → choisir une sauvegarde → **Restaurer**.

La restauration :

1. **crée d'abord une sauvegarde de sécurité** de l'état courant ;
2. vide les tables applicatives ;
3. recharge le dump ;
4. **ne touche pas** aux pièces jointes (elles sont restaurées séparément,
   voir ci-dessous).

> ⚠️ **La restauration est destructive.** Elle remplace les données actuelles
> par celles de la sauvegarde. Ne l'utilisez que sur une base de test, ou
> après une sauvegarde de sécurité vérifiée.

---

## 5. Restauration complète (base + pièces)

```bash
# 1. Sauvegarde de sécurité de l'état courant
cd Backend
node scripts/…   # ou *Administration → Sauvegarde* depuis l'application

# 2. Restaurer la base
MYSQL_PWD='<mot-de-passe>' mysql -h127.0.0.1 -P3306 -u root srsp_db \
  < backups/srsp-<date>.sql

# 3. Restaurer les pièces jointes
#    (les fichiers portent des noms UUID : on les remplace en bloc)
tar -xzf backups/srsp-<date>-pieces.tar.gz -C src/uploads

# 4. Redémarrer l'API
npm start
```

### Contrôle après restauration

```bash
# La base répond-elle ?
curl -s http://localhost:5000/api/health

# Les dossiers sont-ils là ?
mysql -u root srsp_db -e "SELECT COUNT(*) FROM dossiers;"

# Les documents sont-ils lisibles ?
# → se connecter, ouvrir un dossier archivé, télécharger une pièce jointe
```

**Le test de restauration mensuel ne vaut que s'il est complet** : une base
restaurée sans ses pièces jointes paraît fonctionnelle et ne l'est pas. Le
test consiste donc à restaurer une sauvegarde dans une base de test **et à
ouvrir réellement un document**.

---

## 6. Politique de sauvegarde recommandée

| Élément | Fréquence | Conservation |
|---|---|---|
| Sauvegarde complète (base + pièces) | **Quotidienne** | 30 jours glissants |
| Sauvegarde avant toute migration | À chaque migration | Jusqu'à validation de la migration |
| Sauvegarde avant une restauration | Systématique (automatique) | 30 jours |
| Copie **hors site** (disque externe, NAS, cloud chiffré) | Hebdomadaire | 6 mois |
| **Test de restauration** | **Mensuelle** | — |

> La sauvegarde doit être **copiée hors du serveur**. Une sauvegarde restée
> sur le disque de la machine qu'elle protège disparaît avec elle.

---

## 7. Procédure d'incident

| Situation | Conduite à tenir |
|---|---|
| Serveur HS | Réinstaller le système, restaurer la dernière sauvegarde, rejouer les journaux de la base si disponibles |
| Base corrompue | Restaurer la dernière sauvegarde, puis **rejouer les saisies** postérieures à partir des pièces jointes et des notifications. Si MariaDB ne démarre plus, voir § 7 bis. |
| Disque plein | Libérer de l'espace, **ne jamais supprimer une pièce jointe manuellement** : le lien entre le fichier et sa ligne en base serait perdu |
| Compte compromis | Désactiver le compte (action immédiate), changer le mot de passe, consulter le journal (`CONNEXION_ECHOUEE`, `CONNEXION`) |
| Pièce jointe manquante | La pièce est stockée sous un nom UUID : restaurer l'archive `tar.gz`, qui contient les noms d'origine et les UUID |

---

## 7 bis. Reprise d'une base InnoDB qui ne démarre plus

Symptômes dans `C:\xampp\mysql\data\mysql_error.log` :

```
[ERROR] InnoDB: Page ... log sequence number ... is in the future!
[ERROR] mysqld.exe: Index for table '.\mysql\proxies_priv' is corrupt
[ERROR] Fatal error: Can't open and lock privilege tables
```

Un arrêt brutal — coupure, redémarrage de la machine, déplacement du projet —
peut laisser les pages InnoDB en avance sur le journal de redo. La base
applicative reste souvent lisible : on l'extrait **avant** de reconstruire.

1. **Sauvegarder le répertoire de données**, même corrompu : c'est la seule
   copie.
   ```powershell
   robocopy C:\xampp\mysql\data C:\xampp\mysql\data_sauvegarde_<date> /E
   ```
2. **Démarrer en lecture forcée**, sans contrôle des grants.
   ```powershell
   C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini `
     --innodb-force-recovery=4 --skip-grant-tables
   ```
3. **Extraire la base applicative** — avec `cmd`, jamais avec `>` de
   PowerShell, qui écrit en UTF-16.
   ```powershell
   cmd /c "C:\xampp\mysql\bin\mysqldump.exe -u root --skip-lock-tables --single-transaction --routines --triggers --events --default-character-set=utf8mb4 srsp_db > D:\SRSP-2026\Backend\backups\srsp_db_recovery.sql"
   ```
   Vérifier que le fichier se termine par `-- Dump completed` et que sa
   taille est plausible.
4. **Arrêter le serveur de récupération**, déplacer le répertoire corrompu,
   en créer un neuf et l'initialiser.
   ```powershell
   Stop-Process -Id (Get-NetTCPConnection -LocalPort 3306).OwningProcess -Force
   Move-Item C:\xampp\mysql\data C:\xampp\mysql\data_corrompu_<date>
   New-Item -ItemType Directory C:\xampp\mysql\data
   C:\xampp\mysql\bin\mysql_install_db.exe --datadir=C:\xampp\mysql\data
   ```
5. **Redémarrer MariaDB**, recréer la base et importer le dump.
   ```powershell
   C:\xampp\mysql\bin\mysqld.exe --defaults-file=C:\xampp\mysql\bin\my.ini
   C:\xampp\mysql\bin\mysql.exe -u root -e "CREATE DATABASE srsp_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   cmd /c "C:\xampp\mysql\bin\mysql.exe -u root --default-character-set=utf8mb4 srsp_db < D:\SRSP-2026\Backend\backups\srsp_db_recovery.sql"
   ```
6. **Contrôler** : nombre de tables, comptes, dossiers, et un accent —
   `HEX(LEFT(motif, 10))` doit commencer par `5069C3A8` pour « Pièce ».
7. Redémarrer l'API, puis rejouer `test-e2e-droits.mjs` et la campagne de
   référence.

> Le dump doit être **relu avant d'être importé**. Une redirection
> PowerShell produit un fichier UTF-16 avec des NUL : MySQL s'arrête sur
> `ASCII '\0' appeared in the statement`. Utiliser `cmd /c "... > fichier"`,
> ou convertir explicitement en UTF-8 sans BOM.

---

## 8. Vérification du bac à sable

Le test de restauration mensuel :

1. Créer une base `srsp_test` :
   ```sql
   CREATE DATABASE srsp_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Y restaurer le dump :
   ```bash
   MYSQL_PWD='<mot-de-passe>' mysql -h127.0.0.1 -P3306 -u root srsp_test \
     < backups/srsp-<date>.sql
   ```
3. Y extraire les pièces :
   ```bash
   tar -xzf backups/srsp-<date>-pieces.tar.gz -C /tmp/srsp-test
   ```
4. Pointer l'API de test sur `srsp_test` (variable `DB_NAME` du `.env` de
   test), la démarrer sur un autre port, et vérifier :
   - la connexion de chaque profil de démonstration ;
   - l'ouverture d'un dossier archivé ;
   - le **téléchargement** d'une pièce jointe ;
   - l'affichage du journal d'audit.
5. Consigner le résultat (date, durée, anomalies) dans le registre
   d'exploitation.

> Une sauvegarde jamais restaurée n'est pas une sauvegarde : c'est une
> hypothèse.

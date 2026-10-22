# Sauvegarde et restauration — SRSP Fitovinany (PostgreSQL)

La plateforme tient deux choses qu'il ne faut pas perdre : **les données** et
**les pièces jointes**. Une sauvegarde qui n'embarque que l'une des deux
donne un état trompeur — une base cohérente dont aucun document ne
s'ouvre. La procédure ci-dessous traite les deux ensemble.

---

## 1. Ce qui doit être sauvegardé

| Élément | Emplacement | Inclus par |
|---|---|---|
| Base de données `srsp_db` | PostgreSQL 18, `localhost:5432` | `pg_dump` |
| Pièces jointes des dossiers | `Backend/src/uploads/documents/` | archive `tar.gz` / ZIP |
| Pièces jointes des courriers | `Backend/src/uploads/courriers/` | archive `tar.gz` / ZIP |
| Configuration | `Backend/.env` | copie manuelle chiffrée |

> `Backend/.env` contient `JWT_SECRET` et les identifiants de la base. Il
> **ne** figure pas dans la sauvegarde automatique : le conserver hors du
> dépôt, chiffré, avec les secrets de l'établissement. Une base restaurée
> sans le même `JWT_SECRET` invalide toutes les sessions — c'est sans
> conséquence, mais cela force les agents à se reconnecter.

---

## 2. Sauvegarde manuelle de la base

Les commandes ci-dessous utilisent `pg_dump` (fourni avec PostgreSQL). Sous
Windows, il se trouve dans `C:\Program Files\PostgreSQL\18\bin`.

### 2.1 Format SQL lisible (recommandé pour cette livraison)

**Windows PowerShell**

```powershell
$env:PGPASSWORD = "010622"
$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$date = Get-Date -Format "yyyyMMdd-HHmm"
$out = "Backend\backups\srsp-$date.sql"

& "$pgBin\pg_dump.exe" -h localhost -p 5432 -U postgres `
  --no-owner --no-privileges --clean --if-exists `
  -f $out srsp_db
```

**Linux / macOS**

```bash
export PGPASSWORD='010622'
mkdir -p Backend/backups
pg_dump -h localhost -p 5432 -U postgres \
  --no-owner --no-privileges --clean --if-exists \
  -f "Backend/backups/srsp-$(date +%Y%m%d-%H%M).sql" srsp_db
```

`--clean --if-exists` permet de réimporter le dump sur une base qui contient
déjà le schéma. Le fichier reste lisible et versionnable.

### 2.2 Format binaire compressé (plus rapide pour les grosses bases)

```bash
pg_dump -h localhost -p 5432 -U postgres -Fc \
  -f Backend/backups/srsp-$(date +%Y%m%d-%H%M).dump srsp_db
```

Restauration avec `pg_restore` (voir § 4).

---

## 3. Sauvegarde des pièces jointes

**Linux / macOS**

```bash
tar -czf "Backend/backups/srsp-$(date +%Y%m%d-%H%M)-pieces.tar.gz" \
  -C Backend/src/uploads documents courriers
```

**Windows PowerShell**

```powershell
$date = Get-Date -Format "yyyyMMdd-HHmm"
Compress-Archive -Path Backend\src\uploads\documents, Backend\src\uploads\courriers `
  -DestinationPath "Backend\backups\srsp-$date-pieces.zip" -Force
```

> Les fichiers sont stockés sous des noms UUID : l'archive doit conserver
> l'arborescence `documents/` et `courriers/`, pas seulement les fichiers.

---

## 4. Restauration complète (base + pièces)

> ⚠️ **La restauration est destructive.** Elle remplace les données actuelles
> par celles de la sauvegarde. Ne l'utilisez qu'après avoir vérifié la
> sauvegarde de sécurité et, idéalement, sur une base de test.

### 4.1 Arrêter l'API

```bash
# Linux / macOS
ss -ltnp | grep 5000
kill <PID>
```

```powershell
# Windows
Get-NetTCPConnection -LocalPort 5000 -State Listen |
  ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### 4.2 Restaurer la base

**Windows PowerShell**

```powershell
$env:PGPASSWORD = "010622"
$pgBin = "C:\Program Files\PostgreSQL\18\bin"
$psql = Join-Path $pgBin "psql.exe"

# Sauvegarde de sécurité de l'état courant (obligatoire)
& "$pgBin\pg_dump.exe" -h localhost -U postgres `
  -f "Backend\backups\avant-restauration-$(Get-Date -Format yyyyMMdd-HHmm).sql" srsp_db

# Repartir d'une base vide
& $psql -h localhost -U postgres -d postgres `
  -c "DROP DATABASE IF EXISTS srsp_db WITH (FORCE);"
& $psql -h localhost -U postgres -d postgres `
  -c "CREATE DATABASE srsp_db ENCODING 'UTF8' TEMPLATE template0;"

# Réimporter
& $psql -h localhost -U postgres -d srsp_db `
  -v ON_ERROR_STOP=1 -f "Backend\backups\srsp-<date>.sql"
```

**Linux / macOS**

```bash
export PGPASSWORD='010622'
pg_dump -h localhost -U postgres -f "Backend/backups/avant-restauration-$(date +%Y%m%d-%H%M).sql" srsp_db

dropdb -h localhost -U postgres --if-exists --force srsp_db
createdb -h localhost -U postgres -E UTF8 -T template0 srsp_db
psql -h localhost -U postgres -d srsp_db -v ON_ERROR_STOP=1 \
  -f "Backend/backups/srsp-<date>.sql"
```

Avec un dump binaire (`-Fc`) :

```bash
pg_restore -h localhost -U postgres -d srsp_db --clean --if-exists \
  "Backend/backups/srsp-<date>.dump"
```

### 4.3 Restaurer les pièces jointes

```bash
# Linux / macOS
tar -xzf "Backend/backups/srsp-<date>-pieces.tar.gz" -C Backend/src/uploads
```

```powershell
# Windows
Expand-Archive -Path "Backend\backups\srsp-<date>-pieces.zip" `
  -DestinationPath "Backend\src\uploads" -Force
```

### 4.4 Redémarrer et contrôler

```bash
cd Backend
npm start
```

```bash
curl -s http://localhost:5000/api/health
psql -h localhost -U postgres -d srsp_db -c "SELECT COUNT(*) FROM dossiers;"
```

Puis se connecter avec un compte de démonstration, ouvrir un dossier archivé
et **télécharger réellement une pièce jointe**.

---

## 5. Vérifier une sauvegarde

Une sauvegarde n'est une sauvegarde que si elle se restaure. Après chaque
sauvegarde :

```bash
# Dump SQL : le fichier contient-il des données ?
grep -c "^COPY " Backend/backups/srsp-<date>.sql

# Dump binaire : lister son contenu
pg_restore -l Backend/backups/srsp-<date>.dump | head

# Archive des pièces : contient-elle des fichiers ?
tar -tzf Backend/backups/srsp-<date>-pieces.tar.gz | head
```

Un `0` sur la première commande, ou une archive vide, signifie que la
sauvegarde est incomplète : la refaire avant de l'adresser.

---

## 6. Test de restauration mensuel

1. Créer une base de test :
   ```bash
   createdb -h localhost -U postgres -E UTF8 -T template0 srsp_test
   ```
2. Y restaurer le dump :
   ```bash
   psql -h localhost -U postgres -d srsp_test -v ON_ERROR_STOP=1 \
     -f Backend/backups/srsp-<date>.sql
   ```
3. Vérifier les volumes :
   ```bash
   psql -h localhost -U postgres -d srsp_test -c \
     "SELECT COUNT(*) AS tables FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE';"
   psql -h localhost -U postgres -d srsp_test -c "SELECT COUNT(*) FROM dossiers;"
   ```
4. Pointer une instance de test de l'API sur `srsp_test` (`DB_NAME=srsp_test`,
   autre port), puis vérifier :
   - la connexion de chaque profil de démonstration ;
   - l'ouverture d'un dossier archivé ;
   - le **téléchargement** d'une pièce jointe ;
   - l'affichage du journal d'audit.
5. Supprimer la base de test :
   ```bash
   dropdb -h localhost -U postgres --if-exists --force srsp_test
   ```
6. Consigner le résultat (date, durée, anomalies) dans le registre
   d'exploitation.

> Une sauvegarde jamais restaurée n'est pas une sauvegarde : c'est une
> hypothèse.

---

## 7. Politique de sauvegarde recommandée

| Élément | Fréquence | Conservation |
|---|---|---|
| Sauvegarde complète (base + pièces) | **Quotidienne** | 30 jours glissants |
| Sauvegarde avant toute mise à jour | À chaque mise à jour | Jusqu'à validation |
| Sauvegarde avant une restauration | Systématique | 30 jours |
| Copie **hors site** (disque externe, NAS, cloud chiffré) | Hebdomadaire | 6 mois |
| **Test de restauration** | **Mensuelle** | — |

> La sauvegarde doit être **copiée hors du serveur**. Une sauvegarde restée
> sur le disque de la machine qu'elle protège disparaît avec elle.

---

## 8. Procédure d'incident

| Situation | Conduite à tenir |
|---|---|
| Serveur HS | Réinstaller le système, restaurer la dernière sauvegarde, rejouer les saisies postérieures si possible |
| Base corrompue | Restaurer la dernière sauvegarde vérifiée ; ne jamais tenter de réparer à chaud sans copie préalable |
| Service PostgreSQL arrêté | `services.msc` → `postgresql-x64-18` → Démarrer, ou `net start postgresql-x64-18` |
| Disque plein | Libérer de l'espace, **ne jamais supprimer une pièce jointe manuellement** : le lien entre le fichier et sa ligne en base serait perdu |
| Compte compromis | Désactiver le compte, changer le mot de passe, consulter le journal (`CONNEXION_ECHOUEE`, `CONNEXION`) |
| Pièce jointe manquante | La pièce est stockée sous un nom UUID : restaurer l'archive, qui contient l'arborescence d'origine |

---

## 9. Reprise après corruption PostgreSQL

PostgreSQL résiste bien aux arrêts brutaux, mais une coupure de courant
pendant une écriture peut encore laisser le serveur en état de récupération.
La procédure est volontairement simple :

1. **Sauvegarder le répertoire de données** avant toute manipulation
   (par exemple `C:\Program Files\PostgreSQL\18\data`) : c'est la seule copie
   de l'état courant.
2. **Consulter le journal** `C:\Program Files\PostgreSQL\18\data\log\` ou
   l'Observateur d'événements Windows. PostgreSQL refuse de démarrer plutôt
   que de corrompre les données : lire le message avant d'agir.
3. **Redémarrer le service** :
   ```powershell
   Restart-Service postgresql-x64-18
   ```
4. Si le serveur refuse toujours de démarrer, **restaurer la dernière
   sauvegarde** dans une installation PostgreSQL saine. Ne pas supprimer le
   répertoire `data` tant qu'une copie n'est pas faite.
5. Contrôler après restauration : nombre de tables (61), nombre de dossiers,
   connexion de chaque profil, ouverture d'une pièce jointe.

> Ne jamais éditer les fichiers de `data/` à la main. Pour une intervention
> lourde, faire appel à un administrateur PostgreSQL.

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  RefreshCw, TriangleAlert, CircleCheck,
  CircleDashed, CircleSlash, Layers, Download,
} from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { TextInput } from '../../components/fields/index.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';
import { Pagination } from '../../components/ui/Pagination.jsx';

/**
 * Bilan de conformité au cahier des fonctionnalités.
 *
 * La plateforme tient un registre des exigences du cahier — une par une,
 * avec son état : livrée, partielle, inerte, non construite, hors
 * plateforme. Ce registre était dans la base et **n'était visible nulle
 * part** : personne ne pouvait répondre à « où en est-on ? ».
 *
 * C'est cet écran qui y répond. Il dit trois choses :
 *
 *   - **où en est la plateforme** — le décompte par état ;
 *   - **ce qui manque** — le filtre « non livrées », avec le motif de chaque
 *     fonction non livrée ;
 *   - **qui est concerné** — la répartition par poste, c'est-à-dire par
 *     rôle porteur de l'exigence.
 *
 * Un état « inerte » mérite une attention particulière : la fonction est
 * déclarée, la permission existe, mais elle ne mène nulle part. C'est la
 * catégorie la plus trompeuse, et la plus facile à laisser traîner.
 */

/** Les états d'une fonction, et la façon de les montrer. */
const ETATS = {
  LIVREE: { label: 'Livrée', classe: 'border-emerald-200 bg-emerald-50 text-emerald-700', Icone: CircleCheck },
  PARTIELLE: { label: 'Partielle', classe: 'border-amber-200 bg-amber-50 text-amber-700', Icone: CircleDashed },
  INERTE: { label: 'Inerte', classe: 'border-orange-200 bg-orange-50 text-orange-800', Icone: TriangleAlert },
  NON_CONSTRUITE: { label: 'Non construite', classe: 'border-slate-200 bg-slate-50 text-slate-600', Icone: CircleSlash },
  HORS_PLATEFORME: { label: 'Hors plateforme', classe: 'border-slate-200 bg-white text-slate-500', Icone: Layers },
};

const DOCUMENTS = [
  { code: 'OBLIGATOIRE', label: 'Cahier v2.0 — fonctionnalités obligatoires' },
  { code: 'HISTORIQUE', label: 'Cahier v2.0 — fonctionnalités historiques' },
];

export function BilanPage() {
  const [bilan, setBilan] = useState(null);
  const [postes, setPostes] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);

  const [document, setDocument] = useState('OBLIGATOIRE');
  const [etat, setEtat] = useState('');
  const [poste, setPoste] = useState('');
  const [manquantes, setManquantes] = useState(false);

  const [lignes, setLignes] = useState([]);
  const [chargementListe, setChargementListe] = useState(true);
  const [erreurListe, setErreurListe] = useState(null);
  const [recherche, setRecherche] = useState('');

  /* La pagination est côté client : le serveur renvoie le registre filtré,
     et c'est l'écran qui le découpe. */
  const [page, setPage] = useState(1);
  const [taillePage, setTaillePage] = useState(20);
  const chargerBilan = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const [b, p] = await Promise.all([
        referentielService.bilan({ document }),
        referentielService.postes().catch(() => []),
      ]);
      setBilan(b);
      setPostes(Array.isArray(p) ? p : []);
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, [document]);

  const chargerListe = useCallback(async () => {
    try {
      setChargementListe(true);
      setErreurListe(null);
      const reponse = await referentielService.conformite({
        document,
        etat: etat || undefined,
        poste: poste || undefined,
        manquantes: manquantes ? '1' : undefined,
      });
      setLignes(reponse?.lignes || []);
    } catch (e) {
      setErreurListe(e);
    } finally {
      setChargementListe(false);
    }
  }, [document, etat, poste, manquantes]);

  useEffect(() => { Promise.resolve().then(chargerBilan); }, [chargerBilan]);
  useEffect(() => { Promise.resolve().then(chargerListe); }, [chargerListe]);

  /* La recherche porte sur le texte de l'exigence : elle se fait ici, sur la
     liste déjà filtrée par le serveur — le serveur ne connaît pas la
     recherche plein texte. */
  const lignesFiltrees = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return lignes;
    return lignes.filter((l) => (
      `${l.numero_source} ${l.libelle} ${l.description || ''} ${l.poste_libelle || ''}`
        .toLowerCase()
        .includes(q)
    ));
  }, [lignes, recherche]);

  const totalPages = Math.max(1, Math.ceil(lignesFiltrees.length / taillePage));
  const pageCourante = Math.min(page, totalPages);
  const pageLignes = lignesFiltrees.slice(
    (pageCourante - 1) * taillePage,
    pageCourante * taillePage
  );

  /* Un changement de filtre ramène à la première page : sinon on atterrit
     sur une page vide sans comprendre pourquoi. Le retour à la première
     page se fait ici, dans le geste qui a changé le filtre — pas dans un
     effet, qui declencherait un rendu de plus. */
  const changerFiltre = (setter) => (valeur) => {
    setter(valeur);
    setPage(1);
  };

  const exporter = () => {
    const enTete = [
      'N°', 'État', 'Nature', 'Poste', 'Exigence', 'Motif',
    ];
    const corps = lignesFiltrees.map((l) => [
      l.numero_source,
      ETATS[l.etat]?.label || l.etat,
      l.nature || '',
      l.poste_libelle || '',
      l.libelle || l.description || '',
      l.motif || '',
    ]);
    const csv = [enTete, ...corps]
      .map((r) => r.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(';'))
      .join('\r\n');
    const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const lien = document.createElement('a');
    lien.href = url;
    lien.download = `conformite-${document.toLowerCase()}.csv`;
    lien.click();
    URL.revokeObjectURL(url);
  };

  if (chargement) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner label="Chargement du bilan…" />
      </div>
    );
  }

  if (erreur) {
    return (
      <Alert type="warning" title="Bilan indisponible">
        {erreur.message}
      </Alert>
    );
  }

  const parEtat = bilan?.par_etat || {};
  const totalFonctions = bilan?.total || 0;

  return (
    <AnimatedCard
      title="Bilan de conformité"
      subtitle="État des exigences du cahier des fonctionnalités, poste par poste."
      delay={0}
    >
      <div className="space-y-5">
        <Alert type="info" title="Comment lire ce bilan">
          Chaque ligne est une exigence du cahier. <strong>Livrée</strong> :
          elle est en service. <strong>Partielle</strong> : elle existe mais
          ne couvre pas tout. <strong>Inerte</strong> : elle est déclarée, la
          permission existe, et elle ne mène nulle part — c’est la catégorie
          la plus trompeuse. <strong>Non construite</strong> : elle reste à
          faire. <strong>Hors plateforme</strong> : elle ne concerne pas
          l’application.
        </Alert>

        <div className="flex flex-wrap items-end gap-3">
          <div className="w-full sm:w-80">
            <Select
              label="Document"
              value={document}
              onClick={() => {
                setDocument(e.target.value);
                setPage(1);
              }}
            >
              {DOCUMENTS.map((d) => (
                <option key={d.code} value={d.code}>{d.label}</option>
              ))}
            </Select>
          </div>
          <Button variant="ghost" size="sm" onClick={chargerBilan} title="Actualiser">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* Le décompte par état : la réponse à « où en est-on ? ». */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(ETATS).map(([code, etat]) => (
            <button
              key={code}
              type="button"
              onClick={() => setEtat(etat === etat ? '' : code)}
              aria-label={`Filtrer sur les fonctions ${etat.label.toLowerCase()}`}
              aria-pressed={etat === code}
              className={`rounded-lg border px-4 py-3 text-left transition ${
                etat === code
                  ? 'border-primary-300 bg-primary-50'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-xs font-medium text-slate-500">{etat.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">
                {parEtat[code.toLowerCase()] ?? 0}
              </p>
              <p className="text-xs text-slate-400">
                {totalFonctions > 0
                  ? `${Math.round(((parEtat[code.toLowerCase()] ?? 0) / totalFonctions) * 100)} %`
                  : '—'}
              </p>
            </button>
          ))}
        </div>

        {bilan?.fonctions_non_livrees_sans_motif > 0 && (
          <Alert type="warning" title="Des fonctions non livrées n'ont pas de motif">
            {bilan.fonctions_non_livrees_sans_motif} fonction(s) ne sont pas
            livrées sans motif. Un motif est ce qui permet de comprendre
            pourquoi — et de le corriger plus tard.
          </Alert>
        )}

        {/* Par poste : quel rôle porte quelles exigences. */}
        <Card title="Répartition par poste">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th scope="col" className="py-2 pr-3">Poste</th>
                  <th scope="col" className="py-2 pr-3">Total</th>
                  <th scope="col" className="py-2 pr-3">Livrées</th>
                  <th scope="col" className="py-2 pr-3">Partielles</th>
                  <th scope="col" className="py-2 pr-3">Inertes</th>
                  <th scope="col" className="py-2 pr-3">Non construites</th>
                  <th scope="col" className="py-2">Hors plateforme</th>
                </tr>
              </thead>
              <tbody>
                {(bilan?.par_poste || []).map((p) => (
                  <tr key={p.poste_code} className="border-b border-slate-100">
                    <th scope="row" className="py-2 pr-3 text-left font-medium text-slate-700">
                      {p.poste_libelle || p.poste_code}
                    </th>
                    <td className="py-2 pr-3">{p.total}</td>
                    <td className="py-2 pr-3 text-emerald-700">{p.livrees}</td>
                    <td className="py-2 pr-3 text-amber-700">{p.partielles}</td>
                    <td className="py-2 pr-3 text-orange-800">{p.inertes}</td>
                    <td className="py-2 pr-3 text-slate-600">{p.non_construites}</td>
                    <td className="py-2 text-slate-500">{p.hors_plateforme}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* La liste des exigences : c'est là qu'on voit ce qui manque. */}
        <Card
          title="Détail des exigences"
          subtitle={`${lignesFiltrees.length} exigence(s) affichée(s)`}
          actions={
            <Button variant="outline" size="sm" onClick={exporter}>
              <Download className="h-3.5 w-3.5" /> Exporter
            </Button>
          }
        >
          <div className="mb-4 flex flex-wrap items-end gap-3">
            <div className="min-w-[14rem] flex-1">
              <TextInput
                label="Recherche"
                value={recherche}
                onChange={changerFiltre(setRecherche)}
                placeholder="N°, exigence, poste…"
                clearable
              />
            </div>
            <div className="w-full sm:w-52">
              <Select
                label="État"
                value={etat}
                onChange={(e) => changerFiltre(setEtat)(e.target.value)}
                placeholder="Tous les états"
              >
                {Object.entries(ETATS).map(([code, e]) => (
                  <option key={code} value={code}>{e.label}</option>
                ))}
              </Select>
            </div>
            <div className="w-full sm:w-60">
              <Select
                label="Poste"
                value={poste}
                onChange={(e) => changerFiltre(setPoste)(e.target.value)}
                placeholder="Tous les postes"
              >
                {postes.map((p) => (
                  <option key={p.code} value={p.code}>{p.libelle}</option>
                ))}
              </Select>
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={manquantes}
                onChange={(e) => changerFiltre(setManquantes)(e.target.checked)}
                aria-label="Afficher uniquement les fonctions non livrées"
                className="h-4 w-4 rounded border-slate-300 text-primary-600"
              />
              Non livrées seulement
            </label>
          </div>

          {erreurListe && (
            <Alert type="warning" title="Liste indisponible">
              {erreurListe.message}
            </Alert>
          )}

          {chargementListe ? (
            <Spinner className="py-6" />
          ) : lignesFiltrees.length === 0 ? (
            <p className="rounded-md bg-slate-50 px-3 py-4 text-sm text-slate-500">
              Aucune exigence ne correspond à ces filtres.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th scope="col" className="py-2 pr-3">N°</th>
                      <th scope="col" className="py-2 pr-3">État</th>
                      <th scope="col" className="py-2 pr-3">Poste</th>
                      <th scope="col" className="py-2 pr-3">Exigence</th>
                      <th scope="col" className="py-2">Motif</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageLignes.map((l) => {
                      const etat = ETATS[l.etat] || ETATS.NON_CONSTRUITE;
                      return (
                        <tr key={l.id ?? `${l.numero_source}-${l.poste_code}`} className="border-b border-slate-100 align-top">
                          <td className="py-2 pr-3 font-mono text-xs text-slate-500">{l.numero_source}</td>
                          <td className="py-2 pr-3">
                            <Badge className={etat.classe}>{etat.label}</Badge>
                          </td>
                          <td className="py-2 pr-3 text-slate-600">{l.poste_libelle || '—'}</td>
                          <td className="py-2 pr-3 text-slate-700">
                            {l.libelle || l.description || '—'}
                          </td>
                          <td className="py-2 text-xs text-slate-500">{l.motif || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                pagination={{
                  page: pageCourante,
                  setPage,
                  pageSize: taillePage,
                  setPageSize: (n) => { setTaillePage(n); setPage(1); },
                  totalPages,
                  from: lignesFiltrees.length === 0 ? 0 : (pageCourante - 1) * taillePage + 1,
                  to: Math.min(pageCourante * taillePage, lignesFiltrees.length),
                  total: lignesFiltrees.length,
                }}
              />
            </>
          )}
        </Card>
      </div>
    </AnimatedCard>
  );
}

export default BilanPage;

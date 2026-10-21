import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Save, SlidersHorizontal, AlertTriangle } from 'lucide-react';
import { referentielService } from '../../services/referentielService.js';
import { useNotification } from '../../hooks/useNotification.js';
import { Card } from '../../components/ui/Card.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Select } from '../../components/ui/Select.jsx';
import { TextInput, TextAreaInput } from '../../components/fields/index.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Spinner } from '../../components/ui/Spinner.jsx';
import { Alert } from '../../components/ui/Alert.jsx';
import { AnimatedCard } from '../../components/ui/AnimatedCard.jsx';

/**
 * Schémas de données par type d'opération.
 *
 * Un schéma dit à l'agent **quels champs** remplir pour l'opération qu'il
 * instruit. C'est ce qui permet au SRSP de faire évoluer ses formulaires —
 * une fiche de contrôle, un transfert de localité, un bon de caisse — sans
 * développement.
 *
 * L'écran montre, pour chaque opération, les champs qui lui sont propres.
 * Les champs **communs** — référence, dossier mère, période, montant, source,
 * observation — sont toujours disponibles : ils ne sont pas modifiables ici,
 * parce que d'autres écrans s'appuient dessus.
 *
 * Une opération **sans schéma** est signalée : son formulaire ne montre
 * aujourd'hui que les champs communs, et l'administrateur doit le voir pour
 * savoir ce qui lui reste à faire.
 */

/** Les types de champ qu'un formulaire sait rendre. */
const TYPES_CHAMPS = [
  { code: 'texte', label: 'Texte' },
  { code: 'nombre', label: 'Nombre' },
  { code: 'date', label: 'Date' },
  { code: 'textarea', label: 'Texte long' },
  { code: 'choix', label: 'Liste de choix' },
];

/** Champs communs : ils ne se configurent pas ici. */
const CHAMPS_COMMUNS = [
  'reference_externe', 'reference_dossier_mere', 'matricule', 'periode',
  'montant', 'source_montant', 'date_reference', 'destinataire',
  'localisation', 'observation',
];

/** Un champ vide, prêt à être rempli. */
const champVide = () => ({
  cle: '',
  libelle: '',
  type_champ: 'texte',
  requis: false,
  options: '',
  aide: '',
});

export function SchemasOperationsPage() {
  const { toastSuccess, toastError } = useNotification();
  const [donnees, setDonnees] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [enCours, setEnCours] = useState(false);
  /* Les brouillons d'édition, par opération : le formulaire n'est modifié
     qu'en mémoire, et n'est écrit que sur « Enregistrer ». */
  const [brouillons, setBrouillons] = useState({});

  const charger = useCallback(async () => {
    try {
      setChargement(true);
      setErreur(null);
      const reponse = await referentielService.schemasOperations();
      setDonnees(reponse);
      /* Les brouillons repartent de l'état enregistré : une modification
         abandonnée ne doit pas resurgir au rechargement suivant. */
      const initiaux = {};
      for (const schema of reponse?.schemas || []) {
        initiaux[schema.sous_type_id] = schema.champs.map((c) => ({ ...c }));
      }
      setBrouillons(initiaux);
    } catch (e) {
      setErreur(e);
    } finally {
      setChargement(false);
    }
  }, []);

  useEffect(() => { Promise.resolve().then(charger); }, [charger]);

  const champsDe = (schema) => brouillons[schema.sous_type_id] || schema.champs;

  const modifierChamp = (schema, index, modification) => {
    setBrouillons((b) => {
      const champs = [...(b[schema.sous_type_id] || schema.champs)];
      champs[index] = { ...champs[index], ...modification };
      return { ...b, [schema.sous_type_id]: champs };
    });
  };

  const ajouterChamp = (schema) => {
    setBrouillons((b) => {
      const champs = [...(b[schema.sous_type_id] || schema.champs), champVide()];
      return { ...b, [schema.sous_type_id]: champs };
    });
  };

  const retirerChamp = (schema, index) => {
    setBrouillons((b) => {
      const champs = [...(b[schema.sous_type_id] || schema.champs)];
      champs.splice(index, 1);
      return { ...b, [schema.sous_type_id]: champs };
    });
  };

  const enregistrer = async (schema) => {
    const champs = champsDe(schema);
    const incomplets = champs.filter((c) => !String(c.cle || '').trim() || !String(c.libelle || '').trim());
    if (incomplets.length) {
      toastError('Chaque champ doit avoir une clé et un libellé.');
      return;
    }
    setEnCours(true);
    try {
      await referentielService.remplacerSchemaOperation(schema.sous_type_id, {
        champs: champs.map((c) => ({
          cle: c.cle,
          libelle: c.libelle,
          type_champ: c.type_champ,
          requis: Boolean(c.requis),
          options: c.options || null,
          aide: c.aide || null,
          ordre: c.ordre,
        })),
      });
      toastSuccess(`Schéma « ${schema.libelle} » enregistré.`);
      await charger();
    } catch (e) {
      toastError(e.message);
    } finally {
      setEnCours(false);
    }
  };

  if (chargement) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Spinner label="Chargement des schémas…" />
      </div>
    );
  }

  if (erreur) {
    return (
      <Alert type="warning" title="Schémas indisponibles">
        {erreur.message}
      </Alert>
    );
  }

  const schemas = donnees?.schemas || [];
  const sansSchema = donnees?.operations_sans_schema || [];

  return (
    <AnimatedCard
      title="Schémas d’opérations"
      subtitle="Les champs à saisir pour chaque type d’opération, par division."
      delay={0}
    >
      <div className="space-y-5">
        <Alert type="info" title="Comment lire cet écran">
          Chaque bloc correspond à un type d’opération. Les champs listés
          s’ajoutent aux <strong>champs communs</strong> — référence, dossier
          mère, période, montant, source, observation — qui sont toujours
          disponibles. Un champ dont la clé est un champ commun le remplace ;
          les autres lui sont propres.
        </Alert>

        {sansSchema.length > 0 && (
          <Card title="Opérations sans schéma propre">
            <p className="mb-3 text-sm text-slate-600">
              Ces opérations n’ont pas encore de formulaire spécifique : leurs
              dossiers ne montrent que les champs communs.
            </p>
            <div className="flex flex-wrap gap-2">
              {sansSchema.map((o) => (
                <Badge
                  key={o.id}
                  className="border-amber-200 bg-amber-50 text-amber-800"
                >
                  {o.libelle}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {schemas.map((schema) => {
          const champs = champsDe(schema);
          const modifies = JSON.stringify(champs) !== JSON.stringify(schema.champs);
          return (
            <Card
              key={schema.sous_type_id}
              title={schema.libelle}
              subtitle={`${schema.type_libelle} — ${champs.length} champ(s) propre(s)`}
              actions={
                <Button
                  size="sm"
                  onClick={() => enregistrer(schema)}
                  loading={enCours}
                  disabled={!modifies}
                >
                  <Save className="h-3.5 w-3.5" /> Enregistrer
                </Button>
              }
            >
              <div className="space-y-3">
                {champs.length === 0 && (
                  <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Aucun champ propre. Seuls les champs communs sont
                    proposés.
                  </p>
                )}

                {champs.map((champ, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-slate-200 p-3"
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <TextInput
                        label="Clé"
                        value={champ.cle || ''}
                        onChange={(v) => modifierChamp(schema, index, { cle: v })}
                        maxLength={60}
                        hint={
                          CHAMPS_COMMUNS.includes(champ.cle)
                            ? 'Champ commun : il remplace la colonne existante.'
                            : undefined
                        }
                      />
                      <TextInput
                        label="Libellé"
                        value={champ.libelle || ''}
                        onChange={(v) => modifierChamp(schema, index, { libelle: v })}
                        maxLength={150}
                      />
                      <Select
                        label="Type"
                        value={champ.type_champ || 'texte'}
                        onChange={(e) => modifierChamp(schema, index, { type_champ: e.target.value })}
                      >
                        {TYPES_CHAMPS.map((t) => (
                          <option key={t.code} value={t.code}>{t.label}</option>
                        ))}
                      </Select>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2 pb-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            checked={Boolean(champ.requis)}
                            onChange={(e) => modifierChamp(schema, index, { requis: e.target.checked })}
                            className="h-4 w-4 rounded border-slate-300 text-primary-600"
                          />
                          Obligatoire
                        </label>
                      </div>
                    </div>

                    {champ.type_champ === 'choix' && (
                      <div className="mt-3">
                        <TextInput
                          label="Choix possibles"
                          value={champ.options || ''}
                          onChange={(v) => modifierChamp(schema, index, { options: v })}
                          maxLength={500}
                          hint="Séparés par une barre verticale : Virement|Espèces|Chèque"
                        />
                      </div>
                    )}

                    <div className="mt-3 flex items-end gap-2">
                      <div className="flex-1">
                        <TextInput
                          label="Aide affichée sous le champ"
                          value={champ.aide || ''}
                          onChange={(v) => modifierChamp(schema, index, { aide: v })}
                          maxLength={255}
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={() => retirerChamp(schema, index)}
                        className="text-red-600 hover:bg-red-50"
                        title="Retirer ce champ du schéma"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => ajouterChamp(schema)}>
                    <Plus className="h-3.5 w-3.5" /> Ajouter un champ
                  </Button>
                  {modifies && (
                    <span className="flex items-center gap-1 text-xs text-amber-700">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Modifications non enregistrées.
                    </span>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AnimatedCard>
  );
}

export default SchemasOperationsPage;

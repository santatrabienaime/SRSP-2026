import { useState, useEffect, useCallback } from 'react';
import {
  Stamp, ShieldAlert, FileWarning, PenLine, Hourglass,
} from 'lucide-react';
import { Card } from '../ui/Card.jsx';
import { Badge } from '../ui/Badge.jsx';
import { DepouillementChecklist } from './DepouillementChecklist.jsx';
import { formatDateString, formatDateTime } from '../../utils/formatDate.js';
import { STATUT_LABELS } from '../../config/constants.js';

/**
 * Panneau « VISA » de la fiche dossier.
 *
 * Il rassemble ce qui distingue un dossier VISA des autres : une référence
 * propre, un type d'acte, un horodatage de réception, l'origine et le
 * présentateur, le comptable, l'année de référence, le vérificateur, le
 * bénéficiaire et l'organisme.
 *
 * Trois informations de gestion complètent la fiche et se lisent rarement
 * ailleurs : l'ancienneté du dossier, la signature (qui, quand, sous quelle
 * référence) et la dérogation à la validation, qui doit rester visible —
 * une exception demandée mais non tracée ne vaut pas exception.
 */

function Ligne({ label, value, className = '' }) {
  return (
    <div className="border-b border-slate-100 py-2 last:border-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={`mt-0.5 text-sm text-slate-700 ${className}`}>{value || '—'}</dd>
    </div>
  );
}

/** Ancienneté du dossier, exprimée en jours. */
function anciennete(jours) {
  if (jours === undefined || jours === null) return '—';
  if (jours === 0) return 'Reçu aujourd’hui';
  if (jours === 1) return 'Reçu hier';
  return `Reçu il y a ${jours} jours`;
}

export function VisaPanel({ dossier }) {
  const typeActe = dossier.sous_type_libelle || dossier.type_acte;
  const exceptions = dossier.exception_validation
    || dossier.exception_autorisee_par
    || dossier.date_exception;

  return (
    <div className="space-y-5">
      <Card
        title="Dossier VISA"
        subtitle="Référence, acte, réception et parties"
        actions={
          <Badge className="border-primary-200 bg-primary-50 text-primary-700">
            <Stamp className="mr-1 h-3.5 w-3.5" />
            {dossier.reference_visa || dossier.numero}
          </Badge>
        }
      >
        <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          <dl>
            <Ligne label="Référence VISA" value={dossier.reference_visa} className="font-semibold" />
            <Ligne label="N° de dossier" value={dossier.numero} />
            <Ligne label="Type d’acte" value={typeActe} />
            <Ligne label="Code du type d’acte" value={dossier.type_acte} />
            <Ligne label="Année de référence" value={dossier.annee_reference} />
          </dl>
          <dl>
            <Ligne label="Date de réception" value={formatDateString(dossier.date_reception)} />
            <Ligne
              label="Heure de réception"
              value={dossier.date_heure_reception ? formatDateTime(dossier.date_heure_reception) : null}
            />
            <Ligne label="Origine / présentateur" value={dossier.origine_presentateur} />
            <Ligne label="Comptable présentateur" value={dossier.comptable_presentateur} />
            <Ligne label="Division VISA" value={dossier.division_nom} />
          </dl>
          <dl>
            <Ligne label="Vérificateur" value={dossier.verificateur_nom
              ? `${dossier.verificateur_prenom || ''} ${dossier.verificateur_nom}`.trim()
              : null} />
            <Ligne label="Agent responsable" value={dossier.agent_nom
              ? `${dossier.agent_prenom || ''} ${dossier.agent_nom}`.trim()
              : null} />
            <Ligne label="Bénéficiaire" value={dossier.beneficiaire} />
            <Ligne label="Organisme" value={dossier.organisme} />
            <Ligne
              label="Ancienneté"
              value={anciennete(dossier.age_jours)}
              className="inline-flex items-center gap-1 text-slate-600"
            />
          </dl>
        </div>
      </Card>

      {/* Signature : qui a signé, quand, et sous quelle référence. La signature
          du Chef de Service est distincte de la vérification de la division ;
          les deux traces cohabitent dans la fiche sans se confondre. */}
      <Card
        title="Signature"
        subtitle="Signature du dossier — distincte de la vérification par la division"
        actions={
          dossier.date_signature ? (
            <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700">
              <PenLine className="mr-1 h-3.5 w-3.5" /> Signé
            </Badge>
          ) : (
            <Badge className="border-slate-200 bg-slate-50 text-slate-600">Non signé</Badge>
          )
        }
      >
        {dossier.date_signature ? (
          <dl className="grid gap-x-8 sm:grid-cols-3">
            <Ligne label="Signataire" value={dossier.signataire_username} />
            <Ligne label="Date de signature" value={formatDateTime(dossier.date_signature)} />
            <Ligne label="Référence de signature" value={dossier.reference_signature} />
          </dl>
        ) : (
          <p className="rounded-md bg-slate-50 px-3 py-3 text-sm text-slate-500">
            Le dossier n’a pas encore été signé. La signature relève du Chef de
            Service : aucun autre profil ne peut la produire à sa place.
          </p>
        )}
      </Card>

      {/* Exception à la validation : elle doit rester lisible tant qu'elle
          s'applique. Une dérogation non visible n'est plus une dérogation
          contrôlée. */}
      {exceptions && (
        <Card
          title="Exception à la validation"
          subtitle="Dérogation motivée et tracée"
          actions={
            <Badge className="border-amber-200 bg-amber-50 text-amber-700">
              <ShieldAlert className="mr-1 h-3.5 w-3.5" /> Dérogation
            </Badge>
          }
        >
          <dl className="grid gap-x-8 sm:grid-cols-3">
            <Ligne label="Motif de la dérogation" value={dossier.exception_validation} />
            <Ligne
              label="Date de la dérogation"
              value={dossier.date_exception ? formatDateTime(dossier.date_exception) : null}
            />
            <Ligne
              label="Statut"
              value={dossier.statut_libelle || STATUT_LABELS[dossier.statut_code]}
            />
          </dl>
        </Card>
      )}

      {/* Complément demandé : le motif dit à l'intéressé ce qu'il doit
          rapporter. */}
      {dossier.motif_complement && (
        <Card
          title="Complément demandé"
          subtitle="Motif transmis au demandeur"
          actions={
            <Badge className="border-orange-200 bg-orange-50 text-orange-700">
              <FileWarning className="mr-1 h-3.5 w-3.5" /> En attente
            </Badge>
          }
        >
          <p className="rounded-md bg-orange-50 px-3 py-2 text-sm text-orange-800">
            {dossier.motif_complement}
          </p>
        </Card>
      )}

      {/* Dépouillement : les quatre états des pièces. Le composant gère
          lui-même son chargement et ses erreurs. */}
      <Card
        title="Contrôle des pièces"
        subtitle="Présente, manquante, illisible ou à corriger"
      >
        <DepouillementChecklist dossierId={dossier.id} />
      </Card>

      {dossier.observation && (
        <Card title="Observation">
          <p className="flex items-start gap-2 text-sm text-slate-600">
            <Hourglass className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            {dossier.observation}
          </p>
        </Card>
      )}
    </div>
  );
}

export default VisaPanel;

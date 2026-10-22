import { describe, it, expect } from 'vitest';
import {
  ORDRE_CIRCUIT,
  TRIS_DOSSIERS,
  TRIS_BOITE,
  rangStatut,
  grouperParStatut,
} from './triage.js';

/**
 * Tests du triage des dossiers — tris proposés et regroupement par statut.
 *
 * Le triage sert à retrouver vite le dossier à traiter, et à voir d'un coup
 * d'œil où en est le service. Ces tests verrouillent deux choses : l'ordre du
 * circuit (celui que le tableau de bord affiche) et le fait qu'un statut
 * inconnu ne fait jamais perdre de dossier.
 */

/** Dossier minimal : seuls le statut et l'identifiant comptent ici. */
const dossier = (id, statut_code) => ({ id, statut_code });

describe('Triage — ordre du circuit', () => {
  it('place les statuts dans l’ordre du workflow', () => {
    expect(ORDRE_CIRCUIT.indexOf('RECU')).toBeLessThan(ORDRE_CIRCUIT.indexOf('EN_TRAITEMENT'));
    expect(ORDRE_CIRCUIT.indexOf('EN_TRAITEMENT')).toBeLessThan(ORDRE_CIRCUIT.indexOf('VALIDE'));
    expect(ORDRE_CIRCUIT.indexOf('VALIDE')).toBeLessThan(ORDRE_CIRCUIT.indexOf('ARCHIVE'));
  });

  it('classe un statut inconnu après les statuts du circuit', () => {
    expect(rangStatut('ARCHIVE')).toBeLessThan(rangStatut('INCONNU'));
    expect(rangStatut('BROUILLON')).toBe(0);
  });
});

describe('Triage — regroupement par statut', () => {
  it('regroupe les dossiers par statut', () => {
    const groupes = grouperParStatut([
      dossier(1, 'VALIDE'),
      dossier(2, 'RECU'),
      dossier(3, 'VALIDE'),
    ]);
    expect(groupes).toHaveLength(2);
    const valide = groupes.find((g) => g.code === 'VALIDE');
    expect(valide.total).toBe(2);
    expect(valide.dossiers.map((d) => d.id)).toEqual([1, 3]);
  });

  it('classe les groupes dans l’ordre du circuit, pas dans l’ordre d’arrivée', () => {
    const groupes = grouperParStatut([
      dossier(1, 'ARCHIVE'),
      dossier(2, 'RECU'),
      dossier(3, 'EN_TRAITEMENT'),
    ]);
    expect(groupes.map((g) => g.code)).toEqual(['RECU', 'EN_TRAITEMENT', 'ARCHIVE']);
  });

  it('donne à chaque groupe son libellé lisible', () => {
    const [groupe] = grouperParStatut([dossier(1, 'EN_ATTENTE_COMPLEMENT')]);
    expect(groupe.label).toBe('En attente de complément');
  });

  it('ne perd aucun dossier, même quand le statut est inconnu', () => {
    const groupes = grouperParStatut([
      dossier(1, 'RECU'),
      dossier(2, 'INCONNU'),
    ]);
    const total = groupes.reduce((somme, g) => somme + g.total, 0);
    expect(total).toBe(2);
    expect(groupes.some((g) => g.code === 'INCONNU')).toBe(true);
  });

  it('ne produit aucune section vide', () => {
    const groupes = grouperParStatut([dossier(1, 'RECU')]);
    expect(groupes).toHaveLength(1);
    expect(groupes.every((g) => g.total > 0)).toBe(true);
  });

  it('renvoie une liste vide quand il n’y a aucun dossier', () => {
    expect(grouperParStatut([])).toEqual([]);
  });
});

describe('Triage — tris proposés', () => {
  it('propose un tri par statut du circuit', () => {
    expect(TRIS_DOSSIERS.some((t) => t.value === 'statut')).toBe(true);
  });

  it('propose un tri par priorité, par type et par demandeur', () => {
    const valeurs = TRIS_DOSSIERS.map((t) => t.value);
    expect(valeurs).toContain('priorite');
    expect(valeurs).toContain('type');
    expect(valeurs).toContain('demandeur');
  });

  it('donne à chaque tri un libellé lisible', () => {
    expect(TRIS_DOSSIERS.every((t) => typeof t.label === 'string' && t.label.length > 0)).toBe(true);
    expect(TRIS_BOITE.every((t) => typeof t.label === 'string' && t.label.length > 0)).toBe(true);
  });

  it('ne propose pas à la boîte de travail un tri sur les signalements', () => {
    // La boîte de travail ne connaît pas les signalements : proposer ce tri
    // afficherait une file qui ne change pas.
    expect(TRIS_BOITE.some((t) => t.value === 'signalement')).toBe(false);
    expect(TRIS_DOSSIERS.some((t) => t.value === 'signalement')).toBe(true);
  });
});

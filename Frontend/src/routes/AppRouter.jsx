import { Routes, Route, Navigate } from 'react-router-dom';

import { PrivateRoute } from './PrivateRoute.jsx';
import { RoleRoute } from './RoleRoute.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';

import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.jsx';

import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { BoiteTravailPage } from '../pages/dashboard/BoiteTravailPage.jsx';
import { DossierListPage } from '../pages/dossiers/DossierListPage.jsx';
import { DossierCreatePage } from '../pages/dossiers/DossierCreatePage.jsx';
import { DossierDetailPage } from '../pages/dossiers/DossierDetailPage.jsx';
import { DossierEditPage } from '../pages/dossiers/DossierEditPage.jsx';
import { DossierWorkflowPage } from '../pages/dossiers/DossierWorkflowPage.jsx';

import { CourrierListPage } from '../pages/courriers/CourrierListPage.jsx';
import { CourrierCreatePage } from '../pages/courriers/CourrierCreatePage.jsx';
import { CourrierDetailPage } from '../pages/courriers/CourrierDetailPage.jsx';

import { NotificationsPage } from '../pages/notifications/NotificationsPage.jsx';
import { HistoriquePage } from '../pages/historique/HistoriquePage.jsx';
import { ArchivesPage } from '../pages/archives/ArchivesPage.jsx';
import { StatistiquesPage } from '../pages/statistiques/StatistiquesPage.jsx';
import { PerformancePage } from '../pages/performance/PerformancePage.jsx';
import { RapportsPage } from '../pages/rapports/RapportsPage.jsx';
import { ProfilePage } from '../pages/profile/ProfilePage.jsx';

import { PersonnelPage } from '../pages/personnel/PersonnelPage.jsx';
import { BordereauPage } from '../pages/bordereau/BordereauPage.jsx';
import { RolesAdminPage } from '../pages/administration/RolesAdminPage.jsx';
import { SettingsPage } from '../pages/administration/SettingsPage.jsx';
import { BackupPage } from '../pages/administration/BackupPage.jsx';
import { ReinitialisationsPage } from '../pages/administration/ReinitialisationsPage.jsx';
import { ImmatriculationsPage } from '../pages/coordination/ImmatriculationsPage.jsx';
import { ReferentielPage } from '../pages/referentiel/ReferentielPage.jsx';

import { DivisionListPage } from '../pages/divisions/DivisionListPage.jsx';
import { DivisionDossiersRoute } from './divisionGuard.jsx';
import { DivisionDetailPage } from '../pages/divisions/DivisionDetailPage.jsx';
import { DivisionDashboardPage } from '../pages/divisions/DivisionDashboardPage.jsx';

import { TerritoirePage } from '../pages/territoire/TerritoirePage.jsx';
import { BilanPage } from '../pages/referentiel/BilanPage.jsx';

import { NotFoundPage } from '../pages/errors/NotFoundPage.jsx';
import { ForbiddenPage } from '../pages/errors/ForbiddenPage.jsx';
import { ServerErrorPage } from '../pages/errors/ServerErrorPage.jsx';

import { ROLES } from '../config/constants.js';

/**
 * Arbre de routes de l'application.
 *  - routes publiques (auth)
 *  - routes protégées (PrivateRoute) avec gabarit AppLayout
 *  - routes restreintes par rôle (RoleRoute)
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
      <Route path="/mot-de-passe-oublie/reset" element={<ResetPasswordPage />} />

      {/* Protégé */}
      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          {/* Boîte de travail : ce qui attend une action de l'utilisateur.
              Ouverte à tout profil — le serveur la restreint déjà au
              périmètre de chacun. */}
          <Route path="/boite-travail" element={<BoiteTravailPage />} />

          {/* Dossiers */}
          <Route path="/dossiers" element={<DossierListPage />} />
          {/* Vérification des pièces : liste des dossiers incomplets (pièces manquantes) */}
          <Route
            path="/verification-pieces"
            element={
              <RoleRoute permissions={['create_dossier', 'edit_dossier']}>
                <DossierListPage initialGroupe="INCOMPLETS" />
              </RoleRoute>
            }
          />
          {/* Dossiers d'une division : n'affiche que le type qui la concerne,
              et redirige vers son propre périmètre si ce n'est pas la sienne. */}
          <Route
            path="/divisions/:code/dossiers"
            element={<DivisionDossiersRoute />}
          />
          <Route
            path="/dossiers/nouveau"
            element={
              <RoleRoute permissions={['create_dossier']}>
                <DossierCreatePage />
              </RoleRoute>
            }
          />
          <Route path="/dossiers/:id" element={<DossierDetailPage />} />
          <Route
            path="/dossiers/:id/modifier"
            element={
              <RoleRoute permissions={['edit_dossier']}>
                <DossierEditPage />
              </RoleRoute>
            }
          />
          <Route path="/dossiers/:id/workflow" element={<DossierWorkflowPage />} />

          {/* Courriers : Admin, Chef Service, Chef BAAF, Secrétaire (§14.1) */}
          <Route
            path="/courriers"
            element={
              <RoleRoute permissions={['manage_courriers']}>
                <CourrierListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/courriers/nouveau"
            element={
              <RoleRoute permissions={['manage_courriers']}>
                <CourrierCreatePage />
              </RoleRoute>
            }
          />
          <Route
            path="/courriers/:id"
            element={
              <RoleRoute permissions={['manage_courriers']}>
                <CourrierDetailPage />
              </RoleRoute>
            }
          />

          {/* Bordereaux de transmission : Secrétaire, Admin (create_dossier) */}
          <Route
            path="/bordereaux"
            element={
              <RoleRoute permissions={['create_dossier', 'manage_courriers', 'view_all_dossiers']}>
                <BordereauPage />
              </RoleRoute>
            }
          />

          {/* Suivi */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route
            path="/historique"
            element={
              <RoleRoute permissions={['view_journal', 'view_audit']}>
                <HistoriquePage />
              </RoleRoute>
            }
          />
          <Route
            path="/archives"
            element={
              <RoleRoute permissions={['view_archives']}>
                <ArchivesPage />
              </RoleRoute>
            }
          />
          {/* Statistiques du service : répartition, évolution et indicateurs. */}
          <Route
            path="/statistiques"
            element={
              <RoleRoute permissions={['view_stats']}>
                <StatistiquesPage />
              </RoleRoute>
            }
          />
          {/* Performance : délais de traitement et dossiers en retard.
              Le serveur applique le périmètre de l'utilisateur — un chef de
              division n'y voit que sa division, un agent que ses dossiers. */}
          <Route
            path="/performance"
            element={
              <RoleRoute permissions={['view_stats']}>
                <PerformancePage />
              </RoleRoute>
            }
          />
          <Route
            path="/rapports"
            element={
              <RoleRoute permissions={['view_stats', 'consolidate_reports', 'export_data']}>
                <RapportsPage />
              </RoleRoute>
            }
          />
          {/* Territoire : antennes, districts et rattachement des dossiers.
              Le périmètre géographique du service était calculé côté serveur
              mais invisible dans l'interface. */}
          <Route
            path="/territoire"
            element={
              <RoleRoute permissions={['view_stats']}>
                <TerritoirePage />
              </RoleRoute>
            }
          />
          {/* Bilan de conformité : l'état des exigences du cahier. Ce
              registre existait dans la base sans être visible nulle part ;
              ni l'administrateur ni le chef BAAF ne pouvaient répondre à
              « où en est la plateforme ? ». */}
          <Route
            path="/conformite"
            element={
              <RoleRoute permissions={['consolidate_reports']}>
                <BilanPage />
              </RoleRoute>
            }
          />
          <Route path="/profil" element={<ProfilePage />} />

          {/* Administration */}
          {/* « Personnel » remplace les anciens écrans « Agents » et
              « Utilisateurs » : les deux décrivaient les mêmes personnes. */}
          <Route path="/administration" element={<Navigate to="/administration/personnel" replace />} />
          <Route
            path="/administration/personnel"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <PersonnelPage />
              </RoleRoute>
            }
          />
          {/* Anciens chemins conservés : un signet ou un lien partagé continue
              d'arriver au bon écran au lieu d'une page introuvable. */}
          <Route
            path="/administration/utilisateurs"
            element={<Navigate to="/administration/personnel" replace />}
          />
          <Route path="/agents" element={<Navigate to="/administration/personnel" replace />} />
          <Route path="/agents/nouveau" element={<Navigate to="/administration/personnel" replace />} />
          <Route path="/agents/:id" element={<Navigate to="/administration/personnel" replace />} />
          <Route
            path="/administration/roles"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <RolesAdminPage />
              </RoleRoute>
            }
          />
          <Route
            path="/administration/audit"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <HistoriquePage />
              </RoleRoute>
            }
          />
          <Route
            path="/administration/parametres"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <SettingsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/administration/sauvegarde"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <BackupPage />
              </RoleRoute>
            }
          />
          {/* Immatriculations : la mission de la Coordination (§ 11.2).
              Elle n'a aucun pouvoir sur les dossiers : elle enregistre des
              actes administratifs, elle ne décide de rien. */}
          <Route
            path="/coordination/immatriculations"
            element={
              <RoleRoute permissions={['gerer_immatriculations']}>
                <ImmatriculationsPage />
              </RoleRoute>
            }
          />
          {/* Demandes de réinitialisation de mot de passe : l'administrateur
              vérifie l'identité et délivre un code à usage unique. */}
          <Route
            path="/administration/reinitialisations"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <ReinitialisationsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/administration/referentiel"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <ReferentielPage />
              </RoleRoute>
            }
          />
          {/* Divisions */}
          <Route
            path="/divisions"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <DivisionListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/divisions/:id"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <DivisionDetailPage />
              </RoleRoute>
            }
          />
          <Route
            path="/divisions/:id/dashboard"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <DivisionDashboardPage />
              </RoleRoute>
            }
          />

          {/* Erreurs */}
          <Route path="/403" element={<ForbiddenPage />} />
          <Route path="/500" element={<ServerErrorPage />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
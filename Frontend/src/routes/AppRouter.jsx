import { Routes, Route, Navigate } from 'react-router-dom';

import { PrivateRoute } from './PrivateRoute.jsx';
import { RoleRoute } from './RoleRoute.jsx';
import { AppLayout } from '../components/layout/AppLayout.jsx';

import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { ForgotPasswordPage } from '../pages/auth/ForgotPasswordPage.jsx';
import { ResetPasswordPage } from '../pages/auth/ResetPasswordPage.jsx';

import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';

import { DossierListPage } from '../pages/dossiers/DossierListPage.jsx';
import { DossierCreatePage } from '../pages/dossiers/DossierCreatePage.jsx';
import { DossierDetailPage } from '../pages/dossiers/DossierDetailPage.jsx';
import { DossierEditPage } from '../pages/dossiers/DossierEditPage.jsx';
import { DossierWorkflowPage } from '../pages/dossiers/DossierWorkflowPage.jsx';

import { DocumentListPage } from '../pages/documents/DocumentListPage.jsx';
import { DocumentUploadPage } from '../pages/documents/DocumentUploadPage.jsx';

import { CourrierListPage } from '../pages/courriers/CourrierListPage.jsx';
import { CourrierCreatePage } from '../pages/courriers/CourrierCreatePage.jsx';
import { CourrierDetailPage } from '../pages/courriers/CourrierDetailPage.jsx';

import { NotificationsPage } from '../pages/notifications/NotificationsPage.jsx';
import { HistoriquePage } from '../pages/historique/HistoriquePage.jsx';
import { ArchivesPage } from '../pages/archives/ArchivesPage.jsx';
import { StatistiquesPage } from '../pages/statistiques/StatistiquesPage.jsx';
import { RapportsPage } from '../pages/rapports/RapportsPage.jsx';
import { ProfilePage } from '../pages/profile/ProfilePage.jsx';

import { UsersAdminPage } from '../pages/administration/UsersAdminPage.jsx';
import { RolesAdminPage } from '../pages/administration/RolesAdminPage.jsx';
import { SettingsPage } from '../pages/administration/SettingsPage.jsx';

import { AgentListPage } from '../pages/agents/AgentListPage.jsx';
import { AgentCreatePage } from '../pages/agents/AgentCreatePage.jsx';
import { AgentDetailPage } from '../pages/agents/AgentDetailPage.jsx';

import { DivisionListPage } from '../pages/divisions/DivisionListPage.jsx';
import { DivisionDossiersRoute } from './divisionGuard.jsx';
import { DivisionDetailPage } from '../pages/divisions/DivisionDetailPage.jsx';
import { DivisionDashboardPage } from '../pages/divisions/DivisionDashboardPage.jsx';

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

          {/* Dossiers */}
          <Route path="/dossiers" element={<DossierListPage />} />
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

          {/* Documents */}
          <Route path="/documents" element={<DocumentListPage />} />
          <Route path="/documents/upload" element={<DocumentUploadPage />} />

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

          {/* Suivi */}
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/historique" element={<HistoriquePage />} />
          <Route
            path="/archives"
            element={
              <RoleRoute permissions={['view_archives']}>
                <ArchivesPage />
              </RoleRoute>
            }
          />
          <Route
            path="/statistiques"
            element={
              <RoleRoute permissions={['view_stats']}>
                <StatistiquesPage />
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
          <Route path="/profil" element={<ProfilePage />} />

          {/* Administration */}
          <Route path="/administration" element={<Navigate to="/administration/utilisateurs" replace />} />
          <Route
            path="/administration/utilisateurs"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <UsersAdminPage />
              </RoleRoute>
            }
          />
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

          {/* Agents & Divisions */}
          <Route
            path="/agents"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <AgentListPage />
              </RoleRoute>
            }
          />
          <Route
            path="/agents/nouveau"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <AgentCreatePage />
              </RoleRoute>
            }
          />
          <Route
            path="/agents/:id"
            element={
              <RoleRoute roles={[ROLES.ADMIN]}>
                <AgentDetailPage />
              </RoleRoute>
            }
          />
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
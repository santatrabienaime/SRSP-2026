import { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import { authService } from '../services/authService.js';
import { permissionService } from '../services/permissionService.js';
import { landingPathFor } from '../utils/landing.js';
import { setAuthToken } from '../services/apiClient.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // La session n'est **pas** persistée : elle vit uniquement en mémoire.
  // Un rafraîchissement du navigateur efface donc le jeton et ramène à la
  // saisie du mot de passe — ce qui évite qu'un autre utilisateur hérite de
  // l'interface du précédent.
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const persist = useCallback((t, u) => {
    // Synchronisation immédiate avec le client HTTP, pour que les appels
    // suivants (me, permissions) disposent du jeton sans attendre un rendu.
    setAuthToken(t);
    setToken(t);
    setUser(u);
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const perms = await permissionService.my();
      setPermissions(
        Array.isArray(perms)
          ? perms.map((p) => (typeof p === 'string' ? p : p?.nom)).filter(Boolean)
          : []
      );
    } catch {
      setPermissions([]);
    }
  }, []);

  const login = useCallback(
    async (identifiant, password) => {
      const { user: u, token: t } = await authService.login(identifiant, password);
      persist(t, u);
      let profil = u;
      try {
        profil = await authService.me();
        persist(t, profil);
      } catch {
        /* on conserve le profil minimal */
      }
      await loadPermissions();
      setLoading(false);
      return profil;
    },
    [persist, loadPermissions]
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* silencieux : on déconnecte localement quoi qu'il arrive */
    }
    persist(null, null);
    setPermissions([]);
    setLoading(false);
  }, [persist]);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const me = await authService.me();
      setUser(me);
      await loadPermissions();
    } catch {
      /* inchangé */
    }
  }, [token, loadPermissions]);

  const hasPermission = useCallback(
    (perm) => permissions.includes(perm),
    [permissions]
  );

  const hasAnyPermission = useCallback(
    (perms) => perms.some((p) => permissions.includes(p)),
    [permissions]
  );

  const isRole = useCallback(
    (...roles) => Boolean(user?.role_nom && roles.includes(user.role_nom)),
    [user]
  );

  const value = useMemo(
    () => ({
      token,
      user,
      permissions,
      loading,
      initializing,
      login,
      logout,
      refreshUser,
      hasPermission,
      hasAnyPermission,
      isRole,
    }),
    [token, user, permissions, loading, initializing, login, logout, refreshUser, hasPermission, hasAnyPermission, isRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
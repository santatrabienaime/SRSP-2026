import { createContext, useState, useCallback, useEffect, useMemo } from 'react';
import { authService } from '../services/authService.js';
import { permissionService } from '../services/permissionService.js';

export const AuthContext = createContext(null);

const TOKEN_KEY = 'srsp_token';
const USER_KEY = 'srsp_user';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  });
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [initializing, setInitializing] = useState(Boolean(token));

  const persist = useCallback((t, u) => {
    setToken(t);
    setUser(u);
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      const perms = await permissionService.my();
      // /permissions/me renvoie un tableau de noms (chaînes). On normalise
      // pour accepter aussi des objets { nom } sans casser le gating hasPermission.
      setPermissions(
        Array.isArray(perms)
          ? perms.map((p) => (typeof p === 'string' ? p : p?.nom)).filter(Boolean)
          : []
      );
    } catch {
      setPermissions([]);
    }
  }, []);

  // Vérification initiale du token stocké
  useEffect(() => {
    if (!token) {
      setInitializing(false);
      return;
    }
    let active = true;
    authService
      .me()
      .then(async (me) => {
        if (!active) return;
        setUser(me);
        localStorage.setItem(USER_KEY, JSON.stringify(me));
        await loadPermissions();
      })
      .catch(() => {
        if (active) {
          persist(null, null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          setInitializing(false);
        }
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (identifiant, password) => {
      const { user: u, token: t } = await authService.login(identifiant, password);
      persist(t, u);
      await loadPermissions();
      setLoading(false);
      return u;
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
      localStorage.setItem(USER_KEY, JSON.stringify(me));
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
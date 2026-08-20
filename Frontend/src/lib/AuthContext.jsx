import { createContext, useContext, useEffect, useState } from 'react';
import { api } from './api';

const AuthContext = createContext(null);
const SESSION_KEY = 'coco_erp_v1:session';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  async function login(username, password) {
    try {
      const res = await api.login(username, password);
      if (res.success && res.user) {
        if (!res.user.active) {
            return { ok: false, error: 'This account has been deactivated. Contact an admin.' };
        }
        
        const employee = res.user.employee;
        const session = {
            id: res.user.id,
            username: res.user.username,
            role: res.user.role,
            employeeId: res.user.employeeId,
            name: employee ? `${employee.firstName} ${employee.lastName}` : res.user.username,
            position: employee?.position || '',
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        setUser(session);
        return { ok: true };
      }
      return { ok: false, error: 'Invalid username or password.' };
    } catch (err) {
      return { ok: false, error: 'Invalid username or password or server error.' };
    }
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

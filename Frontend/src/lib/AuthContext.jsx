import { createContext, useContext, useEffect, useState } from 'react';
import { db } from './storage';

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

  function login(username, password) {
    const users = db.getAll('users');
    const match = users.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!match) return { ok: false, error: 'Invalid username or password.' };
    if (!match.active) return { ok: false, error: 'This account has been deactivated. Contact an admin.' };

    const employee = db.get('employees', match.employeeId);
    const session = {
      id: match.id,
      username: match.username,
      role: match.role,
      employeeId: match.employeeId,
      name: employee ? `${employee.firstName} ${employee.lastName}` : match.username,
      position: employee?.position || '',
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    setUser(session);
    return { ok: true };
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

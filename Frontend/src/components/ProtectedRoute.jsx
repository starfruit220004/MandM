import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import CoconutMark from './CoconutMark';

export function ProtectedRoute({ children, adminOnly = false }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <CoconutMark size={44} spin />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}

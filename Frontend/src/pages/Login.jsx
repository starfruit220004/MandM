import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ArrowRight } from 'lucide-react';
import CoconutMark from '../components/CoconutMark';
import { useAuth } from '../lib/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = login(username, password);
      setLoading(false);
      if (!result.ok) {
        setError(result.error);
      } else {
        navigate('/');
      }
    }, 350);
  }

  function fillDemo(u, p) {
    setUsername(u);
    setPassword(p);
    setError('');
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-cream-100">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-bark-900 p-10 text-cream-50 lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-husk-600/30" />
        <div className="pointer-events-none absolute -right-10 top-32 h-56 w-56 rounded-full border border-husk-600/20" />
        <div className="pointer-events-none absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full border border-palm-600/20" />

        <div className="flex items-center gap-3">
          <CoconutMark size={38} />
          <div>
            <p className="font-display text-xl font-semibold">CocoTrade</p>
            <p className="text-xs tracking-wide text-copra-400">Business Management System</p>
          </div>
        </div>

        <div className="relative">
          <p className="font-display text-3xl font-medium leading-tight text-cream-50">
            From husk to harvest,<br /> every transaction tracked.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-cream-100/70">
            Manage inventory, purchases, sales, deliveries, and your people — all
            in one place, built for the rhythm of the coconut trade.
          </p>
        </div>

        <div className="relative flex gap-6 text-xs text-cream-100/50">
          <span>Inventory</span>
          <span>Purchases</span>
          <span>Sales</span>
          <span>Deliveries</span>
          <span>Reports</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <CoconutMark size={34} />
            <div>
              <p className="font-display text-lg font-semibold text-bark-900">CocoTrade</p>
              <p className="text-[11px] tracking-wide text-copra-600">Business Management System</p>
            </div>
          </div>

          <h1 className="font-display text-2xl font-semibold text-bark-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Sign in to manage today's trading operations.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Username</label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full rounded-lg border border-husk-200 bg-cream-50 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-palm-500 focus:ring-2 focus:ring-palm-400/30"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-900">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-husk-200 bg-cream-50 py-2.5 pl-9 pr-9 text-sm outline-none focus:border-palm-500 focus:ring-2 focus:ring-palm-400/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-rust-100 px-3 py-2 text-xs font-medium text-rust-600">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-palm-700 py-2.5 text-sm font-semibold text-cream-50 hover:bg-palm-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign in'} {!loading && <ArrowRight size={15} />}
            </button>
          </form>

          <div className="mt-6 rounded-lg border border-husk-200 bg-copra-100 p-3.5 text-xs text-ink-700">
            <p className="mb-2 font-semibold text-ink-900">Demo accounts</p>
            <button
              onClick={() => fillDemo('admin', 'admin123')}
              className="mb-1 block w-full text-left hover:text-palm-700"
            >
              <span className="font-medium">Admin</span> — admin / admin123
            </button>
            <button onClick={() => fillDemo('renato', 'employee123')} className="block w-full text-left hover:text-palm-700">
              <span className="font-medium">Employee</span> — renato / employee123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

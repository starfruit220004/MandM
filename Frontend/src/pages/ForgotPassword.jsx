import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import CoconutMark from '../components/CoconutMark';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const [username, setUsername] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setStatus('');
    
    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }
    
    setLoading(true);
    
    try {
      // Assuming we have an endpoint for this
      const res = await fetch('http://localhost:3000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setStatus('If the username exists, a password reset link has been sent to the associated email.');
      } else {
        setError(data.error || 'Failed to process request.');
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-slate-500/30" />
        <div className="pointer-events-none absolute -right-10 top-32 h-56 w-56 rounded-full border border-slate-500/20" />
        <div className="pointer-events-none absolute bottom-[-6rem] left-[-4rem] h-72 w-72 rounded-full border border-blue-600/20" />

        <div className="flex items-center gap-3">
          <CoconutMark size={38} />
          <div>
            <p className="font-display text-xl font-semibold">CocoTrade</p>
            <p className="text-xs tracking-wide text-sky-400">Business Management System</p>
          </div>
        </div>

        <div className="relative">
          <p className="font-display text-3xl font-medium leading-tight text-white">
            Secure access to your <br /> trading operations.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-50/70">
            Recover your account and get back to managing your coconut trade.
          </p>
        </div>

        <div className="relative flex gap-6 text-xs text-slate-50/50">
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
              <p className="font-display text-lg font-semibold text-slate-900">CocoTrade</p>
              <p className="text-[11px] tracking-wide text-sky-600">Business Management System</p>
            </div>
          </div>

          <Link to="/mamik" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ArrowLeft size={16} /> Back to login
          </Link>

          <h1 className="font-display text-2xl font-semibold text-slate-900">Forgot Password</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your username and we'll send a link to reset your password.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-900">Username</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                <input
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. admin"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-400/30"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-100 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
            )}
            
            {status && (
              <p className="rounded-lg bg-green-100 px-3 py-2 text-xs font-medium text-green-700">{status}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white hover:bg-blue-600 transition-colors disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send Reset Link'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

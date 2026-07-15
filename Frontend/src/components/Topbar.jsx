import { useState } from 'react';
import { Menu, LogOut, ChevronDown, UserCircle2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Topbar({ onMenu }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-3 lg:px-6">
      <button onClick={onMenu} className="rounded-lg p-2 text-slate-700 hover:bg-slate-200/50 lg:hidden">
        <Menu size={20} />
      </button>

      <div className="flex-1" />

      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2.5 hover:bg-slate-200/30 transition-colors"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-700 text-xs font-semibold text-white">
            {user?.name?.charAt(0) || 'U'}
          </span>
          <span className="hidden text-left sm:block leading-tight">
            <span className="block text-sm font-medium text-slate-900">{user?.name}</span>
            <span className="block text-[11px] capitalize text-slate-500">{user?.role}</span>
          </span>
          <ChevronDown size={14} className="text-slate-500" />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg animate-fade-in-up">
              <div className="border-b border-slate-200 px-3.5 py-3">
                <p className="flex items-center gap-2 text-sm font-medium text-slate-900">
                  <UserCircle2 size={16} className="text-blue-700" /> {user?.name}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{user?.position || 'Employee account'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-100 transition-colors"
              >
                <LogOut size={15} /> Log out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

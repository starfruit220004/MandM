import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Receipt,
  Truck,
  Users,
  UserSquare2,
  UsersRound,
  FileBarChart2,
  X,
} from 'lucide-react';
import CoconutMark from './CoconutMark';
import { useAuth } from '../lib/AuthContext';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'employee'] },
  { to: '/inventory', label: 'Inventory', icon: Boxes, roles: ['admin', 'employee'] },
  { to: '/purchases', label: 'Purchases', icon: ShoppingCart, roles: ['admin', 'employee'] },
  { to: '/sales', label: 'Sales', icon: Receipt, roles: ['admin', 'employee'] },
  { to: '/deliveries', label: 'Deliveries', icon: Truck, roles: ['admin', 'employee'] },
  { to: '/suppliers', label: 'Suppliers', icon: UserSquare2, roles: ['admin', 'employee'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['admin', 'employee'] },
  { to: '/employees', label: 'Employees', icon: UsersRound, roles: ['admin'] },
  { to: '/reports', label: 'Reports', icon: FileBarChart2, roles: ['admin', 'employee'] },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const items = nav.filter((n) => n.roles.includes(user?.role));

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 shrink-0 bg-slate-900 text-slate-50 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700">
          <CoconutMark size={30} />
          <div className="leading-tight">
            <p className="font-display text-base font-semibold text-white">CocoTrade</p>
            <p className="text-[11px] text-sky-400 tracking-wide">Business Manager</p>
          </div>
          <button onClick={onClose} className="ml-auto rounded-md p-1 text-slate-50/70 hover:text-white lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {items.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-slate-50/75 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-700 text-[11px] text-slate-50/50">
          © {new Date().getFullYear()} CocoTrade Systems
        </div>
      </aside>
    </>
  );
}

import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, LayoutDashboard, Calendar, Pill, LogOut } from 'lucide-react';

export default function PortalLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  const navItems = [
    { to: '/portal', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/portal/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/portal/prescriptions', icon: Pill, label: 'Prescriptions' },
  ];

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Top nav */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="font-display text-xl text-surface-900">Zealthy</span>
            <span className="badge-blue ml-2">Patient Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-surface-500 hidden sm:block">
              Hi, <span className="font-medium text-surface-700">{user?.name}</span>
            </span>
            <button onClick={handleLogout} className="btn-ghost text-surface-400 hover:text-red-500">
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Tab nav */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <nav className="flex gap-1 -mb-px">
            {navItems.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    isActive
                      ? 'border-brand-500 text-brand-600'
                      : 'border-transparent text-surface-400 hover:text-surface-600'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

import { NavLink, Outlet } from 'react-router-dom';
import { Heart, Users, Shield } from 'lucide-react';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-surface-50">
      <header className="bg-surface-900 text-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Heart size={16} className="text-white" />
            </div>
            <span className="font-display text-xl">Zealthy</span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white/80 ml-2">
              <Shield size={10} />
              EMR Admin
            </span>
          </div>

          <nav className="flex gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Users size={16} />
              Patients
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}

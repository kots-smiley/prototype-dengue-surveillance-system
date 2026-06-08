import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { APP_NAME, APP_LOCATION } from '../../configuration/constants';

interface NavItem {
  to: string;
  label: string;
  roles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT'] },
  { to: '/cases', label: 'Cases', roles: ['ADMIN', 'BHW', 'HOSPITAL_ENCODER'] },
  { to: '/reports', label: 'Risk Reports', roles: ['ADMIN', 'BHW', 'RESIDENT'] },
  { to: '/alerts', label: 'Alerts', roles: ['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT'] },
  { to: '/feedback', label: 'Feedback', roles: ['ADMIN', 'BHW'] },
  { to: '/analytics', label: 'Analytics', roles: ['ADMIN', 'BHW', 'HOSPITAL_ENCODER'] },
  { to: '/diseases', label: 'Diseases', roles: ['ADMIN'] },
  { to: '/barangays', label: 'Barangays', roles: ['ADMIN'] },
  { to: '/users', label: 'Users', roles: ['ADMIN'] },
  { to: '/exports', label: 'Exports', roles: ['ADMIN', 'BHW'] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="leading-tight text-xl font-bold text-primary-600">{APP_NAME}</h1>
              <p className="hidden text-xs text-slate-500 sm:block">{APP_LOCATION}</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 sm:inline">
                {user?.firstName} {user?.lastName} ({user?.role})
              </span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-2 overflow-x-auto py-3" aria-label="Primary navigation">
            {visibleItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6">
        <Outlet />
      </main>
    </div>
  );
}

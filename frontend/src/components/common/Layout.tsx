import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Droplets,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  Activity,
  MapPin,
  UserCog,
  Download,
  Sun,
  Moon,
  Menu,
  X,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { UserRole } from '../../types';
import { APP_NAME, APP_LOCATION } from '../../configuration/constants';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  roles: UserRole[];
}

const ALL: UserRole[] = ['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT', 'PHYSICIAN', 'NURSE', 'MIDWIFE'];
const CLINICAL: UserRole[] = ['ADMIN', 'PHYSICIAN', 'NURSE', 'MIDWIFE'];

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ALL },
  { to: '/patients', label: 'Patients', icon: Users, roles: CLINICAL },
  { to: '/cases', label: 'Cases', icon: ClipboardList, roles: ['ADMIN', 'BHW', 'HOSPITAL_ENCODER'] },
  { to: '/reports', label: 'Risk Reports', icon: Droplets, roles: ['ADMIN', 'BHW', 'RESIDENT'] },
  { to: '/alerts', label: 'Alerts', icon: AlertTriangle, roles: ['ADMIN', 'BHW', 'HOSPITAL_ENCODER', 'RESIDENT', 'PHYSICIAN', 'NURSE', 'MIDWIFE'] },
  { to: '/feedback', label: 'Feedback', icon: MessageSquare, roles: ['ADMIN', 'BHW'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['ADMIN', 'BHW', 'HOSPITAL_ENCODER'] },
  { to: '/diseases', label: 'Diseases', icon: Activity, roles: ['ADMIN'] },
  { to: '/barangays', label: 'Barangays', icon: MapPin, roles: ['ADMIN'] },
  { to: '/users', label: 'Users', icon: UserCog, roles: ['ADMIN'] },
  { to: '/exports', label: 'Exports', icon: Download, roles: ['ADMIN', 'BHW'] },
];

export function Layout() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(`${path}/`);

  const visibleItems = NAV_ITEMS.filter((item) => user && item.roles.includes(user.role));

  const SidebarContent = ({ showLabels }: { showLabels: boolean }) => (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4" aria-label="Primary navigation">
      {visibleItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => setMobileOpen(false)}
            className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? 'text-primary-700 dark:text-primary-300'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
            }`}
            title={showLabels ? undefined : item.label}
          >
            {active && (
              <motion.span
                layoutId="active-nav"
                className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-950/50"
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 h-5 w-5 shrink-0" />
            {showLabels && <span className="relative z-10 whitespace-nowrap">{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 84 : 256 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-slate-200 bg-white/95 backdrop-blur lg:flex dark:border-slate-800 dark:bg-slate-900/95"
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-4 dark:border-slate-800">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-soft">
            <Activity className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-primary-700 dark:text-primary-300">{APP_NAME}</p>
              <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">EMR + Surveillance</p>
            </div>
          )}
        </div>
        <SidebarContent showLabels={!collapsed} />
        <button
          onClick={() => setCollapsed((c) => !c)}
          className="m-3 flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <><PanelLeftClose className="h-4 w-4" /> Collapse</>}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white lg:hidden dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
                <p className="text-sm font-bold text-primary-700 dark:text-primary-300">{APP_NAME}</p>
                <button onClick={() => setMobileOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <SidebarContent showLabels />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main column */}
      <div className={`flex min-h-screen flex-col transition-[padding] duration-300 ${collapsed ? 'lg:pl-[84px]' : 'lg:pl-64'}`}>
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-900/80">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <p className="hidden text-xs text-slate-500 sm:block dark:text-slate-400">{APP_LOCATION}</p>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleTheme}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Toggle theme"
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </motion.span>
                </AnimatePresence>
              </button>

              <span className="hidden rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700 sm:inline dark:bg-slate-800 dark:text-slate-200">
                {user?.firstName} {user?.lastName} · {user?.role}
              </span>

              <button onClick={handleLogout} className="btn btn-secondary !min-h-10 !px-3">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 p-4 sm:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

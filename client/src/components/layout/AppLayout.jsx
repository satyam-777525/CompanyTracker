import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, Bookmark, RotateCcw, Trophy,
  Search, Settings, Shield, LogOut, Menu, X, Flame
} from 'lucide-react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/authSlice';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/revision', icon: RotateCcw, label: 'Revision' },
  { to: '/leaderboard', icon: Trophy, label: 'Leaderboard' },
];

const mobileNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/companies', icon: Building2, label: 'Companies' },
  { to: '/dashboard', icon: LayoutDashboard, label: 'Progress' },
  { to: '/bookmarks', icon: Bookmark, label: 'Bookmarks' },
  { to: '/profile', icon: Settings, label: 'Profile' },
];

export function Sidebar({ className }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={cn(
      'hidden lg:flex flex-col h-screen sticky top-0 border-r border-border bg-card/50 backdrop-blur-xl transition-all',
      collapsed ? 'w-16' : 'w-64',
      className
    )}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm">CT</div>
            <span className="font-bold text-lg">CompanyTracker</span>
          </Link>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-lg hover:bg-border/50">
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{label}</span>}
          </Link>
        ))}
        {user?.role === 'admin' && (
          <Link
            to="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted hover:text-foreground hover:bg-primary/10 transition-colors"
          >
            <Shield className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">Admin</span>}
          </Link>
        )}
      </nav>

      <div className="p-3 border-t border-border">
        {isAuthenticated && !collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <img src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="" className="w-8 h-8 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted flex items-center gap-1">
                <Flame className="w-3 h-3 text-warning" /> {user.currentStreak || 0} day streak
              </p>
            </div>
          </div>
        )}
        {isAuthenticated ? (
          <button
            onClick={() => dispatch(logout())}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted hover:text-danger hover:bg-danger/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            {!collapsed && <span className="text-sm">Logout</span>}
          </button>
        ) : !collapsed && (
          <Link to="/login" className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-primary hover:bg-primary/10 transition-colors">
            <span className="text-sm font-medium">Sign In</span>
          </Link>
        )}
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/90 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map(({ to, icon: Icon, label }) => (
          <Link key={label} to={to} className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted hover:text-primary transition-colors">
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

export function TopBar({ onSearch }) {
  const [query, setQuery] = useState('');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex items-center gap-4 px-4 lg:px-6 h-14">
        <Link to="/dashboard" className="lg:hidden flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xs">CT</div>
        </Link>
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            placeholder="Search questions, companies, tags..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="w-full h-9 pl-9 pr-4 rounded-lg bg-card border border-border text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>
    </header>
  );
}

export function AppLayout({ children, onSearch }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen pb-16 lg:pb-0">
        <TopBar onSearch={onSearch} />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
      <MobileNav />
    </div>
  );
}

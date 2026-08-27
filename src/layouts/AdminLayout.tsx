import { Outlet } from 'react-router-dom';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Star, Tag, LogOut, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BarChart3 } from 'lucide-react';
export default function AdminLayout() {
  const { signOut, profile } = useAuth();
  const navigate = useNavigate();

  const links = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Reports',path: '/admin/reports',icon: BarChart3,},
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Reviews', path: '/admin/reviews', icon: Star },
    { label: 'Categories', path: '/admin/categories', icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-64 bg-palm-deep text-bg fixed top-0 left-0 bottom-0 hidden lg:flex flex-col z-50">
        <div className="p-6 border-b border-bg/10">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center">
              <span className="text-white font-heading text-lg font-semibold">P</span>
            </div>
            <div className="leading-tight">
              <p className="font-heading font-semibold text-bg text-sm">Admin Panel</p>
              <p className="text-xs text-bg/60">{profile?.email}</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-bg/70 hover:bg-bg/10 hover:text-bg transition-colors text-sm font-medium"
            >
              <link.icon className="w-4 h-4" />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-bg/10 space-y-1">
          <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-bg/70 hover:bg-bg/10 hover:text-bg transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </Link>
          <button
            onClick={() => { signOut(); navigate('/'); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-bg/70 hover:bg-copper/20 hover:text-bg transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-palm-deep text-bg px-4 py-3 flex items-center justify-between">
        <Link to="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
            <span className="text-white font-heading text-sm font-semibold">P</span>
          </div>
          <span className="font-heading font-semibold text-sm">Admin</span>
        </Link>
        <button onClick={() => { signOut(); navigate('/'); }} className="p-2 rounded-full hover:bg-bg/10">
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 lg:ml-64 pt-14 lg:pt-0 overflow-y-auto">
        <div className="lg:hidden bg-bg border-b border-ink/5 px-4 py-3 flex gap-2 overflow-x-auto scrollbar-hide">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-ink/5 text-ink-soft text-xs font-medium whitespace-nowrap hover:bg-ink/10 transition-colors"
            >
              <link.icon className="w-3.5 h-3.5" />
              {link.label}
            </Link>
          ))}
        </div>
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
